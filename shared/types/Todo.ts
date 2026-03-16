import type { Deadline } from "./Deadline";

export type Todo = {
  readonly id: number;
  value: string;
  checked: boolean;
  removed: boolean;
  deadline: Deadline;
  time: number;
  sortOrder: number;
  userId: number;
};

export type ReorderTodo = Pick<Todo, "id" | "deadline" | "sortOrder">;