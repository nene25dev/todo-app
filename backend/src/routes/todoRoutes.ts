// URLとcontrollerを結びつける
import { Router } from "express";
import { getTodos, patchTodo, postTodos, removeTodo, reorderTodos } from "../controllers/todoController.js";
import { requireAuth } from "../middlewears/requireAuth.js";

const router = Router();

router.get("/", requireAuth, getTodos);
router.post("/", requireAuth, postTodos);
router.patch("/reorder", requireAuth, reorderTodos);
router.patch("/:id", requireAuth, patchTodo);
router.delete("/:id", requireAuth, removeTodo);

export default router;