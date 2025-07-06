// Các kiểu dữ liệu liên quan đến Auth
import type { User } from "./app.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}


export type UserRole = 'RootAdmin' | 'User';