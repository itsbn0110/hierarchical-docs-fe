import React from "react";
import { Layout } from "antd";
import AppSider from "../components/layout/AppSider";
import AppHeader from "../components/layout/AppHeader";
import DetailsPanel from "../components/layout/DetailsPanel";
import { Outlet } from "react-router-dom";
import { useDriveContext } from "../hooks/useDriveContext";

const { Header, Sider, Content } = Layout;
const HEADER_HEIGHT = 72;

const MainLayout: React.FC = () => {
  // 2. Lấy state và hàm từ Context, không cần state cục bộ nữa
  const { detailsVisible } = useDriveContext();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          position: "fixed",
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

      <Layout style={{ marginTop: HEADER_HEIGHT }}>
        <Sider
          width={280}
          style={{
            background: "#fff",
            borderRight: "1px solid #eee",
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            position: "fixed",
            left: 0,
            top: HEADER_HEIGHT,
            overflow: "auto",
          }}
        >
          <AppSider />
        </Sider>

        <Layout style={{ marginLeft: 280, display: "flex", flexDirection: "row" }}>
          {/* 3. Bỏ `context` khỏi Outlet, vì các trang con sẽ tự dùng hook */}
          <Content style={{ padding: "24px 16px", flex: 1 }}>
            <Outlet />
          </Content>

          {/* Sider cho Details Panel, hiển thị dựa vào state từ context */}
          <Sider
            width={320}
            theme="light"
            collapsed={!detailsVisible}
            collapsedWidth={0}
            trigger={null}
            style={{
              borderLeft: "1px solid #f0f0f0",
              height: `calc(100vh - ${HEADER_HEIGHT}px)`,
              background: "#fff",
            }}
          >
            {/* 4. Truyền toàn bộ node được chọn vào panel */}
            <DetailsPanel />
          </Sider>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
