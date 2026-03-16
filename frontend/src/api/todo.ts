import type { Deadline, Todo } from "../../../shared/types/index.ts";

const API_URL = import.meta.env.VITE_API_URL;

// 読み込み
// fetch 非同期処理 APIを呼ぶ
export const fetchTodos = async (): Promise<Todo[]> => {
  // fetch 非同期処理 APIを呼ぶ
  const res = await fetch(`${API_URL}/todos`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Todo取得失敗");
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
    // リクエストメソッド：リクエストが成功した場合に期待される結果
    method: "POST",
    // リクエスト本体の形式
    headers: {
      "Content-Type": "application/json",
    },
    // サーバーに送信する内容
    body: JSON.stringify(todo),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Todo追加失敗");
  }

  return res.json();
};

// 更新
export const updateTodo = async (
  id: number,
  updates: Partial<
    Pick<Todo, "value" | "deadline" | "time" | "checked" | "removed">
  >,
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

// 削除
export const deleteTodo = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Todo削除失敗");
  }
};

type ReorderTodoItem = {
  id: number;
  deadline: Deadline;
  sortOrder: number;
};

// 並び順の更新
export async function updateTodoOrder(payload:ReorderTodoItem[]) {
  const response = await fetch(`${API_URL}/todos/reorder`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  console.log(response.status, text)

  if (!response.ok) {
    throw new Error("Todoの並び順保存に失敗しました");
  }
}