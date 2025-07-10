import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button, Input, Typography, Card, Avatar, message, Divider, Radio, Space } from "antd";
import { useAuth } from "../../hooks/useAuth";
import { accessRequestApi } from "../../api/accessRequest.api";
import { ErrorMessages } from "../../constants/messages";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const RequestAccessPage: React.FC = () => {
  const { nodeType, nodeId } = useParams<{ nodeType: "folder" | "file"; nodeId: string }>();
  const { user } = useAuth();

  // Bỏ state `node` và `loading` vì không cần gọi API nữa
  const [requestMessage, setRequestMessage] = useState("");
  const [isRecursive, setIsRecursive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleRequestAccess = async () => {
    if (!nodeId) {
      message.error(ErrorMessages.RESOURCE_UNDEFINED);
      return;
    }
    setSubmitting(true);
    try {
      await accessRequestApi.create({
        nodeId,
        message: requestMessage,
        requestedPermission: "Editor", // Mặc định
        isRecursive: nodeType === "folder" ? isRecursive : false, // Chỉ gửi isRecursive nếu là folder
      });
      message.success("Yêu cầu của bạn đã được gửi đi.");
      setRequestSent(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.data?.errorCode === "E5002") {
        message.warning("Bạn đã gửi yêu cầu truy cập cho mục này trước đó.");
        setRequestSent(true);
      } else {
        message.error(ErrorMessages.SEND_REQUEST_FAILED);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Nếu không có nodeId hoặc nodeType, hiển thị lỗi
  if (!nodeId || !nodeType) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f8f9fa",
        }}
      >
        <Card style={{ width: "100%", maxWidth: 500, textAlign: "center" }}>
          <Title level={2} type="danger">
            Lỗi
          </Title>
          <Paragraph>Đường dẫn yêu cầu không hợp lệ.</Paragraph>
          <Link to="/">
            <Button type="primary">Quay về trang chủ</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f8f9fa",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 500,
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={2} style={{ marginBottom: 16 }}>
          Bạn cần có quyền truy cập
        </Title>

        {requestSent ? (
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Yêu cầu của bạn đã được gửi đến chủ sở hữu. Bạn sẽ nhận được email thông báo khi yêu cầu
            được xử lý.
          </Paragraph>
        ) : (
          <>
            <Paragraph type="secondary" style={{ fontSize: 16 }}>
              Hãy yêu cầu quyền truy cập cho mục này, hoặc chuyển sang một tài khoản có quyền.
            </Paragraph>
            <TextArea
              rows={3}
              placeholder="Tin nhắn (không bắt buộc)"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              style={{ marginBottom: 24 }}
            />

            {/* [SỬA] Hiển thị lựa chọn đệ quy dựa vào nodeType từ URL */}
            {nodeType === "folder" && (
              <Card size="small" style={{ marginBottom: 24, textAlign: "left" }}>
                <Radio.Group onChange={(e) => setIsRecursive(e.target.value)} value={isRecursive}>
                  <Space direction="vertical">
                    <Radio value={false}>
                      <Text strong>Chỉ thư mục này</Text>
                    </Radio>
                    <Radio value={true}>
                      <Text strong>Thư mục này và tất cả thư mục con</Text>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Card>
            )}

            <Button
              type="primary"
              size="large"
              onClick={handleRequestAccess}
              loading={submitting}
              style={{ width: "100%" }}
            >
              Yêu cầu quyền truy cập
            </Button>
          </>
        )}

        <Divider />
        <Text type="secondary">Bạn đang đăng nhập bằng</Text>
        <div
          style={{
            marginTop: 8,
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 12px",
            border: "1px solid #d9d9d9",
            borderRadius: 16,
          }}
        >
          <Avatar size="small" style={{ marginRight: 8 }}>
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Text>{user?.email}</Text>
        </div>
      </Card>
    </div>
  );
};

export default RequestAccessPage;
