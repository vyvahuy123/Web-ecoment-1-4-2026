"use client";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import AdminDashboard from "../page/Admin/AdminDashboard";

/**
 * AdminLayout
 * - Bọc AdminDashboard
 * - Kiểm tra quyền admin trước khi cho vào
 * - Sau này có thể thêm: loading state, refresh token, v.v.
 */
export default function AdminLayout() {
  // ── Lấy thông tin user từ (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}) (hoặc context/redux của bạn) ──
  const user = JSON.parse((typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).getItem("user") || "null");

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