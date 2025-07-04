// Định nghĩa những gì Context sẽ cung cấp
import { createContext } from "react";
interface DriveContextType {
  selectedNodeId: string | null; // [SỬA] Chỉ lưu ID, không lưu cả object
  detailsVisible: boolean;
  selectNodeId: (id: string | null) => void; // [SỬA] Hàm để chọn ID
  toggleDetails: () => void;
  showDetails: () => void;
}

// Tạo Context
export const DriveContext = createContext<DriveContextType | undefined>(undefined);
