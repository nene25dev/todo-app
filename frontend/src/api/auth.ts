import type { LoginInput, RegisterInput, User } from "../types";

const API_URL = import.meta.env.VITE_API_URL;


// 登録
export async function register(input: RegisterInput) {
    const res = await fetch(`${API_URL}/auth`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(input),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "登録に失敗しました");
    }

    return data;
}

// ログイン
export async function login(input: LoginInput) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(input),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "ログインに失敗しました");
    }

    return data;
}

// ユーザー取得
export async function fetchMe(): Promise<User> {
    const res = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "未ログインです");
    }

    return data.user;
}

// ログアウト
export async function logout() {
    const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "ログアウトに失敗しました");
    }

    return data;
}