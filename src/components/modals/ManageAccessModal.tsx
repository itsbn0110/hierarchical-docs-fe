// Giả định bạn đã cài đặt: npm install antd @ant-design/icons

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
  Tag, // <-- Import component Tag của AntD
} from "antd";
import { UserAddOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { type Node as DriveNode } from "../../types/app.types";
import { permissionsApi } from "../../api";
// Giả định UserPermission giờ đã bao gồm user.isActive
import { type UserPermission } from "../../types/permission.types";
import type { PermissionLevel } from "../../types/app.types";
import { useAuth } from "../../hooks/useAuth";
import { ErrorMessages } from "../../constants/messages";

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
      message.error(ErrorMessages.LOAD_PERMISSIONS_FAILED);
    } finally {
      setLoading(false);
    }
  }, [node?._id]);

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
      message.error(ErrorMessages.UPDATE_PERMISSION_FAILED);
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    try {
      await permissionsApi.revoke(permissionId);
      message.success("Thu hồi quyền thành công!");
      await fetchPermissions();
    } catch (error) {
      console.log(error);
      message.error(ErrorMessages.REVOKE_PERMISSION_FAILED);
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
      message.error(ErrorMessages.INVITE_FAILED);
    }
  };

  const handleModalClose = () => {
    onPermissionsUpdate();
    onClose();
  };

  return (
    <Modal
      title={`Chia sẻ "${node?.name}"`}
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
        {/* Phần invite không đổi */}
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
            // ===== LOGIC MỚI ĐƯỢC THÊM VÀO =====
            const isOwner = item.permission === "Owner";
            const isSelf = item.user._id === currentUser?._id;
            const isInactive = !item.user.isActive; // Kiểm tra trạng thái hoạt động

            // Điều kiện để có thể thay đổi quyền
            const canChangePermission =
              !isSelf && !isInactive && (!isOwner || (isOwner && isCurrentUserRootAdmin));

            // Điều kiện để có thể thu hồi quyền
            const canRevoke =
              !isSelf && !isInactive && (!isOwner || (isOwner && isCurrentUserRootAdmin));

            let revokeTooltip = "";
            if (isSelf) revokeTooltip = "Không thể tự thu hồi quyền";
            else if (isInactive) revokeTooltip = "Tài khoản đã bị vô hiệu hóa";
            else if (isOwner) revokeTooltip = "Không thể xóa chủ sở hữu";
            // =======================================

            return (
              <List.Item
                actions={[
                  <Select
                    value={item.permission}
                    style={{ width: 150 }}
                    onChange={(value) => handleUpdatePermission(item.user._id, value)}
                    disabled={!canChangePermission} // <-- Cập nhật điều kiện disable
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
                    <Tooltip title={revokeTooltip}>
                      <Button type="text" icon={<DeleteOutlined />} disabled />
                    </Tooltip>
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ opacity: isInactive ? 0.5 : 1 }}>
                      {getAvatarInitial(item.user.username)}
                    </Avatar>
                  }
                  title={
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Text style={{ opacity: isInactive ? 0.5 : 1 }}>
                        {item.user.username} {isSelf && <Text type="secondary">(bạn)</Text>}
                      </Text>
                      {isInactive && (
                        <Tag icon={<ExclamationCircleOutlined />} color="warning">
                          Vô hiệu hóa
                        </Tag>
                      )}
                    </div>
                  }
                  description={
                    <Text style={{ opacity: isInactive ? 0.5 : 1 }}>{item.user.email}</Text>
                  }
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
