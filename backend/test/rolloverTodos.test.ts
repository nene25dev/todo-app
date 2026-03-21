import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma.js";
import { todoService } from "../src/services/todoService.js";
import { todoRepository } from "../src/repositories/todoRepository.js";

test("日付が変わったら「明日やる」を「今日やる」に移動", async () => {
    // DBリセット
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
    // 1. 前提データ作成
    const user = await prisma.user.create({
        data: {
            name: "test",
            lastRolloverDate: "2026-03-20",
        },
    });

    await prisma.todo.createMany({
        data: [
            { userId: user.id, value: "today-1", deadline: "today", checked: false, removed: false, sortOrder: 1, time: 10 },
            { userId: user.id, value: "tomorrow-1", deadline: "tomorrow", checked: false, removed: false, sortOrder: 1, time: 10 },
            { userId: user.id, value: "tomorrow-2", deadline: "tomorrow", checked: false, removed: false, sortOrder: 2, time: 10 },
        ],
    });

    // 2. 実行
    await todoService.rolloverTodos(user.id, new Date("2026-03-21T09:00:00+09:00"));

    // 3. 検証
    const todos = await todoRepository.findAllTodos(user.id);
    const todayTodos = todos.filter((todo) => todo.deadline === "today");

    assert.equal(todayTodos.length, 3);
});

test("「今日やる」が3件あれば、「明日やる」は移動しない", async () => {
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
        data: {
            name: "test",
            lastRolloverDate: "2026-03-20",
        },
    });

    await prisma.todo.createMany({
        data: [
            { userId: user.id, value: "today-1", deadline: "today", checked: false, removed: false, sortOrder: 1, time: 10 },
            { userId: user.id, value: "today-2", deadline: "today", checked: false, removed: false, sortOrder: 2, time: 10 },
            { userId: user.id, value: "today-3", deadline: "today", checked: false, removed: false, sortOrder: 3, time: 10 },
            { userId: user.id, value: "tomorrow-1", deadline: "tomorrow", checked: false, removed: false, sortOrder: 1, time: 10 },
        ],
    });

    await todoService.rolloverTodos(user.id, new Date("2026-03-21T09:00:00+09:00"));

    const todos = await todoRepository.findAllTodos(user.id);
    const todayTodos = todos.filter((todo) => todo.deadline === "today");
    const tomorrowTodos = todos.filter((todo) => todo.deadline === "tomorrow");

    assert.equal(todayTodos.length, 3);
    assert.equal(tomorrowTodos.length, 1);
});