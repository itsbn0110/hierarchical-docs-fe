import React, { useState, useEffect } from "react";
import {
  Modal,
  List,
  Avatar,
  Select,
  Button,
  Input,
  message,
  Typography,
  Tooltip,
  Popconfirm,
  Spin,
} from "antd";
import { UserAddOutlined, DeleteOutlined } from "@ant-design/icons";
import { type Node as DriveNode } from "../../types/app.types";
import { permissionsApi, type UserPermission } from "../../api/permission";
import type { PermissionLevel } from "../../types/app.types";
import { useAuth } from "../../hooks/useAuth";

const { Text } = Typography;

interface ManageAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsUpdate: () => void;
  node: DriveNode;
  isCurrentUserRootAdmin: boolean;
}

const getAvatarInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : "?");

const ManageAccessModal: React.FC<ManageAccessModalProps> = ({
  isOpen,
  onClose,
  onPermissionsUpdate,
  node,
  isCurrentUserRootAdmin,
}) => {
  const { user: currentUser } = useAuth();
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState<PermissionLevel>("Viewer");

  const fetchPermissions = React.useCallback(async () => {
    if (!node?._id) return;
    setLoading(true);
    try {
      const perms = await permissionsApi.getPermissionsForNode(node._id);
      setPermissions(perms);
    } catch (error) {
      console.log(error);
      message.error("Không thể tải danh sách quyền.");
    } finally {
      setLoading(false);
    }
  }, [node._id]);

  useEffect(() => {
    if (isOpen) {
      fetchPermissions();
    }
  }, [isOpen, fetchPermissions]);

  const handleUpdatePermission = async (userId: string, permission: PermissionLevel) => {
    try {
      await permissionsApi.grant({ nodeId: node._id, userId, permission });
      message.success("Cập nhật quyền thành công!");
      await fetchPermissions();
    } catch (error) {
      console.log(error);
      message.error("Cập nhật quyền thất bại.");
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    try {
      await permissionsApi.revoke(permissionId);
      message.success("Thu hồi quyền thành công!");
      await fetchPermissions();
    } catch (error) {
      console.log(error);
      message.error("Thu hồi quyền thất bại. Có thể bạn đang cố xóa Owner cuối cùng.");
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      message.warning("Vui lòng nhập email người dùng.");
      return;
    }
    try {
      await permissionsApi.inviteByEmail({
        nodeId: node._id,
        email: inviteEmail,
        permission: invitePermission,
      });
      message.success(`Đã mời ${inviteEmail} thành công.`);
      setInviteEmail("");
      await fetchPermissions();
    } catch (error) {
      console.log(error);
      message.error("Mời thất bại. Người dùng không tồn tại hoặc đã có quyền.");
    }
  };

  const handleModalClose = () => {
    onPermissionsUpdate();
    onClose();
  };

  return (
    <Modal
      title={`Chia sẻ "${node.name}"`}
      open={isOpen}
      onCancel={handleModalClose}
      footer={[
        <Button key="done" type="primary" onClick={handleModalClose}>
          Xong
        </Button>,
      ]}
      width={600}
    >
      <Spin spinning={loading}>
        <Input.Group compact style={{ display: "flex", marginBottom: 24 }}>
          <Input
            style={{ flex: 1, paddingLeft: 8 }}
            placeholder="Thêm người dùng bằng email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onPressEnter={handleInvite}
          />
          <Select
            value={invitePermission}
            onChange={(value) => setInvitePermission(value)}
            style={{ width: "120px" }}
          >
            <Select.Option value="Viewer">Người xem</Select.Option>
            <Select.Option value="Editor">Người chỉnh sửa</Select.Option>
          </Select>
          <Button type="default" icon={<UserAddOutlined />} onClick={handleInvite}>
            Mời
          </Button>
        </Input.Group>

        <List
          header={<Text strong>Những người có quyền truy cập</Text>}
          dataSource={permissions}
          renderItem={(item) => {
            const isOwner = item.permission === "Owner";
            const isSelf = item.user._id === currentUser?._id;
            const canRevoke = (!isOwner || (isOwner && isCurrentUserRootAdmin)) && !isSelf;

            return (
              <List.Item
                actions={[
                  <Select
                    value={item.permission}
                    style={{ width: 150 }}
                    onChange={(value) => handleUpdatePermission(item.user._id, value)}
                    disabled={isSelf || (isOwner && !isCurrentUserRootAdmin)}
                  >
                    {isCurrentUserRootAdmin && (
                      <Select.Option value="Owner">Chủ sở hữu</Select.Option>
                    )}
                    <Select.Option value="Editor">Người chỉnh sửa</Select.Option>
                    <Select.Option value="Viewer">Người xem</Select.Option>
                  </Select>,

                  canRevoke ? (
                    <Popconfirm
                      title="Bạn chắc chắn muốn thu hồi quyền?"
                      onConfirm={() => handleRevokePermission(item._id)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  ) : (
                    <Tooltip
                      title={isSelf ? "Không thể tự thu hồi quyền" : "Không thể xóa chủ sở hữu"}
                    >
                      <Button type="text" icon={<DeleteOutlined />} disabled />
                    </Tooltip>
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar>{getAvatarInitial(item.user.username)}</Avatar>}
                  title={
                    <>
                      {item.user.username} {isSelf && <Text type="secondary">(bạn)</Text>}
                    </>
                  }
                  description={item.user.email}
                />
              </List.Item>
            );
          }}
        />
      </Spin>
    </Modal>
  );
};

export default ManageAccessModal;
