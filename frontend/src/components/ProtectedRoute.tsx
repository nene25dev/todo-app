import { Navigate, Outlet } from "react-router-dom";
import type { User } from "../types/auth";

type Props = {
    user: User | null;
    isLoading: boolean;
};

export default function ProtectedRoute({ user, isLoading }: Props) {
    if (isLoading) {
        return <p>読み込み中...</p>;
    }

    if (!user) {
        // Navigate：リダイレクト
        return <Navigate to="/login" replace />;
    }
    // Outlet：子ルートの表示場所を指定
    return <Outlet />;
}