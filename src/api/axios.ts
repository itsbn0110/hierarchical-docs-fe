import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8086",
  withCredentials: true,
});

// Thêm interceptor để tự động gắn access token vào header Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// TODO: Thêm interceptor để tự động refresh token khi hết hạn
// api.interceptors.response.use(...)

export default api;
