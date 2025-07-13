import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Form,
  Input,
  Button,
  Typography,
  Descriptions,
  message,
  Spin,
  Alert,
  Space,
} from 'antd';
import { UserOutlined, LockOutlined, EditOutlined, SaveOutlined, RollbackOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { userApi } from '../../api/user.api';
import { ErrorMessages } from '../../constants/messages';
import type { ChangePasswordDto } from '../../types/api.types';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
import { Header } from 'antd/es/layout/layout';
const ProfilePage: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const defaultTab = user?.mustChangePassword ? '2' : '1';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        username: user.username,
        email: user.email,
      });
    }
  }, [user, profileForm]);

  const handleUpdateProfile = async (values: { username: string }) => {
    if (!user) return;
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (!accessToken || !refreshToken) return;

    setLoading(true);
    try {
      const updatedUser = await userApi.updateUser(user._id, values);
      if (login) {
        login({ 
            user: { ...user, ...updatedUser }, 
            accessToken, 
            refreshToken 
        });
      }
      message.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error) {
      console.log(error);
      message.error(ErrorMessages.UPDATE_PROFILE_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: ChangePasswordDto) => {
    if (!user) return;
    setLoading(true);
    try {
      const payload = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };
      await userApi.changePassword(payload); 
      message.success('Đổi mật khẩu thành công! Bạn sẽ được đăng xuất sau giây lát.');
      if (logout) {
        setTimeout(() => logout(), 2000);
      }
    } catch (error) {
      console.log(error);
      message.error(ErrorMessages.CHANGE_PASSWORD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Spin tip="Đang tải thông tin..." fullscreen />;
  }

  return (
    // SỬA ĐỔI: Bọc toàn bộ trang trong một container
    <div>
      <Header/>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        <Title level={2}>Tài khoản của tôi</Title>
        <Paragraph type="secondary">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</Paragraph>
  
        {user?.mustChangePassword && (
          <Alert
            message="Yêu cầu đổi mật khẩu"
            description="Đây là lần đăng nhập đầu tiên của bạn hoặc mật khẩu của bạn đã được reset. Vui lòng đổi mật khẩu mới để tiếp tục."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}
  
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><UserOutlined /> Thông tin cá nhân</span>} key="1">
            <Spin spinning={loading}>
              <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile}>
                <Descriptions bordered column={1} title="Thông tin cơ bản">
                  <Descriptions.Item label="Tên người dùng">
                    {isEditing ? (
                      <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
                        style={{ margin: 0 }}
                      >
                        <Input />
                      </Form.Item>
                    ) : (
                      user.username
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                  <Descriptions.Item label="Vai trò">{user.role}</Descriptions.Item>
                </Descriptions>
                <Space style={{ marginTop: 24 }}>
                  {isEditing ? (
                    <>
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Lưu thay đổi</Button>
                      <Button onClick={() => { setIsEditing(false); profileForm.resetFields(); }} icon={<RollbackOutlined />}>Hủy</Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} icon={<EditOutlined />}>Chỉnh sửa</Button>
                  )}
                </Space>
              </Form>
            </Spin>
          </TabPane>
          <TabPane tab={<span><LockOutlined /> Đổi mật khẩu</span>} key="2">
            <Spin spinning={loading}>
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
                style={{ maxWidth: 400 }}
              >
                <Form.Item
                  name="oldPassword"
                  label="Mật khẩu cũ"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="Mật khẩu mới"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                  hasFeedback
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  dependencies={['newPassword']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Đổi mật khẩu</Button>
                </Form.Item>
              </Form>
            </Spin>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
