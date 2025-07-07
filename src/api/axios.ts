import axios from "axios";
import { Modal, message } from 'antd';
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
api.interceptors.response.use(
  (response) => {
    // Trả về response nếu không có lỗi
    return response;
  },
  (error) => {
    // Xử lý lỗi ở đây
    if (error.response) {
      const { data, status } = error.response;

      // Trường hợp 1: Lỗi yêu cầu đổi mật khẩu (E1009)
      if (status === 403 && data.errorCode === 'E1009' ) {
        Modal.warning({
          title: 'Yêu cầu Cập nhật Mật khẩu',
          content: 'Để đảm bảo an toàn cho tài khoản, bạn phải đổi mật khẩu trước khi có thể thực hiện các hành động khác.',
          okText: 'Đến trang đổi mật khẩu',
          keyboard: false, // Không cho đóng bằng phím Esc
          maskClosable: false, // Không cho đóng khi click ra ngoài
          onOk: () => {
            // Chuyển hướng người dùng. Dùng window.location.href để đảm bảo chuyển trang
            // vì interceptor nằm ngoài context của React Router.
            window.location.href = '/change-password'; // Hoặc một route khác của bạn
          },
        });
      } 
      // Trường hợp 2: Token hết hạn hoặc không hợp lệ (thường là 401)
      else if (status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem("accessToken")
        window.location.href = '/login';
      }
      // Các trường hợp lỗi khác có thể được xử lý ở đây
    }

    // Rất quan trọng: Trả về lỗi để các hàm .catch() ở nơi gọi API có thể xử lý tiếp
    return Promise.reject(error);
  }
);
export default api;
