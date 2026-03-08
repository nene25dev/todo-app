import express from "express";
import cors from "cors";
import type { Todo, Deadline } from "../../shared/types/index.ts";

const app = express();
const PORT = 3001;
const validDeadlines: Deadline[] = ["today", "tomorrow", "idea"];

app.use(cors());
app.use(express.json());

let todos: Todo[] = [
  {
    id: 1,
    value: "メールをまとめて返信する",
    checked: false,
    removed: false,
    deadline: "today",
    time: 20,
  },
  {
    id: 2,
    value: "リビングを片付ける",
    checked: false,
    removed: true,
    deadline: "tomorrow",
    time: 30,
  },
  {
    id: 3,
    value: "テストデータ追加",
    checked: true,
    removed: false,
    deadline: "today",
    time: 20,
  },
  {
    id: 4,
    value: "ReactのuseEffectを復習する",
    checked: false,
    removed: false,
    deadline: "idea",
    time: 30,
  },
  {
    id: 5,
    value: "スマホ表示を確認",
    checked: false,
    removed: false,
    deadline: "tomorrow",
    time: 10,
  },
];

// ルート確認
app.get("/", (_req, res) => {
  res.send("backend server ok");
});

// Todo一覧取得
app.get("/todos", (_req, res) => {
  res.json(todos);
});

// Todo追加
app.post("/todos", (req, res) => {
  const { value, deadline, time } = req.body;

  if (typeof value !== "string" || !value.trim()) {
    return res.status(400).json({ message: "text is required" });
  }
  if (!validDeadlines.includes(deadline)) {
    return res.status(400).json({ message: "deadline is invalid" });
  }

  if (typeof time !== "number" || Number.isNaN(time)) {
    return res.status(400).json({ message: "time is invalid" });
  }

  const newTodo: Todo = {
    id: new Date().getTime(),
    value: value,
    checked: false,
    removed: false,
    deadline: deadline,
    time: time,
  };

  todos.unshift(newTodo);

  res.status(201).json(newTodo);
});

// Todo更新
app.patch("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const { value, deadline, time, checked, removed } = req.body;

  const targetTodo = todos.find((todo) => todo.id === id);

  if (!targetTodo) {
    return res.status(404).json({ message: "Todoが見つけられませんでした" });
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return res.status(400).json({ message: "テキストが空です" });
    }

    targetTodo.value = trimmedValue;
  }

  if (deadline !== undefined) {
    if (!validDeadlines.includes(deadline)) {
      return res.status(400).json({ message: "締め切りが設定されていません" });
    }

    targetTodo.deadline = deadline;
  }

  if (time !== undefined) {
    if (typeof time !== "number" || Number.isNaN(time)) {
      return res.status(400).json({ message: "時間が入力されていません" });
    }

    targetTodo.time = time;
  }

  if (checked !== undefined) {
    if (typeof checked !== "boolean") {
      return res.status(400).json({ message: "checked が不正です" });
    }

    targetTodo.checked = checked;
  }

  if (removed !== undefined) {
    if (typeof removed !== "boolean") {
      return res.status(400).json({ message: "removed が不正です" });
    }

    targetTodo.removed = removed;
  }

  res.json(targetTodo);
});

// Todo削除
app.delete("/todos/:id", (req, res) => {
  const id = Number(req.params.id);

  const exists = todos.some((todo) => todo.id === id);

  if (!exists) {
    return res.status(404).json({ message: "todo not found" });
  }

  todos = todos.filter((todo) => todo.id !== id);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
