import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { fetchMe } from "./api/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TodosPage from "./pages/TodosPage";
import type { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // アプリ起動時
  useEffect(() => {
    // ログインチェック
    async function checkAuth() {
      try {
        const currentUser = await fetchMe();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* 未ログイン */}
        <Route element={<PublicRoute user={user} isLoading={isLoading} />}>
          <Route
            path="/login"
            element={<LoginPage onLogin={setUser} />}
          />
          <Route
            path="/register"
            element={<RegisterPage onLogin={setUser} />}
          />
        </Route>

        {/* ログイン済 */}
        <Route element={<ProtectedRoute user={user} isLoading={isLoading} />}>
          <Route
            path="/"
            element={user ? <Navigate to="/todos" replace /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/todos"
            element={
              user ? (
                <TodosPage
                  user={user}
                  onLogout={() => setUser(null)}
                />
              ) : null
            }
          />
        </Route>

        {/* 存在しないURLはトップにリダイレクト */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}