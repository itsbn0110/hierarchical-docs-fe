import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Spin, Table, Typography, Breadcrumb, Empty, Dropdown, Menu, Modal, Input, Button, Space } from "antd";
import type { TableProps } from 'antd';
import { nodeApi } from "../../api/node";
import { useDriveContext } from "../../hooks/useDriveContext";
import { useCreateNode } from "../../hooks/useCreateNode";
import type { Node as DriveNode,  } from "../../types/app.types";
import type { TreeNodeDto } from "../../types/node.types";
import { HomeOutlined, InfoCircleOutlined, EditOutlined, ShareAltOutlined, DeleteOutlined, ExclamationCircleFilled, MoreOutlined } from "@ant-design/icons";
import FileIcon from "../../components/common/Icons/FileIcon";
import FolderIcon from "../../components/common/Icons/FolderIcon";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

const { Title } = Typography;
const { confirm } = Modal;

const FolderPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { selectNodeId, selectedNodeId, showDetails, toggleDetails } = useDriveContext();
  const { user } = useAuth(); // [MỚI] Lấy thông tin user hiện tại

  const [nodes, setNodes] = useState<TreeNodeDto[]>([]);
  const [currentFolder, setCurrentFolder] = useState<DriveNode | null>(null);
  const [loading, setLoading] = useState(true);

  // State cho modal đổi tên
  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [processing, setProcessing] = useState(false);

  // State để quản lý context menu động
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    record?: TreeNodeDto;
  }>({ visible: false, x: 0, y: 0 });
  
  const refreshFolder = async () => {
    if (!folderId) return;
    try {
      const folderContent = await nodeApi.getNodesByParentId(folderId);
      setNodes(folderContent);
    } catch {
      toast.error("Không thể làm mới thư mục.");
    }
  };
  
  const { showCreateModal, CreateNodeModal } = useCreateNode({ onNodeCreated: refreshFolder });

  // Đóng context menu khi click ra ngoài
  useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
      // Nếu click vào một menu khác hoặc ra ngoài, đóng menu hiện tại
      if (!(event.target as HTMLElement).closest('.ant-dropdown')) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    // Dùng mousedown để bắt sự kiện trước khi menu item được click
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
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
        showDetails()
      } catch (error) {
        console.log(error);
        toast.error("Không thể tải nội dung thư mục hoặc bạn không có quyền truy cập.");
        setCurrentFolder(null);
        setNodes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFolderData();
  }, [folderId, selectNodeId, showDetails]);

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

  // --- Logic cho các hành động từ Context Menu ---

  const handleShowRenameModal = (record: TreeNodeDto) => {
    setContextMenu({ visible: false, x: 0, y: 0 });
    selectNodeId(record.id);
    setItemName(record.name);
    setRenameModalVisible(true);
  };
  
  const handleRename = async () => {
     if (!itemName.trim() || !selectedNodeId) {
      toast.error("Tên không hợp lệ.");
      return;
    }
    setProcessing(true);
    try {
        await nodeApi.updateNodeName(selectedNodeId, { name: itemName });
        toast.success("Đổi tên thành công!");
        setRenameModalVisible(false);
        await refreshFolder();
    } catch {
        toast.error("Đổi tên thất bại.");
    } finally {
        setProcessing(false);
    }
  }

  const handleDelete = (record: TreeNodeDto) => {
    setContextMenu({ visible: false, x: 0, y: 0 });
    confirm({
      title: `Bạn có chắc chắn muốn xóa "${record.name}"?`,
      icon: <ExclamationCircleFilled />,
      content: 'Hành động này không thể hoàn tác. Tất cả nội dung bên trong (nếu có) cũng sẽ bị xóa.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await nodeApi.deleteNode(record.id);
          toast.success("Xóa thành công!");
          await refreshFolder();
        } catch {
          toast.error("Xóa thất bại.");
        }
      },
    });
  };

  // --- Định nghĩa các Context Menu ---
   const emptyAreaMenu = (
    <Menu style={{ minWidth: 180 }}>
      <Menu.Item key="new-folder"  onClick={() => { showCreateModal({ type: 'FOLDER', parentId: folderId || null }) }}>
       <Space>
          <FolderIcon />
          Thư mục mới
        </Space>
      </Menu.Item>
      <Menu.Item key="new-file"  onClick={() => showCreateModal({ type: 'FILE', parentId: folderId || null })}>
        <Space>
          <FileIcon />
          Tài liệu mới
        </Space>
      </Menu.Item>
    </Menu>
  );
  // [SỬA] Thêm logic kiểm tra quyền RootAdmin
  const itemMenu = (record: TreeNodeDto) => {
    const isRootAdmin = user?.role === 'RootAdmin';
    const canEdit = isRootAdmin || record.userPermission === 'Editor' || record.userPermission === 'Owner';
    const canDelete = isRootAdmin || record.userPermission === 'Owner';

    return (
      <Menu>
        <Menu.Item 
          key="rename" 
          icon={<EditOutlined />} 
          onClick={() => handleShowRenameModal(record)}
          disabled={!canEdit} // Vô hiệu hóa nếu không có quyền
        >
          Đổi tên
        </Menu.Item>
        <Menu.Item key="share" icon={<ShareAltOutlined />}>
          Chia sẻ
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item 
          key="delete" 
          icon={<DeleteOutlined />} 
          danger 
          onClick={() => handleDelete(record)}
          disabled={!canDelete} // Vô hiệu hóa nếu không có quyền
        >
          Xóa
        </Menu.Item>
      </Menu>
    );
  };

  if (loading) return <Spin size="large" style={{ display: "block", marginTop: 50 }} />;
  if (!currentFolder) return <Typography.Text type="danger">Không tìm thấy thư mục.</Typography.Text>;

  const columns: TableProps<TreeNodeDto>['columns'] = [
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
      title: '',
      key: 'action',
      width: 60,
      align: 'right',
      render: (_, record) => (
        <Button
          type="text"
          icon={<MoreOutlined />}
          onClick={(e) => {
            e.stopPropagation(); // Ngăn sự kiện click vào hàng
            // [SỬA] Kích hoạt context menu chính tại vị trí của nút
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setContextMenu({ visible: true, x: rect.left, y: rect.bottom, record });
          }}
          onContextMenu={(e) => e.stopPropagation()} // Ngăn menu vùng trống hiện ra
        />
      ),
    },
  ];

  return (
    <div 
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      onContextMenu={(e) => {
        if (!(e.target as HTMLElement).closest('.ant-table-row')) {
          e.preventDefault();
          setContextMenu({ visible: true, x: e.clientX, y: e.clientY, record: undefined });
        }
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item><Link to="/"><HomeOutlined /></Link></Breadcrumb.Item>
            {currentFolder.ancestors.map((ancestor) => (
              <Breadcrumb.Item key={ancestor._id}><Link to={`/drive/${ancestor._id}`}>{ancestor.name}</Link></Breadcrumb.Item>
            ))}
            <Breadcrumb.Item>{currentFolder.name}</Breadcrumb.Item>
          </Breadcrumb>
          <span style={{ cursor: "pointer" }} onClick={handleInfoClick}>
            <InfoCircleOutlined style={{ fontSize: 20 }} />
          </span>
        </div>
        <Title level={2}>{currentFolder.name}</Title>
      </div>
      
      <div style={{ flex: 1, minHeight: 0, background: '#fff', borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={nodes}
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
        overlay={contextMenu.record ? itemMenu(contextMenu.record) : emptyAreaMenu}
        visible={contextMenu.visible}
      >
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, width: 1, height: 1 }} />
      </Dropdown>
      
      {CreateNodeModal}
      
      <Modal title="Đổi tên" visible={isRenameModalVisible} onOk={handleRename} onCancel={() => setRenameModalVisible(false)} confirmLoading={processing}>
        <Input placeholder="Nhập tên mới" value={itemName} onChange={(e) => setItemName(e.target.value)} onPressEnter={handleRename} />
      </Modal>
    </div>
  );
};

export default FolderPage;
