import api from "./axios";
import type { ActivityAction } from "../types/app.types";

// Kiểu dữ liệu cho bản ghi lịch sử hoạt động
export interface ActivityLog {
  _id: string;
  action: ActivityAction;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: Record<string, any>;
  timestamp: string;
  user: {
    _id: string;
    username: string;
  };
}

const getForNode = async (nodeId: string): Promise<ActivityLog[]> => {
  const res = await api.get(`/permissions/activity/${nodeId}`);
  return res.data;
};

export const activityLogApi = {
  getForNode,
};
