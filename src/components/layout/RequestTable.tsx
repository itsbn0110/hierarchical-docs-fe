import { Table, Button, Space, Tag, Typography, Empty, Tooltip } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import type { PendingRequest, ProcessedRequest } from "../../api/accessRequest.api";
import FileIcon from "../../assets/Icons/FileIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";
import { useAuth } from "../../hooks/useAuth";

const { Text } = Typography;

type RequestsTableProps = {
  requests: PendingRequest[] | ProcessedRequest[];
  loading: boolean;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  isHistory?: boolean;
};

const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  loading,
  onApprove,
  onDeny,
  isHistory = false,
}) => {
  const { user } = useAuth();

  const baseColumns = [
    {
      title: "Tài nguyên",
      dataIndex: "node",
      key: "node",
      render: (node: PendingRequest["node"]) => (
        <Space>
          {node?.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
          <span>{node?.name || <Text type="danger">[Đã xóa]</Text>}</span>
        </Space>
      ),
    },
    {
      title: "Người yêu cầu",
      dataIndex: "requester",
      key: "requester",
      render: (requester: PendingRequest["requester"]) =>
        requester?.username || <Text type="secondary">[Ẩn danh]</Text>,
    },
    {
      title: "Quyền yêu cầu",
      dataIndex: "requestedPermission",
      key: "requestedPermission",
      render: (permission: string) => <Tag color="blue">{permission}</Tag>,
    },
    {
      title: "Phạm vi",
      dataIndex: "isRecursive",
      key: "isRecursive",
      render: (isRecursive: boolean, record: PendingRequest) => {
        if (record.node?.type !== "FOLDER") {
          return <Text type="secondary">-</Text>;
        }
        return isRecursive ? <Tag color="purple">Cả thư mục con</Tag> : <Tag>Chỉ mục này</Tag>;
      },
    },
  ];

  const historyColumns = [
    ...baseColumns,
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        status === "APPROVED" ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã chấp thuận
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Đã từ chối
          </Tag>
        ),
    },
    {
      title: "Người xử lý",
      dataIndex: "reviewer",
      key: "reviewer",
      render: (reviewer: ProcessedRequest["reviewer"]) =>
        (reviewer?.username !== user?.username ? reviewer?.username : "Bạn") || (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Ngày xử lý",
      dataIndex: "reviewedAt",
      key: "reviewedAt",
      render: (date: string) => (date ? new Date(date).toLocaleString("vi-VN") : "-"),
    },
  ];

  const pendingColumns = [
    ...baseColumns,
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
              onClick={() => onApprove && onApprove(record._id)}
            />
          </Tooltip>
          <Tooltip title="Từ chối">
            <Button
              danger
              shape="circle"
              icon={<CloseCircleOutlined />}
              onClick={() => onDeny && onDeny(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="_id"
      columns={isHistory ? historyColumns : pendingColumns}
      dataSource={requests}
      pagination={{ pageSize: 10 }}
      bordered
      loading={loading}
      style={{ marginTop: 24 }}
      locale={{
        emptyText: (
          <Empty
            description={
              isHistory ? "Không có lịch sử yêu cầu nào." : "Không có yêu cầu nào đang chờ xử lý."
            }
          />
        ),
      }}
    />
  );
};

export default RequestsTable;
