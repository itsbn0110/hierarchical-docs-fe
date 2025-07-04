import { useState, type ReactNode, useCallback, useMemo } from "react";
import { DriveContext } from "./DriveContext.context";

export const DriveProvider = ({ children }: { children: ReactNode }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  // [SỬA] Dùng useCallback để hàm không bị tạo lại mỗi lần render
  const selectNodeId = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []); // Mảng rỗng có nghĩa là hàm này chỉ được tạo 1 lần duy nhất

  const toggleDetails = useCallback(() => {
    setDetailsVisible((prev) => !prev);
  }, []);

  const showDetails = useCallback(() => {
    setDetailsVisible(true);
  }, []);

  // [SỬA] Dùng useMemo để object `value` chỉ được tạo lại khi cần thiết
  const value = useMemo(
    () => ({
      selectedNodeId,
      detailsVisible,
      selectNodeId,
      toggleDetails,
      showDetails,
    }),
    [selectedNodeId, detailsVisible, selectNodeId, toggleDetails, showDetails]
  );

  return <DriveContext.Provider value={value}>{children}</DriveContext.Provider>;
};
