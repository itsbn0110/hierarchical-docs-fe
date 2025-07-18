import React, { useState, useEffect } from "react";
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message } from "antd";
import { userApi } from "../../api";
import type { User } from "../../types/app.types";
import "react-toastify/dist/ReactToastify.css";
import { ErrorMessages, SuccessMessages } from "../../constants/messages";

import { useDriveContext } from "../../hooks/useDriveContext";

const { Option } = Select;

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { hiddenDetails } = useDriveContext();

  useEffect(() => {
    setLoading(true);
    hiddenDetails();
    userApi
      .getUsers()
      .then((data) => setUsers(data))
      .catch(() => message.error(ErrorMessages.LOAD_USERS_FAILED))
      .finally(() => setLoading(false));
  }, [hiddenDetails]);

  const deleteUserHandler = async (id: string) => {
    try {
      await userApi.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user._id !== id));
      message.success(SuccessMessages.USER_DELETED);
    } catch (error) {
      console.log(error);
      message.error(ErrorMessages.DELETE_USER_FAILED);
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
      const userDetail = await userApi.getUserById(user._id);
      form.setFieldsValue({
        ...userDetail,
        isActive: [true, "true", 1, "1"].includes(userDetail.isActive),
      });
    } catch (err) {
      console.log("check error: ", err);
      // message.error(getErrorMessage(err));
    }
  };

  const handleDelete = (_id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa người dùng này? Khi xóa mọi dữ liệu liên quan sẽ bị mất!",
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
        await userApi.updateUser(editUser._id, updateValues);
        setUsers((prev) =>
          prev.map((u) => (u._id === editUser._id ? { ...u, ...updateValues } : u))
        );
        message.success(SuccessMessages.USER_UPDATED);
      } else {
        await userApi.createUser(values);
        setLoading(true);
        userApi
          .getUsers()
          .then((data) => setUsers(data))
          .catch((err) => {
            console.log(err);
            message.error(ErrorMessages.CANNOT_CREATE_USER);
          })
          .finally(() => setLoading(false));
        message.success(SuccessMessages.USER_CREATED);
      }
      setModalOpen(false);
    } catch (err) {
      console.log(err);
      message.error(ErrorMessages.EMAIL_ALREADY_EXISTS);
    }
  };

  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color={role === "RootAdmin" ? "volcano" : "blue"}>{role}</Tag>,
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>{active ? "Active" : "Inactive"}</Tag>
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
          padding: "22px",
          minWidth: 100,
          fontWeight: 500,
          fontSize: 15,
          float: "right",
        }}
        onClick={openAddModal}
      >
        Thêm người dùng
      </Button>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={users}
        pagination={{ pageSize: 8 }}
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

          <Form.Item name="isActive" label="Active">
            <Select>
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Vô hiệu hóa</Option>
            </Select>
          </Form.Item>
          {editUser ? (
            <Form.Item name="mustChangePassword" label="Đổi mật khẩu lần đầu ?">
              <Select>
                <Option value={true}>Có</Option>
                <Option value={false}>Không</Option>
              </Select>
            </Form.Item>
          ) : (
            ""
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
