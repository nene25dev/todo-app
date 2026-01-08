import type {
  Todo,
  Deadline,
} from "../types";

const isDeadline = (value: any): value is Deadline => {
  return value === 'idea' || value === 'today' || value === 'tomorrow';
};

const isTodo = (arg: any): arg is Todo => {
  return (
    typeof arg === 'object' &&
    Object.keys(arg).length === 6 &&
    typeof arg.id === 'number' &&
    typeof arg.value === 'string' &&
    typeof arg.checked === 'boolean' &&
    typeof arg.removed === 'boolean' &&
    isDeadline(arg.deadline) &&
    typeof arg.time === 'number' &&
    Number.isFinite(arg.time) &&
    arg.time > 0 &&
    arg.time <= 30
  );
};

export const isTodos = (arg: any): arg is Todo[] => {
  return Array.isArray(arg) && arg.every(isTodo);
};