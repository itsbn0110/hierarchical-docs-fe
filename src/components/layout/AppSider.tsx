import React, { useState, useEffect } from "react";
import { Divider, Tree, Spin, message, Badge } from "antd";
import type { DataNode, TreeProps } from "antd/es/tree";
import {
  FolderOpenOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  MailOutlined,
  SafetyCertificateOutlined, // 1. Import icon mới
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { nodeApi } from "../../api";
import { accessRequestApi } from "../../api/accessRequest.api";
import type { TreeNodeDto } from "../../types/node.types";
import classNames from "classnames";
import CreateNewButton from "./CreateNewNodeButton";
import FileIcon from "../../assets/Icons/FileIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";
import { ErrorMessages } from "../../constants/messages";

interface CustomDataNode extends DataNode {
  type: "FOLDER" | "FILE";
}

const SiderTreeStyles = `
  /* Sửa lại class của Ant Design để icon và title luôn thẳng hàng */
  .sider-drive-tree .ant-tree-node-content-wrapper {
    display: inline-flex !important;
    align-items: center !important;
    width: 100%;
  }

  /* Đảm bảo title không bị xuống dòng và có dấu ... khi dài */
  .sider-drive-tree .ant-tree-title {
    display: inline-block;
    max-width: 160px; /* Điều chỉnh chiều rộng tối đa tại đây */
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    margin-left: 4px; /* Thêm khoảng cách nhỏ với icon */
    margin-left: 4px;
  }
  .sider-drive-tree .ant-tree-indent-unit {
    width: 16px !important; /* Giảm khoảng cách mỗi cấp, mặc định là 24px */
  }
  .sider-drive-tree .ant-tree-switcher {
    width: 16px !important; /* Giảm chiều rộng của khu vực chứa mũi tên */
  }
    `;

const mainMenuItems = [
  { key: "shared", label: "Được chia sẻ với tôi", icon: <UsergroupAddOutlined />, path: "/shared" },
  { key: "recent", label: "Gần đây", icon: <ClockCircleOutlined />, path: "/recent" },
  { key: "trash", label: "Thùng rác", icon: <DeleteOutlined />, path: "/trash" },
];

// 2. Sửa đổi menu cho Admin
const adminMenuItems = [
  { key: "users", label: "Quản lý Người dùng", icon: <TeamOutlined />, path: "/users" },
  {
    key: "permissions",
    label: "Quản lý Quyền",
    icon: <SafetyCertificateOutlined />,
    path: "/permissions-management",
  },
];

const transformToDataNode = (node: TreeNodeDto): CustomDataNode => ({
  key: node.id,
  title: node.name,
  icon: node.type === "FOLDER" ? <FolderIcon /> : <FileIcon />,
  isLeaf: !node.hasChildren,
  type: node.type,
});

const AppSider: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("my-drive");
  const [isDriveOpen, setIsDriveOpen] = useState(true);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  // ... các useEffect và hàm xử lý khác giữ nguyên ...
  useEffect(() => {
    accessRequestApi
      .getPendingRequests()
      .then((requests) => {
        setPendingRequestCount(requests.length);
      })
      .catch((err) => {
        console.error("Không thể lấy danh sách yêu cầu:", err);
      });
  }, []);

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    if (location.pathname === "/") {
      setSelectedKey("my-drive");
    } else if (location.pathname.startsWith("/drive/") || location.pathname.startsWith("/file/")) {
      const currentId = pathParts[pathParts.length - 1];
      setSelectedKey(currentId);
    } else {
      const activeItem = [
        ...mainMenuItems,
        ...adminMenuItems,
        { key: "access-requests", path: "/access-requests" },
      ].find((item) => item.path === location.pathname);
      if (activeItem) {
        setSelectedKey(activeItem.key);
      }
    }
  }, [location.pathname]);

  const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] => {
    return list.map((node) => {
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateTreeData(node.children, key, children) };
      }
      return node;
    });
  };

  const onLoadData: TreeProps["loadData"] = (node) => {
    return new Promise<void>((resolve) => {
      if (node.children) {
        resolve();
        return;
      }
      nodeApi
        .getNodesByParentId(node.key as string)
        .then((childNodes: TreeNodeDto[]) => {
          setTreeData((currentTreeData) =>
            updateTreeData(currentTreeData, node.key, childNodes.map(transformToDataNode))
          );
          resolve();
        })
        .catch(() => {
          message.error(ErrorMessages.LOAD_FOLDER_CONTENT_FAILED);
          resolve();
        });
    });
  };

  const refreshNode = async (nodeId: string | null) => {
    try {
      const children = await nodeApi.getNodesByParentId(nodeId);
      if (nodeId === null) {
        setTreeData(children.map(transformToDataNode));
      } else {
        setTreeData((currentData) =>
          updateTreeData(currentData, nodeId, children.map(transformToDataNode))
        );
        if (!expandedKeys.includes(nodeId)) {
          setExpandedKeys([...expandedKeys, nodeId]);
        }
      }
    } catch {
      message.error(ErrorMessages.REFRESH_TREE_FAILED);
    }
  };

  useEffect(() => {
    setTreeLoading(true);
    nodeApi
      .getNodesByParentId(null)
      .then((rootNodes: TreeNodeDto[]) => {
        setTreeData(rootNodes.map(transformToDataNode));
      })
      .catch(() => console.log(ErrorMessages.LOAD_DRIVE_FAILED))
      .finally(() => setTreeLoading(false));
  }, []);

  const handleStaticItemSelect = (key: string, path: string) => {
    setSelectedKey(key);
    navigate(path);
  };

  const onTreeSelect: TreeProps["onSelect"] = (keys, info) => {
    if (keys.length === 0) return;
    const key = keys[0] as string;
    const node = info.node as unknown as CustomDataNode;
    setSelectedKey(key);
    if (node.type === "FILE") {
      navigate(`/file/${key}`);
    } else {
      navigate(`/drive/${key}`);
    }
  };

  const onExpand: TreeProps["onExpand"] = (keys) => {
    setExpandedKeys(keys);
  };

  const renderStaticItem = (item: {
    key: string;
    label: string;
    icon: React.ReactNode;
    path: string;
  }) => {
    const isActive = selectedKey === item.key;
    return (
      <div
        key={item.key}
        className={classNames("sider-menu-item", isActive && "sider-menu-item--active")}
        onClick={() => handleStaticItemSelect(item.key, item.path)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 20px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: isActive ? 600 : 400,
          fontSize: 16,
          color: isActive ? "#2563eb" : "#374151",
          background: isActive ? "#e8f0fe" : "transparent",
          marginBottom: 2,
        }}
      >
        <span style={{ fontSize: 22, marginRight: 12 }}>{item.icon}</span>
        {item.label}
      </div>
    );
  };

  const isMyDriveActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/drive/") ||
    location.pathname.startsWith("/file/");

  const accessRequestItem = {
    key: "access-requests",
    label: "Yêu cầu truy cập",
    icon: (
      <Badge count={pendingRequestCount} size="small">
        <MailOutlined />
      </Badge>
    ),
    path: "/access-requests",
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <style>{SiderTreeStyles}</style>
      <div style={{ padding: 16 }}>
        <CreateNewButton onNodeCreated={refreshNode} />
      </div>

      <div
        style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0, paddingRight: 4 }}
      >
        <div style={{ padding: "4px 14px 16px" }}>
          <div
            className={classNames("sider-menu-item", isMyDriveActive && "sider-menu-item--active")}
            onClick={() => setIsDriveOpen(!isDriveOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 4px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: isMyDriveActive ? 600 : 400,
              fontSize: 17,
              color: isMyDriveActive ? "#2563eb" : "#374151",
              background: isMyDriveActive ? "#e8f0fe" : "transparent",
              marginBottom: 2,
            }}
          >
            <span style={{ fontSize: 16, marginRight: 4, transform: "translateY(2px)" }}>
              {isDriveOpen ? <CaretDownOutlined /> : <CaretRightOutlined />}
            </span>
            <span style={{ fontSize: 18, marginRight: 12 }}>
              <FolderOpenOutlined />
            </span>
            <span
              style={{ fontSize: 17 }}
              onClick={(e) => {
                e.stopPropagation();
                handleStaticItemSelect("my-drive", "/");
              }}
            >
              Drive của tôi
            </span>
          </div>

          {isDriveOpen && (
            <div style={{ paddingLeft: 18, marginTop: 4 }}>
              {treeLoading ? (
                <div style={{ textAlign: "center", padding: 10 }}>
                  <Spin />
                </div>
              ) : (
                <Tree
                  className="sider-drive-tree"
                  showIcon
                  blockNode
                  loadData={onLoadData}
                  treeData={treeData}
                  onSelect={onTreeSelect}
                  selectedKeys={[selectedKey]}
                  expandedKeys={expandedKeys}
                  onExpand={onExpand}
                  style={{ background: "transparent" }}
                />
              )}
            </div>
          )}

          {renderStaticItem(accessRequestItem)}
          {mainMenuItems.map(renderStaticItem)}

          <Divider style={{ margin: "18px 0 12px 0" }} />

          {user?.role === "RootAdmin" && adminMenuItems.map(renderStaticItem)}
        </div>
      </div>
    </div>
  );
};

export default AppSider;
