export type User = {
  id: number;
  email: string;
  name: string | null;
};

export type RegisterInput = {
  name?: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};