import { useState, useEffect, useRef } from "react";
import { notificationService } from "../../../services/notification.service";

const PAGE_TITLES = {
  dashboard:     "Dashboard",
  users:         "Nguoi dung",
  products:      "San pham",
  categories:    "Danh muc san pham",
  orders:        "Don hang",
  vouchers:      "Voucher",
  reviews:       "Danh gia",
  payments:      "Thanh toan",
  notifications: "Thong bao",
  chat:          "Tin nhan",
  news:          "Tin tuc",
};

export default function Topbar({ activePage, onMenuClick, onUnreadChange, onNavigate }) {
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    loadUnread();
    notificationService.connect((notif) => {
      setNotifs(prev => [notif, ...prev].slice(0, 10));
      setUnread(prev => { const n = prev + 1; onUnreadChange?.(n); return n; });
    }).catch(() => {});
    return () => notificationService.disconnect();
  }, []);

  const loadUnread = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnread(count);
      onUnreadChange?.(count);
      const data = await notificationService.getAll({ page: 1, pageSize: 10 });
      setNotifs(data?.items ?? []);
    } catch {}
  };

  // Click outside đóng dropdown
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBellClick = () => setOpen(v => !v);

  const handleMarkAll = async () => {
    await notificationService.markAllRead();
    setUnread(0);
    onUnreadChange?.(0);
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleViewAll = () => {
    setOpen(false);
    onNavigate?.("notifications");
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="hamburger-btn"
          onClick={onMenuClick}
          style={{ display: "none", background: "none", border: "none", fontSize: 22, cursor: "pointer", marginRight: 8, alignItems: "center" }}
        >
          ☰
        </button>
        <div className="topbar__title">{PAGE_TITLES[activePage] ?? "Dashboard"}</div>
      </div>
      <div className="topbar__right">
        <div className="topbar__search">
          <span style={{ fontSize: 13 }}>🔍</span>
          Tim kiem...
        </div>
        <div style={{ position: "relative" }} ref={dropRef}>
          <button className="topbar__icon-btn" onClick={handleBellClick} style={{ position: "relative" }}>
            🔔
            {unread > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4,
                background: "#e53e3e", color: "#fff",
                fontSize: 10, fontWeight: 700,
                borderRadius: "50%", minWidth: 16, height: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 3px"
              }}>{unread > 99 ? "99+" : unread}</span>
            )}
          </button>

          {open && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)",
              width: 340, background: "#fff",
              borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              zIndex: 1000, overflow: "hidden"
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Thong bao</span>
                {unread > 0 && (
                  <button onClick={handleMarkAll} style={{ background: "none", border: "none", fontSize: 12, color: "#666", cursor: "pointer" }}>
                    Danh dau da doc
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {notifs.length === 0 && (
                  <div style={{ padding: "24px 16px", textAlign: "center", color: "#999", fontSize: 13 }}>
                    Khong co thong bao nao
                  </div>
                )}
                {notifs.map((n) => (
                  <div key={n.id} style={{
                    padding: "12px 16px", borderBottom: "1px solid #f5f5f5",
                    background: (n.isRead || n.read) ? "#fff" : "#f0f7ff",
                    cursor: "pointer"
                  }}>
                    <div style={{ fontSize: 13, color: "#111", marginBottom: 4 }}>
                      <div onClick={() => { setOpen(false); onNavigate?.("orders"); }}>
                    {n.message ?? n.text}
                  </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#999" }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString("vi-VN") : n.time}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 16px", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
                <button onClick={handleViewAll} style={{ background: "none", border: "none", fontSize: 13, color: "#3182ce", cursor: "pointer", fontWeight: 500 }}>
                  Xem tat ca thong bao
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}