import { prisma } from "../src/lib/prisma.js";
import { Deadline } from "../src/generated/prisma/enums.js";

async function main() {
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.upsert({
    where: { id: 1 },
    update: {
      name: "demo-user",
      lastRolloverDate: "2026-03-21",
    },
    create: {
      id: 1,
      name: "demo-user",
      lastRolloverDate: "2026-03-21",
    },
  });

  await prisma.todo.createMany({
    data: [
      {
        value: "ブログ記事を書く",
        checked: false,
        removed: false,
        deadline: Deadline.idea,
        time: 20,
        sortOrder: 0,
        userId: user.id,
      },
      {
        value: "デザインを調整する",
        checked: false,
        removed: false,
        deadline: Deadline.idea,
        time: 15,
        sortOrder: 1,
        userId: user.id,
      },
      {
        value: "GitHubにpushする",
        checked: false,
        removed: false,
        deadline: Deadline.idea,
        time: 10,
        sortOrder: 2,
        userId: user.id,
      },
      {
        value: "メールを返信する",
        checked: false,
        removed: false,
        deadline: Deadline.idea,
        time: 5,
        sortOrder: 3,
        userId: user.id,
      },

      {
        value: "TODOアプリを修正する",
        checked: false,
        removed: false,
        deadline: Deadline.today,
        time: 30,
        sortOrder: 0,
        userId: user.id,
      },
      {
        value: "資料を作成する",
        checked: false,
        removed: false,
        deadline: Deadline.today,
        time: 25,
        sortOrder: 1,
        userId: user.id,
      },

      {
        value: "スーパーで買い物",
        checked: false,
        removed: false,
        deadline: Deadline.tomorrow,
        time: 15,
        sortOrder: 0,
        userId: user.id,
      },
      {
        value: "散歩する",
        checked: false,
        removed: false,
        deadline: Deadline.tomorrow,
        time: 20,
        sortOrder: 1,
        userId: user.id,
      },
      {
        value: "Reactの勉強",
        checked: false,
        removed: false,
        deadline: Deadline.tomorrow,
        time: 30,
        sortOrder: 2,
        userId: user.id,
      },
      {
        value: "部屋を片付ける",
        checked: false,
        removed: false,
        deadline: Deadline.tomorrow,
        time: 20,
        sortOrder: 3,
        userId: user.id,
      },
    ],
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});