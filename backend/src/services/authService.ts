import { hashPassword,verifyPassword } from "../lib/password.js";
import { signAccessToken } from "../lib/auth.js";
import { AppError } from "../errors/AppError.js";
import { userRepository } from "../repositories/userRepository.js";

// 認証
async function register({
    email,
    password,
    name,
}: {
    email: string;
    password: string;
    name: string;
}) {
    // メールアドレスの重複チェック
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
        throw new AppError("このメールアドレスは既に使われています", 400);
    }

    // パスワードハッシュ化
    const passwordHash = await hashPassword(password);

    // ユーザー作成
    const user = await userRepository.create({
        email,
        passwordHash,
        name,
    });

    // JWT発行
    const token = signAccessToken({
        userId: user.id,
        email: user.email,
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        token,
    };
}

// ログイン
type LoginInput = {
    email: string;
    password: string;
};

async function login({ email, password }: LoginInput) {
    // メールアドレスでユーザー検索
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new AppError("メールアドレスまたはパスワードが違います", 401);
    }

    // パスワードを照合
    const isMatched = await verifyPassword(user.passwordHash,password);

    if (!isMatched) {
        throw new AppError("メールアドレスまたはパスワードが違います", 401);
    }

    // JWT発行
    const token = signAccessToken({
        userId: user.id,
        email: user.email,
    });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
    };
}

// ユーザー取得
export async function getMe(userId: number) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError("ユーザーが見つかりませんでした", 404);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export const authService = {
    register,
    login,
    getMe,
};