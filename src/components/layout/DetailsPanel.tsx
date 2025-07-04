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
  Spin,
  Tooltip,
  message,
} from "antd";
import { useDriveContext } from "../../hooks/useDriveContext";
import FileIcon from "../common/Icons/FileIcon";
import FolderIcon from "../common/Icons/FolderIcon";
import { UserOutlined, ClockCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { permissionsApi, type UserPermission } from "../../api/permission";
import { activityLogApi, type ActivityLog } from "../../api/activityLog";
import { nodeApi } from "../../api/node";
import type { Node as DriveNode } from "../../types/app.types";

const { TabPane } = Tabs;
const { Text, Title, Paragraph } = Typography;

// [MỚI] CSS để xử lý layout và scrolling
const PanelStyles = `
  .details-panel-tabs.ant-tabs-centered .ant-tabs-nav {
    margin-bottom: 0px !important;
  }

  /* Làm cho component Tabs chiếm hết không gian còn lại */
  .details-panel-tabs {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0; /* Ngăn chặn overflow */
  }

  /* Làm cho khu vực chứa nội dung tab (dưới thanh tab) co giãn */
  .details-panel-tabs .ant-tabs-content-holder {
    flex: 1;
    overflow-y: auto; /* Bật thanh cuộn dọc cho khu vực này */
    min-height: 0; /* Ngăn chặn overflow */
  }
  
  /* Đảm bảo TabPane có chiều cao đầy đủ để tính toán scroll */
  .details-panel-tabs .ant-tabs-content,
  .details-panel-tabs .ant-tabs-tabpane {
    height: 100%;
  }
`;

const getAvatarInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : "?");

const DetailsPanel: React.FC = () => {
  const { selectedNodeId } = useDriveContext();

  const [nodeDetails, setNodeDetails] = useState<DriveNode | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedNodeId) {
      setNodeDetails(null);
      return;
    }

    setLoading(true);
    Promise.all([
      nodeApi.getNodeById(selectedNodeId),
      permissionsApi.getPermissionsForNode(selectedNodeId),
      activityLogApi.getActivityForNode(selectedNodeId),
    ])
      .then(([nodeData, perms, logs]) => {
        setNodeDetails(nodeData);
        console.log("nodeData", nodeData);

        setPermissions(perms);
        console.log("perms", perms);

        setActivityLogs(logs);
        console.log("logs", logs);
      })
      .catch(() => {
        message.error("Không thể tải chi tiết cho mục này.");
        setNodeDetails(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedNodeId]);

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
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!nodeDetails) {
    return (
      <div style={{ padding: 24 }}>
        <Text type="danger">Không thể hiển thị chi tiết.</Text>
      </div>
    );
  }

  return (
    // [SỬA] Cấu trúc layout với Flexbox
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
      <Tabs
        className="details-panel-tabs" // Gán class để CSS áp dụng
        defaultActiveKey="1"
        centered
        tabBarGutter={40}
      >
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
          <Button type="primary" ghost style={{ width: "100%", marginBottom: 24 }}>
            Quản lý quyền truy cập
          </Button>
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
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Text>
                      <Text strong>{item.user.username}</Text> đã thực hiện hành động{" "}
                      <Text strong>{item.action}</Text>
                    </Text>
                  }
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
    </div>
  );
};

export default DetailsPanel;
