// HTTPリクエストを受けて、レスポンスを返す
import type { Request, Response } from "express";
import {
  createTodo,
  deleteTodo,
  findAllTodos,
  findTodoById,
  updatedTodo,
} from "../repositories/todoRepository.js";
import type { Deadline } from "../../../shared/types/Deadline.js";
import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/client.js"; 

const validDeadlines: Deadline[] = ["today", "tomorrow", "idea"];

// _req何で一蘭だけ_があるの？
// get
export const getTodos = async (_req: Request, res: Response) => {
  try {
    const todos = await findAllTodos();
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Todo一覧の取得に失敗しました" });
  }
};

// post
export const postTodos = async (req: Request, res: Response) => {
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

    const newTodo = await createTodo({
      value: value.trim(),
      deadline,
      time,
    });

    res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Todo追加に失敗しました" });
  }
};

// patch
export const patchTodo = async (req: Request, res: Response) => {
  try {
    // urlからidを取り出す
    const id = Number(req.params.id);
    const { value, deadline, time, checked, removed } = req.body;
    // idが正しいか確認
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "id が不正です" });
    }
    // DBに対象データが存在するか確認
    const targetTodo = await findTodoById(id);

    if (!targetTodo) {
      return res.status(404).json({ message: "Todoが見つけられませんでした" });
    }

    // 更新用データ
    const data: Prisma.TodoUpdateInput = {};

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
    const todo = await updatedTodo(id, data);

    // 更新されたデータを返す
    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Todo更新に失敗しました" });
  }
};

// remove
export const removeTodo = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "idが不正です" });
    }

    const exists = await findTodoById(id);

    if (!exists) {
      return res.status(404).json({ message: "TODOが見つかりませんでした" });
    }

    await deleteTodo(id);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Todo削除に失敗しました" });
  }
};
