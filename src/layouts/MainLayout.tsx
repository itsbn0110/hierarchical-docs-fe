import React from "react";
import { Layout } from "antd";
import AppSider from "../components/layout/AppSider";
import AppHeader from "../components/layout/AppHeader";
import { Outlet } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sử dụng layout "Fixed Sider" của Ant Design.
        Sider được đặt ở vị trí cố định bên trái, có chiều cao 100% viewport và tự xử lý overflow.
      */}
      <Sider
        width={280}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: "#fff",
          borderRight: "1px solid #eee",
        }}
      >
        {/* Component AppSider của bạn không cần thay đổi gì thêm */}
        <AppSider />
      </Sider>

      {/* Layout chính cho phần còn lại của trang.
        Cần có marginLeft bằng với chiều rộng của Sider để không bị Sider che mất.
      */}
      <Layout style={{ marginLeft: 280 }}>
        <Header
          style={{
            padding: 0,
            background: "#fff",
            boxShadow: "0 2px 8px #f0f1f2",
            // Header cũng cần dính vào lề trái của layout này
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%",
          }}
        >
          <AppHeader />
        </Header>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
