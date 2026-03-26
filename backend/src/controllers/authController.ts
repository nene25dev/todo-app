import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewears/requireAuth.js";
import { authService } from "../services/authService.js";
// 認証
export async function register(req: Request, res: Response) {
    const { email, password, name } = req.body;

    const { user, token } = await authService.register({
        email,
        password,
        name,
    });

    // Cookie保存
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(201).json({ user });
}

// ログイン
export async function login(req: Request, res: Response) {
    const { email, password } = req.body;

    const { user, token } = await authService.login({
        email,
        password,
    });

    // Cookie保存
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({ user });
}

// ユーザー取得
export async function getMe(req: AuthRequest, res: Response) {
    // requireAuthでセットされた user を使う
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: "認証が必要です" });
    }

    const user = await authService.getMe(userId);

    res.status(200).json({ user });
}

// ログアウト
export function logout(req: Request, res: Response) {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "ログアウトしました" });
}