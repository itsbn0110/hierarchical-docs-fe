import React from "react";
import { Tabs, Card, Typography, List } from "antd";

const { TabPane } = Tabs;
const { Text } = Typography;

const DetailsPanel: React.FC = () => {
  // Dữ liệu mock, sau này truyền props hoặc lấy từ context/store
  const node = {
    type: "folder",
    name: "Drive của tôi",
    updatedAt: "2025-07-01",
  };
  const mockHistory = [
    { time: "2025-07-01 10:00", action: "Tạo mới thư mục" },
    { time: "2025-07-01 11:00", action: "Thêm tài liệu" },
  ];

  return (
    <Tabs defaultActiveKey="1" style={{ height: "100%" }}>
      <TabPane tab="Chi tiết" key="1">
        <Card bordered={false} style={{ margin: 0, boxShadow: "none" }}>
          <Text strong>Loại:</Text>{" "}
          {node.type === "folder" ? "Thư mục" : "Tài liệu"}
          <br />
          <Text strong>Tên:</Text> {node.name}
          <br />
          <Text strong>Ngày chỉnh sửa:</Text> {node.updatedAt}
        </Card>
      </TabPane>
      <TabPane tab="Lịch sử" key="2">
        <List
          dataSource={mockHistory}
          renderItem={(item) => (
            <List.Item>
              <Text>{item.time}</Text> - <Text>{item.action}</Text>
            </List.Item>
          )}
        />
      </TabPane>
    </Tabs>
  );
};

export default DetailsPanel;
