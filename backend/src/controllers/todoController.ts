// HTTPリクエストを受けて、レスポンスを返す
import type { Request, Response } from "express";
import {
  deleteTodo,
  findTodoById,
} from "../repositories/todoRepository.js";
import { createNewTodo, getAllTodos, updatedTodo } from "../services/todoService.js";
import { AppError } from "../errors/AppError.js";

// get
export const getTodos = async (_req: Request, res: Response) => {
  try {
    const todos = await getAllTodos();
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Todo一覧の取得に失敗しました" });
  }
};

// post
export const postTodos = async (req: Request, res: Response) => {
  try {
    const newTodo = await createNewTodo(req.body);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message === "VALIDATION_ERROR") {
      return res.status(400).json({ message: "必須項目です" });
    }
    res.status(500).json({ message: "Todo追加に失敗しました" });
  }
};

// patch
export const patchTodo = async (req: Request, res: Response) => {
  try {
    // urlからidを取り出す
    const id = Number(req.params.id);
    // 更新用データを元に、DBを更新
    const todo = await updatedTodo(id, req.body);
    // 更新されたデータを返す
    res.json(todo);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
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
