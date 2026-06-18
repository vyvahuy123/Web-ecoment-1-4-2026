import { useState, useEffect, useRef } from "react";
import "./Home.css";

const SLIDES = [
  { tag: "New Collection 2025", title: "Effortless\nElegance", desc: "Discover pieces crafted for the modern wardrobe — timeless silhouettes, refined details.", btn: "Shop Now", href: "#products" },
  { tag: "Limited Edition", title: "Minimal\nLuxury", desc: "Fewer pieces, more meaning. Our curated edit for the discerning few.", btn: "Explore", href: "#products" },
  { tag: "Summer Edit", title: "Light &\nBreezeful", desc: "Linen, cotton, and silk. The fabrics that define the season.", btn: "View Collection", href: "#products" },
];

const CATEGORIES = [
  { name: "Women", count: "124 items", color: "#d4c5b0", icon: "👗" },
  { name: "Men", count: "98 items", color: "#b5bec9", icon: "👔" },
  { name: "Accessories", count: "76 items", color: "#c9b5b5", icon: "👜" },
  { name: "New Arrivals", count: "32 items", color: "#b5c9b8", icon: "✨" },
];

const PRODUCTS = [
  { name: "Oversized Linen Blazer", cat: "Women", price: "1.890.000", oldPrice: null, badge: "new", emoji: "🧥" },
  { name: "Slim Fit Chino Pants", cat: "Men", price: "890.000", oldPrice: "1.200.000", badge: "sale", emoji: "👖" },
  { name: "Silk Slip Dress", cat: "Women", price: "2.350.000", oldPrice: null, badge: "new", emoji: "👗" },
  { name: "Structured Tote Bag", cat: "Accessories", price: "1.450.000", oldPrice: null, badge: null, emoji: "👜" },
  { name: "Merino Wool Turtleneck", cat: "Men", price: "1.190.000", oldPrice: "1.590.000", badge: "sale", emoji: "🧣" },
  { name: "Wide-Leg Trousers", cat: "Women", price: "990.000", oldPrice: null, badge: null, emoji: "👘" },
  { name: "Canvas Sneakers", cat: "Men", price: "750.000", oldPrice: null, badge: "new", emoji: "👟" },
  { name: "Leather Card Holder", cat: "Accessories", price: "350.000", oldPrice: null, badge: null, emoji: "💳" },
];

const TESTIMONIALS = [
  { text: "Chất lượng vải tuyệt vời, đúng như mô tả. Giao hàng nhanh và đóng gói rất cẩn thận.", name: "Nguyễn Linh", role: "Khách hàng thân thiết", stars: 5 },
  { text: "Thiết kế tối giản nhưng rất sang trọng. Tôi đã mua 3 lần rồi và lần nào cũng hài lòng.", name: "Trần Minh", role: "Khách hàng", stars: 5 },
  { text: "Size chuẩn, màu đẹp y hình. Sẽ tiếp tục ủng hộ shop lâu dài.", name: "Phạm Thu Hà", role: "Khách hàng mới", stars: 5 },
];

function useFadeUp(ref) {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("visible", e.isIntersecting)),
      { threshold: 0.1 },
    );
    ref.current?.querySelectorAll(".fade-up").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ref]);
}

function Topbar() {
  return <div className="ec-topbar">CODE BY VYX SDT: 0906645842</div>;
}

