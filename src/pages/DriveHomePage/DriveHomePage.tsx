import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Spin,
  Table,
  Typography,
  Empty,
  Dropdown,
  Menu,
  Modal,
  Input,
  Button,
  Space,
  message,
} from "antd";
import type { TableProps } from "antd";
import { nodeApi } from "../../api";
import { useDriveContext } from "../../hooks/useDriveContext";
import { useCreateNode } from "../../hooks/useCreateNode";
import type { TreeNodeDto } from "../../types/node.types";
import {
  EditOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  MoreOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import FileIcon from "../../assets/Icons/FileIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import MoveNodeModal from "../../components/modals/MoveNodeModal";

const { Title } = Typography;
const { confirm } = Modal;

const DriveHomePage: React.FC = () => {
  const [rootNodes, setRootNodes] = useState<TreeNodeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { hiddenDetails } = useDriveContext();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State cho các modal
  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [isMoveModalVisible, setMoveModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  // State để lưu thông tin cho các hành động
  const [actionTarget, setActionTarget] = useState<TreeNodeDto | null>(null);
  const [itemName, setItemName] = useState("");

  const fetchRootContent = useCallback(async () => {
    setLoading(true);
    hiddenDetails();
    try {
      const content = await nodeApi.getNodesByParentId(null);
      setRootNodes(content);
    } catch (error) {
      message.error("Không thể tải dữ liệu Drive.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [hiddenDetails]);

  useEffect(() => {
    fetchRootContent();
  }, [fetchRootContent]);

  const { showCreateModal, CreateNodeModal } = useCreateNode({ onNodeCreated: fetchRootContent });

  const handleRowDoubleClick = (record: TreeNodeDto) => {
    if (record.type === "FOLDER") {
      navigate(`/drive/${record.id}`);
    } else {
      navigate(`/file/${record.id}`);
    }
  };

  // --- Logic cho các hành động ---
  const handleShowRenameModal = (record: TreeNodeDto) => {
    setActionTarget(record);
    setItemName(record.name);
    setRenameModalVisible(true);
  };

  const handleRename = async () => {
    if (!itemName.trim() || !actionTarget) {
      toast.error("Tên không hợp lệ.");
      return;
    }
    setProcessing(true);
    try {
      await nodeApi.updateNodeName(actionTarget.id, { name: itemName });
      toast.success("Đổi tên thành công!");
      setRenameModalVisible(false);
      await fetchRootContent();
    } catch {
      toast.error("Đổi tên thất bại.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (record: TreeNodeDto) => {
    confirm({
      title: `Chuyển "${record.name}" vào thùng rác?`,
      icon: <ExclamationCircleFilled />,
      content: "Bạn có thể khôi phục mục này từ thùng rác.",
      okText: "Chuyển vào thùng rác",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await nodeApi.softDeleteNode(record.id);
          toast.success("Đã chuyển vào thùng rác!");
          fetchRootContent();
        } catch {
          toast.error("Xóa thất bại.");
        }
      },
    });
  };

  const handleShowMoveModal = (record: TreeNodeDto) => {
    setActionTarget(record);
    setMoveModalVisible(true);
  };

  // Menu cho từng mục trong bảng
  const itemMenu = (record: TreeNodeDto) => {
    const isRootAdmin = user?.role === "RootAdmin";
    const canEdit = isRootAdmin || record.userPermission === "Editor" || record.userPermission === "Owner";
    const canDelete = isRootAdmin || record.userPermission === "Owner";

    return (
      <Menu onClick={({ key }) => {
          if (key === 'rename') handleShowRenameModal(record);
          if (key === 'move') handleShowMoveModal(record);
          if (key === 'delete') handleDelete(record);
      }}>
        <Menu.Item key="rename" icon={<EditOutlined />} disabled={!canEdit}>Đổi tên</Menu.Item>
        <Menu.Item key="move" icon={<SwapOutlined />} disabled={!canDelete}>Di chuyển đến...</Menu.Item>
        <Menu.Item key="share" icon={<ShareAltOutlined />}>Chia sẻ</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger disabled={!canDelete}>Xóa</Menu.Item>
      </Menu>
    );
  };

  const columns: TableProps<TreeNodeDto>['columns'] = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: TreeNodeDto) => (
        <Space>
          {record.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
          <span>{text}</span>
        </Space>
      ),
    },
    { title: "Chủ sở hữu", dataIndex: "createdBy", key: "createdBy", width: 150 },
    { title: "Quyền của bạn", dataIndex: "userPermission", key: "userPermission", width: 150 },
    {
      title: "",
      key: "action",
      width: 60,
      align: "right",
      render: (_, record) => (
        <Dropdown overlay={itemMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      ),
    },
  ];

  // Menu cho vùng trống của bảng
  const emptyAreaMenu = (
    <Menu onClick={({ key }) => {
        const type = key === 'new-folder' ? 'FOLDER' : 'FILE';
        showCreateModal({ type, parentId: null }); // parentId luôn là null ở trang chủ
    }}>
      <Menu.Item key="new-folder"><Space><FolderIcon />Thư mục mới</Space></Menu.Item>
      <Menu.Item key="new-file"><Space><FileIcon />Tài liệu mới</Space></Menu.Item>
    </Menu>
  );

  if (loading) {
    return <Spin size="large" style={{ display: "block", marginTop: 50 }} />;
  }

  return (
    <div>
      <Title level={2}>Drive của tôi</Title>
      <Dropdown overlay={emptyAreaMenu} trigger={['contextMenu']}>
        <div style={{ background: "#fff", borderRadius: 8 }}>
            <Table
                columns={columns}
                dataSource={rootNodes}
                pagination={{ pageSize: 10 }}
                rowKey="id"
                onRow={(record) => ({
                onDoubleClick: () => handleRowDoubleClick(record),
                style: { cursor: 'pointer' },
                })}
                locale={{
                emptyText: <Empty description="Drive của bạn chưa có gì. Hãy tạo mới!" />,
                }}
            />
        </div>
      </Dropdown>

      {CreateNodeModal}

      <Modal title="Đổi tên" open={isRenameModalVisible} onOk={handleRename} onCancel={() => setRenameModalVisible(false)} confirmLoading={processing}>
        <Input placeholder="Nhập tên mới" value={itemName} onChange={(e) => setItemName(e.target.value)} onPressEnter={handleRename} />
      </Modal>

      <MoveNodeModal
        visible={isMoveModalVisible}
        onCancel={() => setMoveModalVisible(false)}
        onMoveSuccess={() => { fetchRootContent(); }}
        nodeToMove={actionTarget ? { id: actionTarget.id, name: actionTarget.name } : null}
      />
    </div>
  );
};

export default DriveHomePage;
