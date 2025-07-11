import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Alert,
  Space,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { nodeApi } from "../../api";
import type { Node, PermissionLevel } from "../../types/app.types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useAuth } from "../../hooks/useAuth";
import { useDriveContext } from "../../hooks/useDriveContext";
import { ErrorMessages } from "../../constants/messages";

const { Title } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

// --- Dữ liệu cho bảng hướng dẫn Markdown ---
const markdownGuideData = [
  { key: "1", syntax: "**Chữ đậm**", result: <strong>Chữ đậm</strong> },
  { key: "2", syntax: "*Chữ nghiêng*", result: <em>Chữ nghiêng</em> },
  { key: "3", syntax: "# Tiêu đề 1", result: <h1>Tiêu đề 1</h1> },
  { key: "4", syntax: "## Tiêu đề 2", result: <h2>Tiêu đề 2</h2> },
  { key: "5", syntax: "[Link](https://google.com)", result: <a href="#">Link</a> },
  { key: "6", syntax: "`code`", result: <code>code</code> },
  { key: "7", syntax: "![Mô tả](https://via.placeholder.com/150)", result: "Ảnh" },
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
  // [MỚI] State để lưu quyền của người dùng
  const [permission, setPermission] = useState<PermissionLevel | null>(null);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageHeaderRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState<string>("500px");
  const { selectNodeId, toggleDetails } = useDriveContext();

  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const calculateHeight = () => {
      if (pageHeaderRef.current) {
        const topOffset = pageHeaderRef.current.getBoundingClientRect().bottom;
        const availableHeight = window.innerHeight - topOffset - 24;
        setEditorHeight(`${availableHeight > 300 ? availableHeight : 300}px`);
      }
    };
    if (!loading) {
      calculateHeight();
    }
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, [loading]);

  useEffect(() => {
    if (!fileId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // [SỬA] Giả định API getNodeById trả về cả userPermission
    // Bạn cần cập nhật backend để hàm getNodeDetails trả về thêm quyền của user hiện tại
    nodeApi
      .getNodeById(fileId)
      .then((fileData) => {
        setFile(fileData);
        setContent(fileData.content || "");
        setPermission(fileData.userPermission || null); // Lưu quyền vào state
        selectNodeId(fileId);
      })
      .catch((error) => {
        if (error.response?.status === 403) {
          navigate(`/request-access/file/${fileId}`);
        } else {
          message.error(ErrorMessages.LOAD_FOLDER_FAILED);
          navigate("/");
        }
        setFile(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fileId, navigate, selectNodeId]);

  const handleInfoClick = () => {
    if (file) {
      toggleDetails();
    }
  };

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
      message.error(ErrorMessages.SAVE_FAILED);
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

  // [MỚI] Xác định xem người dùng có quyền chỉnh sửa không
  const canEdit =
    permission === ("Editor" as PermissionLevel) || permission === ("Owner" as PermissionLevel);

  return (
    <div>
      <style>
        {`@import url('https://cdn.jsdelivr.net/npm/github-markdown-css@5.5.1/github-markdown-light.css');`}
      </style>
      <div ref={pageHeaderRef}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link to="/">
                  <HomeOutlined />
                </Link>
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
            <Space>
              <span style={{ cursor: "pointer" }} onClick={handleInfoClick}>
                <InfoCircleOutlined style={{ fontSize: 20 }} />
              </span>

              {canEdit && isSaving && <Spin size="small" style={{ marginRight: 8 }} />}
              {canEdit && (
                <Typography.Text type="success">
                  {isSaving ? "Đang lưu..." : "Đã lưu"}
                </Typography.Text>
              )}
            </Space>
          </Col>
        </Row>
        <Title level={3}>{file.name}</Title>
        <Collapse ghost style={{ marginBottom: 16 }}>
          <Panel
            header={
              <>
                <QuestionCircleOutlined /> Hướng dẫn cú pháp Markdown
              </>
            }
            key="1"
            style={{ background: "#fafafa", borderRadius: "8px", border: "1px solid #f0f0f0" }}
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

      {/* [SỬA] Render có điều kiện dựa trên quyền */}
      <Row gutter={16} style={{ height: editorHeight }}>
        {canEdit || user?.role === "RootAdmin" ? (
          <>
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
          </>
        ) : (
          // Nếu chỉ có quyền xem, hiển thị phần xem trước chiếm toàn bộ chiều rộng
          <Col span={24} style={{ height: "100%" }}>
            <Alert
              message="Chế độ chỉ xem"
              description="Bạn chỉ có quyền xem tài liệu này. Để chỉnh sửa, hãy yêu cầu quyền Editor từ chủ sở hữu."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Card
              title={
                <>
                  <EyeOutlined /> Nội dung tài liệu
                </>
              }
              style={{
                height: `calc(${editorHeight} - 70px)`,
                display: "flex",
                flexDirection: "column",
              }}
              bodyStyle={{ flex: 1, overflowY: "auto" }}
            >
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {content}
                </ReactMarkdown>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default FilePage;
