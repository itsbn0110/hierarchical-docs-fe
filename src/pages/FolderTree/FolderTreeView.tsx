// src/components/FolderTreeView/FolderTreeView.tsx

import React, { useState, useEffect } from "react";
import { Tree, Spin, message } from "antd";
import type { DataNode } from "antd/es/tree";
import { FolderOutlined, FileTextOutlined } from "@ant-design/icons";

// Import service gọi API của bạn
import { nodeApi } from "../../api/node"; // Giả sử bạn có service này

// Định nghĩa kiểu dữ liệu trả về từ API (dựa trên TreeNodeDto)
interface ApiTreeNode {
  id: string;
  name: string;
  type: "FOLDER" | "FILE";
  hasChildren: boolean;
  userPermission: "VIEWER" | "EDITOR" | "OWNER" | null;
}

// DataNode của antd cần thêm các thuộc tính này
interface CustomDataNode extends DataNode {
  type: "FOLDER" | "FILE";
  userPermission: "VIEWER" | "EDITOR" | "OWNER" | null;
}

const FolderTreeView: React.FC = () => {
  const [treeData, setTreeData] = useState<CustomDataNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const transformToDataNode = (node: ApiTreeNode): CustomDataNode => ({
    key: node.id,
    title: node.name,
    type: node.type,
    userPermission: node.userPermission,
    icon: node.type === "FOLDER" ? <FolderOutlined /> : <FileTextOutlined />,
    isLeaf: !node.hasChildren, // `isLeaf` là true nếu không có con
  });
  // ... Các logic khác sẽ được thêm vào đây

  useEffect(() => {
    const fetchRootNodes = async () => {
      try {
        setLoading(true);
        // Gọi API để lấy node gốc (parentId = null)
        const rootNodes = await nodeApi.getNodesByParentId(null);
        console.log("Root nodes:", rootNodes); // Kiểm tra dữ liệu trả về
        setTreeData(rootNodes.map(transformToDataNode));
      } catch (error) {
        message.error("Không thể tải danh sách thư mục.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRootNodes();
  }, []);

  const updateTreeData = (
    list: CustomDataNode[],
    key: React.Key,
    children: CustomDataNode[]
  ): CustomDataNode[] => {
    return list.map((node: CustomDataNode) => {
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children as CustomDataNode[], key, children),
        };
      }
      return node;
    });
  };

  const onLoadData = async (node: CustomDataNode): Promise<void> => {
    // Nếu node đã có con hoặc là một file, không làm gì cả
    if (node.children || node.type === "FILE") {
      return;
    }

    try {
      const childNodesFromApi = await nodeApi.getNodesByParentId(node.key as string);
      const newChildren = childNodesFromApi.map(transformToDataNode);

      // Cập nhật state của cây với dữ liệu con mới
      setTreeData((currentTreeData) => updateTreeData(currentTreeData, node.key, newChildren));
    } catch (error) {
      console.log(error);
      message.error(`Không thể tải nội dung của thư mục "${node.title}".`);
    }
  };

  if (loading) {
    return <Spin tip="Đang tải..." />;
  }

  return (
    <Tree
      showIcon
      loadData={onLoadData} // Gán hàm lazy-loading vào đây
      treeData={treeData}
    />
  );
};

export default FolderTreeView;
