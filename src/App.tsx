import { Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./pages/LoginPage/LoginPage";
import UserManagementPage from "./pages/UserManagement/UserManagementPage";
import { ToastContainer } from "react-toastify";
import MainLayout from "./layouts/MainLayout";
import DriveHomePage from "./pages/DriveHomePage/DriveHomePage";
import FolderPage from "./pages/FolderPage/FolderPage";
import FilePage from "./pages/FilePage/FilePage";
import RequestAccessPage from "./pages/RequestAccessPage/RequestAccessPage";
import AccessRequestsPage from "./pages/AccessRequestManagement/AccessRequestManagement";
import SharedWithMePage from "./pages/SharedWithMePage/SharedWithMePage";
import RecentPage from "./pages/RecentPage/RecentPage";
import TrashPage from "./pages/TrashPage/TrashPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
const NotFound = () => <div>Unauthorized</div>;

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<NotFound />} />
        <Route path="/request-access/:nodeType/:nodeId" element={<RequestAccessPage />} />
        <Route path="/profile" element={<ProfilePage/>} />
        

        <Route path="/" element={<MainLayout />}>
          {/* Trang chủ của Drive, hiển thị các thư mục gốc */}
          <Route index element={<DriveHomePage />} />

          {/* Route để hiển thị nội dung một thư mục */}
          <Route path="/drive/:folderId" element={<FolderPage />} />

          {/* Route để hiển thị nội dung một file */}
          <Route path="/file/:fileId" element={<FilePage />} />

          {/* Route quản lý người dùng cho Admin */}
          <Route path="/users" element={<UserManagementPage />} />

          <Route path="/access-requests" element={<AccessRequestsPage />} />

          <Route path="/shared" element={<SharedWithMePage />} />

          <Route path="/recent" element={<RecentPage />} />

          <Route path="/trash" element={<TrashPage />} />
          

          {/* Các route khác như /shared, /recent... */}
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
