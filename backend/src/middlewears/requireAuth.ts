import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/auth.js"

export type AuthRequest = Request & {
    user?: {
        userId: number;
        email: string;
    };
};

// 認証チェック
export function requireAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        // CookieからJWTを取り出す
        const token = req.cookies.token;

        // 未ログイン → 強制終了
        if (!token) {
            return res.status(401).json({ message: "認証が必要です" });
        }

        // JWTが正しいかチェック
        const payload = verifyAccessToken(token);
        // ユーザー情報を保存
        req.user = payload;

        next();
    } catch {
        return res.status(401).json({ message: "認証に失敗しました" });
    }
}