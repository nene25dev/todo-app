import express from "express";
import cors from "cors";
import type { Deadline } from "../../shared/types/index.js";
import { prisma } from "./lib/prisma.js";

const app = express();
const PORT = 3001;
const validDeadlines: Deadline[] = ["today", "tomorrow", "idea"];

app.use(cors());
app.use(express.json());

/* let todos: Todo[] = [
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
]; */

// ルート確認
app.get("/", (_req, res) => {
  res.send("backend server ok");
});

// 一覧取得
app.get("/todos", async (_req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        id: "desc",
      },
    });

    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Todo一覧の取得に失敗しました" });
  }
});

// 追加
app.post("/todos", async (req, res)  => {
  try {
    const { value, deadline, time } = req.body;

    if (typeof value !== "string" || !value.trim()) {
      return res.status(400).json({ message: "必須項目です" });
    }
    if (!validDeadlines.includes(deadline)) {
      return res.status(400).json({ message: "必須項目です" });
    }

    if (typeof time !== "number" || Number.isNaN(time)) {
      return res.status(400).json({ message: "必須項目です" });
    }

    const newTodo = await prisma.todo.create({
      data: {
        value: value.trim(),
        deadline,
        time,
      },
    });

    res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Todo追加に失敗しました" });
  }
});

// 更新
// フロントからのリクエスト
app.patch("/todos/:id", async (req, res) => {
  try {
    // urlからidを取り出す
    const id = Number(req.params.id);
    const { value, deadline, time, checked, removed } = req.body;
    // idが正しいか確認
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "id が不正です" });
    }
    // DBに対象データが存在するか確認
    const targetTodo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!targetTodo) {
      return res.status(404).json({ message: "Todoが見つけられませんでした" });
    }

    // 更新用データ
    const data: {
      value?: string;
      deadline?: Deadline;
      time?: number;
      checked?: boolean;
      removed?: boolean;
    } = {};

    // それぞれ項目があるか、値が不正じゃないかチェックし、更新用データに追加
    if (typeof value === "string") {
      const trimmedValue = value.trim();

      if (!trimmedValue) {
        return res.status(400).json({ message: "テキストが空です" });
      }

      data.value = trimmedValue;
    }

    if (deadline !== undefined) {
      if (!validDeadlines.includes(deadline)) {
        return res
          .status(400)
          .json({ message: "締め切りが設定されていません" });
      }

      data.deadline = deadline;
    }

    if (time !== undefined) {
      if (typeof time !== "number" || Number.isNaN(time)) {
        return res.status(400).json({ message: "時間が入力されていません" });
      }

      data.time = time;
    }

    if (checked !== undefined) {
      if (typeof checked !== "boolean") {
        return res.status(400).json({ message: "不正な値が入力されました" });
      }

      data.checked = checked;
    }

    if (removed !== undefined) {
      if (typeof removed !== "boolean") {
        return res.status(400).json({ message: "不正な値が入力されました" });
      }

      data.removed = removed;
    }

    // 更新用データを元に、DBを更新
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data,
    });

    // 更新されたデータを返す
    res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Todo更新に失敗しました" });
  }
});

// 削除
app.delete("/todos/:id",async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "idが不正です" });
    }

    const exists = await prisma.todo.findUnique({
      where: { id },
    });

    if (!exists) {
      return res.status(404).json({ message: "TODOが見つかりませんでした" });
    }

    await prisma.todo.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Todo削除に失敗しました" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
