import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/layout.css";
import api from "../../../api/axiosConfig";
import AuthService from "../../../services/auth.service";

const NAV_TEMPLATE = [
  {
    group: "Tổng quan",
    items: [{ id: "dashboard", icon: "▦", label: "Dashboard" }],
  },
  {
    group: "Danh mục",
    items: [
      { id: "users",      icon: "◎", label: "Người dùng" },
      { id: "products",   icon: "◈", label: "Sản phẩm" },
      { id: "categories", icon: "◉", label: "Danh mục SP" },
      { id: "orders",     icon: "▤", label: "Đơn hàng",  badgeKey: "orders" },
      { id: "vouchers",   icon: "⊘", label: "Voucher" },
      { id: "news", icon: "◎", label: "Tin tức" },
    ],
  },
  {
    group: "Dịch vụ",
    items: [
      { id: "chat",          icon: "◈", label: "Tin nhắn",   badgeKey: "chat" },
      { id: "payments",      icon: "◻", label: "Thanh toán" },
      { id: "notifications", icon: "◌", label: "Thông báo",  badgeKey: "notifications" },
    ],
  },
];

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

function getUserFromToken(decoded) {
  if (!decoded) return { name: "Admin", role: "Admin", initials: "AD" };

  const name =
    decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
    decoded["name"] ??
    decoded["unique_name"] ??
    decoded["email"] ??
    "Admin";

  const role =
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
    decoded["role"] ??
    "Admin";

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return { name, role, initials };
}

export default function Sidebar({ activePage, onNavigate, open }) {
  const [badges, setBadges] = useState({});
  const [user, setUser] = useState({ name: "Admin", role: "Admin", initials: "AD" });
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await AuthService.logout(); } catch {}
    navigate("/dang-nhap");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = decodeToken(token);
    setUser(getUserFromToken(decoded));
  }, []);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [ordersRes, notifRes] = await Promise.allSettled([
          api.get("/orders", { params: { page: 1, pageSize: 1, status: "pending" } }),
          api.get("/notifications", { params: { page: 1, pageSize: 1 } }),
        ]);
        setBadges({
          orders: ordersRes.status === "fulfilled"
            ? (ordersRes.value.data?.totalCount ?? ordersRes.value.data?.total ?? 0)
            : 0,
          notifications: notifRes.status === "fulfilled"
            ? (notifRes.value.data?.unread ?? 0)
            : 0,
          reviews: 0,
          chat: 0,
        });
      } catch {}
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo__brand">VYX Store</span>
        <span className="sidebar-logo__sub">Admin Dashboard</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_TEMPLATE.map((section) => (
          <div key={section.group}>
            <div className="sidebar-group">{section.group}</div>
            {section.items.map((item) => {
              const badgeCount = item.badgeKey ? (badges[item.badgeKey] ?? 0) : 0;
              return (
                <div
                  key={item.id}
                  className={`sidebar-item${activePage === item.id ? " active" : ""}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <span className="sidebar-item__icon">{item.icon}</span>
                  <span className="sidebar-item__label">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="sidebar-badge">{badgeCount}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">{user.initials}</div>
        <div className="sidebar-user">
          <div className="sidebar-user__name">{user.name}</div>
          <div className="sidebar-user__role">{user.role}</div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Đăng xuất">
          ⏻
        </button>
      </div>
    </aside>
  );
}