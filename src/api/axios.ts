import axios from "axios";
import { Modal, message } from "antd";
import { authApi } from "./auth.api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8086",
  withCredentials: true,
  timeout: 1000 * 60 * 10,
});

let refreshTokenPromise: Promise<string> | null = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { data, status } = error.response;
      const originalRequests = error.config;

      if (status === 410 && !originalRequests._retry) {
        originalRequests._retry = true;
        if (!refreshTokenPromise) {
          refreshTokenPromise = authApi
            .refreshTokenAPI()
            .then((response) => {
              const accessToken = response.accessToken;
              const refreshToken = response.refreshToken;
              localStorage.setItem("accessToken", accessToken);
              localStorage.setItem("refreshToken", refreshToken);
              return accessToken;
            })
            .catch((err) => {
              message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
              localStorage.removeItem("accessToken");
              window.location.href = "/login";
              return Promise.reject(err);
            })
            .finally(() => {
              refreshTokenPromise = null;
            });
        }
        return refreshTokenPromise.then((newToken) => {
          originalRequests.headers["Authorization"] = `Bearer ${newToken}`;
          return api(originalRequests);
        });
      }

      if (status === 403 && data.errorCode === "E1010") {
        Modal.warning({
          title: "Yêu cầu Cập nhật Mật khẩu",
          content:
            "Để đảm bảo an toàn cho tài khoản, bạn phải đổi mật khẩu trước khi có thể thực hiện các hành động khác.",
          okText: "Đến trang đổi mật khẩu",
          keyboard: false,
          maskClosable: false,
          onOk: () => {
            window.location.href = "/change-password";
          },
        });
      } else if (status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
