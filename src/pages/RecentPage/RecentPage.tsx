import React, { useState, useEffect } from "react";
import { Table, Space, Typography, Empty, message } from "antd";
import type { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
import { permissionsApi } from "../../api";
import  { type RecentItem } from "../../types/permission.types";
import FileIcon from "../../assets/Icons/FileIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";
import { ErrorMessages } from "../../constants/messages";
import { useDriveContext } from "../../hooks/useDriveContext";

const { Title, Paragraph } = Typography;

const RecentPage: React.FC = () => {
    const [items, setItems] = useState<RecentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { hiddenDetails } = useDriveContext();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        hiddenDetails();
        permissionsApi.getRecentItems()
            .then(data => setItems(data))
            .catch(() => message.error(ErrorMessages.LOAD_RECENT_LIST_FAILED))
            .finally(() => setLoading(false));
    }, [hiddenDetails]);

    const handleRowDoubleClick = (record: RecentItem) => {
        if (record.type === "FOLDER") {
            navigate(`/drive/${record._id}`);
        } else {
            navigate(`/file/${record._id}`);
        }
    };

    const columns: TableProps<RecentItem>['columns'] = [
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            render: (name: string, record: RecentItem) => (
                <Space>
                    {record.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
                    <span>{name}</span>
                </Space>
            ),
        },
        {
            title: "Chủ sở hữu",
            dataIndex: "owner",
            key: "owner",
        },
        {
            title: "Truy cập lần cuối",
            dataIndex: "lastAccessedAt",
            key: "lastAccessedAt",
            render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : '-',
            sorter: (a, b) => new Date(a.lastAccessedAt).getTime() - new Date(b.lastAccessedAt).getTime(),
            defaultSortOrder: 'descend',
        },
    ];

    return (
        <div>
            <Title level={2}>Gần đây</Title>
            <Paragraph type="secondary">
                Các tài liệu và thư mục bạn đã xem hoặc chỉnh sửa gần đây nhất.
            </Paragraph>
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={items}
                bordered
                loading={loading}
                style={{ marginTop: 24 }}
                locale={{ emptyText: <Empty description="Chưa có hoạt động nào gần đây." /> }}
                onRow={(record) => ({
                    onDoubleClick: () => handleRowDoubleClick(record),
                    style: { cursor: 'pointer' }
                })}
            />
        </div>
    );
};

export default RecentPage;
