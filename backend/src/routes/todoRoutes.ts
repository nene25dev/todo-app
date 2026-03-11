import { Router } from "express";
import { getTodos, patchTodo, postTodos, removeTodo } from "../controllers/todoController.js";

const router = Router();

router.get("/",getTodos);
router.post("/",postTodos);
router.patch("/:id",patchTodo);
router.delete("/:id",removeTodo);

export default router;