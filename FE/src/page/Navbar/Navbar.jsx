import { useState, useEffect, useRef } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import AuthService from "@/services/auth.service";

const NAV_LINKS_LEFT = [
  ["Trang chủ", "/"],
  ["Giới thiệu", "/gioi-thieu"],
  ["Tin tức", "/"],
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

export default function Navbar({ cartCount, onCartOpen }) {
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
          <button className="ec-cart-btn" style={{position:"relative"}} onClick={() => navigate("/yeu-thich")}>
            <span style={{fontSize:18, lineHeight:1}}>♡</span>
            {wishlist.length > 0 && <span className="ec-cart-count">{wishlist.length}</span>}
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