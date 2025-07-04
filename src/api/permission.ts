import api from "./axios";
import type { PermissionLevel } from "../types/app.types";

// Định nghĩa kiểu dữ liệu cho một quyền truy cập trả về từ API
// Giả định API trả về thông tin chi tiết của người dùng
export interface UserPermission {
  _id: string; // ID của bản ghi quyền
  user: {
    _id: string;
    username: string;
    email: string;
  };
  permission: PermissionLevel;
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

// Các hàm API khác cho việc quản lý quyền (cấp quyền, thu hồi quyền) có thể được thêm vào đây

export const permissionsApi = {
  getPermissionsForNode,
};
