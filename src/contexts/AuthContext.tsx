import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/app.types";
import { AuthContext } from "./AuthContext.context";
import { useNavigate } from "react-router-dom";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 1. Khởi tạo state bằng cách đọc từ localStorage
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    try {
      // Parse JSON, nếu lỗi (dữ liệu không hợp lệ) thì trả về null
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem("accessToken");
  });

  const navigate = useNavigate();

  // 2. Sử dụng useEffect để tự động cập nhật localStorage khi state thay đổi
  useEffect(() => {
    console.log("hello from AuthProvider", user);
    if (user) {
      // Lưu object user dưới dạng chuỗi JSON
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      // Nếu user là null (khi logout), xóa khỏi localStorage
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [accessToken]);

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    // Các dòng removeItem ở đây giờ không còn thực sự cần thiết
    // vì useEffect đã xử lý, nhưng để lại cũng không sao.
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refeshToken"); // Đảm bảo refreshToken cũng được xóa
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, setUser, setAccessToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
