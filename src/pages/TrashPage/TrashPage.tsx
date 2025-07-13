import React, { useState, useEffect } from "react";
import { Table, Button, Space, Typography, Empty, message, Modal, Popconfirm } from "antd";
import type { TableProps } from "antd";
import { nodeApi } from "../../api";
import FileIcon from "../../assets/Icons/FileIcon";
import FolderIcon from "../../assets/Icons/FolderIcon";
import { ErrorMessages } from "../../constants/messages";
import { DeleteOutlined, RollbackOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import type { TrashedItem } from "../../types/node.types";
import { useDriveContext } from "../../hooks/useDriveContext";

const { Title, Paragraph } = Typography;
const { confirm } = Modal;


const TrashPage: React.FC = () => {
    const [items, setItems] = useState<TrashedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { hiddenDetails } = useDriveContext();
    const fetchTrashedItems = () => {
        setLoading(true);
        nodeApi.getTrashedNodes()
            .then(data => setItems(data))
            .catch(() => message.error(ErrorMessages.LOAD_TRASH_LIST_FAILED))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        hiddenDetails();
        fetchTrashedItems();
    }, [hiddenDetails]);

    const handleRestore = async (record: TrashedItem) => {
        try {
            await nodeApi.restoreNode(record._id);
            message.success(`Đã khôi phục "${record.name}"`);
            fetchTrashedItems(); // Tải lại danh sách
        } catch {
            message.error(`Không thể khôi phục "${record.name}"`);
        }
    };

    const handleDeletePermanently = (record: TrashedItem) => {
        confirm({
            title: `Bạn có chắc chắn muốn xóa vĩnh viễn "${record.name}"?`,
            icon: <ExclamationCircleFilled />,
            content: "Hành động này không thể hoàn tác.",
            okText: "Xóa vĩnh viễn",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await nodeApi.deleteNodePermanently(record._id);
                    message.success(`Đã xóa vĩnh viễn "${record.name}"`);
                    fetchTrashedItems(); // Tải lại danh sách
                } catch {
                    message.error("Xóa vĩnh viễn thất bại.");
                }
            },
        });
    };

    const columns: TableProps<TrashedItem>['columns'] = [
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            render: (name: string, record: TrashedItem) => (
                <Space>
                    {record.type === "FOLDER" ? <FolderIcon /> : <FileIcon />}
                    <span>{name}</span>
                </Space>
            ),
        },
        {
            title: "Ngày xóa",
            dataIndex: "deletedAt",
            key: "deletedAt",
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: "Hành động",
            key: "actions",
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Button icon={<RollbackOutlined />} onClick={() => handleRestore(record)}>
                        Khôi phục
                    </Button>
                    <Popconfirm
                        title="Xóa vĩnh viễn mục này?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDeletePermanently(record)}
                        okText="Xóa vĩnh viễn"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa vĩnh viễn
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Thùng rác</Title>
            <Paragraph type="secondary">
                Các mục trong thùng rác sẽ bị xóa vĩnh viễn sau 30 ngày.
            </Paragraph>
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={items}
                bordered
                loading={loading}
                style={{ marginTop: 24 }}
                locale={{ emptyText: <Empty description="Thùng rác của bạn trống." /> }}
            />
        </div>
    );
};

export default TrashPage;
