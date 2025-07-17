import React, { useState, useEffect, useCallback } from "react";
import { Table, Input, Tag, Space, Typography, message, Popconfirm, Button, Tooltip } from "antd";
import type { TableProps } from "antd";
import type { PermissionDetails } from "../../types/permission.types";
import { permissionsApi } from "../../api";
import { useDebounce } from "../../hooks/useDebounce";
import FileIcon from "../../assets/Icons/FileIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";
import { DeleteOutlined } from "@ant-design/icons";
import { ErrorMessages, SuccessMessages } from "../../constants/messages";

const { Title, Paragraph } = Typography;

const PermissionsManagementPage: React.FC = () => {
  const [permissions, setPermissions] = useState<PermissionDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // SỬA ĐỔI: Chuyển logic fetch vào một hàm được memoize bởi useCallback.
  // Hàm này giờ sẽ phụ thuộc vào các giá trị state mà nó sử dụng.
  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await permissionsApi.getAllPermissions({
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearchQuery,
      });
      setPermissions(response.data);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error) {
      console.log(error);
      message.error(ErrorMessages.PERMISSION_NOT_FOUND);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, debouncedSearchQuery]); // Thêm dependencies vào đây

  // SỬA ĐỔI: useEffect giờ chỉ phụ thuộc vào hàm fetchPermissions đã được memoize.
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleTableChange: TableProps<PermissionDetails>["onChange"] = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    }));
  };

  const handleRevokePermission = async (permissionId: string) => {
    try {
      await permissionsApi.revoke(permissionId);
      message.success(SuccessMessages.PERMISSION_REVOKED);
      // Tải lại dữ liệu sau khi thu hồi
      fetchPermissions();
    } catch (error) {
      console.log(error);
      message.error(ErrorMessages.REVOKE_PERMISSION_FAILED);
    }
  };

  const columns: TableProps<PermissionDetails>["columns"] = [
    {
      title: "Tài nguyên",
      dataIndex: "node",
      key: "node",
      render: (node) => (
        <Space>
          {node.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
          <span>{node.name}</span>
        </Space>
      ),
    },
    {
      title: "Người được cấp quyền",
      dataIndex: "user",
      key: "user",
      render: (user) => user?.username || "N/A",
    },
    {
      title: "Quyền",
      dataIndex: "permission",
      key: "permission",
      render: (permission) => <Tag color="blue">{permission}</Tag>,
    },
    {
      title: "Người cấp quyền",
      dataIndex: "grantedBy",
      key: "grantedBy",
      render: (user) => user?.username || "N/A",
    },
    {
      title: "Ngày cấp",
      dataIndex: "grantedAt",
      key: "grantedAt",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Popconfirm
          title="Bạn chắc chắn muốn thu hồi quyền này?"
          onConfirm={() => handleRevokePermission(record._id)}
          okText="Thu hồi"
          cancelText="Hủy"
        >
          <Tooltip title="Thu hồi quyền">
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Quản lý Quyền truy cập</Title>
      <Paragraph type="secondary">
        Xem, tìm kiếm và quản lý tất cả các quyền truy cập trong toàn bộ hệ thống.
      </Paragraph>
      <Input.Search
        placeholder="Tìm kiếm theo tên người dùng, email, hoặc tên tài nguyên..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        // Sửa đổi: onSearch sẽ trigger việc fetch lại trang đầu tiên
        onSearch={() => {
          setPagination((prev) => ({ ...prev, current: 1 }));
          // useEffect sẽ tự động gọi fetchPermissions khi debouncedSearchQuery thay đổi
        }}
        style={{ marginBottom: 24, maxWidth: 500 }}
        allowClear
      />
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={permissions}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        bordered
      />
    </div>
  );
};

export default PermissionsManagementPage;
