import React, { useState, useEffect } from "react";
import { Table, Button, Space, Typography, Empty, message, Popconfirm } from "antd";
import type { TableProps } from "antd";
import { nodeApi } from "../../api";
import FileIcon from "../../assets/Icons/FileIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";
import { ErrorMessages, SuccessMessages } from "../../constants/messages";
import { DeleteOutlined, RollbackOutlined } from "@ant-design/icons";
import type { TrashedItem } from "../../types/node.types";
import { useDriveContext } from "../../hooks/useDriveContext";
import { useAuth } from "../../hooks/useAuth";

const { Title, Paragraph } = Typography;

const TrashPage: React.FC = () => {
  const [items, setItems] = useState<TrashedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { hiddenDetails } = useDriveContext();
  const { user } = useAuth();
  const isRootAdmin = user?.role === "RootAdmin";

  const fetchTrashedItems = React.useCallback(() => {
    setLoading(true);
    // Chọn hàm API dựa trên vai trò của user
    const apiCall = isRootAdmin ? nodeApi.getAllTrashedNodesForAdmin() : nodeApi.getTrashedNodes();

    apiCall
      .then((data) => setItems(data))
      .catch(() => message.error(ErrorMessages.LOAD_TRASH_LIST_FAILED))
      .finally(() => setLoading(false));
  }, [isRootAdmin]); // Thêm isRootAdmin vào dependency array

  useEffect(() => {
    hiddenDetails();
    fetchTrashedItems();
  }, [hiddenDetails, fetchTrashedItems]);

  const handleRestore = async (record: TrashedItem) => {
    try {
      await nodeApi.restoreNode(record._id);
      message.success(SuccessMessages.RESTORE_SUCCESS);
      fetchTrashedItems();
    } catch {
      message.error(ErrorMessages.RESTORE_FAILED);
    }
  };

  const handleDeletePermanently = async (record: TrashedItem) => {
    try {
      await nodeApi.deleteNodePermanently(record._id);
      message.success(SuccessMessages.DOCUMENT_FOREVER_DELETED);
      fetchTrashedItems();
    } catch {
      message.error(ErrorMessages.DOCUMENT_FOREVER_DELETED_FAILED);
    }
  };

  // Định nghĩa các cột cơ bản
  const baseColumns: TableProps<TrashedItem>["columns"] = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: TrashedItem) => (
        <Space>
          {record.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
          <span>{name}</span>
        </Space>
      ),
    },
  ];

  // Thêm cột "Chủ sở hữu" nếu là admin
  const adminColumns: TableProps<TrashedItem>["columns"] = isRootAdmin
    ? [
        {
          title: "Chủ sở hữu",
          dataIndex: "owner", // Giả sử dữ liệu trả về có nested object
          key: "owner",
        },
      ]
    : [];

  // Các cột còn lại
  const actionColumns: TableProps<TrashedItem>["columns"] = [
    {
      title: "Ngày xóa",
      dataIndex: "deletedAt",
      key: "deletedAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button icon={<RollbackOutlined />} onClick={() => handleRestore(record)}>
            Khôi phục
          </Button>
          <Popconfirm
            title="Xóa vĩnh viễn mục này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDeletePermanently(record)}
            okText="Xóa vĩnh viễn"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa vĩnh viễn
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns = [...baseColumns, ...adminColumns, ...actionColumns];

  return (
    <div>
      <Title level={2}>Thùng rác</Title>
      <Paragraph type="secondary">
        Các mục trong thùng rác sẽ bị xóa vĩnh viễn sau 30 ngày.
      </Paragraph>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={items}
        bordered
        loading={loading}
        style={{ marginTop: 24 }}
        locale={{
          emptyText: (
            <Empty
              description={
                isRootAdmin ? "Không có mục nào trong thùng rác." : "Thùng rác của bạn trống."
              }
            />
          ),
        }}
      />
    </div>
  );
};

export default TrashPage;
