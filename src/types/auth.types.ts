import type { User } from "./app.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: unknown;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type UserRole = "RootAdmin" | "User";
