import api from './axios';
import type { LoginPayload, LoginResponse } from '../types/auth.types';

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>('/auth/login', payload);
  return res.data;
};
