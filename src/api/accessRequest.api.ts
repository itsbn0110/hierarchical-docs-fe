import api from "./axios";
import type { CreateAccessRequestDto, PermissionLevel, RequestStatus } from "../types/app.types";

// [SỬA] Bổ sung đầy đủ các trường cho PendingRequest để khớp với dữ liệu API trả về
export interface PendingRequest {
  _id: string; // ID của bản ghi yêu cầu
  node: {
    _id: string;
    name: string;
    type: "FOLDER" | "FILE";
  };
  requester: {
    _id: string;
    username: string;
  };
  requestedPermission: PermissionLevel;
  message?: string;
  createdAt: string;
}


export interface ProcessedRequest extends Omit<PendingRequest, 'message'> {
    status: RequestStatus;
    reviewedAt: string;
    reviewer: {
        _id: string;
        username: string;
    };
}


/**
 * Gửi yêu cầu xin quyền truy cập cho một node.
 * @param data - Dữ liệu yêu cầu, bao gồm nodeId, message, và quyền mong muốn.
 */
const create = async (data: CreateAccessRequestDto) => {
  const res = await api.post("/access-requests", data);
  return res.data;
};

/**
 * Lấy danh sách các yêu cầu đang chờ xử lý cho người dùng hiện tại (owner).
 * @returns Mảng các yêu cầu truy cập đang chờ xử lý.
 */
const getPendingRequests = async (): Promise<PendingRequest[]> => {
  const res = await api.get("/access-requests/pending");
  return res.data;
};

/**
 * Chấp thuận một yêu cầu truy cập.
 * @param requestId - ID của yêu cầu cần chấp thuận.
 */
const approve = async (requestId: string) => {
  const res = await api.post(`/access-requests/${requestId}/approve`);
  return res.data;
};

/**
 * Từ chối một yêu cầu truy cập.
 * @param requestId - ID của yêu cầu cần từ chối.
 */
const deny = async (requestId: string) => {
  const res = await api.post(`/access-requests/${requestId}/deny`);
  return res.data;
};


const getProcessedRequests = async (): Promise<ProcessedRequest[]> => {
    const res = await api.get("/access-requests/processed");
    return res.data;
}
export const accessRequestApi = {
  create,
  getPendingRequests,
  getProcessedRequests,
  approve,
  deny,
};
