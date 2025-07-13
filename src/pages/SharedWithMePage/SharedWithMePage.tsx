import React, { useState, useEffect } from "react";
import { Table, Space, Tag, Typography, Empty, message } from "antd";
import type { TableProps } from "antd";
import { useNavigate } from "react-router-dom";
import { permissionsApi } from "../../api";
import FileIcon from "../../assets/Icons/FileIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";
import { ErrorMessages } from "../../constants/messages";
import type { SharedNode } from "../../types/permission.types";
import { useDriveContext } from "../../hooks/useDriveContext";

const { Title, Paragraph } = Typography;


const SharedWithMePage: React.FC = () => {
    const [items, setItems] = useState<SharedNode[]>([]);
    const [loading, setLoading] = useState(false);
    const { hiddenDetails } = useDriveContext();
    
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        hiddenDetails()
        permissionsApi.getSharedWithMe()
            .then(data => setItems(data))
            .catch(() => message.error(ErrorMessages.LOAD_SHARED_LIST_FAILED))
            .finally(() => setLoading(false));
    }, [hiddenDetails]);

    const handleRowDoubleClick = (record: SharedNode) => {
        if (record.type === "FOLDER") {
            navigate(`/drive/${record._id}`);
        } else {
            navigate(`/file/${record._id}`);
        }
    };

    const columns: TableProps<SharedNode>['columns'] = [
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            render: (name: string, record: SharedNode) => (
                <Space>
                    {record.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
                    <span>{name}</span>
                </Space>
            ),
        },
        {
            title: "Người chia sẻ",
            dataIndex: "sharedBy",
            key: "sharedBy",
        },
        {
            title: "Ngày chia sẻ",
            dataIndex: "sharedAt",
            key: "sharedAt",
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: "Quyền của bạn",
            dataIndex: "yourPermission",
            key: "yourPermission",
            render: (permission: string) => <Tag color={permission === 'Editor' ? 'processing' : 'default'}>{permission}</Tag>,
        },
    ];

    return (
        <div>
            <Title level={2}>Được chia sẻ với tôi</Title>
            <Paragraph type="secondary">
                Đây là danh sách các tài liệu và thư mục mà người khác đã chia sẻ với bạn.
            </Paragraph>
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={items}
                bordered
                loading={loading}
                style={{ marginTop: 24 }}
                locale={{ emptyText: <Empty description="Chưa có ai chia sẻ gì với bạn." /> }}
                onRow={(record) => ({
                    onDoubleClick: () => handleRowDoubleClick(record),
                    style: { cursor: 'pointer' }
                })}
            />
        </div>
    );
};

export default SharedWithMePage;
