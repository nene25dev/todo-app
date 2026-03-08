import type { Errors } from "./Errors";

// 「タスクIDごとのエラー」を持つ
// IDをキーにしてる
export type EditErrors = Record<number, Errors>;