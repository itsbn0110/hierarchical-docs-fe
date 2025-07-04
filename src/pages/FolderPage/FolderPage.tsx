import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Spin, Table, Typography, Breadcrumb, Empty } from "antd";
import { nodeApi } from "../../api/node";
import { useDriveContext } from "../../hooks/useDriveContext";
import type { Node as DriveNode } from "../../types/app.types";
import type { TreeNodeDto } from "../../types/node.types";
import { HomeOutlined, InfoCircleOutlined } from "@ant-design/icons";
import FileIcon from "../../components/common/Icons/FileIcon";
import FolderIcon from "../../components/common/Icons/FolderIcon";
import { toast } from "react-toastify";

const { Title } = Typography;

const FolderPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  // [SỬA] Lấy về `selectedNodeId` và `selectNodeId` từ context
  const { selectNodeId, selectedNodeId, showDetails, toggleDetails } = useDriveContext();

  const [nodes, setNodes] = useState<TreeNodeDto[]>([]);
  const [currentFolder, setCurrentFolder] = useState<DriveNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!folderId) return;

    // Bỏ chọn mục cũ khi chuyển sang thư mục mới
    selectNodeId(null);
    const fetchFolderData = async () => {
      setLoading(true);
      try {
        const [folderDetails, folderContent] = await Promise.all([
          nodeApi.getNodeById(folderId),
          nodeApi.getNodesByParentId(folderId),
        ]);
        console.log("folderDetails", folderDetails);
        setCurrentFolder(folderDetails);
        setNodes(folderContent);
        console.log("folderCon");
      } catch (error) {
        console.error("Error fetching folder data:", error);
        toast.error("Không thể tải nội dung thư mục hoặc bạn không có quyền truy cập.");
        setCurrentFolder(null);
        setNodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFolderData();
  }, [folderId, selectNodeId]); // [SỬA] Cập nhật dependency array

  // [SỬA] handleRowClick không cần gọi API nữa
  const handleRowClick = (record: TreeNodeDto) => {
    selectNodeId(record.id); // Chỉ cần cập nhật ID vào context
    showDetails();
  };

  const handleRowDoubleClick = (record: TreeNodeDto) => {
    if (record.type === "FOLDER") {
      navigate(`/drive/${record.id}`);
    } else {
      navigate(`/file/${record.id}`);
    }
  };

  const handleInfoClick = () => {
    if (currentFolder) {
      console.log(currentFolder._id);
      selectNodeId(folderId ?? null); // [SỬA] Cập nhật ID của thư mục hiện tại
      toggleDetails();
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: "block", marginTop: 50 }} />;
  }

  if (!currentFolder) {
    return <Typography.Text type="danger">Không tìm thấy thư mục.</Typography.Text>;
  }

  const columns = [
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
  ];

  return (
    <div>
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

      <Table
        columns={columns}
        dataSource={nodes}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          onDoubleClick: () => handleRowDoubleClick(record),
          style: { cursor: "pointer" },
        })}
        rowSelection={{
          type: "radio",
          // [SỬA] Sử dụng selectedNodeId để highlight hàng
          selectedRowKeys: selectedNodeId ? [selectedNodeId] : [],
          renderCell: () => null, // Ẩn radio button đi cho đẹp
        }}
        locale={{ emptyText: <Empty description="Thư mục này trống." /> }}
      />
    </div>
  );
};

export default FolderPage;
