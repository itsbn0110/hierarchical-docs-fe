import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag, Typography, Empty, Tooltip, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { accessRequestApi } from "../../api/accessRequest.api";
import type { PendingRequest } from "../../api/accessRequest.api";
import FileIcon from "../../components/common/Icons/FileIcon";
import FolderIcon from "../../components/common/Icons/FolderIcon";

const { Title, Paragraph, Text } = Typography;

const AccessRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    accessRequestApi
      .getPendingRequests()
      .then((data) => setRequests(data))
      .catch(() => message.error("Không thể tải danh sách yêu cầu."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId: string) => {
    try {
      console.log("requestId", requestId);
      await accessRequestApi.approve(requestId);
      message.success("Đã chấp thuận yêu cầu.");
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      console.log(error);
      message.error("Chấp thuận yêu cầu thất bại.");
    }
  };

  const handleDeny = async (requestId: string) => {
    try {
      await accessRequestApi.deny(requestId);
      message.info("Đã từ chối yêu cầu.");
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error) {
      console.log(error);
      message.error("Từ chối yêu cầu thất bại.");
    }
  };

  const columns = [
    {
      title: "Tài nguyên được yêu cầu",
      dataIndex: "node",
      key: "node",
      render: (node: PendingRequest["node"]) => (
        <Space>
          {node?.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
          <span>{node?.name}</span>
        </Space>
      ),
    },
    {
      title: "Người yêu cầu",
      dataIndex: "requester",
      key: "requester",
      render: (requester: PendingRequest["requester"]) => requester?.username,
    },
    {
      title: "Quyền yêu cầu",
      dataIndex: "requestedPermission",
      key: "requestedPermission",
      render: (permission: string) => <Tag color="blue">{permission}</Tag>,
    },
    // [MỚI] Thêm cột Phạm vi
    {
      title: "Phạm vi",
      dataIndex: "isRecursive",
      key: "isRecursive",
      render: (isRecursive: boolean, record: PendingRequest) => {
        // Nếu không phải là thư mục, không hiển thị gì
        if (record.node.type !== "FOLDER") {
          return <Text type="secondary">-</Text>;
        }
        // Hiển thị Tag tương ứng
        return isRecursive ? <Tag color="purple">Cả thư mục con</Tag> : <Tag>Chỉ mục này</Tag>;
      },
    },
    {
      title: "Lời nhắn",
      dataIndex: "message",
      key: "message",
      render: (text: string) => text || <Text type="secondary">Không có</Text>,
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: unknown, record: PendingRequest) => (
        <Space>
          <Tooltip title="Chấp thuận">
            <Button
              type="primary"
              shape="circle"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record._id)}
            />
          </Tooltip>
          <Tooltip title="Từ chối">
            <Button
              danger
              shape="circle"
              icon={<CloseCircleOutlined />}
              onClick={() => handleDeny(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Yêu cầu Truy cập Đang chờ</Title>
      <Paragraph type="secondary">
        Xem xét các yêu cầu xin quyền truy cập vào các tài liệu và thư mục mà bạn sở hữu.
      </Paragraph>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={requests}
        bordered
        loading={loading}
        style={{ marginTop: 24 }}
        locale={{
          emptyText: <Empty description="Không có yêu cầu nào đang chờ xử lý." />,
        }}
      />
    </div>
  );
};

export default AccessRequestsPage;
