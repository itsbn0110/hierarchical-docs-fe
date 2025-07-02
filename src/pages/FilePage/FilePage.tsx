// src/pages/FilePage/FilePage.tsx

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Spin, Typography, message, Card, Breadcrumb } from "antd";
import { nodeApi } from "../../api/node";
import type { Node } from "../../types/app.types";

const { Title, Paragraph } = Typography;

// --- LƯU Ý QUAN TRỌNG ---
// Backend API của bạn cần có một endpoint GET /nodes/:id để lấy chi tiết một node,
// bao gồm cả `content` và `ancestors` (để làm breadcrumb).
// Bạn cần thêm hàm sau vào file `src/api/node.api.ts`:
/*
export const getNodeById = async (id: string): Promise<Node> => {
  const res = await api.get(`/nodes/${id}`);
  return res.data;
}
*/
// Và cập nhật `nodeApi` object để export nó.
// Đồng thời, cần có kiểu `Node` trong `app.types.ts`
/*
export interface Node {
  id: string;
  name: string;
  type: NodeType;
  content?: string;
  ancestors: { _id: string; name: string }[];
  // ... các thuộc tính khác
}
*/

const FilePage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [file, setFile] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fileId) {
      setLoading(false);
      return;
    }

    const fetchFileContent = async () => {
      setLoading(true);
      try {
        // Gọi API thật để lấy dữ liệu file
        const fileData = await nodeApi.getNodeById(fileId);
        console.log("File data:", fileData); // Kiểm tra dữ liệu trả về
        setFile(fileData);
      } catch (error) {
        message.error("Không thể tải nội dung file hoặc bạn không có quyền truy cập.");
        console.error(error);
        setFile(null); // Đặt lại file là null nếu có lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchFileContent();
  }, [fileId]);

  if (loading) {
    return <Spin size="large" style={{ display: "block", marginTop: 50 }} />;
  }

  if (!file) {
    return <Typography.Text type="danger">Không tìm thấy file hoặc có lỗi xảy ra.</Typography.Text>;
  }

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/">Drive của tôi</Link>
        </Breadcrumb.Item>
        {file.ancestors.map((ancestor) => (
          <Breadcrumb.Item key={ancestor._id}>
            <Link to={`/drive/${ancestor._id}`}>{ancestor.name}</Link>
          </Breadcrumb.Item>
        ))}
        <Breadcrumb.Item>{file.name}</Breadcrumb.Item>
      </Breadcrumb>
      <Card>
        <Title level={3}>{file.name}</Title>
        <Paragraph>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              fontFamily: "inherit",
              fontSize: "1rem",
            }}
          >
            {file.content || "Tài liệu này không có nội dung."}
          </pre>
        </Paragraph>
      </Card>
    </div>
  );
};

export default FilePage;
