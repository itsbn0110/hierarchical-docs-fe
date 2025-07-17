import api from "./axios";

import {
  type FindAllPermissionsParams,
  type GrantPermissionPayload,
  type InviteEmailPayload,
  type PermissionDetails,
  type RecentItem,
  type SharedNode,
  type UserPermission,
} from "../types/permission.types";

/**
 * Lấy danh sách tất cả các quyền truy cập cho một node cụ thể.
 * @param nodeId - ID của node (file hoặc folder).
 * @returns Mảng các quyền truy cập.
 */
const getPermissionsForNode = async (nodeId: string): Promise<UserPermission[]> => {
  const res = await api.get(`/permissions/node/${nodeId}`);
  return res.data;
};

/**
 * Cấp quyền truy cập một node cho người dùng.
 * @param payload - Dữ liệu bao gồm nodeId, permission, và userId hoặc email.
 * @returns Bản ghi quyền vừa được tạo hoặc cập nhật.
 */
const grant = async (payload: GrantPermissionPayload): Promise<UserPermission> => {
  const res = await api.post("/permissions/grant", payload);
  return res.data;
};

/**
 * Thu hồi một quyền truy cập đã được cấp.
 * @param permissionId - ID của bản ghi quyền cần xóa (permission record's _id).
 * @returns Một object xác nhận thành công.
 */
const revoke = async (permissionId: string): Promise<{ statusCode: number; message: string }> => {
  const res = await api.delete(`/permissions/${permissionId}`);
  return res.data;
};

const inviteByEmail = async (payload: InviteEmailPayload): Promise<UserPermission> => {
  const res = await api.post(`/permissions/invite`, payload);
  return res.data;
};

const getSharedWithMe = async (): Promise<SharedNode[]> => {
  const res = await api.get("/permissions/shared-with-me");
  return res.data;
};

/**
 * Lấy danh sách các mục đã truy cập gần đây.
 */
const getRecentItems = async (): Promise<RecentItem[]> => {
  const res = await api.get("/permissions/recent");
  return res.data;
};

const getAllPermissions = async (
  params: FindAllPermissionsParams
): Promise<{ data: PermissionDetails[]; total: number }> => {
  const res = await api.get("/permissions/management", { params });
  return res.data;
};

export const permissionsApi = {
  getPermissionsForNode,
  inviteByEmail,
  grant,
  revoke,
  getSharedWithMe,
  getRecentItems,
  getAllPermissions,
};
