// アプリの処理・ルールをここに書く
import { AppError } from "../errors/AppError.js";
import { prisma } from "../lib/prisma.js";
import { Deadline, type Prisma, type Todo } from "../generated/prisma/client.js";
import { todoRepository } from "../repositories/todoRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import type { ReorderTodo } from "../../../shared/types/index.js";

function isDeadline(value: unknown): value is Deadline {
  return Object.values(Deadline).includes(value as Deadline);
}

// 日付を YYYY-MM-DD形式の文字列 に変換
function getDayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 日付が変わったら「明日やる」を「今日やる」に最大3件移動
async function rolloverTodos(
  userId: number,
  now = new Date(),
): Promise<void> {
  const todayKey = getDayKey(now);
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError("ユーザーが見つかりませんでした",400);
  }

  // 初回アクセス時：今日の日付に変更
  if (!user.lastRolloverDate) {
    await userRepository.updateLastRolloverDate(userId, todayKey);
    return;
  }

  // 日付が同じ場合：終了
  if (user.lastRolloverDate === todayKey) {
    return;
  }

  // 今日のTodo数取得
  const todayCount = await todoRepository.countActiveTodayTodos(userId);
  const movableCount = Math.max(0, 3 - todayCount);

  await prisma.$transaction(async (tx) => {
    // 「今日やる」に空きがあれば
    if (movableCount > 0) {
      // 「明日やる」タスクを取得
      const tomorrowTodos:Todo[] = await todoRepository.findMovableTomorrowTodos(userId,movableCount);

      const ids = tomorrowTodos.map((todo) => todo.id);

      if (ids.length > 0) {
        // 取得したタスクを「今日やる」に移動
        await todoRepository.updateDeadlineMany(ids,Deadline.today);
      }
    }

    // ユーザーの最終アクセス日を更新
    await userRepository.updateLastRolloverDate(userId,todayKey);
  });
}

// 一覧
 async function getAllTodos(userId: number,now = new Date()){
  await rolloverTodos(userId,now);
  return todoRepository.findAllTodos(userId);
};

// 作成
async function createNewTodo(
  userId: number,
  body: {
  value?: unknown;
  deadline?: unknown;
  time?: unknown;
}){
  const { value, deadline, time } = body;
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError("タスクを入力してください",400);
  }
  if (!isDeadline(deadline)) {
    throw new AppError("締切を選択してください",400);
  }
  if (typeof time !== "number" || Number.isNaN(time)) {
    throw new AppError("かかる時間を入力してください",400);
  }

  const lastTodo = await todoRepository.findLastTodo(userId,deadline);
  // 並び順をセクション内の最後にする
  const sortOrder = lastTodo ? lastTodo.sortOrder + 1 : 0;

  return await todoRepository.createTodo({
    value: value.trim(),
    deadline: deadline as Deadline,
    time,
    sortOrder,
    user: {
      connect: { id: userId }
    }
  });
};

// 更新
async function updatedTodo(
  id: number,
  userId: number,
  body: {
    value?: unknown;
    deadline?: unknown;
    time?: unknown;
    checked?: unknown;
    removed?: unknown;
  },
){
  // idが正しいか確認
  if (Number.isNaN(id)) {
    throw new AppError("id が不正です", 400);
  }
  // DBに対象データが存在するか確認
  const targetTodo = await todoRepository.findTodoById(id);

  if (!targetTodo) {
    throw new AppError("Todoが見つけられませんでした", 404);
  }

  const { value, deadline, time, checked, removed } = body;
  // 更新用データ
  const data: Prisma.TodoUpdateInput = {};

  // それぞれ項目があるか、値が不正じゃないかチェックし、更新用データに追加
  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      throw new AppError("テキストが空です", 400);
    }

    data.value = trimmedValue;
  }

  if (deadline !== undefined) {
    if (!isDeadline(deadline)) {
      throw new AppError("締め切りが設定されていません", 400);
    }

    data.deadline = deadline as Deadline;
  }

  if (time !== undefined) {
    if (typeof time !== "number" || Number.isNaN(time)) {
      throw new AppError("時間が入力されていません", 400);
    }

    data.time = time;
  }

  if (checked !== undefined) {
    if (typeof checked !== "boolean") {
      throw new AppError("不正な値が入力されました", 400);
    }

    data.checked = checked;
  }

  if (removed !== undefined) {
    if (typeof removed !== "boolean") {
      throw new AppError("不正な値が入力されました", 400);
    }

    data.removed = removed;
  }

  return await todoRepository.updatedTodo(id,userId, data);
};

// 削除
async function deleteTodo(id:number,userId: number) {
  const exists = await todoRepository.findTodoById(id);

    if (!exists) {
      throw new AppError("TODOが見つかりませんでした",400);
    }

    await todoRepository.deleteTodo(id,userId);
}

// 並び順
function reorderTodos(userId: number, items: ReorderTodo[]) {
  return todoRepository.reorderTodos(userId, items);
}


export const todoService = {
  getAllTodos,
  createNewTodo,
  updatedTodo,
  deleteTodo,
  reorderTodos,
  rolloverTodos
};