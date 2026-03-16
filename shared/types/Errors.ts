export  type Errors = {
  text?: string;
  time?: string;
};

// 「タスクIDごとのエラー」を持つ
// IDをキーにしてる
export type EditErrors = Record<number, Errors>;