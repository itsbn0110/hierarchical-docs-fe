import api from "./axios";
import type { PermissionLevel } from "../types/app.types";

// Định nghĩa kiểu dữ liệu cho một quyền truy cập trả về từ API
export interface UserPermission {
  _id: string; // ID của bản ghi quyền (permission record)
  user: {
    _id: string;
    username: string;
    email: string;
  };
  permission: PermissionLevel;
}

// Định nghĩa kiểu dữ liệu cho việc gửi yêu cầu cấp quyền
// Backend sẽ cần tìm user ID từ email nếu được cung cấp
interface GrantPermissionPayload {
  nodeId: string;
  permission: PermissionLevel;
  userId?: string; // Cấp quyền theo User ID (nếu đã biết)
  email?: string; // Hoặc cấp quyền bằng cách mời qua email
}

interface InviteEmailPayload {
  nodeId: string;
  permission: PermissionLevel;
  email: string; // Hoặc cấp quyền bằng cách mời qua email
}

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

export const permissionsApi = {
  getPermissionsForNode,
  inviteByEmail,
  grant,
  revoke,
};
