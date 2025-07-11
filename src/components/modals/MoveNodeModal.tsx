import React, { useState, useEffect } from "react";
import { Modal, Tree, Spin, message, Empty } from "antd";
import type { DataNode, TreeProps } from "antd/es/tree";
import { nodeApi } from "../../api";
import FolderIcon from "../../assets/Icons/FolderIcon";

interface MoveNodeModalProps {
  visible: boolean;
  onCancel: () => void;
  onMoveSuccess: () => void;
  nodeToMove: { id: string; name: string } | null;
}

// Hàm helper để lọc bỏ node đang di chuyển và các con của nó khỏi cây
const filterTree = (tree: DataNode[], nodeIdToExclude?: string): DataNode[] => {
  if (!nodeIdToExclude) return tree;
  return tree.filter((node) => {
    if (node.key === nodeIdToExclude) return false;
    if (node.children) {
      node.children = filterTree(node.children, nodeIdToExclude);
    }
    return true;
  });
};

const MoveNodeModal: React.FC<MoveNodeModalProps> = ({
  visible,
  onCancel,
  onMoveSuccess,
  nodeToMove,
}) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Helper để biến đổi dữ liệu từ API sang định dạng của Antd Tree, chỉ lấy thư mục
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformToFolderDataNode = (nodes: any[]): DataNode[] => {
    return nodes
      .filter((node) => node.type === "FOLDER")
      .map((node) => ({
        key: node.id,
        title: node.name,
        isLeaf: !node.hasChildren,
      }));
  };

  // Helper để cập nhật cây thư mục một cách đệ quy
  const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] => {
    return list.map((node) => {
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateTreeData(node.children, key, children) };
      }
      return node;
    });
  };

  // Logic tải dữ liệu lười biếng cho cây
  const onLoadData: TreeProps["loadData"] = (node) =>
    new Promise<void>((resolve) => {
      if (node.children && node.children.length > 0) {
        resolve();
        return;
      }
      nodeApi
        .getNodesByParentId(node.key as string)
        .then((childNodes) => {
          const folderNodes = transformToFolderDataNode(childNodes);
          setTreeData((origin) => updateTreeData(origin, node.key, folderNodes));
          resolve();
        })
        .catch(() => {
          message.error("Không thể tải thư mục con.");
          resolve();
        });
    });

  useEffect(() => {
    if (visible) {
      setLoading(true);
      setSelectedKey(null); // Reset lựa chọn mỗi khi mở modal
      // Lấy các thư mục ở cấp gốc ban đầu
      nodeApi
        .getNodesByParentId(null)
        .then((rootNodes) => {
          const transformedNodes = transformToFolderDataNode(rootNodes);
          const filteredData = filterTree(transformedNodes, nodeToMove?.id);
          setTreeData(filteredData);
        })
        .catch(() => message.error("Không thể tải cây thư mục."))
        .finally(() => setLoading(false));
    }
  }, [visible, nodeToMove]);

  const handleOk = async () => {
    if (!selectedKey || !nodeToMove) {
      message.warning("Vui lòng chọn một thư mục đích.");
      return;
    }
    setProcessing(true);
    try {
      await nodeApi.moveNode(nodeToMove.id, { newParentId: selectedKey });
      message.success(`Đã di chuyển "${nodeToMove.name}" thành công.`);
      onMoveSuccess(); // Gọi callback để refresh lại trang
      onCancel(); // Đóng modal
    } catch (error) {
      console.log(error);
      message.error(
        "Di chuyển thất bại. Bạn có thể không có quyền hoặc đang di chuyển vào thư mục con của nó."
      );
    } finally {
      setProcessing(false);
    }
  };

  const onSelect = (keys: React.Key[]) => {
    if (keys.length > 0) {
      setSelectedKey(keys[0] as string);
    }
  };

  return (
    <Modal
      title={`Di chuyển "${nodeToMove?.name}"`}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={processing}
      okText="Di chuyển"
      cancelText="Hủy"
      okButtonProps={{ disabled: !selectedKey }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
        </div>
      ) : (
        <>
          <p>Chọn vị trí mới:</p>
          <div
            style={{
              maxHeight: "40vh",
              overflowY: "auto",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              padding: "8px",
            }}
          >
            {treeData.length > 0 ? (
              <Tree
                showIcon
                loadData={onLoadData}
                treeData={treeData}
                onSelect={onSelect}
                selectedKeys={selectedKey ? [selectedKey] : []}
                icon={<FolderIcon />}
              />
            ) : (
              <Empty description="Không có thư mục nào để di chuyển đến." />
            )}
          </div>
        </>
      )}
    </Modal>
  );
};

export default MoveNodeModal;
