import { prisma } from "../src/lib/prisma.js";
import { Deadline } from "../src/generated/prisma/enums.js";
import { fakerJA as faker } from "@faker-js/faker";


function shuffleItem<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const taskTexts = [
  "メールを返信する",
  "部屋を片付ける",
  "洗濯を回す",
  "スーパーで買い物",
  "資料を作成する",
  "TODOアプリを修正する",
  "GitHubにpushする",
  "ブログ記事を書く",
  "筋トレをする",
  "散歩する",
  "Reactの勉強",
  "TypeScriptの型整理",
  "ポートフォリオを更新",
  "PRレビューする",
  "デザインを調整する",
  "バグ修正",
];

const shuffledTasks = shuffleItem(taskTexts);

const deadlines: Deadline[] = [
  Deadline.idea,
  Deadline.idea,
  Deadline.idea,
  Deadline.today,
  Deadline.today,
  Deadline.tomorrow,
  Deadline.tomorrow,
  Deadline.tomorrow,
  Deadline.tomorrow,
];

const shuffledDeadlines = shuffleItem(deadlines);

async function main() {
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: faker.person.firstName(),
    },
  });

  const todos = Array.from({ length: 10 }).map((_, i) => {
    return {
      value: shuffledTasks[i],
      checked: faker.datatype.boolean(),
      removed: false,
      deadline: shuffledDeadlines[i],
      time: faker.number.int({ min: 5, max: 30 }),
      sortOrder: i,
      userId: user.id,
    };
  });

  await prisma.todo.createMany({ data: todos });
}

main().finally(async () => {
  await prisma.$disconnect();
});
