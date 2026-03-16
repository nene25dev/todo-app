import { prisma } from "../src/lib/prisma.js";
import { Deadline } from "../src/generated/prisma/enums.js";
import { fakerJA as faker } from "@faker-js/faker";

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

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

  const deadlines: Deadline[] = [
    Deadline.idea,
    Deadline.tomorrow,
  ];

  const todos = Array.from({ length: 10 }).map((_,i) => {
    return {
      value: faker.lorem.words(3),
      checked: faker.datatype.boolean(),
      removed: false,
      deadline: randomItem(deadlines),
      time: faker.number.int({ min: 5, max: 30 }),
      sortOrder:i,
      userId: user.id,
    };
  });

  await prisma.todo.createMany({ data: todos });
}

main().finally(async () => {
  await prisma.$disconnect();
});
