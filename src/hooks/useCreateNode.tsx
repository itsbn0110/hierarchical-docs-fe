import  { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { nodeApi } from '../api/node';
import type { CreateNodeDto } from '../types/node.types';

// Định nghĩa các props mà hook cần
interface UseCreateNodeProps {
  onNodeCreated: (parentId: string | null) => void;
}

// Định nghĩa các props cần thiết khi muốn hiển thị modal
interface ShowModalProps {
  type: 'FOLDER' | 'FILE';
  parentId: string | null;
}

export const useCreateNode = ({ onNodeCreated }: UseCreateNodeProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [modalProps, setModalProps] = useState<ShowModalProps>({ type: 'FOLDER', parentId: null });
  const [processing, setProcessing] = useState(false);

  // Hàm để các component bên ngoài gọi để kích hoạt modal
  const showCreateModal = (props: ShowModalProps) => {
    setModalProps(props);
    setItemName(''); // Reset tên mỗi khi mở
    setIsModalVisible(true);
  };

  // Logic tạo node, giờ đã được đóng gói trong hook
  const handleCreate = async () => {
    if (!itemName.trim()) {
      message.error('Tên không được để trống.');
      return;
    }
    setProcessing(true);
    const dto: CreateNodeDto = {
      name: itemName,
      type: modalProps.type,
      parentId: modalProps.parentId,
    };
    try {
      await nodeApi.createNode(dto);
      message.success(`Đã tạo ${modalProps.type === 'FOLDER' ? 'thư mục' : 'file'} thành công!`);
      setIsModalVisible(false);
      onNodeCreated(modalProps.parentId); // Gọi callback để component cha làm mới
    } catch {
      message.error('Tạo mới thất bại.');
    } finally {
      setProcessing(false);
    }
  };

  // Component Modal được trả về như một phần của hook
  const CreateNodeModal = (
    <Modal
      title={`Tạo ${modalProps.type === 'FOLDER' ? 'thư mục' : 'file'} mới`}
      visible={isModalVisible}
      onOk={handleCreate}
      onCancel={() => setIsModalVisible(false)}
      confirmLoading={processing}
      destroyOnClose
    >
      <Input
        style={{ padding: 8 }}
        placeholder="Nhập tên"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        onPressEnter={handleCreate}
      />
    </Modal>
  );

  // Hook trả về hàm để kích hoạt và component Modal để hiển thị
  return { showCreateModal, CreateNodeModal,setIsModalVisible };
};
