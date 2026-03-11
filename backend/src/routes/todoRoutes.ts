import { Router } from "express";
import { getTodos, patchTodo, postTodos, removeTodo } from "../controllers/todoController.js";

const router = Router();

router.get("/todos",getTodos);
router.post("/todos",postTodos);
router.patch("/todos/:id",patchTodo);
router.delete("/todos/:id",removeTodo);

export default router;