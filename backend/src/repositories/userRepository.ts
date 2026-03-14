import { prisma } from "../lib/prisma.js";

// 特定のユーザーを見つける
export const userRepository = {
  findById(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  },

// 作成
  create(data?: { name?: string; lastRolloverDate?: string }) {
    return prisma.user.create({
      data: {
        name: data?.name ?? null,
        lastRolloverDate: data?.lastRolloverDate ?? null,
      },
    });
  },

// 最終アクセス日時を更新
  updateLastRolloverDate(userId: number, dateKey: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastRolloverDate: dateKey },
    });
  },
};