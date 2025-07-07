import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { List, Spin, Typography, Empty, Button, message } from "antd";
import { searchApi } from "../../api/search.api";
import type { SearchResultDto } from "../../types/app.types";
import FileIcon from "../../components/common/Icons/FileIcon";
import FolderIcon from "../../components/common/Icons/FolderIcon";

const { Title, Text } = Typography;

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q");

  const [results, setResults] = useState<SearchResultDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchApi
        .fullSearch(query)
        .then((data) => setResults(data))
        .catch(() => message.error("Tìm kiếm thất bại."))
        .finally(() => setLoading(false));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleItemClick = (item: SearchResultDto) => {
    if (item.accessStatus === "NO_ACCESS") {
      // Logic để yêu cầu quyền truy cập sẽ được thêm vào sau
      message.info("Bạn cần yêu cầu quyền để xem mục này.");
    } else {
      const path = item.type === "FOLDER" ? `/drive/${item.nodeId}` : `/file/${item.nodeId}`;
      navigate(path);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: "block", marginTop: 50 }} />;
  }

  return (
    <div>
      <Title level={2}>Kết quả tìm kiếm cho: "{query}"</Title>
      <List
        itemLayout="horizontal"
        dataSource={results}
        renderItem={(item) => (
          <List.Item
            style={{ cursor: "pointer", padding: "12px", borderRadius: 8 }}
            className="search-result-item" // Thêm class để hover
            onClick={() => handleItemClick(item)}
            actions={[
              item.accessStatus === "NO_ACCESS" ? (
                <Button type="link">Yêu cầu truy cập</Button>
              ) : (
                <Text type="secondary">{item.accessStatus}</Text>
              ),
            ]}
          >
            <List.Item.Meta
              avatar={item.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
              title={item.name}
            />
          </List.Item>
        )}
        locale={{ emptyText: <Empty description="Không tìm thấy kết quả nào." /> }}
      />
    </div>
  );
};

export default SearchResultsPage;
