import React from "react";
import { Avatar, Dropdown, Menu } from "antd";
import { LogoutOutlined, UserOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import SearchInput from "./SearchInput"; // 1. Import component SearchInput mới

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();

  const menu = (
    <Menu style={{ minWidth: 140 }}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Hồ sơ
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      style={{
        background: "#fff",
        borderBottom: "1px solid #eee",
        height: "100%",
        boxShadow: "0 2px 8px #f0f1f2",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        gap: 32,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          minWidth: 180,
          height: "100%",
        }}
      >
        <FolderOpenOutlined style={{ fontSize: 32, color: "#2563eb" }} />
        <span
          style={{
            fontWeight: 700,
            fontSize: 24,
            color: "#334155",
          }}
        >
          Hierarchical Docs
        </span>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        {/* 2. Thay thế Input cũ bằng SearchInput mới */}
        <SearchInput />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          minWidth: 80,
          justifyContent: "flex-end",
          height: "100%",
        }}
      >
        <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
          <Avatar
            style={{
              background: "#fecaca",
              color: "#991b1b",
              fontWeight: 700,
              cursor: "pointer",
            }}
            size={40}
          >
            {user?.role === "RootAdmin" ? "AD" : "U"}
          </Avatar>
        </Dropdown>
      </div>
    </div>
  );
};

export default AppHeader;
