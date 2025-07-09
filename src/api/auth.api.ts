import api from "./axios";
import type { LoginPayload, LoginResponse } from "../types/auth.types";

const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  return res.data;
};

const refreshTokenAPI = async (): Promise<LoginResponse> => {
  const refreshToken = localStorage.getItem("refreshToken");
  const res = await api.post<LoginResponse>("/auth/refresh", { refreshToken });
  return res.data;
};

export const authApi = {
  login,
  refreshTokenAPI,
};
