import { prisma } from "../src/lib/prisma.js";
import { Deadline } from "../src/generated/prisma/enums.js";

async function main() {
  await prisma.todo.deleteMany();
  await prisma.todo.createMany({
    data: [
      {
        value: "メールをまとめて返信する",
        deadline: Deadline.today,
        time: 20,
      },
      {
        value: "リビングを片付ける",
        deadline: Deadline.tomorrow,
        time: 30,
      },
      {
        value: "テストデータ追加",
        deadline: Deadline.today,
        time: 20,
      },
      {
        value: "ReactのuseEffectを復習する",
        deadline: Deadline.idea,
        time: 30,
      },
      {
        value: "スマホ表示を確認",
        deadline: Deadline.tomorrow,
        time: 10,
      },
    ],
  });
}

  main().finally(async () => {
  await prisma.$disconnect();
});
