import React, { useState, useEffect } from "react";
import { Tabs, Typography, message } from "antd";
import { ClockCircleOutlined, HistoryOutlined } from "@ant-design/icons";
import { accessRequestApi } from "../../api/accessRequest.api";
import type { PendingRequest, ProcessedRequest } from "../../api/accessRequest.api";
import { ErrorMessages } from "../../constants/messages";
import RequestsTable from "../../components/layout/RequestTable"; // Giả sử bạn đặt file trên vào components
import { useDriveContext } from "../../hooks/useDriveContext";
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const AccessRequestsPage: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [processedRequests, setProcessedRequests] = useState<ProcessedRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const { hiddenDetails } = useDriveContext();

  const fetchRequests = (tabKey: string) => {
    setLoading(true);
    const apiCall =
      tabKey === "pending"
        ? accessRequestApi.getPendingRequests()
        : accessRequestApi.getProcessedRequests();

    apiCall
      .then((data) => {
        if (tabKey === "pending") {
          setPendingRequests(data as PendingRequest[]);
        } else {
          setProcessedRequests(data as ProcessedRequest[]);
        }
      })
      .catch(() => message.error(ErrorMessages.LOAD_REQUEST_LIST_FAILED))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    hiddenDetails();
  }, [hiddenDetails]);

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  const handleApprove = async (requestId: string) => {
    try {
      await accessRequestApi.approve(requestId);
      message.success("Đã chấp thuận yêu cầu.");
      // Tải lại danh sách pending sau khi xử lý
      fetchRequests("pending");
    } catch (error) {
      console.log(error);
      message.error(ErrorMessages.APPROVE_REQUEST_FAILED);
    }
  };

  const handleDeny = async (requestId: string) => {
    try {
      await accessRequestApi.deny(requestId);
      message.info("Đã từ chối yêu cầu.");
      // Tải lại danh sách pending sau khi xử lý
      fetchRequests("pending");
    } catch (error) {
      console.log(error);
      message.error(ErrorMessages.DENY_REQUEST_FAILED);
    }
  };

  return (
    <div>
      <Title level={2}>Yêu cầu Truy cập</Title>
      <Paragraph type="secondary">
        Xem xét các yêu cầu xin quyền truy cập vào các tài liệu và thư mục mà bạn sở hữu.
      </Paragraph>

      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
        <TabPane
          tab={
            <span>
              <ClockCircleOutlined /> Đang chờ
            </span>
          }
          key="pending"
        >
          <RequestsTable
            requests={pendingRequests}
            loading={loading}
            onApprove={handleApprove}
            onDeny={handleDeny}
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <HistoryOutlined /> Lịch sử
            </span>
          }
          key="history"
        >
          <RequestsTable requests={processedRequests} loading={loading} isHistory={true} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AccessRequestsPage;
