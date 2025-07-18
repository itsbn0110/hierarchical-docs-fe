import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Spin,
  Table,
  Typography,
  Breadcrumb,
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
import type { Node as DriveNode } from "../../types/app.types";
import type { TreeNodeDto } from "../../types/node.types";
import {
  HomeOutlined,
  InfoCircleOutlined,
  EditOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  MoreOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import FileIcon from "../../assets/Icons/FileIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";

import { useAuth } from "../../hooks/useAuth";
import MoveNodeModal from "../../components/modals/MoveNodeModal";
// Đường dẫn tới component ManageAccessModal mới của bạn
import ManageAccessModal from "../../components/modals/ManageAccessModal";
import { ErrorMessages, SuccessMessages } from "../../constants/messages";

const { Title } = Typography;
const { confirm } = Modal;

const FolderPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { selectNodeId, selectedNodeId, showDetails, toggleDetails } = useDriveContext();
  const { user } = useAuth();

  const [nodes, setNodes] = useState<TreeNodeDto[]>([]);
  const [currentFolder, setCurrentFolder] = useState<DriveNode | null>(null);
  const [loading, setLoading] = useState(true);

  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [itemName, setItemName] = useState("");
  const [processing, setProcessing] = useState(false);

  const [isMoveModalVisible, setMoveModalVisible] = useState(false);
  const [nodeToMove, setNodeToMove] = useState<{ id: string; name: string } | null>(null);

  const [isManageAccessModalVisible, setManageAccessModalVisible] = useState(false);
  const [nodeToShare, setNodeToShare] = useState<DriveNode | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    record?: TreeNodeDto;
  }>({ visible: false, x: 0, y: 0 });

  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const refreshFolder = async () => {
    if (!folderId) return;
    try {
      const folderContent = await nodeApi.getNodesByParentId(folderId);
      setNodes(folderContent);
    } catch {
      message.error(ErrorMessages.REFRESH_DOCUMENT_FAILED);
    }
  };

  const { showCreateModal, CreateNodeModal } = useCreateNode({ onNodeCreated: refreshFolder });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".ant-dropdown")) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!folderId) return;
    selectNodeId(null);

    const fetchFolderData = async () => {
      setLoading(true);
      try {
        const [folderDetails, folderContent] = await Promise.all([
          nodeApi.getNodeById(folderId),
          nodeApi.getNodesByParentId(folderId),
        ]);
        setCurrentFolder(folderDetails);
        setNodes(folderContent);
        selectNodeId(folderId);
        showDetails();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.response?.status === 403) {
          navigate(`/request-access/folder/${folderId}`);
        } else {
          message.error(ErrorMessages.LOAD_DRIVE_FAILED);
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFolderData();
  }, [folderId, navigate, selectNodeId, showDetails]);

  const handleRowClick = (record: TreeNodeDto) => {
    selectNodeId(record.id);
    showDetails();
  };

  const handleRowDoubleClick = (record: TreeNodeDto) => {
    if (record.type === "FOLDER") navigate(`/drive/${record.id}`);
    else navigate(`/file/${record.id}`);
  };

  const handleInfoClick = () => {
    if (currentFolder) {
      toggleDetails();
    }
  };

  const handleShowRenameModal = (record: TreeNodeDto) => {
    setContextMenu({ visible: false, x: 0, y: 0 });
    selectNodeId(record.id);
    setItemName(record.name);
    setRenameModalVisible(true);
  };

  const handleRename = async () => {
    if (!itemName.trim() || !selectedNodeId) {
      message.error(ErrorMessages.DOCUMENT_NAME_INVALID);
      return;
    }
    setProcessing(true);
    try {
      await nodeApi.updateNodeName(selectedNodeId, { name: itemName });
      message.success(SuccessMessages.DOCUMENT_RENAME_SUCCESS);
      setRenameModalVisible(false);
      await refreshFolder();
    } catch {
      message.error(ErrorMessages.DOCUMENT_RENAME_FAILED);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (record: TreeNodeDto) => {
    setContextMenu({ visible: false, x: 0, y: 0 });
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
          message.success(SuccessMessages.MOVED_TO_TRASH);
          await refreshFolder();
        } catch {
          message.error(ErrorMessages.DELETE_USER_FAILED);
        }
      },
    });
  };

  const handleShowMoveModal = (record: TreeNodeDto) => {
    setContextMenu({ visible: false, x: 0, y: 0 });
    setNodeToMove({ id: record.id, name: record.name });
    setMoveModalVisible(true);
  };

  const handleShowManageAccessModal = async (record: TreeNodeDto) => {
    setContextMenu({ visible: false, x: 0, y: 0 });
    try {
      const fullNodeDetails = await nodeApi.getNodeById(record.id);
      setNodeToShare(fullNodeDetails);
      setManageAccessModalVisible(true);
    } catch (error) {
      console.log(error);
      message.error(ErrorMessages.LOAD_DRIVE_FAILED);
    }
  };

  const handleCloseManageAccessModal = () => {
    setManageAccessModalVisible(false);
    setNodeToShare(null);
  };

  const emptyAreaMenu = (
    <Menu style={{ minWidth: 180 }}>
      <Menu.Item
        key="new-folder"
        onClick={() => {
          showCreateModal({ type: "FOLDER", parentId: folderId || null });
        }}
      >
        <Space>
          <FolderIcon />
          Thư mục mới
        </Space>
      </Menu.Item>
      <Menu.Item
        key="new-file"
        onClick={() => showCreateModal({ type: "FILE", parentId: folderId || null })}
      >
        <Space>
          <FileIcon />
          Tài liệu mới
        </Space>
      </Menu.Item>
    </Menu>
  );

  const itemMenu = (record: TreeNodeDto) => {
    const isRootAdmin = user?.role === "RootAdmin";
    const canEdit =
      isRootAdmin || record.userPermission === "Editor" || record.userPermission === "Owner";
    const canDelete = isRootAdmin || record.userPermission === "Owner";

    return (
      <Menu>
        <Menu.Item
          key="rename"
          icon={<EditOutlined />}
          onClick={() => handleShowRenameModal(record)}
          disabled={!canEdit}
        >
          Đổi tên
        </Menu.Item>
        <Menu.Item
          key="move"
          icon={<SwapOutlined />}
          onClick={() => handleShowMoveModal(record)}
          disabled={!canDelete}
        >
          Di chuyển đến...
        </Menu.Item>
        <Menu.Item
          key="share"
          icon={<ShareAltOutlined />}
          onClick={() => handleShowManageAccessModal(record)}
          disabled={!canEdit}
        >
          Chia sẻ
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          key="delete"
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleDelete(record)}
          disabled={!canDelete}
        >
          Xóa
        </Menu.Item>
      </Menu>
    );
  };

  if (loading) return <Spin size="large" style={{ display: "block", marginTop: 50 }} />;
  if (!currentFolder)
    return <Typography.Text type="danger">Không tìm thấy thư mục.</Typography.Text>;

  const columns: TableProps<TreeNodeDto>["columns"] = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: TreeNodeDto) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {record.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
          <span style={{ marginLeft: 8 }}>{text}</span>
        </div>
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
        <Button
          type="text"
          icon={<MoreOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setContextMenu({ visible: true, x: rect.left, y: rect.bottom, record });
          }}
          onContextMenu={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  const isRootAdmin = user?.role === "RootAdmin";
  const canCreate =
    isRootAdmin ||
    currentFolder?.userPermission === "Owner" ||
    currentFolder?.userPermission === "Editor";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item>
              <Link to="/">
                <HomeOutlined />
              </Link>
            </Breadcrumb.Item>
            {currentFolder.ancestors.map((ancestor) => (
              <Breadcrumb.Item key={ancestor._id}>
                <Link to={`/drive/${ancestor._id}`}>{ancestor.name}</Link>
              </Breadcrumb.Item>
            ))}
            <Breadcrumb.Item>{currentFolder.name}</Breadcrumb.Item>
          </Breadcrumb>
          <span style={{ cursor: "pointer" }} onClick={handleInfoClick}>
            <InfoCircleOutlined style={{ fontSize: 20 }} />
          </span>
        </div>
        <Title level={2}>{currentFolder.name}</Title>
      </div>
      <div
        ref={tableWrapperRef}
        style={{ flex: 1, minHeight: 0, background: "#fff", borderRadius: 8 }}
        onContextMenu={(e) => {
          if (canCreate && !(e.target as HTMLElement).closest(".ant-table-row")) {
            e.preventDefault();
            setContextMenu({ visible: true, x: e.clientX, y: e.clientY, record: undefined });
          }
        }}
      >
        <Table
          columns={columns}
          dataSource={nodes}
          pagination={{ pageSize: 5 }}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            onDoubleClick: () => handleRowDoubleClick(record),
            onContextMenu: (e) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({ visible: true, x: e.clientX, y: e.clientY, record });
            },
            style: { cursor: "pointer" },
          })}
          rowSelection={{
            type: "radio",
            selectedRowKeys: selectedNodeId ? [selectedNodeId] : [],
            renderCell: () => null,
          }}
          locale={{ emptyText: <Empty description="Thư mục này trống." /> }}
        />
      </div>
      <Dropdown
        overlay={
          contextMenu.record ? itemMenu(contextMenu.record) : canCreate ? emptyAreaMenu : <></>
        }
        visible={contextMenu.visible}
      >
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            width: 1,
            height: 1,
          }}
        />
      </Dropdown>
      {CreateNodeModal}
      <Modal
        title="Đổi tên"
        visible={isRenameModalVisible}
        onOk={handleRename}
        onCancel={() => setRenameModalVisible(false)}
        confirmLoading={processing}
      >
        <Input
          placeholder="Nhập tên mới"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          onPressEnter={handleRename}
        />
      </Modal>
      <MoveNodeModal
        visible={isMoveModalVisible}
        onCancel={() => setMoveModalVisible(false)}
        onMoveSuccess={() => {
          refreshFolder();
        }}
        nodeToMove={nodeToMove}
      />

      {/* --- CẬP NHẬT CÁCH GỌI MODAL THEO ĐÚNG PROPS MỚI --- */}
      {nodeToShare && (
        <ManageAccessModal
          node={nodeToShare}
          isOpen={isManageAccessModalVisible}
          onClose={handleCloseManageAccessModal}
          onPermissionsUpdate={refreshFolder}
          isCurrentUserRootAdmin={isRootAdmin}
        />
      )}
    </div>
  );
};

export default FolderPage;
