import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const PRODUCTS = [
  { name: "Oversized Linen Blazer", cat: "Women", price: "1.890.000", emoji: "🧥" },
  { name: "Slim Fit Chino Pants", cat: "Men", price: "890.000", emoji: "👖" },
  { name: "Silk Slip Dress", cat: "Women", price: "2.350.000", emoji: "👗" },
  { name: "Structured Tote Bag", cat: "Accessories", price: "1.450.000", emoji: "👜" },
  { name: "Merino Wool Turtleneck", cat: "Men", price: "1.190.000", emoji: "🧣" },
  { name: "Wide-Leg Trousers", cat: "Women", price: "990.000", emoji: "👘" },
  { name: "Canvas Sneakers", cat: "Men", price: "750.000", emoji: "👟" },
  { name: "Leather Card Holder", cat: "Accessories", price: "350.000", emoji: "💳" },
];

const PRODUCT_DROPDOWN = [
  { label: "Quần áo", href: "#categories" },
  { label: "Phụ kiện", href: "#categories" },
  { label: "Giày dép", href: "#categories" },
];

const NAV_LINKS_LEFT = [
  ["Trang chủ", "#products"],
  ["Giới thiệu", "#categories"],
  ["Tin tức", "#categories"],
];

const NAV_LINKS_RIGHT = [
  ["Sale", "#products"],
  ["Liên hệ", "/lien-he"],
];

export default function Navbar({ cartCount, onCartOpen }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [visible, setVisible] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const lastY = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) {
        setVisible(true);
      } else if (currentY < lastY.current) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      lastY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scroll = (href) => {
    setOpen(false);
    setDropdownOpen(false);
    if (href === "/lien-he") {
      navigate("/lien-he");
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.trim() === "") { setResults([]); return; }
    const filtered = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(val.toLowerCase()) ||
        p.cat.toLowerCase().includes(val.toLowerCase()),
    );
    setResults(filtered);
  };

  const clearSearch = () => { setSearch(""); setResults([]); };

  return (
    <nav className={`ec-nav ${visible ? "nav-visible" : "nav-hidden"}`}>
      <div className="ec-nav-inner">
        <span className="ec-logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          INDIAS
        </span>

        <div className="ec-nav-links">
          {NAV_LINKS_LEFT.map(([l, h]) => (
            <a key={l} href={h} onClick={(e) => { e.preventDefault(); scroll(h); }}>
              {l}
            </a>
          ))}

          {/* Dropdown hover */}
          <div
            className="ec-dropdown-wrap"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="ec-dropdown-trigger">
              Sản phẩm
              <span className={`ec-dropdown-arrow ${dropdownOpen ? "open" : ""}`}>▾</span>
            </button>
            <div className={`ec-dropdown-menu ${dropdownOpen ? "open" : ""}`}>
              {PRODUCT_DROPDOWN.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="ec-dropdown-item"
                  onClick={(e) => { e.preventDefault(); scroll(item.href); }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {NAV_LINKS_RIGHT.map(([l, h]) => (
            <a key={l} href={h} onClick={(e) => { e.preventDefault(); scroll(h); }}>
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
            {search && (
              <button className="ec-search-clear" onClick={clearSearch}>✕</button>
            )}
            {results.length > 0 && (
              <div className="ec-search-dropdown">
                {results.map((p) => (
                  <div key={p.name} className="ec-search-item" onClick={() => {
                    clearSearch();
                    navigate("/");
                    setTimeout(() => {
                      document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}>
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
        </div>

        <button className="ec-burger" onClick={() => setOpen((o) => !o)}>
          <span /><span /><span />
        </button>
      </div>

      <div className={`ec-mobile-menu ${open ? "open" : ""}`}>
        {NAV_LINKS_LEFT.map(([l, h]) => (
          <a key={l} href={h} onClick={(e) => { e.preventDefault(); scroll(h); }}>
            {l}
          </a>
        ))}
        <div className="ec-mobile-dropdown">
          <span className="ec-mobile-dropdown-title">Sản phẩm ▾</span>
          {PRODUCT_DROPDOWN.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="ec-mobile-dropdown-item"
              onClick={(e) => { e.preventDefault(); scroll(item.href); }}
            >
              {item.label}
            </a>
          ))}
        </div>
        {NAV_LINKS_RIGHT.map(([l, h]) => (
          <a key={l} href={h} onClick={(e) => { e.preventDefault(); scroll(h); }}>
            {l}
          </a>
        ))}
      </div>
    </nav>
  );
}