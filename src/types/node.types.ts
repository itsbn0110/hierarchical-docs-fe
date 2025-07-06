// Định nghĩa các type cho node API

export type NodeType = "FOLDER" | "FILE";
export type PermissionLevel = "Owner" | "Editor" | "Viewer" | "RootAdmin"; // Sửa lại nếu BE có enum khác

export interface MoveNodeDto {
  newParentId: string | null; // ID thư mục cha mới, null nếu chuyển lên root
}

export interface TreeNodeDto {
  id: string; // FE dùng string thay vì ObjectId
  name: string;
  type: NodeType;
  level: number;
  hasChildren: boolean;
  content?: string;
  userPermission: PermissionLevel;
  createdBy: string;
}

export interface UpdateNodeContentDto {
  content: string; // Nội dung mới của file
}

export interface UpdateNodeNameDto {
  name: string; // Tên mới của node
}

export interface CreateNodeDto {
  name: string; // Tên node (thư mục hoặc file)
  type: NodeType;
  parentId?: string | null; // ID thư mục cha, null nếu là node gốc
  content?: string; // Chỉ áp dụng khi type là FILE
}
