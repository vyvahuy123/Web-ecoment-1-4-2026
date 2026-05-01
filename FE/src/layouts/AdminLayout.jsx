import { Navigate } from "react-router-dom";
import AdminDashboard from "../page/Admin/AdminDashboard";

/**
 * AdminLayout
 * - Bọc AdminDashboard
 * - Kiểm tra quyền admin trước khi cho vào
 * - Sau này có thể thêm: loading state, refresh token, v.v.
 */
export default function AdminLayout() {
  // ── Lấy thông tin user từ localStorage (hoặc context/redux của bạn) ──
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Chưa đăng nhập → về trang Auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Không phải admin → về trang chủ
  if (user.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  // Đủ quyền → render dashboard
  return <AdminDashboard />;
}