import { Router } from "express";
import { register, login, getMe,logout } from "../controllers/authController.js";
import { requireAuth } from "../middlewears/requireAuth.js";

const router = Router();

router.post("/", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

export default router;