function Hero() {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCur((c) => (c + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);
  const bgs = ["#f0ece6", "#e8ecf0", "#f0e8e8"];
  const emojis = ["🧥", "👗", "👔"];
  return (
    <section id="home" className="ec-hero">
      {SLIDES.map((s, i) => (
        <div key={i} className={`ec-slide ${i === cur ? "active" : ""}`} style={{ background: bgs[i] }}>
          <div className="ec-slide-content">
            <p className="tag">{s.tag}</p>
            <h1>{s.title.split("\n").map((line, j) => (<span key={j}>{line}<br /></span>))}</h1>
            <p>{s.desc}</p>
            <a href={s.href} className="ec-btn ec-btn-dark"
              onClick={(e) => { e.preventDefault(); document.querySelector(s.href)?.scrollIntoView({ behavior: "smooth" }); }}>
              {s.btn}
            </a>
          </div>
          <div style={{ position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)", fontSize: 180, opacity: 0.15, pointerEvents: "none", userSelect: "none" }}>
            {emojis[i]}
          </div>
        </div>
      ))}
      <div className="ec-hero-dots">
        {SLIDES.map((_, i) => (
          <button key={i} className={`ec-dot ${i === cur ? "active" : ""}`} onClick={() => setCur(i)} />
        ))}
      </div>
      <div className="ec-hero-counter">0{cur + 1} / 0{SLIDES.length}</div>
    </section>
  );
}

function Categories() {
  const ref = useRef(null);
  useFadeUp(ref);
  return (
    <section id="categories" className="ec-section" ref={ref}>
      <div className="container">
        <div className="ec-section-head fade-up">
          <h2>Danh mục</h2>
          <a href="#">Xem tất cả</a>
        </div>
        <div className="ec-cats">
          {CATEGORIES.map((c, i) => (
            <div className="ec-cat fade-up" key={c.name} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="ec-cat-bg" style={{ background: c.color }}>
                <span style={{ fontSize: 72, opacity: 0.6 }}>{c.icon}</span>
              </div>
              <div className="ec-cat-label">
                <h3>{c.name}</h3>
                <span>{c.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Products({ onAddCart }) {
  const ref = useRef(null);
  useFadeUp(ref);
  return (
    <section id="products" className="ec-section bg-gray" ref={ref}>
      <div className="container">
        <div className="ec-section-head fade-up">
          <h2>Sản phẩm nổi bật</h2>
          <a href="#">Xem tất cả</a>
        </div>
        <div className="ec-products">
          {PRODUCTS.map((p, i) => (
            <div className="ec-product-card fade-up" key={p.name} style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="ec-product-img">
                <div className="ec-product-img-inner">{p.emoji}</div>
                {p.badge && (
                  <span className={`ec-product-badge badge-${p.badge}`}>
                    {p.badge === "new" ? "Mới" : "Sale"}
                  </span>
                )}
                <div className="ec-product-actions">
                  <button className="ec-add-cart" onClick={() => onAddCart(p)}>Thêm vào giỏ</button>
                  <button className="ec-wishlist">♡</button>
                </div>
              </div>
              <div className="ec-product-info">
                <p className="cat">{p.cat}</p>
                <h3>{p.name}</h3>
                <div className="ec-product-price">
                  <span className="ec-price">{p.price}₫</span>
                  {p.oldPrice && <span className="ec-price-old">{p.oldPrice}₫</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Banner() {
  const ref = useRef(null);
  useFadeUp(ref);
  return (
    <section className="ec-banner" ref={ref}>
      <div className="ec-banner-inner">
        <div>
          <h2 className="fade-up">Bộ sưu tập<br />Thu Đông 2025</h2>
          <p className="fade-up">Những thiết kế lấy cảm hứng từ kiến trúc tối giản Nhật Bản — nơi hình thức và chức năng hòa làm một. Mỗi đường may là một tuyên ngôn.</p>
          <a href="#products" className="ec-btn ec-btn-outline fade-up"
            onClick={(e) => { e.preventDefault(); document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" }); }}>
            Khám phá ngay
          </a>
        </div>
        <div className="ec-banner-visual fade-up">🍂</div>
      </div>
    </section>
  );
}

function Testimonials() {
  const ref = useRef(null);
  useFadeUp(ref);
  const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <section className="ec-section" ref={ref}>
      <div className="container">
        <div className="ec-section-head fade-up">
          <h2>Khách hàng nói gì</h2>
        </div>
        <div className="ec-testimonials">
          {TESTIMONIALS.map((t, i) => (
            <div className="ec-testimonial fade-up" key={t.name} style={{ transitionDelay: `${i * 0.15}s` }}>
              <div className="ec-stars">{"★".repeat(t.stars)}</div>
              <p>"{t.text}"</p>
              <div className="ec-reviewer">
                <div className="av">{initials(t.name)}</div>
                <div>
                  <h5>{t.name}</h5>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (email) { setDone(true); setEmail(""); setTimeout(() => setDone(false), 4000); }
  };
  return (
    <section className="ec-newsletter">
      <div className="container">
        <h2>Đăng ký nhận ưu đãi</h2>
        <p>Nhận thông tin bộ sưu tập mới và ưu đãi độc quyền dành riêng cho thành viên.</p>
        {done ? (
          <p style={{ color: "#0a0a0a", fontWeight: 500 }}>✓ Cảm ơn bạn đã đăng ký!</p>
        ) : (
          <form className="ec-newsletter-form" onSubmit={submit}>
            <input type="email" placeholder="Địa chỉ email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit">Đăng ký</button>
          </form>
        )}
        <p className="ec-newsletter-note">Bạn có thể hủy đăng ký bất cứ lúc nào.</p>
      </div>
    </section>
  );
}

function CartDrawer({ open, onClose, items, onUpdateQty, onRemove }) {
  const total = items.reduce((sum, i) => sum + parseInt(i.price.replace(/\./g, "")) * i.qty, 0);
  return (
    <>
      <div className={`ec-cart-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`ec-cart-drawer ${open ? "open" : ""}`}>
        <div className="ec-cart-header">
          <h3>Giỏ hàng ({items.length})</h3>
          <button className="ec-cart-close" onClick={onClose}>✕</button>
        </div>
        <div className="ec-cart-items">
          {items.length === 0 ? (
            <p style={{ color: "#b0b0b0", fontSize: 14, textAlign: "center", marginTop: 40 }}>Giỏ hàng trống</p>
          ) : (
            items.map((item) => (
              <div className="ec-cart-item" key={item.name}>
                <div className="ec-cart-item-img">{item.emoji}</div>
                <div className="ec-cart-item-info">
                  <h4>{item.name}</h4>
                  <p>{item.cat}</p>
                  <div className="ec-cart-item-footer">
                    <div className="ec-qty">
                      <button onClick={() => onUpdateQty(item.name, -1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => onUpdateQty(item.name, 1)}>+</button>
                    </div>
                    <button className="ec-remove" onClick={() => onRemove(item.name)}>Xóa</button>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500, marginTop: 6 }}>{item.price}₫</p>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="ec-cart-footer">
            <div className="ec-cart-total">
              <span>Tổng cộng</span>
              <span>{total.toLocaleString("vi-VN")}₫</span>
            </div>
            <button className="ec-checkout-btn">Tiến hành thanh toán</button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Home({ cartOpen, setCartOpen, cartItems, setCartItems }) {
  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.name === product.name);
      if (exists) return prev.map((i) => i.name === product.name ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (name, delta) => {
    setCartItems((prev) =>
      prev.map((i) => i.name === name ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  };

  const removeItem = (name) => setCartItems((prev) => prev.filter((i) => i.name !== name));

  return (
    <>
      <Topbar />
      <div style={{ paddingTop: "68px" }}>
        <Hero />
        <Categories />
        <Products onAddCart={addToCart} />
      </div>
      <Banner />
      <Testimonials />
      <Newsletter />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQty={updateQty}
        onRemove={removeItem}
      />
    </>
  );
}
