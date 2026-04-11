import { useState, useEffect, useRef } from "react";
import "./Products.css";

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "accessories", label: "Phụ kiện" },
  { id: "clothing", label: "Quần áo" },
  { id: "shoes", label: "Giày dép" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Mặc định" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "new", label: "Mới nhất" },
];

const ALL_PRODUCTS = [
  // Phụ kiện
  { id: 1, name: "Túi Tote Cấu Trúc", cat: "accessories", price: 1450000, oldPrice: null, badge: null, emoji: "👜", desc: "Da bò thật, khóa vàng 24k" },
  { id: 2, name: "Ví Da Card Holder", cat: "accessories", price: 350000, oldPrice: null, badge: null, emoji: "💳", desc: "Da bê nhập khẩu, 6 ngăn" },
  { id: 3, name: "Thắt Lưng Da Bò", cat: "accessories", price: 520000, oldPrice: 690000, badge: "sale", emoji: "🪡", desc: "Full-grain leather, khóa matte" },
  { id: 4, name: "Mũ Bucket Linen", cat: "accessories", price: 280000, oldPrice: null, badge: "new", emoji: "🎩", desc: "Linen cao cấp, UV50+" },
  { id: 5, name: "Kính Mát Acetate", cat: "accessories", price: 890000, oldPrice: 1100000, badge: "sale", emoji: "🕶️", desc: "Gọng acetate Ý, tròng UV400" },
  { id: 6, name: "Khăn Lụa Vuông", cat: "accessories", price: 420000, oldPrice: null, badge: "new", emoji: "🧣", desc: "100% lụa Mori, 90×90cm" },

  // Quần áo
  { id: 7, name: "Áo Blazer Linen Oversized", cat: "clothing", price: 1890000, oldPrice: null, badge: "new", emoji: "🧥", desc: "Linen Bỉ, dáng rộng unisex" },
  { id: 8, name: "Váy Lụa Slip Dress", cat: "clothing", price: 2350000, oldPrice: null, badge: "new", emoji: "👗", desc: "100% silk, cổ chữ V tinh tế" },
  { id: 9, name: "Quần Chino Slim Fit", cat: "clothing", price: 890000, oldPrice: 1200000, badge: "sale", emoji: "👖", desc: "Cotton twill co giãn 4 chiều" },
  { id: 10, name: "Áo Turtleneck Merino", cat: "clothing", price: 1190000, oldPrice: 1590000, badge: "sale", emoji: "👕", desc: "Merino wool 100%, giữ ấm tốt" },
  { id: 11, name: "Quần Wide-Leg Vải Dệt", cat: "clothing", price: 990000, oldPrice: null, badge: null, emoji: "👘", desc: "Vải dệt thủ công, ống rộng" },
  { id: 12, name: "Áo Sơ Mi Poplin Trắng", cat: "clothing", price: 750000, oldPrice: null, badge: "new", emoji: "👔", desc: "Cotton poplin Ai Cập, slim fit" },
  { id: 13, name: "Áo Khoác Dạ Wool", cat: "clothing", price: 3200000, oldPrice: null, badge: null, emoji: "🧤", desc: "Wool-cashmere blend, dáng dài" },
  { id: 14, name: "Chân Váy Midi Linen", cat: "clothing", price: 820000, oldPrice: 1050000, badge: "sale", emoji: "🩱", desc: "Linen mềm, cạp chun thoải mái" },

  // Giày dép
  { id: 15, name: "Sneaker Canvas Trắng", cat: "shoes", price: 750000, oldPrice: null, badge: "new", emoji: "👟", desc: "Canvas hữu cơ, đế cao su tự nhiên" },
  { id: 16, name: "Giày Oxford Da Bò", cat: "shoes", price: 1650000, oldPrice: null, badge: null, emoji: "👞", desc: "Full-grain leather, đế Goodyear" },
  { id: 17, name: "Dép Leather Mule", cat: "shoes", price: 680000, oldPrice: 890000, badge: "sale", emoji: "🩴", desc: "Da mềm, đế EVA siêu nhẹ" },
  { id: 18, name: "Boot Chelsea Da Lộn", cat: "shoes", price: 2100000, oldPrice: null, badge: "new", emoji: "🥾", desc: "Suede Ý, đế chunky thời thượng" },
  { id: 19, name: "Sandal Đế Phẳng", cat: "shoes", price: 490000, oldPrice: null, badge: null, emoji: "👡", desc: "Da thật, quai chỉnh được" },
  { id: 20, name: "Loafer Penny Leather", cat: "shoes", price: 1380000, oldPrice: 1700000, badge: "sale", emoji: "🥿", desc: "Horsebit chi tiết, da lam óng" },
];

