// HTTPリクエストを受けて、レスポンスを返す
import type { Request, Response } from "express";
import { todoService } from "../services/todoService.js";
import { AppError } from "../errors/AppError.js";
import type { Deadline } from "../generated/prisma/enums.js";

// TODO:仮固定、認証導入時に差し替え
const userId = 1;

type ReorderTodoItem = {
  id: number;
  deadline: Deadline;
  sortOrder: number;
};


// get
export const getTodos = async (_req: Request, res: Response) => {
  try {
    const todos = await todoService.getAllTodos(userId);
    res.json(todos);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: "Todo一覧の取得に失敗しました" });
  }
};

// post
export const postTodos = async (req: Request, res: Response) => {
  try {
    const newTodo = await todoService.createNewTodo(userId,req.body);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
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
    const todo = await todoService.updatedTodo(id, req.body);
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

    await todoService.deleteTodo(id);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: "Todo削除に失敗しました" });
  }
};


export const reorderTodos = async (req: Request, res: Response) => {
  try {
    const items = req.body as ReorderTodoItem[];

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "不正なデータです" });
    }

    await todoService.reorderTodos(userId, items);

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Todoの並び順保存に失敗しました" });
  }
};