import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Spin, Table, Typography, message, Breadcrumb, Empty } from "antd";
import { nodeApi } from "../../api/node"; // Sửa lỗi: đường dẫn import
import type { Node } from "../../types/app.types";
import type { TreeNodeDto } from "../../types/node.types";
import { FolderOutlined, FileTextOutlined, HomeOutlined } from "@ant-design/icons";

const { Title } = Typography;

const FolderPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();

  // State cho danh sách các mục con
  const [nodes, setNodes] = useState<TreeNodeDto[]>([]);
  // State cho thông tin của chính thư mục hiện tại (để làm breadcrumb)
  const [currentFolder, setCurrentFolder] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!folderId) return;

    const fetchFolderData = async () => {
      setLoading(true);
      try {
        // Gọi cả 2 API cùng lúc để tăng hiệu suất
        const [folderDetails, folderContent] = await Promise.all([
          nodeApi.getNodeById(folderId), // Lấy chi tiết folder hiện tại
          nodeApi.getNodesByParentId(folderId), // Lấy các mục con bên trong
        ]);

        setCurrentFolder(folderDetails);
        setNodes(folderContent);
      } catch (error) {
        message.error("Không thể tải nội dung thư mục hoặc bạn không có quyền truy cập.");
        setCurrentFolder(null);
        setNodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFolderData();
  }, [folderId]);

  // Hàm xử lý khi click vào một hàng trong bảng
  const handleRowClick = (record: TreeNodeDto) => {
    if (record.type === "FOLDER") {
      navigate(`/drive/${record.id}`);
    } else {
      navigate(`/file/${record.id}`);
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
          {record.type === "FOLDER" ? (
            <FolderOutlined style={{ color: "#1890ff" }} />
          ) : (
            <FileTextOutlined />
          )}
          <span style={{ marginLeft: 8 }}>{text}</span>
        </div>
      ),
    },
    {
      title: "Quyền của bạn",
      dataIndex: "userPermission",
      key: "userPermission",
      width: 150,
    },
  ];

  return (
    <div>
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

      <Title level={2}>{currentFolder.name}</Title>

      <Table
        columns={columns}
        dataSource={nodes}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
        locale={{
          emptyText: <Empty description="Thư mục này trống." />,
        }}
      />
    </div>
  );
};

export default FolderPage;
