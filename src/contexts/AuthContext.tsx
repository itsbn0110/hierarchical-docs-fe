import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/app.types";
import { AuthContext } from "./AuthContext.context";
import { useNavigate } from "react-router-dom";

// Định nghĩa kiểu dữ liệu cho payload của hàm login
export interface LoginData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 1. Khởi tạo state bằng cách đọc từ localStorage
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem("accessToken");
  });

  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return localStorage.getItem("accessToken");
  });
  
  

  const navigate = useNavigate();

  // 2. Sử dụng useEffect để tự động cập nhật localStorage khi state thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
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

  
  /**
   * HÀM MỚI: Xử lý việc đăng nhập.
   * Cập nhật state và lưu token vào localStorage.
   */
  const login = useCallback((data: LoginData) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken)
    localStorage.setItem("refreshToken", data.refreshToken);
  }, []);


  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken"); // Sửa lỗi chính tả từ "refeshToken"
    navigate("/login");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{  user, accessToken,refreshToken, setUser, setAccessToken, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};
