import { useContext } from "react";
import { DriveContext } from "../contexts/DriveContext.context";
export const useDriveContext = () => {
  const context = useContext(DriveContext);
  if (context === undefined) {
    throw new Error("useDriveContext must be used within a DriveProvider");
  }
  return context;
};
