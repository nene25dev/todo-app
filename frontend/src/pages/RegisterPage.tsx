import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, fetchMe } from "../api/auth";
import type { User } from "../types/auth";

type Props = {
    onLogin: (user: User) => void;
};

export default function RegisterPage({ onLogin }: Props) {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await register({ name, email, password });
            const user = await fetchMe();
            onLogin(user);
            navigate("/todos");
        } catch (err) {
            setError(err instanceof Error ? err.message : "登録に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <h1>登録</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">名前</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

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

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "送信中..." : "登録"}
                </button>
            </form>
        </div>
    );
}