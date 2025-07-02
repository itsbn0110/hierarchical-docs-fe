import React, { useState, useEffect } from "react";
import { Table, Button, Space, Modal, Form, Input, Select, Tag } from "antd";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../../api/user";
import type { User } from "../../types/app.types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SuccessMessages } from "../../constants/messages";
import { getErrorMessage } from "../../constants/getErrorMessage";

const { Option } = Select;

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    getUsers()
      .then((data) => setUsers(data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const deleteUserHandler = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user._id !== id));
      toast.success(SuccessMessages.USER_UPDATED);
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error));
    }
  };

  const openAddModal = () => {
    setEditUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = async (user: User) => {
    setEditUser(user);
    setModalOpen(true);
    try {
      const userDetail = await getUserById(user._id);
      form.setFieldsValue({
        ...userDetail,
        isActive: [true, "true", 1, "1"].includes(userDetail.isActive),
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = (_id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content:
        "Bạn có chắc chắn muốn xóa người dùng này? Khi xóa mọi dữ liệu liên quan sẽ bị mất!",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        deleteUserHandler(_id);
      },
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editUser) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { email: _, ...updateValues } = values;
        await updateUser(editUser._id, updateValues);
        setUsers((prev) =>
          prev.map((u) =>
            u._id === editUser._id ? { ...u, ...updateValues } : u
          )
        );
        toast.success(SuccessMessages.USER_UPDATED);
      } else {
        await createUser(values);
        setLoading(true);
        getUsers()
          .then((data) => setUsers(data))
          .catch((err) => toast.error(getErrorMessage(err)))
          .finally(() => setLoading(false));
        toast.success(SuccessMessages.USER_CREATED);
      }
      setModalOpen(false);
    } catch (err) {
      console.log(err);
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "RootAdmin" ? "volcano" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Must Change Password",
      dataIndex: "mustChangePassword",
      key: "mustChangePassword",
      render: (must: boolean) => (
        <Tag color={must ? "orange" : "default"}>{must ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: User) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        style={{
          marginBottom: 24,
          minWidth: 100,
          fontWeight: 500,
          fontSize: 13,
        }}
        onClick={openAddModal}
      >
        Thêm người dùng
      </Button>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={users}
        bordered
        loading={loading}
        style={{ marginTop: 8 }}
      />
      <Modal
        title={editUser ? "Sửa người dùng" : "Thêm người dùng"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText={editUser ? "Cập nhật" : "Thêm mới"}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Vui lòng nhập username" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
          >
            <Input type="email" disabled={editUser ? true : false} />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Chọn vai trò" }]}
          >
            <Select>
              <Option value="RootAdmin">RootAdmin</Option>
              <Option value="User">User</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="Active">
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      {/* Đã chuyển ToastContainer lên App.tsx, không cần ở đây nữa */}
    </div>
  );
};

export default UserManagementPage;
