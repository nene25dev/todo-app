import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma.js";
import { todoService } from "../src/services/todoService.js";
import { todoRepository } from "../src/repositories/todoRepository.js";
import { Deadline } from "../src/generated/prisma/enums.js";

async function resetDb() {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
}

// ユーザーとtodoの前提データ
async function setupUserTodos(todos: { value: string; deadline: Deadline }[]) {
  const user = await prisma.user.create({
    data: {
      name: "test",
      lastRolloverDate: "2026-03-20",
    },
  });

  const counters: Partial<Record<Deadline, number>> = {};

  await prisma.todo.createMany({
    data: todos.map((todo) => {
      const deadline = todo.deadline;

      if (!counters[deadline]) {
        counters[deadline] = 1;
      } else {
        counters[deadline]++;
      }

      return {
        userId: user.id,
        sortOrder: counters[deadline],
        checked: false,
        removed: false,
        time: 10,
        ...todo,
      };
    }),
  });

  return user;
}

const today = (value: string) => ({
  value,
  deadline: Deadline.today,
});

const tomorrow = (value: string) => ({
  value,
  deadline: Deadline.tomorrow,
});

test("『今日やる』が0件なら『明日やる』は3件だけ移動する", async () => {
  await resetDb();

  const user = await setupUserTodos([
        tomorrow("tomorrow-1"),
        tomorrow("tomorrow-2"),
        tomorrow("tomorrow-3"),
        tomorrow("tomorrow-4"),
    ]);

  await todoService.rolloverTodos(user.id, new Date("2026-03-21T09:00:00+09:00"));

  const todos = await todoRepository.findAllTodos(user.id);
  const todayTodos = todos.filter((todo) => todo.deadline === "today");
  const tomorrowTodos = todos.filter((todo) => todo.deadline === "tomorrow");

  assert.equal(todayTodos.length, 3);
  assert.equal(tomorrowTodos.length, 1);

  assert.equal(todayTodos.some((todo) => todo.value === "tomorrow-1"), true);
  assert.equal(todayTodos.some((todo) => todo.value === "tomorrow-2"), true);
  assert.equal(todayTodos.some((todo) => todo.value === "tomorrow-3"), true);
  assert.equal(tomorrowTodos.some((todo) => todo.value === "tomorrow-4"), true);
});

test("『今日やる』が1件なら『明日やる』は2件だけ移動する", async () => {
  await resetDb();

  const user = await setupUserTodos([
        today("t1"),
        tomorrow("tomorrow-1"),
        tomorrow("tomorrow-2"),
        tomorrow("tomorrow-3")
    ]);

  await todoService.rolloverTodos(user.id, new Date("2026-03-21T09:00:00+09:00"));

  const todos = await todoRepository.findAllTodos(user.id);
  const todayTodos = todos.filter((todo) => todo.deadline === "today");
  const tomorrowTodos = todos.filter((todo) => todo.deadline === "tomorrow");

  assert.equal(todayTodos.length, 3);
  assert.equal(tomorrowTodos.length, 1);

  assert.equal(todayTodos.some((todo) => todo.value === "tomorrow-1"), true);
  assert.equal(todayTodos.some((todo) => todo.value === "tomorrow-2"), true);
  assert.equal(tomorrowTodos.some((todo) => todo.value === "tomorrow-3"), true);
});

test("「今日やる」が2件なら「明日やる」は1件だけ移動する", async () => {
    // DBリセット
    await resetDb();

    // 1. 前提データ作成
    const user = await setupUserTodos([
        today("t1"),
        today("t2"),
        tomorrow("tomorrow-1"),
        tomorrow("tomorrow-2"),
    ]);

    // 2. 実行
    await todoService.rolloverTodos(user.id, new Date("2026-03-21T09:00:00+09:00"));

    // 3. 検証
    const todos = await todoRepository.findAllTodos(user.id);
    const todayTodos = todos.filter((todo) => todo.deadline === "today");
    const tomorrowTodos = todos.filter((todo) => todo.deadline === "tomorrow");

    assert.equal(todayTodos.length, 3);
    assert.equal(tomorrowTodos.length, 1);

    assert.equal(todayTodos.some((todo) => todo.value === "tomorrow-1"), true);
    assert.equal(tomorrowTodos.some((todo) => todo.value === "tomorrow-2"), true);
});

test("「今日やる」が3件あれば、「明日やる」は移動しない", async () => {
    await resetDb();

    const user = await setupUserTodos([
        today("t1"),
        today("t2"),
        today("t3"),
        tomorrow("t1"),
    ]);

    await todoService.rolloverTodos(user.id, new Date("2026-03-21T09:00:00+09:00"));

    const todos = await todoRepository.findAllTodos(user.id);
    const todayTodos = todos.filter((todo) => todo.deadline === "today");
    const tomorrowTodos = todos.filter((todo) => todo.deadline === "tomorrow");

    assert.equal(todayTodos.length, 3);
    assert.equal(tomorrowTodos.length, 1);
});

test("日付が変わっていないなら移動しない", async () => {
    await resetDb();

    const user = await setupUserTodos([
        today("t1"),
        tomorrow("t1"),
    ]);

    await todoService.rolloverTodos(user.id, new Date("2026-03-20T09:00:00+09:00"));

    const todos = await todoRepository.findAllTodos(user.id);
    const todayTodos = todos.filter((todo) => todo.deadline === "today");
    const tomorrowTodos = todos.filter((todo) => todo.deadline === "tomorrow");

    assert.equal(todayTodos.length, 1);
    assert.equal(tomorrowTodos.length, 1);
});

test("移動後に lastRolloverDate が更新される", async () => {
  await resetDb();

  const user = await setupUserTodos([
        tomorrow("t1"),
    ]);

  await todoService.rolloverTodos(user.id, new Date("2026-03-21T09:00:00+09:00"));

  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  assert.equal(updatedUser?.lastRolloverDate, "2026-03-21");
});

test("同日に2回実行しても2回目は移動しない", async () => {
  await resetDb();

  const user = await setupUserTodos([
        today("t1"),
        tomorrow("t1"),
        tomorrow("t2"),
    ]);

  const now = new Date("2026-03-21T09:00:00+09:00");

  await todoService.rolloverTodos(user.id, now);
  await todoService.rolloverTodos(user.id, now);

  const todos = await todoRepository.findAllTodos(user.id);
  const todayTodos = todos.filter((todo) => todo.deadline === "today");
  const tomorrowTodos = todos.filter((todo) => todo.deadline === "tomorrow");

  assert.equal(todayTodos.length, 3);
  assert.equal(tomorrowTodos.length, 0);
});

test("存在しないユーザーIDならエラー", async () => {
  await resetDb();

  await assert.rejects(
    async () => {
      await todoService.rolloverTodos(999999, new Date("2026-03-21T09:00:00+09:00"));
    },
    {
      message: "ユーザーが見つかりませんでした",
    }
  );
});