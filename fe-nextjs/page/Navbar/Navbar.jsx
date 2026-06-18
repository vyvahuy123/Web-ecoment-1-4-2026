"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import "./Navbar.css";
import AuthService from "@/services/auth.service";
import { notificationService } from "@/services/notification.service";

const NAV_LINKS_LEFT = [
  ["Trang chủ", "/"],
  ["Giới thiệu", "/gioi-thieu"],
  ["Tin tức", "/tin-tuc"],   
  ["Sản phẩm", "/san-pham"],
];

const NAV_LINKS_RIGHT = [
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
  const router = useRouter();
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
    if (!confirm("Bạn có muốn đăng xuất không?")) return;
    await AuthService.logout();
    localStorage.removeItem("user");
    setOpen(false);
    onLogout?.();
    router.push("/dang-nhap");
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
          <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.05)" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: getAvatarColor(displayName), display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>
              {getInitials(displayName)}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: "#fff", margin: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
            </div>
          </div>
          <div style={{ padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            {[
              { label: "Thông tin cá nhân", path: "/tai-khoan" },
              { label: "Đơn hàng", path: "/orders" },
              { label: "Giỏ hàng", path: "/cart" },
            ].map(item => (
              <button key={item.path}
                onClick={() => { setOpen(false); router.push(item.path); }}
                style={{ width: "100%", padding: "10px 18px", border: "none", background: "none",
                  textAlign: "left", cursor: "pointer", fontSize: 13, color: "#ffffff",
                  display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit",
                  transition: "background 0.15s, padding-left 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.paddingLeft = "22px"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.paddingLeft = "18px"; }}
              >
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.6)", flexShrink: 0 }} />
                {item.label}
              </button>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", padding: "6px 0 4px" }}>
            <button onClick={handleLogout} style={{ width: "100%", padding: "10px 18px", border: "none",
              background: "none", textAlign: "left", cursor: "pointer", fontSize: 13, color: "#ff6b6b",
              display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,100,100,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff6b6b", flexShrink: 0 }} />
              Đăng xuất
            </button>
          </div>
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const lastY = useRef(0);
  useEffect(() => { setIsLoggedIn(!!localStorage.getItem("token")); }, []);
  const router = useRouter();
  const location = usePathname();

  useEffect(() => { setOpen(false); }, [location]);

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
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", handler);
    const connectNotif = () => {
      setTimeout(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        notificationService.getUnreadCount().then(n => setUnreadNotif(n)).catch(() => {});
        notificationService.getAll({ page: 1, pageSize: 10 }).then(d => setNotifs(d?.items ?? [])).catch(() => {});
        notificationService.connect((notif) => {
          setUnreadNotif(prev => prev + 1);
          setNotifs(prev => [notif, ...prev].slice(0, 10));
          window.dispatchEvent(new CustomEvent("newNotification", { detail: notif }));
        }).catch(() => {});
      }, 300);
    };
    const token = localStorage.getItem("token");
    if (token) connectNotif();
    window.addEventListener("user-logged-in", connectNotif);
    return () => {
      notificationService.disconnect();
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("user-logged-in", connectNotif);
    };
  }, []);

  const go = (href) => {
    setOpen(false);
    router.push(href);
  };

  const isActive = (href) => location === href;

  return (
    <nav className={`ec-nav ${visible ? "nav-visible" : "nav-hidden"}`}>
      <div className="ec-nav-inner">
        <span className="ec-logo" style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
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
          {isLoggedIn && (
            <div style={{ position: "relative" }} ref={notifRef}>
              <button className="ec-cart-btn" style={{ position: "relative" }} onClick={() => { setNotifOpen(v => !v); if (unreadNotif > 0) { setUnreadNotif(0); notificationService.markAllRead().catch(() => {}); } }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>🔔</span>
                {unreadNotif > 0 && <span className="ec-cart-count">{unreadNotif > 99 ? "99+" : unreadNotif}</span>}
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, background: "#fff", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 1000, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0", fontWeight: 600, fontSize: 14 }}>Thong bao</div>
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {notifs.length === 0 && <div style={{ padding: "24px 16px", textAlign: "center", color: "#999", fontSize: 13 }}>Khong co thong bao</div>}
                    {notifs.map((n, idx) => (
                      <div key={n.id ?? idx} style={{ padding: "12px 16px", borderBottom: "1px solid #f5f5f5", background: n.isRead ? "#fff" : "#f0f7ff", cursor: "pointer" }}
                        onClick={() => { setNotifOpen(false); if (n.type === "Order") router.push("/orders?orderId=" + (n.referenceId ?? "")); }}>
                        <div style={{ fontSize: 13, color: "#111", marginBottom: 4 }}>{n.message ?? n.text}</div>
                        <div style={{ fontSize: 11, color: "#999" }}>{n.createdAt ? new Date(n.createdAt).toLocaleString("vi-VN") : ""}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "10px 16px", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>
                    <button onClick={() => { setNotifOpen(false); router.push("/orders"); }} style={{ background: "none", border: "none", fontSize: 13, color: "#3182ce", cursor: "pointer" }}>Xem tat ca don hang</button>
                  </div>
                </div>
              )}
            </div>
          )}
          <button className="ec-cart-btn" style={{position:"relative"}} onClick={() => router.push("/yeu-thich")}>
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
            <button className="ec-login-btn" onClick={() => router.push("/dang-nhap")}>
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