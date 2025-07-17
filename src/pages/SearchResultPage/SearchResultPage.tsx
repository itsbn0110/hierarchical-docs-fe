import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { List, Spin, Typography, Empty, Button, message, Tag } from "antd";
import { searchApi } from "../../api";
import type { SearchResultDto, AccessStatus } from "../../types/app.types";
import FileIcon from "../../assets/Icons/FileIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";
import { ErrorMessages } from "../../constants/messages";

const { Title, Text } = Typography;

// Hàm helper để hiển thị Tag quyền truy cập
const getPermissionTag = (status: AccessStatus) => {
  switch (status) {
    case "OWNER":
      return <Tag color="gold">Owner</Tag>;
    case "EDITOR":
      return <Tag color="blue">Editor</Tag>;
    case "VIEWER":
      return <Tag color="green">Viewer</Tag>;
    default:
      return null;
  }
};

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q"); // Lấy từ khóa `q` từ URL

  const [results, setResults] = useState<SearchResultDto[]>([]);
  const [loading, setLoading] = useState(false);

  // useEffect sẽ chạy mỗi khi từ khóa tìm kiếm trên URL thay đổi
  useEffect(() => {
    if (query) {
      setLoading(true);
      // Gọi API fullSearch
      searchApi
        .fullSearch(query)
        .then((data) => setResults(data))
        .catch(() => message.error(ErrorMessages.SEARCH_FAILED))
        .finally(() => setLoading(false));
    } else {
      setResults([]); // Xóa kết quả nếu không có từ khóa
    }
  }, [query]);

  // Hàm xử lý khi người dùng click vào một kết quả
  const handleItemClick = (item: SearchResultDto) => {
    // Nếu không có quyền, chuyển đến trang yêu cầu quyền
    if (item.accessStatus === "NO_ACCESS") {
      const nodeType = item.type.toLowerCase();
      navigate(`/request-access/${nodeType}/${item.nodeId}`);
    } else {
      // Nếu có quyền, chuyển đến trang của file/folder đó
      const path = item.type === "FOLDER" ? `/drive/${item.nodeId}` : `/file/${item.nodeId}`;
      navigate(path);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: "block", marginTop: 50 }} />;
  }

  return (
    <div>
      <style>{`
        .search-result-item:hover {
          background-color: #f5f5f5;
        }
      `}</style>
      <Title level={2}>Kết quả tìm kiếm cho: "{query}"</Title>
      <List
        itemLayout="horizontal"
        dataSource={results}
        renderItem={(item) => (
          <List.Item
            style={{ cursor: "pointer", padding: "12px 16px", borderRadius: 8 }}
            className="search-result-item"
            onClick={() => handleItemClick(item)}
            actions={[
              // Hiển thị nút "Yêu cầu truy cập" hoặc Tag quyền
              item.accessStatus === "NO_ACCESS" ? (
                <Button
                  type="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item);
                  }}
                >
                  Yêu cầu truy cập
                </Button>
              ) : (
                getPermissionTag(item.accessStatus)
              ),
            ]}
          >
            <List.Item.Meta
              avatar={item.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
              title={<Text>{item.name}</Text>}
            />
          </List.Item>
        )}
        locale={{ emptyText: <Empty description="Không tìm thấy kết quả nào phù hợp." /> }}
      />
    </div>
  );
};

export default SearchResultsPage;
