export interface User {
  _id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "RootAdmin" | "User";

export interface Node {
  userPermission: null;
  _id: string;
  name: string;
  type: NodeType;
  content?: string;
  parentId: string | null;
  ancestors: { _id: string; name: string }[];
  level: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type NodeType = "FOLDER" | "FILE";

export interface Permission {
  _id: string;
  userId: string;
  nodeId: string;
  permission: PermissionLevel;
  grantedBy: string;
  grantedAt: string;
}

export type PermissionLevel = "Owner" | "Editor" | "Viewer";

export interface AccessRequest {
  _id: string;
  requesterId: string;
  nodeId: string;
  requestedPermission: PermissionLevel;
  isRecursive: boolean;
  message?: string;
  status: RequestStatus;
  reviewerId?: string;
  reviewedAt?: string;
  createdAt: string;
}

export type RequestStatus = "PENDING" | "APPROVED" | "DENIED";

export interface ActivityLog {
  _id: string;
  userId: string;
  action: ActivityAction;
  targetId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: Record<string, any>;
  createdAt: string;
}

export type ActivityAction =
  | "NODE_CREATED"
  | "NODE_RENAMED"
  | "NODE_MOVED"
  | "NODE_DELETED"
  | "PERMISSION_GRANTED"
  | "PERMISSION_REVOKED";

export interface CreateUserDto {
  username: string;
  email: string;
  role: "RootAdmin" | "User";
  isActive: boolean;
  mustChangePassword?: boolean;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  role?: "RootAdmin" | "User";
  isActive?: boolean;
  mustChangePassword?: boolean;
}

export interface SearchResultDto {
  nodeId: string; // Backend đã biến đổi ObjectId thành string
  name: string;
  type: NodeType;
  accessStatus: AccessStatus;
  score?: number; // Điểm số liên quan, có thể không có
}
export type AccessStatus = "OWNER" | "EDITOR" | "VIEWER" | "NO_ACCESS";

// Giả định bạn đã có định nghĩa cho PermissionLevel ở frontend
// export type PermissionLevel = 'VIEWER' | 'EDITOR' | 'OWNER';

/**
 * Interface định nghĩa cấu trúc dữ liệu để gửi yêu cầu xin quyền truy cập.
 * Đây là phiên bản frontend của CreateAccessRequestDto ở backend.
 */
export interface CreateAccessRequestDto {
  /**
   * ID của Node (file hoặc folder) mà người dùng muốn xin quyền.
   */
  nodeId: string;

  /**
   * Cấp độ quyền mà người dùng yêu cầu (chỉ có thể là 'VIEWER' hoặc 'EDITOR').
   */
  requestedPermission: "Viewer" | "Editor";

  /**
   * (Tùy chọn) Áp dụng yêu cầu cho cả các thư mục con. Mặc định là false.
   */
  isRecursive?: boolean;

  /**
   * (Tùy chọn) Lời nhắn gửi cho chủ sở hữu.
   */
  message?: string;
}
