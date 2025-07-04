import api from "./axios";
import type { ActivityAction } from "../types/app.types";

// Định nghĩa cấu trúc của một bản ghi lịch sử hoạt động trả về từ API
export interface ActivityLog {
  _id: string;
  action: ActivityAction;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: Record<string, any>;
  timestamp: string; // hoặc Date
  user: {
    _id: string;
    username: string;
  };
}

/**
 * Lấy lịch sử hoạt động cho một node cụ thể.
 * @param nodeId - ID của node (file hoặc folder).
 * @returns Một mảng các bản ghi lịch sử hoạt động.
 */
const getActivityForNode = async (nodeId: string): Promise<ActivityLog[]> => {
  const res = await api.get(`/permissions/activity/${nodeId}`);
  return res.data;
};

export const activityLogApi = {
  getActivityForNode,
};
