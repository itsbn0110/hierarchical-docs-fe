# Hierarchical Document Management System - Frontend Docs

## 1. Tổng quan dự án

- **Mục tiêu:** Xây dựng giao diện quản lý tài liệu phân cấp, phân quyền chi tiết, tìm kiếm, quản lý người dùng, yêu cầu truy cập, v.v.
- **Tech stack:** React + TypeScript + Vite + Ant Design
- **Thư mục chính:**
  - `src/layouts/`: Các layout tổng thể (AppLayout, AdminLayout, ...)
  - `src/pages/`: Các trang chức năng (UserManagement, FolderTree, Document, ...)
  - `src/components/`: Component dùng chung
  - `src/routes/`: Định nghĩa route
  - `src/api/`: Gọi API, DTO mapping
  - `src/types/`: Định nghĩa type, DTO FE

## 2. Thứ tự phát triển (Roadmap)

### Giai đoạn 1: Xác thực & Quản lý người dùng

- [x] F1: Giao diện đăng nhập, đăng xuất (`pages/LoginPage.tsx`)
- [x] F2: Khu vực quản trị cho Root Admin để quản lý người dùng (`pages/UserManagement/UserManagementPage.tsx`)

### Giai đoạn 2: Cây thư mục & Tài liệu

- [ ] F3: Giao diện cây thư mục trực quan (`pages/FolderTree/FolderTreeView.tsx`)
- [ ] F4: Chức năng CRUD cho Thư mục (`pages/FolderTree/FolderForm.tsx`)
- [ ] F5: Chức năng CRUD cho Tài liệu văn bản (`pages/Document/DocumentView.tsx`, `pages/Document/DocumentForm.tsx`)

### Giai đoạn 3: Phân quyền

- [ ] F6: Hệ thống phân quyền chi tiết (`pages/Permission/PermissionManager.tsx`)
- [ ] F7: Logic xử lý quyền không kế thừa và quyền của Root Admin

### Giai đoạn 4: Tìm kiếm & Yêu cầu truy cập

- [ ] F8: Module tìm kiếm toàn văn (`pages/Search/SearchPage.tsx`)
- [ ] F9: Giao diện hiển thị kết quả tìm kiếm (`pages/Search/SearchResult.tsx`)
- [ ] F10: Form yêu cầu quyền truy cập (`pages/AccessRequest/AccessRequestForm.tsx`)
- [ ] F12: Giao diện quản lý các yêu cầu truy cập (`pages/AccessRequest/AccessRequestList.tsx`)

### Giai đoạn 5: Thông báo & Lịch sử (Optional)

- [ ] F11: Hệ thống gửi Email thông báo qua Queue
- [ ] F13: Giao diện xem lịch sử thay đổi của tài liệu (`pages/History/HistoryView.tsx`)

## 3. Bố cục & vị trí các thành phần

- **AppLayout:**
  - Header: Logo, user info, logout
  - Sider: Menu điều hướng (User, Thư mục, Tài liệu, Tìm kiếm, ...)
  - Content: Hiển thị nội dung theo route
- **AdminLayout:**
  - Sidebar riêng cho admin (quản lý user, quyền, yêu cầu truy cập)
  - Content: Render các trang quản trị
- **UserLayout:**
  - Sidebar cho user thông thường (nếu cần)

## 4. Những thứ cần chuẩn bị

- Cài đặt các package:
  - `npm install antd @ant-design/icons react-router-dom classnames reset-css`
- Import `reset-css` ở entrypoint (`src/main.tsx`)
- Chuẩn bị file cấu hình route (`src/routes/adminRoutes.tsx`, `src/routes/publicRoutes.tsx`)
- Chuẩn bị các API endpoint, DTO mapping ở `src/api/`
- Định nghĩa type, interface ở `src/types/`

## 5. Quy tắc phát triển

- Ưu tiên chia nhỏ component, tách biệt logic và UI
- Sử dụng Ant Design cho toàn bộ UI/UX
- Đặt tên file, folder rõ ràng, nhất quán
- Tách biệt rõ layout, page, component, api, types
- Đảm bảo phân quyền UI đúng theo role (RootAdmin/User)

## 6. Tham khảo

- [Ant Design](https://ant.design/components/overview/)
- [Ant Design Pro](https://pro.ant.design/)
- [Figma/Dribbble](https://dribbble.com/tags/admin_dashboard)

---

**Cập nhật roadmap và docs khi thêm tính năng mới hoặc thay đổi cấu trúc!**
