import api from "./axios";
import type {
  CreateNodeDto,
  MoveNodeDto,
  TreeNodeDto,
  UpdateNodeContentDto,
  UpdateNodeNameDto,
} from "../types/node.types";
import type { Node as DriveNode } from "../types/app.types";
/**
 * Lấy danh sách các node con của một thư mục cha (hỗ trợ lazy-loading).
 * @param parentId - ID của thư mục cha. Nếu là null, sẽ lấy các node ở cấp gốc.
 * @returns Mảng các node con.
 */
export const getNodesByParentId = async (parentId: string | null): Promise<TreeNodeDto[]> => {
  const res = await api.get("/nodes", {
    params: {
      // Nếu parentId tồn tại, thêm nó vào query params. Nếu không, không gửi param này.
      ...(parentId && { parentId }),
    },
  });
  return res.data;
};

export const getNodeById = async (id: string): Promise<DriveNode> => {
  const res = await api.get(`/nodes/${id}`);
  return res.data;
};
/**
 * Tạo một node mới (thư mục hoặc file).
 * @param data - Dữ liệu để tạo node mới, bao gồm tên, loại, và parentId.
 * @returns Node vừa được tạo.
 */
export const createNode = async (data: CreateNodeDto) => {
  const res = await api.post("/nodes", data);
  return res.data;
};

/**
 * Đổi tên một node.
 * @param id - ID của node cần đổi tên.
 * @param data - Dữ liệu chứa tên mới.
 * @returns Node đã được cập nhật.
 */
export const updateNodeName = async (id: string, data: UpdateNodeNameDto) => {
  const res = await api.patch(`/nodes/${id}/name`, data);
  return res.data;
};

/**
 * Cập nhật nội dung của một file.
 * @param id - ID của file cần cập nhật.
 * @param data - Dữ liệu chứa nội dung mới.
 * @returns File đã được cập nhật.
 */
export const updateNodeContent = async (id: string, data: UpdateNodeContentDto) => {
  const res = await api.patch(`/nodes/${id}/content`, data);
  return res.data;
};

/**
 * Di chuyển một node sang một thư mục cha mới.
 * @param id - ID của node cần di chuyển.
 * @param data - Dữ liệu chứa ID của thư mục cha mới.
 * @returns Node đã được di chuyển.
 */
export const moveNode = async (id: string, data: MoveNodeDto) => {
  const res = await api.patch(`/nodes/${id}/move`, data);
  return res.data;
};

/**
 * Xóa một node (và tất cả các node con của nó nếu là thư mục).
 * @param id - ID của node cần xóa.
 * @returns Kết quả xóa.
 */
export const deleteNode = async (id: string) => {
  const res = await api.delete(`/nodes/${id}`);
  return res.data;
};

// Gom lại thành một object để dễ quản lý và import
export const nodeApi = {
  getNodesByParentId,
  getNodeById,
  createNode,
  updateNodeName,
  updateNodeContent,
  moveNode,
  deleteNode,
};
