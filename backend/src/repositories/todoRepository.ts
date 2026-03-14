// DB処理(prisma)をここに書く
import { prisma } from "../lib/prisma.js";
import { Deadline, type Prisma } from "../generated/prisma/client.js";

export const todoRepository = {
  // 一覧取得
  findAllTodos(userId: number) {
    return prisma.todo.findMany({
      where: { userId },
      orderBy: {
        id: "desc",
      },
    });
  },

  // 追加
  createTodo(data: Prisma.TodoCreateInput) {
    return prisma.todo.create({
      data,
    });
  },

  // 更新
  updatedTodo(id: number, data: Prisma.TodoUpdateInput) {
    return prisma.todo.update({
      where: { id },
      data,
    });
  },

  // 削除
  deleteTodo(id: number) {
    return prisma.todo.delete({
      where: { id },
    });
  },

  // 特定のタスクを取得
  findTodoById(id: number) {
    return prisma.todo.findUnique({
      where: { id },
    });
  },

  //「今日やる」ゴミ箱にないタスクを取得
  countActiveTodayTodos(userId: number) {
    return prisma.todo.count({
      where: {
        userId,
        deadline: Deadline.today,
        removed: false,
      },
    });
  },

  //「明日やる」を指定した件数取得
  findMovableTomorrowTodos(userId: number, take: number) {
    return prisma.todo.findMany({
      where: {
        userId,
        deadline: Deadline.tomorrow,
        removed: false,
      },
      orderBy: [{ id: "asc" }],
      take,
    });
  },

  // 指定したタスクの締め切りをまとめて変更
  updateDeadlineMany(todoIds: number[], deadline: Deadline) {
    if (todoIds.length === 0) {
      return Promise.resolve({ count: 0 });
    }

    return prisma.todo.updateMany({
      where: {
        id: { in: todoIds },
      },
      data: { deadline },
    });
  },
};
