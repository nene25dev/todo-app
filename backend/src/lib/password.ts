import argon2 from "argon2";

// パスワードをハッシュ化
export async function hashPassword(password:string) {
    return argon2.hash(password);
}

// パスワードを同じ処理をして一致するか確認
export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}