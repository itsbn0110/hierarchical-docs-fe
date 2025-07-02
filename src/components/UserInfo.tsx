import React from "react";
import { useAuthContext } from "../hooks/useAuthContext";
const UserInfo: React.FC = () => {
  const { user } = useAuthContext();
  return (
    <div style={{ margin: "16px 0", padding: 8, border: "1px solid #eee" }}>
      <strong>User from context:</strong>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};

export default UserInfo;
