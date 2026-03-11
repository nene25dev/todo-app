import { createTodo, findAllTodos, findTodoById } from "../repositories/todoRepository.js";
import type { Deadline } from "../../../shared/types/Deadline.js";
import { AppError } from "../errors/AppError.js";
import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/client.js"; 
import * as todoRepository from "../repositories/todoRepository.js";

const validDeadlines: Deadline[] = ["today", "tomorrow", "idea"];

// 一覧
export const getAllTodos = async () => {
  return await findAllTodos();
};

// 作成
export const createNewTodo = async (body: {
  value?: unknown;
  deadline?: unknown;
  time?: unknown;
}) => {
  const { value, deadline, time } = body;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("VALIDATION_ERROR");
  }
  if (!validDeadlines.includes(deadline as Deadline)) {
    throw new Error("VALIDATION_ERROR");
  }
  if (typeof time !== "number" || Number.isNaN(time)) {
    throw new Error("VALIDATION_ERROR");
  }

  return await createTodo({
    value: value.trim(),
    deadline: deadline as Deadline,
    time,
  });
};

// 更新
export const updatedTodo = async (id: number,
  body: {
    value?: unknown;
    deadline?: unknown;
    time?: unknown;
    checked?: unknown;
    removed?: unknown;
  }) => {

    // idが正しいか確認
    if (Number.isNaN(id)) {
      throw new AppError("id が不正です", 400);
    }
    // DBに対象データが存在するか確認
    const targetTodo = await findTodoById(id);

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
      if (!validDeadlines.includes(deadline as Deadline)) {
        throw new AppError("締め切りが設定されていません", 400);
      }

      data.deadline = deadline as Deadline;
    }

    if (time !== undefined) {
      if (typeof time !== "number" || Number.isNaN(time)) {throw new AppError("時間が入力されていません", 400);}

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

    return await todoRepository.updatedTodo(id, data);
}