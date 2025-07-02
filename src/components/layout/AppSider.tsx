import React, { useState, useEffect } from "react";
import { Button, Divider, Tree, Spin, message } from "antd";
import type { DataNode, TreeProps } from "antd/es/tree";
import {
  FolderOpenOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  PlusOutlined,
  UsergroupAddOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  FolderOutlined as AntFolderOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { nodeApi } from "../../api/node";
import type { TreeNodeDto } from "../../types/node.types";
import classNames from "classnames";

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

// --- Hàm tiện ích cho Tree ---
const transformToDataNode = (node: TreeNodeDto): DataNode => ({
  key: node.id,
  title: node.name,
  icon: node.type === "FOLDER" ? <AntFolderOutlined /> : <FileTextOutlined />,
  isLeaf: node.type === "FILE",
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
      if (node.children || node.isLeaf) {
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

  // --- Tải dữ liệu gốc cho cây khi component mount ---
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

  const onTreeSelect: TreeProps["onSelect"] = (keys, info) => {
    if (keys.length === 0) return;
    const key = keys[0] as string;
    setSelectedKey(key);
    if (info.node.isLeaf) {
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

  // --- [SỬA LẠI] Hàm render tiêu đề cho Tree, quay về dùng span ---
  const titleRender = (node: DataNode) => (
    <span
      style={{
        display: "inline-block", // Giữ trên cùng một hàng với icon
        maxWidth: "160px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        verticalAlign: "middle",
      }}
      title={node.title as string}
    >
      {node.title as React.ReactNode}
    </span>
  );

  const isMyDriveActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/drive/") ||
    location.pathname.startsWith("/file/");

  return (
    <div style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "0 8px 0 0" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          style={{ fontWeight: 600, fontSize: 18, marginBottom: 24, height: 48 }}
        >
          Tạo mới
        </Button>
      </div>

      <div
        style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0, paddingRight: 4 }}
      >
        {/* Phần "Drive của tôi" */}
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
          <span style={{ fontSize: 18, marginRight: 4, transform: "translateY(2px)" }}>
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
          <div style={{ paddingLeft: 16, marginTop: 4 }}>
            {treeLoading ? (
              <div style={{ textAlign: "center", padding: 10 }}>
                <Spin />
              </div>
            ) : (
              <Tree
                showIcon
                blockNode
                loadData={onLoadData}
                treeData={treeData}
                onSelect={onTreeSelect}
                selectedKeys={[selectedKey]}
                expandedKeys={expandedKeys}
                onExpand={onExpand}
                style={{ background: "transparent" }}
                titleRender={titleRender}
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
  );
};

export default AppSider;
