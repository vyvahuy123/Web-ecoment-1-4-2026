import { useState, useEffect, useRef } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import AuthService from "@/services/auth.service";
import { notificationService } from "@/services/notification.service";

const NAV_LINKS_LEFT = [
  ["Trang chủ", "/"],
  ["Giới thiệu", "/gioi-thieu"],
  ["Tin tức", "/tin-tuc"],   // ← sửa từ "/" thành "/tin-tuc"
  ["Sản phẩm", "/san-pham"],
];

const NAV_LINKS_RIGHT = [
  ["Sale", "/san-pham"],
  ["Liên hệ", "/lien-he"],
];

function getInitials(name) {
  if (!name) return "U";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  const colors = ["#5c6bc0", "#26a69a", "#ef5350", "#ab47bc", "#42a5f5", "#d4a43a"];
  if (!name) return colors[0];
  return colors[name.charCodeAt(0) % colors.length];
}

function UserMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const displayName = user?.fullName || user?.username || user?.email || "User";

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await AuthService.logout();
    localStorage.removeItem("user");
    setOpen(false);
    onLogout?.();
    navigate("/");
  };

  return (
    <div className="ec-user-menu" ref={ref}>
      <button className="ec-user-btn" onClick={() => setOpen((o) => !o)}>
        <div className="ec-user-avatar" style={{ background: getAvatarColor(displayName) }}>
          {getInitials(displayName)}
        </div>
        <span className="ec-user-name">{displayName.split(" ").slice(-1)[0]}</span>
        <span className={`ec-dropdown-arrow ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="ec-user-dropdown">
          <div className="ec-user-dropdown-header">
            <div className="ec-user-avatar-lg" style={{ background: getAvatarColor(displayName) }}>
              {getInitials(displayName)}
            </div>
            <div>
              <p className="ec-user-fullname">{displayName}</p>
              <p className="ec-user-email">{user?.email}</p>
            </div>
          </div>
          <div className="ec-user-dropdown-divider" />
          <button className="ec-user-dropdown-item" onClick={() => { setOpen(false); navigate("/orders"); }}>
            📦 Đơn hàng của tôi
          </button>
          <button className="ec-user-dropdown-item" onClick={() => { setOpen(false); navigate("/cart"); }}>
            🛒 Giỏ hàng
          </button>
          <div className="ec-user-dropdown-divider" />
          <button className="ec-user-dropdown-item ec-user-logout" onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ cartCount, onCartOpen, wishlistCount = 0 }) {
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const notifRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const lastY = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    const check = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", check);
    const interval = setInterval(check, 500);
    return () => { window.removeEventListener("storage", check); clearInterval(interval); };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) setVisible(true);
      else if (currentY < lastY.current) setVisible(true);
      else setVisible(false);
      lastY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    notificationService.getUnreadCount().then(n => setUnreadNotif(n)).catch(() => {});
    notificationService.getAll({ page: 1, pageSize: 10 }).then(d => setNotifs(d?.items ?? [])).catch(() => {});
    notificationService.connect((notif) => {
      setUnreadNotif(prev => prev + 1);
      setNotifs(prev => [notif, ...prev].slice(0, 10));
      // Dispatch event để Orders page tự refresh
      window.dispatchEvent(new CustomEvent("newNotification", { detail: notif }));
    }).catch(() => {});
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => { notificationService.disconnect(); document.removeEventListener("mousedown", handler); };
  }, []);

  const go = (href) => {
    setOpen(false);
    navigate(href);
  };

  const isActive = (href) => location.pathname === href;

  return (
    <nav className={`ec-nav ${visible ? "nav-visible" : "nav-hidden"}`}>
      <div className="ec-nav-inner">
        <span className="ec-logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          INDIAS
        </span>

        <div className="ec-nav-links">
          {NAV_LINKS_LEFT.map(([l, h]) => (
            <a
              key={l}
              href={h}
              className={isActive(h) ? "active" : ""}
              onClick={(e) => { e.preventDefault(); go(h); }}
            >
              {l}
            </a>
          ))}
          {NAV_LINKS_RIGHT.map(([l, h]) => (
            <a
              key={l}
              href={h}
              className={isActive(h) ? "active" : ""}
              onClick={(e) => { e.preventDefault(); go(h); }}
            >
              {l}
            </a>
          ))}
        </div>

        <div className="ec-nav-actions">
          {localStorage.getItem("token") && (
            <div style={{ position: "relative" }} ref={notifRef}>
              <button className="ec-cart-btn" style={{ position: "relative" }} onClick={() => { setNotifOpen(v => !v); setUnreadNotif(0); }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>🔔</span>
                {unreadNotif > 0 && <span className="ec-cart-count">{unreadNotif > 99 ? "99+" : unreadNotif}</span>}
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, background: "#fff", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 1000, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0", fontWeight: 600, fontSize: 14 }}>Thong bao</div>
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {notifs.length === 0 && <div style={{ padding: "24px 16px", textAlign: "center", color: "#999", fontSize: 13 }}>Khong co thong bao</div>}
                    {notifs.map((n) => (
                      <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #f5f5f5", background: n.isRead ? "#fff" : "#f0f7ff", cursor: "pointer" }}
                        onClick={() => { setNotifOpen(false); if (n.type === "Order") navigate("/orders?orderId=" + (n.referenceId ?? "")); }}>
                        <div style={{ fontSize: 13, color: "#111", marginBottom: 4 }}>{n.message ?? n.text}</div>
                        <div style={{ fontSize: 11, color: "#999" }}>{n.createdAt ? new Date(n.createdAt).toLocaleString("vi-VN") : ""}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "10px 16px", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>
                    <button onClick={() => { setNotifOpen(false); navigate("/orders"); }} style={{ background: "none", border: "none", fontSize: 13, color: "#3182ce", cursor: "pointer" }}>Xem tat ca don hang</button>
                  </div>
                </div>
              )}
            </div>
          )}
          <button className="ec-cart-btn" style={{position:"relative"}} onClick={() => navigate("/yeu-thich")}>
            <span style={{fontSize:18, lineHeight:1}}>♡</span>
            {wishlistCount > 0 && <span className="ec-cart-count">{wishlistCount}</span>}
          </button>
          <button className="ec-cart-btn" onClick={onCartOpen}>
            <span className="ec-cart-icon" />
            {cartCount > 0 && <span className="ec-cart-count">{cartCount}</span>}
          </button>

          {isLoggedIn ? (
            <UserMenu onLogout={() => setIsLoggedIn(false)} />
          ) : (
            <button className="ec-login-btn" onClick={() => navigate("/dang-nhap")}>
              Đăng nhập
            </button>
          )}
        </div>

        <button className="ec-burger" onClick={() => setOpen((o) => !o)}>
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`ec-mobile-menu ${open ? "open" : ""}`}>
        {NAV_LINKS_LEFT.map(([l, h]) => (
          <a key={l} href={h} onClick={(e) => { e.preventDefault(); go(h); }}>{l}</a>
        ))}
        {NAV_LINKS_RIGHT.map(([l, h]) => (
          <a key={l} href={h} onClick={(e) => { e.preventDefault(); go(h); }}>{l}</a>
        ))}
        {isLoggedIn ? (
          <>
            <a href="/yeu-thich" onClick={(e) => { e.preventDefault(); go("/yeu-thich"); }}>♡ Yêu thích</a>
            <a href="/orders" onClick={(e) => { e.preventDefault(); go("/orders"); }}>📦 Đơn hàng</a>
            <a href="/cart" onClick={(e) => { e.preventDefault(); go("/cart"); }}>🛒 Giỏ hàng</a>
          </>
        ) : (
          <a href="/dang-nhap" onClick={(e) => { e.preventDefault(); go("/dang-nhap"); }}>Đăng nhập</a>
        )}
      </div>
    </nav>
  );
}