import type { NodeType, PermissionLevel } from "../types/app.types";
// Định nghĩa kiểu dữ liệu cho một quyền truy cập trả về từ API
export interface UserPermission {
  _id: string; // ID của bản ghi quyền (permission record)
  user: {
    _id: string;
    username: string;
    email: string;
    isActive: boolean;
  };
  permission: PermissionLevel;
}

// Định nghĩa kiểu dữ liệu cho việc gửi yêu cầu cấp quyền
// Backend sẽ cần tìm user ID từ email nếu được cung cấp
export interface GrantPermissionPayload {
  nodeId: string;
  permission: PermissionLevel;
  userId?: string; // Cấp quyền theo User ID (nếu đã biết)
  email?: string; // Hoặc cấp quyền bằng cách mời qua email
}

export interface InviteEmailPayload {
  nodeId: string;
  permission: PermissionLevel;
  email: string; // Hoặc cấp quyền bằng cách mời qua email
}

export interface SharedNode {
  _id: string;
  name: string;
  type: NodeType;
  yourPermission: PermissionLevel;
  sharedBy: string;
  sharedAt: string;
}

/**
 * DTO cho một mục đã truy cập gần đây.
 */
export interface RecentItem {
  _id: string;
  name: string;
  type: NodeType;
  owner: string;
  lastAccessedAt: string;
}

export interface PermissionDetails {
  _id: string;
  permission: PermissionLevel;
  grantedAt: string;
  user: {
    _id: string;
    username: string;
  };
  node: {
    _id: string;
    name: string;
    type: NodeType;
  };
  grantedBy: {
    _id: string;
    username: string;
  };
}

export interface FindAllPermissionsParams {
  page?: number;
  limit?: number;
  search?: string;
}
