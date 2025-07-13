import api from "./axios";
import type {
  CreateNodeDto,
  MoveNodeDto,
  TreeNodeDto,
  UpdateNodeContentDto,
  UpdateNodeNameDto,
} from "../types/node.types";
import type { Node as DriveNode } from "../types/app.types";
import { type TrashedItem } from "../types/node.types";
const getNodesByParentId = async (parentId: string | null): Promise<TreeNodeDto[]> => {
  const res = await api.get("/nodes", {
    params: parentId ? { parentId } : {},
  });
  return res.data;
};

const getNodeById = async (id: string): Promise<DriveNode> => {
  const res = await api.get(`/nodes/${id}`);
  return res.data;
};

const createNode = async (data: CreateNodeDto) => {
  const res = await api.post("/nodes", data);
  return res.data;
};

const updateNodeName = async (id: string, data: UpdateNodeNameDto) => {
  const res = await api.patch(`/nodes/${id}/name`, data);
  return res.data;
};

const updateNodeContent = async (id: string, data: UpdateNodeContentDto) => {
  const res = await api.patch(`/nodes/${id}/content`, data);
  return res.data;
};

const moveNode = async (id: string, data: MoveNodeDto) => {
  const res = await api.patch(`/nodes/${id}/move`, data);
  return res.data;
};


const getTrashedNodes = async (): Promise<TrashedItem[]> => {
    const res = await api.get('/nodes/trash');
    return res.data;
}

const softDeleteNode = async (id: string) => {
  const res = await api.delete(`/nodes/${id}`);
  return res.data;
};


const deleteNodePermanently = async (id: string): Promise<void> => {
    await api.delete(`/nodes/${id}/permanently`);
}


const restoreNode = async (id: string): Promise<void> => {
    await api.post(`/nodes/${id}/restore`);
}



export const nodeApi = {
  getNodesByParentId,
  getNodeById,
  createNode,
  updateNodeName,
  updateNodeContent,
  moveNode,
  softDeleteNode,
  deleteNodePermanently,
  getTrashedNodes,
  restoreNode
};
