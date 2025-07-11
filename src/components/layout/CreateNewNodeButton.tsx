import React, { useState } from "react";
import { Button, Dropdown, Menu, Modal, Input, message, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { nodeApi } from "../../api";
import type { CreateNodeDto } from "../../types/node.types";
import FolderIcon from "../../assets/Icons/FolderIcon";
import FileIcon from "../../assets/Icons/FileIcon";
import { ErrorMessages } from "../../constants/messages"; // Import ErrorMessages

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
      message.error(ErrorMessages.NODE_NAME_REQUIRED);
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
      message.error(ErrorMessages.CREATE_NODE_FAILED);
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
          style={{ padding: 8 }}
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onPressEnter={handleCreate}
        />
      </Modal>
    </>
  );
};

export default CreateNewButton;
