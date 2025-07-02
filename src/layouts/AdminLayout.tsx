import React from "react";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Content, Footer, Sider } = Layout;

const items1 = ["1", "2", "3"].map((key) => ({
  key,
  label: `nav ${key}`,
}));

const items2 = [
  {
    key: "users",
    icon: React.createElement(UserOutlined),
    label: "Quản lý người dùng",
  },
  {
    key: "folders",
    icon: React.createElement(LaptopOutlined),
    label: "Cây thư mục",
  },
  {
    key: "permissions",
    icon: React.createElement(NotificationOutlined),
    label: "Phân quyền",
  },
];

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  // Lấy key menu từ path
  const selectedKey = location.pathname.startsWith("/admin/folders")
    ? "folders"
    : location.pathname.startsWith("/admin/permissions")
    ? "permissions"
    : "users";
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          items={items1}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <div style={{ padding: "0 48px" }}>
        <Breadcrumb
          style={{ margin: "16px 0" }}
          items={[
            { title: "Home" },
            { title: "Admin" },
            { title: items2.find((i) => i.key === selectedKey)?.label },
          ]}
        />
        <Layout
          style={{
            padding: "24px 0",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Sider style={{ background: colorBgContainer }} width={200}>
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              style={{ height: "100%" }}
              items={items2}
              onClick={({ key }) => {
                if (key === "users") navigate("/admin/users");
                if (key === "folders") navigate("/admin/folders");
                if (key === "permissions") navigate("/admin/permissions");
              }}
            />
          </Sider>
          <Content style={{ padding: "0 24px", minHeight: 280 }}>
            {children ? children : <Outlet />}
          </Content>
        </Layout>
      </div>
      <Footer style={{ textAlign: "center" }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
  );
};

export default AdminLayout;
