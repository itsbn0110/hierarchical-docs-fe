import React, { useState } from "react";
import { Button, Dropdown, Menu, Modal, Input, message, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { nodeApi } from "../../api/node";
import type { CreateNodeDto } from "../../types/node.types";
import FolderIcon from "../common/Icons/FolderIcon";
import FileIcon from "../common/Icons/FileIcon";

interface CreateNewButtonProps {
  onNodeCreated: (parentId: string | null) => void;
}

const CreateNewButton: React.FC<CreateNewButtonProps> = ({ onNodeCreated }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"FOLDER" | "FILE">("FOLDER");
  const [isCreating, setIsCreating] = useState(false);

  const handleShowCreateModal = (type: "FOLDER" | "FILE") => {
    setNewItemType(type);
    setNewItemName("");
    setIsModalVisible(true);
  };

  const handleCreate = async () => {
    if (!newItemName.trim()) {
      message.error("Tên không được để trống.");
      return;
    }

    setIsCreating(true);

    // [SỬA] Đặt parentId là null để luôn tạo ở cấp gốc
    const parentId: string | null = null;

    const dto: CreateNodeDto = {
      name: newItemName,
      type: newItemType,
      parentId: parentId, // Luôn là null
    };

    try {
      await nodeApi.createNode(dto);
      message.success(
        `Đã tạo ${newItemType === "FOLDER" ? "thư mục" : "file"} "${newItemName}" thành công!`
      );
      setIsModalVisible(false);
      // Gọi callback để làm mới lại thư mục gốc
      onNodeCreated(parentId);
    } catch (error) {
      console.log(error);
      message.error("Tạo mới thất bại. Bạn có thể không có quyền trong thư mục này.");
    } finally {
      setIsCreating(false);
    }
  };

  const createMenu = (
    <Menu
      style={{ width: 220 }}
      onClick={({ key }) => handleShowCreateModal(key as "FOLDER" | "FILE")}
    >
      <Menu.Item key="FOLDER">
        <Space>
          <FolderIcon />
          Thư mục mới
        </Space>
      </Menu.Item>
      <Menu.Item key="FILE">
        <Space>
          <FileIcon />
          Tài liệu mới
        </Space>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown
        overlay={createMenu}
        trigger={["click"]}
        placement="bottomLeft"
        arrow={{ pointAtCenter: true }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          style={{ fontWeight: 600, fontSize: 18, marginBottom: 0, height: 48 }}
        >
          Tạo mới
        </Button>
      </Dropdown>

      <Modal
        title={`Tạo ${newItemType === "FOLDER" ? "thư mục" : "file"} mới`}
        visible={isModalVisible}
        onOk={handleCreate}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isCreating}
        destroyOnClose
      >
        <Input
          placeholder="Nhập tên"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onPressEnter={handleCreate}
        />
      </Modal>
    </>
  );
};

export default CreateNewButton;
