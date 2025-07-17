import React, { useState, useEffect, useRef } from "react";
import { Input, Tag, Typography, Spin, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import { searchApi } from "../../api/search.api";
import type { SearchResultDto, AccessStatus } from "../../types/app.types";
import FileIcon from "../../assets/Icons/FileIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";
import { SearchOutlined, CloseCircleFilled } from "@ant-design/icons";
import { useDriveContext } from "../../hooks/useDriveContext";

const { Text } = Typography;

// Hàm helper để lấy màu cho Tag quyền
const getPermissionColor = (status: AccessStatus) => {
  switch (status) {
    case "OWNER":
      return "gold";
    case "EDITOR":
      return "blue";
    case "VIEWER":
      return "green";
    default:
      return "default";
  }
};

const SearchInput: React.FC = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState<SearchResultDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { hiddenDetails } = useDriveContext();
  // [MỚI] State để quản lý mục đang được chọn bằng bàn phím
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Hook để ẩn dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    hiddenDetails();
  }, [hiddenDetails]);

  // Hook để fetch gợi ý
  useEffect(() => {
    if (!debouncedSearchTerm) {
      setOptions([]);
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(false);
    setLoading(true);
    searchApi
      .getSuggestions(debouncedSearchTerm)
      .then((results) => {
        setOptions(results);
        setActiveIndex(-1); // Reset active index khi có kết quả mới
      })
      .catch(() => {
        setOptions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [debouncedSearchTerm]);

  // Hook để quản lý trạng thái debounce
  useEffect(() => {
    if (searchTerm) {
      setIsDebouncing(true);
    } else {
      setIsDebouncing(false);
    }
  }, [searchTerm]);

  const handleSelect = (node: SearchResultDto) => {
    setSearchTerm(""); // Xóa ô tìm kiếm sau khi chọn
    setDropdownVisible(false);

    // Điều hướng đến trang chi tiết của file hoặc folder
    if (node.type === "FOLDER") {
      navigate(`/drive/${node.nodeId}`);
    } else {
      navigate(`/file/${node.nodeId}`);
    }
  };

  // [SỬA] Cập nhật hàm handleKeyDown để hỗ trợ mũi tên
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownVisible || options.length === 0) {
      if (event.key === "Enter" && searchTerm) {
        navigate(`/search?q=${searchTerm}`);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % options.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
        break;
      case "Enter":
        event.preventDefault();
        if (activeIndex >= 0) {
          handleSelect(options[activeIndex]);
        } else if (searchTerm) {
          navigate(`/search?q=${searchTerm}`);
          setDropdownVisible(false);
        }
        break;
      case "Escape":
        setDropdownVisible(false);
        break;
    }
  };

  const clearInput = () => {
    setSearchTerm("");
    setOptions([]);
    setDropdownVisible(false);
  };

  return (
    <div ref={searchContainerRef} style={{ position: "relative", width: "100%", maxWidth: 600 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 24,
          background: "#f5f6fa",
          height: 40,
          padding: "0 8px 0 16px",
          border: "1px solid transparent",
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
        onFocus={() => searchContainerRef.current?.style.setProperty("border-color", "#40a9ff")}
        onBlur={() => searchContainerRef.current?.style.setProperty("border-color", "transparent")}
      >
        <SearchOutlined style={{ color: "#8c8c8c", fontSize: 16 }} />
        <Input
          placeholder="Tìm trong tài liệu..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isDropdownVisible) {
              setDropdownVisible(true);
            }
          }}
          onFocus={() => setDropdownVisible(true)}
          onKeyDown={handleKeyDown}
          style={{
            border: "none",
            boxShadow: "none",
            background: "transparent",
            fontSize: 16,
            flex: 1,
            padding: 0,
            marginLeft: 8,
          }}
        />
        <div style={{ display: "flex", alignItems: "center" }}>
          {isDebouncing || loading ? (
            <Spin size="small" />
          ) : searchTerm ? (
            <CloseCircleFilled
              onClick={clearInput}
              style={{ color: "#aaa", cursor: "pointer", fontSize: 14 }}
            />
          ) : null}
        </div>
      </div>

      {isDropdownVisible && searchTerm && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            left: 0,
            right: 0,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 6px 16px 0 rgba(0, 0, 0, 0.08)",
            zIndex: 1050,
            maxHeight: 320,
            overflowY: "auto",
            border: "1px solid #f0f0f0",
          }}
        >
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <Spin />
            </div>
          ) : options.length > 0 ? (
            options.map((item, index) => (
              <div
                key={item.nodeId}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setActiveIndex(index)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  cursor: "pointer",
                  // [MỚI] Thêm background cho mục đang được chọn
                  backgroundColor: index === activeIndex ? "#f5f5f5" : "transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18, display: "flex", alignItems: "center" }}>
                    {item.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
                  </span>
                  <Text ellipsis={{ tooltip: item.name }} style={{ maxWidth: 250 }}>
                    {item.name}
                  </Text>
                </div>
                {item.accessStatus && (
                  <Tag color={getPermissionColor(item.accessStatus)}>{item.accessStatus}</Tag>
                )}
              </div>
            ))
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không tìm thấy kết quả"
              style={{ padding: "16px 0" }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
