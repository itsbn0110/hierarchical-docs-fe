import api from "./axios";
import type { CreateUserDto, UpdateUserDto } from "../types/app.types";

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const getUserById = async (id: string) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const createUser = async (data: CreateUserDto) => {
  const res = await api.post("/users", data);
  return res.data;
};

export const updateUser = async (id: string, data: UpdateUserDto) => {
  const res = await api.patch(`/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};
