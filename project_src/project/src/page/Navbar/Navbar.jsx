import { useState } from "react";
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

const NAV_LINKS = [
  ["Mới về", "#products"],
  ["Phụ nữ", "#categories"],
  ["Đàn ông", "#categories"],
  ["Phụ kiện", "#categories"],
  ["Sale", "#products"],
  ["Liên hệ", "/lien-he"],
];

export default function Navbar({ cartCount, onCartOpen }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const scroll = (href) => {
    setOpen(false);
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
    <nav className="ec-nav">
      <div className="ec-nav-inner">
        <span className="ec-logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          INDIAS
        </span>
        <div className="ec-nav-links">
          {NAV_LINKS.map(([l, h]) => (
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
        {NAV_LINKS.map(([l, h]) => (
          <a key={l} href={h} onClick={(e) => { e.preventDefault(); scroll(h); }}>
            {l}
          </a>
        ))}
      </div>
    </nav>
  );
}
