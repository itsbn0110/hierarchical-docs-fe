import api from "./axios";
import type { CreateUserDto, UpdateUserDto } from "../types/app.types";
import type { ChangePasswordDto } from "../types/api.types";

const getUsers = async () => api.get("/users").then((res) => res.data);
const getUserById = async (id: string) => api.get(`/users/${id}`).then((res) => res.data);
const createUser = async (data: CreateUserDto) => api.post("/users", data).then((res) => res.data);
const updateUser = async (id: string, data: UpdateUserDto) =>
  api.patch(`/users/${id}`, data).then((res) => res.data);
const deleteUser = async (id: string) => api.delete(`/users/${id}`).then((res) => res.data);
const changePassword = async ( data: ChangePasswordDto): Promise<{ message: string }> => {
    const res = await api.patch(`/users/me/password`, data);
    return res.data;
};
export const userApi = { getUsers, getUserById, createUser, updateUser, deleteUser,changePassword};
