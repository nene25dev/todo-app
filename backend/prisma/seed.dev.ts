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
  // Deadline.idea,
  // Deadline.idea,
  // Deadline.idea,
  // Deadline.idea,
  // Deadline.today,
  // Deadline.today,
  Deadline.tomorrow,
  Deadline.tomorrow,
  Deadline.tomorrow,
  Deadline.tomorrow,
];

const shuffledDeadlines = shuffleItem(deadlines);

async function main() {
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      passwordHash: "あとで本物のhashにする",
      name: "test user",
    },
  });

  const counters: Partial<Record<Deadline, number>> = {};

  const todos = Array.from({ length: 4 }).map((_, i) => {
    const deadline = shuffledDeadlines[i];

    if (!counters[deadline]) {
      counters[deadline] = 1;
    } else {
      counters[deadline]++;
    }

    return {
      value: shuffledTasks[i],
      checked: faker.datatype.boolean(),
      removed: false,
      deadline: deadline,
      time: faker.number.int({ min: 5, max: 30 }),
      sortOrder: counters[deadline],
      userId: user.id,
    };
  });

  await prisma.todo.createMany({ data: todos });
}

main().finally(async () => {
  await prisma.$disconnect();
});
