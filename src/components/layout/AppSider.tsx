import React, { useState, useEffect } from "react";
import { Divider, Tree, Spin, message } from "antd";
import type { DataNode, TreeProps } from "antd/es/tree";
import {
  FolderOpenOutlined,
  TeamOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { nodeApi } from "../../api/node";
import type { TreeNodeDto } from "../../types/node.types";
import classNames from "classnames";
import CreateNewButton from "./CreateNewNodeButton";
import FileIcon from "../common/Icons/FileIcon";
import FolderIcon from "../common/Icons/FolderIcon";
// --- [SỬA] Định nghĩa lại CustomDataNode để chứa 'type' ---
interface CustomDataNode extends DataNode {
  type: "FOLDER" | "FILE";
}

// --- CSS tùy chỉnh cho Tree ---
const SiderTreeStyles = `
  .sider-drive-tree .ant-tree-node-content-wrapper {
    display: inline-flex !important;
    align-items: center !important;
    width: 100%;
  }
  .sider-drive-tree .ant-tree-title {
    display: inline-block;
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    margin-left: 4px;
  }
  .sider-drive-tree .ant-tree-indent-unit {
    width: 16px !important; /* Giảm khoảng cách mỗi cấp, mặc định là 24px */
  }
  .sider-drive-tree .ant-tree-switcher {
    width: 16px !important; /* Giảm chiều rộng của khu vực chứa mũi tên */
  }
`;

// --- Các mục menu tĩnh ---
const mainMenuItems = [
  { key: "shared", label: "Được chia sẻ với tôi", icon: <UsergroupAddOutlined />, path: "/shared" },
  { key: "recent", label: "Gần đây", icon: <ClockCircleOutlined />, path: "/recent" },
  { key: "trash", label: "Thùng rác", icon: <DeleteOutlined />, path: "/trash" },
];

const adminMenuItems = [
  { key: "users", label: "Quản lý Người dùng", icon: <TeamOutlined />, path: "/users" },
  { key: "system", label: "Quản lý Hệ thống", icon: <SettingOutlined />, path: "/system" },
];

// --- [SỬA] Hàm tiện ích cho Tree để trả về CustomDataNode ---
const transformToDataNode = (node: TreeNodeDto): CustomDataNode => ({
  key: node.id,
  title: node.name,
  icon: node.type === "FOLDER" ? <FolderIcon /> : <FileIcon />,
  isLeaf: !node.hasChildren,
  type: node.type, // Thêm lại thuộc tính type
});

const AppSider: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("my-drive");
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // --- Đồng bộ mục được chọn với URL ---
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    if (location.pathname === "/") {
      setSelectedKey("my-drive");
    } else if (location.pathname.startsWith("/drive/") || location.pathname.startsWith("/file/")) {
      const currentId = pathParts[pathParts.length - 1];
      setSelectedKey(currentId);
    } else {
      const activeItem = [...mainMenuItems, ...adminMenuItems].find(
        (item) => item.path === location.pathname
      );
      if (activeItem) {
        setSelectedKey(activeItem.key);
      }
    }
  }, [location.pathname]);

  // --- Logic tải dữ liệu cho cây thư mục ---
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
          message.error(`Không thể tải nội dung của thư mục "${node.title}".`);
          resolve();
        });
    });
  };

  // --- Hàm làm mới một node trên cây ---
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
      message.error("Không thể làm mới cây thư mục.");
    }
  };

  // --- Tải dữ liệu gốc ---
  useEffect(() => {
    setTreeLoading(true);
    nodeApi
      .getNodesByParentId(null)
      .then((rootNodes: TreeNodeDto[]) => {
        setTreeData(rootNodes.map(transformToDataNode));
      })
      .catch(() => message.error("Không thể tải dữ liệu Drive."))
      .finally(() => setTreeLoading(false));
  }, []);

  // --- Các hàm xử lý sự kiện ---
  const handleStaticItemSelect = (key: string, path: string) => {
    setSelectedKey(key);
    navigate(path);
  };

  // --- [SỬA] Logic onTreeSelect để dùng CustomDataNode ---
  const onTreeSelect: TreeProps["onSelect"] = (keys, info) => {
    if (keys.length === 0) return;
    const key = keys[0] as string;
    const node = info.node as unknown as CustomDataNode; // Ép kiểu về CustomDataNode
    setSelectedKey(key);
    if (node.type === "FILE") {
      // Dùng type để quyết định
      navigate(`/file/${key}`);
    } else {
      navigate(`/drive/${key}`);
    }
  };

  const onExpand: TreeProps["onExpand"] = (keys) => {
    setExpandedKeys(keys);
  };

  // --- Hàm render cho các mục tĩnh ---
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
          padding: "12px 16px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: isActive ? 600 : 400,
          fontSize: 17,
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

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <style>{SiderTreeStyles}</style>
      <div style={{ padding: 16 }}>
        <CreateNewButton onNodeCreated={refreshNode} />
      </div>

      <div
        style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0, paddingRight: 4 }}
      >
        <div style={{ padding: "4px 16px 16px" }}>
          <div
            className={classNames("sider-menu-item", isMyDriveActive && "sider-menu-item--active")}
            onClick={() => setIsDriveOpen(!isDriveOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: isMyDriveActive ? 600 : 400,
              fontSize: 17,
              color: isMyDriveActive ? "#2563eb" : "#374151",
              background: isMyDriveActive ? "#e8f0fe" : "transparent",
              marginBottom: 2,
            }}
          >
            <span style={{ fontSize: 16, marginRight: 10, transform: "translateY(2px)" }}>
              {isDriveOpen ? <CaretDownOutlined /> : <CaretRightOutlined />}
            </span>
            <span style={{ fontSize: 22, marginRight: 12 }}>
              <FolderOpenOutlined />
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleStaticItemSelect("my-drive", "/");
              }}
            >
              Drive của tôi
            </span>
          </div>

          {/* Cây thư mục động */}
          {isDriveOpen && (
            <div style={{ paddingLeft: 14, marginTop: 4 }}>
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

          {/* Các mục menu tĩnh khác */}
          {mainMenuItems.map(renderStaticItem)}

          <Divider style={{ margin: "18px 0 12px 0" }} />

          {/* Menu cho Admin */}
          {user?.role === "RootAdmin" && adminMenuItems.map(renderStaticItem)}
        </div>
      </div>
    </div>
  );
};

export default AppSider;
