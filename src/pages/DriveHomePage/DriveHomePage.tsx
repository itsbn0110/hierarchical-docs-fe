import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Table, Typography, message, Empty } from "antd";
import { nodeApi } from "../../api/node";
import type { TreeNodeDto } from "../../types/node.types";
import FolderIcon from "../../components/common/Icons/FolderIcon";

const { Title } = Typography;

const DriveHomePage: React.FC = () => {
  const [rootNodes, setRootNodes] = useState<TreeNodeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRootContent = async () => {
      setLoading(true);
      try {
        // Lấy các node ở cấp gốc bằng cách truyền `null`
        const content = await nodeApi.getNodesByParentId(null);
        console.log("content:", content); // Kiểm tra dữ liệu trả về
        setRootNodes(content);
      } catch (error) {
        message.error("Không thể tải dữ liệu từ Drive của bạn.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRootContent();
  }, []);

  const handleRowClick = (record: TreeNodeDto) => {
    if (record.type === "FOLDER") {
      navigate(`/drive/${record.id}`);
    } else {
      navigate(`/file/${record.id}`);
    }
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: TreeNodeDto) => (
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          {record.type === "FOLDER" ? <FolderIcon /> : <FolderIcon />}
          <span style={{ marginLeft: 8 }}>{text}</span>
        </div>
      ),
    },
    {
      title: "Chủ sở hữu",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 150,
    },
    {
      title: "Quyền của bạn",
      dataIndex: "userPermission",
      key: "userPermission",
      width: 150,
    },

    // Bạn có thể thêm các cột khác như 'Ngày tạo', 'Người tạo' ở đây
  ];

  if (loading) {
    return <Spin size="large" style={{ display: "block", marginTop: 50 }} />;
  }

  return (
    <div>
      <Title level={2}>Drive của tôi</Title>
      <Table
        columns={columns}
        dataSource={rootNodes}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        locale={{
          emptyText: <Empty description="Drive của bạn chưa có gì. Hãy tạo mới!" />,
        }}
      />
    </div>
  );
};

export default DriveHomePage;
