// DB処理(prisma)をここに書く
import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";

// 一覧取得
export const findAllTodos = async () => {
  return await prisma.todo.findMany({
    orderBy: {
      id: "desc",
    },
  });
};

// 特定のタスクを取得
export const findTodoById = async (id: number) => {
  return await prisma.todo.findUnique({
    where: { id },
  });
};

// 追加
export const createTodo = async (data: Prisma.TodoCreateInput) => {
  return await prisma.todo.create({
    data,
  });
};

// 更新
export const updatedTodo = async (id: number, data: Prisma.TodoUpdateInput) => {
  return await prisma.todo.update({
    where: { id },
    data,
  });
};

// 削除
export const deleteTodo = async (id: number) => {
  return await prisma.todo.delete({
    where: { id },
  });
};
