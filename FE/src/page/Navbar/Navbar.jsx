import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import AuthService from "@/services/auth.service";
import CategoryService from "@/services/category.service";

const PRODUCTS_SEARCH = [
  { name: "Oversized Linen Blazer", cat: "Women", price: "1.890.000", emoji: "🧥" },
  { name: "Slim Fit Chino Pants", cat: "Men", price: "890.000", emoji: "👖" },
  { name: "Silk Slip Dress", cat: "Women", price: "2.350.000", emoji: "👗" },
  { name: "Structured Tote Bag", cat: "Accessories", price: "1.450.000", emoji: "👜" },
  { name: "Merino Wool Turtleneck", cat: "Men", price: "1.190.000", emoji: "🧣" },
  { name: "Wide-Leg Trousers", cat: "Women", price: "990.000", emoji: "👘" },
  { name: "Canvas Sneakers", cat: "Men", price: "750.000", emoji: "👟" },
  { name: "Leather Card Holder", cat: "Accessories", price: "350.000", emoji: "💳" },
];

const NAV_LINKS_LEFT = [
  ["Trang chủ", "/"],
  ["Giới thiệu", "/gioi-thieu"],
  ["Tin tức", "/"],
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
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [visible, setVisible] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [categories, setCategories] = useState([]);
  const lastY = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch categories từ API
  useEffect(() => {
    CategoryService.getAll()
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Đóng mobile menu khi đổi route
  useEffect(() => { setOpen(false); setDropdownOpen(false); }, [location.pathname]);

  // Theo dõi login state
  useEffect(() => {
    const check = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", check);
    const interval = setInterval(check, 500);
    return () => { window.removeEventListener("storage", check); clearInterval(interval); };
  }, []);

  // Hide/show navbar on scroll
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
    setDropdownOpen(false);
    navigate(href);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val.trim()) { setResults([]); return; }
    setResults(PRODUCTS_SEARCH.filter(
      (p) => p.name.toLowerCase().includes(val.toLowerCase()) || p.cat.toLowerCase().includes(val.toLowerCase())
    ));
  };

  const clearSearch = () => { setSearch(""); setResults([]); };

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

          {/* Dropdown Danh mục — load từ API */}
          <div
            className="ec-dropdown-wrap"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className={`ec-dropdown-trigger ${isActive("/san-pham") ? "active" : ""}`}>
              Danh mục
              <span className={`ec-dropdown-arrow ${dropdownOpen ? "open" : ""}`}>▾</span>
            </button>
            <div className={`ec-dropdown-menu ${dropdownOpen ? "open" : ""}`}>
              {/* Mục "Tất cả" cố định */}
              <a
                href="/san-pham"
                className="ec-dropdown-item"
                onClick={(e) => { e.preventDefault(); go("/san-pham"); }}
              >
                Tất cả sản phẩm
              </a>

              {categories.length === 0 ? (
                <p className="ec-dropdown-empty">Đang tải...</p>
              ) : (
                categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/san-pham?category=${cat.id}`}
                    className="ec-dropdown-item"
                    onClick={(e) => { e.preventDefault(); go(`/san-pham?category=${cat.id}`); }}
                  >
                    {cat.name}
                  </a>
                ))
              )}
            </div>
          </div>

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
          <div className="ec-search-wrap">
            <input
              className="ec-search-input"
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={handleSearch}
            />
            {search && <button className="ec-search-clear" onClick={clearSearch}>✕</button>}
            {results.length > 0 && (
              <div className="ec-search-dropdown">
                {results.map((p) => (
                  <div key={p.name} className="ec-search-item"
                    onClick={() => { clearSearch(); navigate("/san-pham"); }}
                  >
                    <span className="ec-search-item-emoji">{p.emoji}</span>
                    <div>
                      <p className="ec-search-item-name">{p.name}</p>
                      <p className="ec-search-item-cat">{p.cat} — {p.price}₫</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {search && results.length === 0 && (
              <div className="ec-search-dropdown">
                <p className="ec-search-empty">Không tìm thấy sản phẩm</p>
              </div>
            )}
          </div>

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
        <div className="ec-mobile-dropdown">
          <span className="ec-mobile-dropdown-title">Danh mục ▾</span>
          <a href="/san-pham" className="ec-mobile-dropdown-item"
            onClick={(e) => { e.preventDefault(); go("/san-pham"); }}>
            Tất cả sản phẩm
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/san-pham?category=${cat.id}`}
              className="ec-mobile-dropdown-item"
              onClick={(e) => { e.preventDefault(); go(`/san-pham?category=${cat.id}`); }}
            >
              {cat.name}
            </a>
          ))}
        </div>
        {NAV_LINKS_RIGHT.map(([l, h]) => (
          <a key={l} href={h} onClick={(e) => { e.preventDefault(); go(h); }}>{l}</a>
        ))}
        {isLoggedIn ? (
          <>
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