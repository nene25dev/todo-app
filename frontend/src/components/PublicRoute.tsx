import { Navigate, Outlet } from "react-router-dom";
import type { User } from "../types/auth";

type Props = {
    user: User | null;
    isLoading: boolean;
};

export default function PublicRoute({ user, isLoading }: Props) {
    if (isLoading) {
        return <p>読み込み中...</p>;
    }

    if (user) {
        return <Navigate to="/todos" replace />;
    }

    return <Outlet />;
}