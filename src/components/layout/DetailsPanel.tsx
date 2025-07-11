import React, { useEffect, useState } from "react";
import {
  Tabs,
  Typography,
  List,
  Avatar,
  Button,
  Divider,
  Empty,
  Space,
  Skeleton,
  Tooltip,
  message,
} from "antd";
import { useDriveContext } from "../../hooks/useDriveContext";
import FileIcon from "../../assets/Icons/FileIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";
import { ClockCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import {
  permissionsApi,
  nodeApi,
  activityLogApi,
  type UserPermission,
  type ActivityLog,
} from "../../api";
import ManageAccessModal from "../modals/ManageAccessModal";
import type { PermissionLevel } from "../../types/app.types";
import type { Node as DriveNode } from "../../types/app.types";
import { getAvatarInitial } from "../../utils/getAvatarIntial";
import { useAuth } from "../../hooks/useAuth";
import { ErrorMessages } from "../../constants/messages";

const { TabPane } = Tabs;
const { Text, Title, Paragraph } = Typography;

const PanelStyles = `
  .details-panel-tabs.ant-tabs-centered .ant-tabs-nav {
    margin-bottom: 0px !important;
  }
  .details-panel-tabs {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .details-panel-tabs .ant-tabs-content-holder {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
  .details-panel-tabs .ant-tabs-content,
  .details-panel-tabs .ant-tabs-tabpane {
    height: 100%;
  }
`;

/**
 * Helper function để render mô tả hành động một cách thân thiện.
 */
const renderActivityDescription = (item: ActivityLog) => {
  const { user, action, details } = item;
  const username = <Text strong>{user.username}</Text>;

  switch (action) {
    case "PERMISSION_GRANTED":
      return (
        <>
          {username} đã cấp quyền <Text strong>{details?.permissionLevel}</Text> cho{" "}
          <Text strong>{details?.grantedFor}</Text>
        </>
      );
    case "PERMISSION_REVOKED":
      return (
        <>
          {username} đã thu hồi quyền <Text strong>{details?.permissionLevel}</Text> từ{" "}
          <Text strong>{details?.revokedFor}</Text>
        </>
      );
    case "NODE_CREATED":
      return <>{username} đã tạo mục này</>;
    case "NODE_RENAMED":
      return (
        <>
          {username} đã đổi tên mục từ "{details?.oldName}" thành "{details?.newName}"
        </>
      );
    case "NODE_DELETED":
      return <>{username} đã xóa mục</>;
    default:
      return (
        <>
          {username} đã thực hiện hành động <Text strong>{action}</Text>
        </>
      );
  }
};

const DetailsPanelSkeleton: React.FC = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <Divider style={{ margin: 0, flexShrink: 0 }} />
    <div style={{ padding: "24px" }}>
      <Skeleton.Input active style={{ width: 150, height: 24 }} />
      <Skeleton.Input active size="small" style={{ width: 220, marginTop: 16 }} />
      <Skeleton.Button active block style={{ marginTop: 16, marginBottom: 24 }} />
      <Divider />
      <Skeleton.Input active style={{ width: 100, height: 24, marginTop: 16 }} />
      <Skeleton paragraph={{ rows: 4 }} style={{ marginTop: 16 }} />
    </div>
  </div>
);

