import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, fetchMe } from "../api/auth";
import type { User } from "../types/auth";

type Props = {
    onLogin: (user: User) => void;
};

export default function LoginPage({ onLogin }: Props) {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    // 送信中フラグ
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            // ログイン処理
            await login({ email, password });
            // ユーザー取得
            const user = await fetchMe();
            onLogin(user);
            navigate("/todos");
        } catch (err) {
            setError(err instanceof Error ? err.message : "ログインに失敗しました");
        } finally {
            // ローディング解除
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <h1>ログイン</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">メールアドレス</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="password">パスワード</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && <p>{error}</p>}

                {/* 二重送信防止 */}
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "送信中..." : "ログイン"}
                </button>
            </form>
        </div>
    );
}