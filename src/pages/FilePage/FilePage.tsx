import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Spin,
  Typography,
  message,
  Card,
  Breadcrumb,
  Row,
  Col,
  Input,
  Collapse,
  Table,
} from "antd";
import { EditOutlined, EyeOutlined, HomeOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { nodeApi } from "../../api/node";
import type { Node } from "../../types/app.types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const { Title } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

// --- Dữ liệu cho bảng hướng dẫn Markdown ---
const markdownGuideData = [
  { key: "1", syntax: "**Chữ đậm**", result: <strong>Chữ đậm</strong> },
  { key: "2", syntax: "*Chữ nghiêng*", result: <em>Chữ nghiêng</em> },
  { key: "3", syntax: "# Tiêu đề 1", result: <h1>Tiêu đề 1</h1> },
  { key: "4", syntax: "## Tiêu đề 2", result: <h2>Tiêu đề 2</h2> },
  {
    key: "5",
    syntax: "[Link tới Google](https://google.com)",
    result: <a href="#">Link tới Google</a>,
  },
  { key: "6", syntax: "`code`", result: <code>code</code> },
  { key: "7", syntax: "![Mô tả](https://via.placeholder.com/150)", result: "Hiển thị ảnh" },
  { key: "8", syntax: "<b>Chữ đậm HTML</b>", result: <b>Chữ đậm HTML</b> },
];

const guideColumns = [
  { title: "Kiểu", dataIndex: "result", key: "result" },
  { title: "Cú pháp Markdown", dataIndex: "syntax", key: "syntax" },
];

const FilePage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [file, setFile] = useState<Node | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const saveTimeout = useRef<number | null>(null);
  const pageHeaderRef = useRef<HTMLDivElement>(null); // Ref để đo chiều cao phần header của trang
  const [editorHeight, setEditorHeight] = useState<string>("500px"); // Chiều cao mặc định

  // useEffect để tính toán chiều cao cho editor
  useEffect(() => {
    const calculateHeight = () => {
      if (pageHeaderRef.current) {
        const topOffset = pageHeaderRef.current.getBoundingClientRect().bottom;
        // 24px là khoảng cách lề dưới của content area
        const availableHeight = window.innerHeight - topOffset - 24;
        setEditorHeight(`${availableHeight > 300 ? availableHeight : 300}px`); // Đặt chiều cao tối thiểu 300px
      }
    };

    // Tính toán chiều cao sau khi dữ liệu đã tải xong
    if (!loading) {
      calculateHeight();
    }

    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, [loading]); // Chạy lại khi loading thay đổi

  useEffect(() => {
    if (!fileId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    nodeApi
      .getNodeById(fileId)
      .then((fileData) => {
        const fileWithContent = fileData as unknown as Node;
        setFile(fileWithContent);
        setContent(fileWithContent.content || "");
      })
      .catch(() => {
        message.error("Không thể tải nội dung file hoặc bạn không có quyền truy cập.");
        setFile(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fileId]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      handleSave(newContent);
    }, 1500);
  };

  const handleSave = async (saveContent: string) => {
    if (!fileId) return;
    setIsSaving(true);
    try {
      await nodeApi.updateNodeContent(fileId, { content: saveContent });
    } catch (error) {
      console.log(error);
      message.error("Lưu thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: "block", marginTop: 50 }} />;
  }

  if (!file) {
    return <Typography.Text type="danger">Không tìm thấy file hoặc có lỗi xảy ra.</Typography.Text>;
  }

  return (
    <div>
      <style>
        {`@import url('https://cdn.jsdelivr.net/npm/github-markdown-css@5.5.1/github-markdown-light.css');`}
      </style>
      {/* Bọc các thành phần header của trang trong một div với ref */}
      <div ref={pageHeaderRef}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link to="/"><HomeOutlined /></Link>
              </Breadcrumb.Item>
              {file.ancestors.map((ancestor) => (
                <Breadcrumb.Item key={ancestor._id}>
                  <Link to={`/drive/${ancestor._id}`}>{ancestor.name}</Link>
                </Breadcrumb.Item>
              ))}
              <Breadcrumb.Item>{file.name}</Breadcrumb.Item>
            </Breadcrumb>
          </Col>
          <Col>
            {isSaving && <Spin size="small" style={{ marginRight: 8 }} />}
            <Typography.Text type="secondary">
              {isSaving ? "Đang lưu..." : "Đã lưu"}
            </Typography.Text>
          </Col>
        </Row>

        <Title level={2}>{file.name}</Title>

        <Collapse ghost style={{ marginBottom: 16 }}>
          <Panel
            header={
              <>
                <QuestionCircleOutlined /> Hướng dẫn cú pháp Markdown
              </>
            }
            key="1"
            style={{
              background: "#fafafa",
              borderRadius: "8px",
              border: "1px solid #f0f0f0",
            }}
          >
            <Table
              dataSource={markdownGuideData}
              columns={guideColumns}
              pagination={false}
              size="small"
            />
          </Panel>
        </Collapse>
      </div>

      {/* Áp dụng chiều cao đã tính toán */}
      <Row gutter={16} style={{ height: editorHeight }}>
        <Col span={12} style={{ height: "100%" }}>
          <Card
            title={
              <>
                <EditOutlined /> Trình soạn thảo
              </>
            }
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            bodyStyle={{ flex: 1, overflowY: "auto", padding: 0 }}
          >
            <TextArea
              value={content}
              onChange={handleContentChange}
              placeholder="Nhập nội dung Markdown ở đây..."
              style={{
                border: "none",
                resize: "none",
                padding: "12px",
                boxShadow: "none",
                height: "100%",
              }}
            />
          </Card>
        </Col>
        <Col span={12} style={{ height: "100%" }}>
          <Card
            title={
              <>
                <EyeOutlined /> Xem trước
              </>
            }
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            bodyStyle={{ flex: 1, overflowY: "auto" }}
          >
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content}
              </ReactMarkdown>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FilePage;
