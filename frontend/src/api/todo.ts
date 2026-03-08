import type { Todo } from "../../../shared/types/index.ts";

const API_URL = import.meta.env.VITE_API_URL;

// 読み込み
// fetch 非同期処理 APIを呼ぶ
export const fetchTodos = async ():Promise<Todo[]> => {
  // fetch 非同期処理 APIを呼ぶ
  const res = await fetch(`${API_URL}/todos`);

  if (!res.ok) {
    throw new Error("Todo取得失敗");
  }

  // サーバーから来たjsonをjavascriptオブジェクトに変換
  return res.json();
};

// 追加
export const createTodo = async (todo: {
  value: string;
  deadline: string;
  time: number;
}) => {
  const res = await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });

  if (!res.ok) {
    throw new Error("Todo追加失敗");
  }

  return res.json();
};

// 更新
export const updateTodo = async (
  id: number,
  updates: Partial<Pick<Todo, "value" | "deadline" | "time" | "checked" | "removed">>,
): Promise<Todo> => {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Todo更新失敗");
  }

  return res.json();
};
