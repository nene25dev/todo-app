import { prisma } from "../lib/prisma.js";

export const userRepository = {
  // 特定のユーザーを見つける
  findById(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  },

  // 作成
  create(data: { name?: string; passwordHash: string; email: string; lastRolloverDate?: string }) {
    const { name, passwordHash, email, lastRolloverDate } = data;

    return prisma.user.create({
      data: {
        name: name ?? null,
        passwordHash,
        email,
        lastRolloverDate: lastRolloverDate ?? null,
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


  // メールアドレスの重チェック
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },
};