const DetailsPanel: React.FC = () => {
  const { selectedNodeId } = useDriveContext();
  const { user } = useAuth(); // Lấy user từ hook thật

  const [nodeDetails, setNodeDetails] = useState<DriveNode | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserPermission, setCurrentUserPermission] = useState<PermissionLevel | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  const currentUserId = user ? user._id : null;
  const isCurrentUserRootAdmin = user?.role === "RootAdmin";

  useEffect(() => {
    if (!selectedNodeId) {
      setNodeDetails(null);
      return;
    }
    if (!currentUserId) {
      setNodeDetails(null);
      return;
    }

    setLoading(true);
    Promise.all([
      nodeApi.getNodeById(selectedNodeId),
      permissionsApi.getPermissionsForNode(selectedNodeId),
      activityLogApi.getForNode(selectedNodeId),
    ])
      .then(([nodeData, perms, logs]) => {
        setNodeDetails(nodeData);
        setPermissions(perms);
        setActivityLogs(logs);

        console.log("check logs", logs);
        const myPermission = perms.find((p) => p.user._id === currentUserId);
        setCurrentUserPermission(myPermission ? myPermission.permission : null);
      })
      .catch(() => {
        message.error(ErrorMessages.LOAD_DETAIL_FAILED);
        setNodeDetails(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedNodeId, currentUserId, dataVersion]);

  const handlePermissionsUpdate = () => {
    setDataVersion((prev) => prev + 1);
  };

  if (!selectedNodeId) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Empty
          image={<InfoCircleOutlined style={{ fontSize: 48, color: "#ccc" }} />}
          imageStyle={{ height: 60 }}
          description={<Text type="secondary">Chọn một mục để xem chi tiết</Text>}
        />
      </div>
    );
  }
  if (loading) {
    return <DetailsPanelSkeleton />;
  }
  if (!nodeDetails) {
    return (
      <div style={{ padding: 24 }}>
        <Text type="danger">Không thể hiển thị chi tiết.</Text>
      </div>
    );
  }

  const canManageAccess =
    currentUserPermission === "Owner" ||
    currentUserPermission === "Editor" ||
    isCurrentUserRootAdmin;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <style>{PanelStyles}</style>
      <div style={{ padding: "24px", textAlign: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 64, color: "#595959" }}>
          {nodeDetails.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
        </span>
        <Title level={4} style={{ marginTop: 16, wordBreak: "break-word" }}>
          {nodeDetails.name}
        </Title>
      </div>
      <Divider style={{ margin: 0, flexShrink: 0 }} />
      <Tabs className="details-panel-tabs" defaultActiveKey="1" centered tabBarGutter={40}>
        <TabPane tab="Chi tiết" key="1" style={{ padding: "0 24px" }}>
          <Title style={{ marginTop: 8 }} level={5}>
            Ai có quyền truy cập
          </Title>
          <Avatar.Group maxCount={4} style={{ marginBottom: 16 }}>
            {permissions.map((p) => (
              <Tooltip key={p.user._id} title={`${p.user.username} (${p.permission})`}>
                <Avatar>{getAvatarInitial(p.user.username)}</Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>
          <Paragraph type="secondary">Sở hữu bởi {nodeDetails.createdBy}.</Paragraph>
          {canManageAccess && (
            <Button
              type="primary"
              ghost
              style={{ width: "100%", marginBottom: 24 }}
              onClick={() => setIsModalOpen(true)}
            >
              Quản lý quyền truy cập
            </Button>
          )}
          <Divider />
          <Title level={5}>Thuộc tính</Title>
          <List itemLayout="horizontal">
            <List.Item>
              <List.Item.Meta
                avatar={<Text strong>Loại</Text>}
                description={nodeDetails.type === "FOLDER" ? "Thư mục" : "Tài liệu"}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<Text strong>Chủ sở hữu</Text>}
                description={nodeDetails.createdBy}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<Text strong>Sửa đổi</Text>}
                description={new Date(nodeDetails.updatedAt).toLocaleDateString("vi-VN")}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<Text strong>Ngày tạo</Text>}
                description={new Date(nodeDetails.createdAt).toLocaleDateString("vi-VN")}
              />
            </List.Item>
          </List>
        </TabPane>
        <TabPane tab="Lịch sử hoạt động" key="2" style={{ padding: "0 24px" }}>
          <List
            dataSource={activityLogs}
            locale={{ emptyText: "Chưa có hoạt động nào." }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{getAvatarInitial(item.user.username)}</Avatar>}
                  title={renderActivityDescription(item)}
                  description={
                    <Space>
                      <ClockCircleOutlined /> {new Date(item.timestamp).toLocaleString("vi-VN")}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
      {nodeDetails && (
        <ManageAccessModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          node={nodeDetails}
          onPermissionsUpdate={handlePermissionsUpdate}
          isCurrentUserRootAdmin={isCurrentUserRootAdmin}
        />
      )}
    </div>
  );
};

export default DetailsPanel;
