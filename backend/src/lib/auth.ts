import jwt from "jsonwebtoken";

// トークンの中に入れる情報
type AuthPayload = {
    userId: number;
    email: string;
}

// シークレットキー
const JWT_SECRET = process.env.JWT_SECRET!;

// トークン発行
export function signAccessToken(payload: AuthPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken (token: string): AuthPayload {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
}