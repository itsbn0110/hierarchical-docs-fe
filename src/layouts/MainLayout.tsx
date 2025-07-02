import React from "react";
import { Layout } from "antd";
import AppSider from "../components/layout/AppSider";
import AppHeader from "../components/layout/AppHeader";
import { Outlet } from "react-router-dom";

const { Header, Sider, Content } = Layout;

// Chiều cao của Header, dùng để tính toán cho các thành phần khác
const HEADER_HEIGHT = 72;

const MainLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          position: "fixed", // Cố định Header ở trên cùng
          zIndex: 10,
          width: "100%",
          background: "#fff",
          padding: 0,
          height: HEADER_HEIGHT,
          boxShadow: "0 2px 8px #f0f1f2",
        }}
      >
        <AppHeader />
      </Header>
      
      {/* Layout cho phần nội dung bên dưới Header */}
      <Layout style={{ marginTop: HEADER_HEIGHT }}>
        <Sider
          width={280}
          style={{
            background: "#fff",
            borderRight: "1px solid #eee",
            // Chiều cao của Sider bằng chiều cao màn hình trừ đi chiều cao Header
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            // Cố định Sider ở bên trái, bên dưới Header
            position: "fixed",
            left: 0,
            top: HEADER_HEIGHT,
            // Cho phép Sider tự cuộn khi nội dung dài hơn
            overflow: "auto",
          }}
        >
          <AppSider />
        </Sider>
        
        {/* Layout cho khu vực Content chính */}
        <Layout style={{ marginLeft: 280, padding: '24px 16px' }}>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