function useFadeUp(ref) {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("visible", e.isIntersecting)),
      { threshold: 0.08 }
    );
    ref.current?.querySelectorAll(".fade-up").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ref]);
}

function ProductCard({ p, onAddCart }) {
  return (
    <div className="pd-card fade-up">
      <div className="pd-card-img">
        <div className="pd-card-emoji">{p.emoji}</div>
        {p.badge && (
          <span className={`pd-badge badge-${p.badge}`}>
            {p.badge === "new" ? "Mới" : "Sale"}
          </span>
        )}
        <div className="pd-card-actions">
          <button className="pd-btn-cart" onClick={() => onAddCart(p)}>Thêm vào giỏ</button>
          <button className="pd-btn-wish">♡</button>
        </div>
      </div>
      <div className="pd-card-info">
        <p className="pd-card-desc">{p.desc}</p>
        <h3 className="pd-card-name">{p.name}</h3>
        <div className="pd-card-price">
          <span className="pd-price">{p.price.toLocaleString("vi-VN")}₫</span>
          {p.oldPrice && (
            <span className="pd-price-old">{p.oldPrice.toLocaleString("vi-VN")}₫</span>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryHero({ activeCategory }) {
  const heroData = {
    all: { title: "Toàn bộ sản phẩm", desc: "Khám phá trọn bộ sưu tập — từ trang phục đến phụ kiện và giày dép.", bg: "#f0ece6", emoji: "✦" },
    accessories: { title: "Phụ kiện", desc: "Những chi tiết nhỏ tạo nên sự khác biệt lớn. Chọn lọc từ các chất liệu cao cấp nhất.", bg: "#e8ecf0", emoji: "👜" },
    clothing: { title: "Quần áo", desc: "Tối giản trong thiết kế, tinh tế trong từng đường may. Thời trang vượt thời gian.", bg: "#f0e8e8", emoji: "👗" },
    shoes: { title: "Giày dép", desc: "Từ sneaker cơ bản đến boot da cao cấp — mỗi bước đi là một tuyên ngôn phong cách.", bg: "#e8f0e8", emoji: "👟" },
  };
  const h = heroData[activeCategory] || heroData.all;
  return (
    <div className="pd-hero" style={{ background: h.bg }}>
      <div className="pd-hero-inner">
        <h1>{h.title}</h1>
        <p>{h.desc}</p>
      </div>
      <div className="pd-hero-deco">{h.emoji}</div>
    </div>
  );
}

export default function Products({ onAddCart }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  useFadeUp(ref);

  const filtered = ALL_PRODUCTS
    .filter((p) => {
      const matchCat = activeCategory === "all" || p.cat === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "new") return (b.badge === "new" ? 1 : 0) - (a.badge === "new" ? 1 : 0);
      return a.id - b.id;
    });

  return (
     <div className="pd-page" ref={ref} style={{ paddingTop: "68px" }}>
      <CategoryHero activeCategory={activeCategory} />

      <div className="pd-main">
        <div className="pd-controls">
          <div className="pd-tabs">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`pd-tab ${activeCategory === c.id ? "active" : ""}`}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="pd-toolbar">
            <div className="pd-search-wrap">
              <span className="pd-search-icon">⌕</span>
              <input
                className="pd-search"
                type="text"
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="pd-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="pd-count">{filtered.length} sản phẩm</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="pd-empty">
            <p>Không tìm thấy sản phẩm nào.</p>
          </div>
        ) : (
          <div className="pd-grid">
            {filtered.map((p, i) => (
              <div key={p.id} style={{ transitionDelay: `${(i % 8) * 0.07}s` }}>
                <ProductCard p={p} onAddCart={onAddCart} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}