import "../styles/layout.css";

const NAV = [
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
      { id: "orders",     icon: "▤", label: "Đơn hàng",  badge: 12 },
      { id: "vouchers",   icon: "⊘", label: "Voucher" },
    ],
  },
  {
    group: "Dịch vụ",
    items: [
      { id: "chat",          icon: "◈", label: "Tin nhắn",   badge: 8 },
      { id: "reviews",       icon: "◇", label: "Đánh giá",   badge: 5 },
      { id: "payments",      icon: "◻", label: "Thanh toán" },
      { id: "notifications", icon: "◌", label: "Thông báo",  badge: 3 },
    ],
  },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo__brand">VYX Store</span>
        <span className="sidebar-logo__sub">Admin Dashboard</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((section) => (
          <div key={section.group}>
            <div className="sidebar-group">{section.group}</div>
            {section.items.map((item) => (
              <div
                key={item.id}
                className={`sidebar-item${activePage === item.id ? " active" : ""}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className="sidebar-item__icon">{item.icon}</span>
                <span className="sidebar-item__label">{item.label}</span>
                {item.badge && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">AD</div>
        <div className="sidebar-user">
          <div className="sidebar-user__name">Admin</div>
          <div className="sidebar-user__role">Super Admin</div>
        </div>
      </div>
    </aside>
  );
}