"use client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import "./Home.css";
import ProductService from "@/services/product.service";

const SLIDES_FALLBACK = [
  {
    tag: "New Collection 2025",
    title: "Effortless\nElegance",
    desc: "Discover pieces crafted for the modern wardrobe — timeless silhouettes, refined details.",
    btn: "Shop Now",
    href: "#products",
    backgroundColor: "#f0ece6",
    emoji: "🧥",
  },
  {
    tag: "Limited Edition",
    title: "Minimal\nLuxury",
    desc: "Fewer pieces, more meaning. Our curated edit for the discerning few.",
    btn: "Explore",
    href: "#products",
    backgroundColor: "#e8ecf0",
    emoji: "👗",
  },
  {
    tag: "Summer Edit",
    title: "Light &\nBreezeful",
    desc: "Linen, cotton, and silk. The fabrics that define the season.",
    btn: "View Collection",
    href: "#products",
    backgroundColor: "#f0e8e8",
    emoji: "👔",
  },
];

const CATEGORIES = [
  { name: "Quần", color: "#d4c5b0", categoryId: "e9646c0d-23bc-4d0c-90c7-0d67ccb4de39" },
  { name: "Túi xách", color: "#b5bec9", categoryId: "8c6609ec-440e-402b-b64e-1b06ec2dd143" },
  { name: "Phụ kiện", color: "#c9b5b5", categoryId: "34a3b50e-1b6a-4432-a4b7-87225b5e7072" },
  { name: "Áo", color: "#b5c9b8", categoryId: "7814ab9d-4b1d-4e69-9c61-f112436ee19b" },
];

const TESTIMONIALS = [
  {
    text: "Chất lượng vải tuyệt vời, đúng như mô tả. Giao hàng nhanh và đóng gói rất cẩn thận.",
    name: "Nguyễn Linh",
    role: "Khách hàng thân thiết",
    stars: 5,
  },
  {
    text: "Thiết kế tối giản nhưng rất sang trọng. Tôi đã mua 3 lần rồi và lần nào cũng hài lòng.",
    name: "Trần Minh",
    role: "Khách hàng",
    stars: 5,
  },
  {
    text: "Size chuẩn, màu đẹp y hình. Sẽ tiếp tục ủng hộ shop lâu dài.",
    name: "Phạm Thu Hà",
    role: "Khách hàng mới",
    stars: 5,
  },
];

function useCategoryImages() {
  const [catImages, setCatImages] = useState({});
  useEffect(() => {
    CATEGORIES.forEach(async (cat) => {
      try {
        const data = await ProductService.getAll({ categoryId: cat.categoryId, pageSize: 10 });
        const imgs = (data?.items || []).map(p => p.imageUrl).filter(Boolean);
        if (imgs.length > 0) setCatImages(prev => ({ ...prev, [cat.categoryId]: imgs }));
      } catch(e) {}
    });
  }, []);
  return catImages;
}

function useFadeUp(ref, deps = []) {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) =>
          e.target.classList.toggle("visible", e.isIntersecting),
        ),
      { threshold: 0.1 },
    );
    ref.current?.querySelectorAll(".fade-up").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ref, ...deps]);
}

function Topbar() {
  return <div className="ec-topbar">CODE BY VYX SDT: 0906645842</div>;
}


function Hero() {
  const router = useRouter();
  const [slides, setSlides] = useState(SLIDES_FALLBACK);
  const [cur, setCur] = useState(0);
  

  useEffect(() => {
    fetch("http://localhost:5000/api/banners")
      .then((r) => r.json())
      .then((data) => {
        const heroes = (data || []).filter(
          (b) => (b.type === "hero" || b.type === "") && b.isActive,
        );
        if (heroes.length > 0) setSlides(heroes);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCur((c) => (c + 1) % slides.length), 3000);
    return () => clearInterval(t);
  }, [slides.length]);

  const getTitle = (s) => (s.title ?? s.Title ?? "").replace(/\\n/g, "\n");
  const getTag = (s) => s.tag ?? s.Tag ?? "";
  const getDesc = (s) => s.description ?? s.desc ?? "";
  const getBtn = (s) => s.buttonText ?? s.btn ?? "Xem ngay";
  const getHref = (s) => s.buttonHref ?? s.href ?? "#products";
  const getBg = (s) => s.backgroundColor ?? "#f0ece6";
  const getImg = (s) => s.imageUrl ?? null;
  const getEmoji = (s, i) => s.emoji ?? ["🧥", "👗", "👔"][i % 3];

  return (
    <section id="home" className="ec-hero">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`ec-slide ${i === cur ? "active" : ""}`}
          style={{
            background: getImg(s)
              ? `url(${getImg(s)}) center/cover no-repeat`
              : getBg(s),
          }}
        >
          <div className="ec-slide-content">
            <p className="tag">{getTag(s)}</p>
            <h1>
              {getTitle(s)
                .split("\n")
                .map((line, j) => (
                  <span key={j}>
                    {line}
                    <br />
                  </span>
                ))}
            </h1>
            <p>{getDesc(s)}</p>
            <a
              href={getHref(s)}
              className="ec-btn ec-btn-dark"
              onClick={(e) => {
                e.preventDefault();
                const href = getHref(s);
                if (href.startsWith("#")) {
                  document
                    .querySelector(href)
                    ?.scrollIntoView({ behavior: "smooth" });
                } else {
                  router.push(href);
                }
              }}
            >
              {getBtn(s)}
            </a>
          </div>
          {!getImg(s) && (
            <div
              style={{
                position: "absolute",
                right: "10%",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 180,
                opacity: 0.15,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {getEmoji(s, i)}
            </div>
          )}
        </div>
      ))}
      <div className="ec-hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`ec-dot ${i === cur ? "active" : ""}`}
            onClick={() => setCur(i)}
          />
        ))}
      </div>
      <div className="ec-hero-counter">
        0{cur + 1} / 0{slides.length}
      </div>
    </section>
  );
}

function Categories() {
  const ref = useRef(null);
  const router = useRouter();
  const catImages = useCategoryImages();
  const [slideIdx, setSlideIdx] = useState({});
  useFadeUp(ref);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIdx(prev => {
        const next = { ...prev };
        CATEGORIES.forEach(cat => {
          const imgs = catImages[cat.categoryId];
          if (imgs && imgs.length > 1) {
            next[cat.categoryId] = ((prev[cat.categoryId] || 0) + 1) % imgs.length;
          }
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [catImages]);

  return (
    <section id="categories" className="ec-section" ref={ref}>
      <div className="container">
        <div className="ec-section-head fade-up">
          <h2>Danh mục</h2>
          <a href="/san-pham" onClick={(e) => { e.preventDefault(); router.push("/san-pham"); }}>Xem tat ca</a>
        </div>
        <div className="ec-cats">
          {CATEGORIES.map((c, i) => {
            const imgs = catImages[c.categoryId] || [];
            const idx = slideIdx[c.categoryId] || 0;
            const currentImg = imgs[idx];
            return (
              <div className="ec-cat fade-up" key={c.name} style={{ cursor: "pointer", transitionDelay: `${i * 0.1}s` }} onClick={() => router.push(`/san-pham?category=${c.categoryId}`)}>
                <div className="ec-cat-bg" style={{ background: c.color, overflow: "hidden", position: "relative" }}>
                  {imgs.length > 0 ? imgs.slice(0, 5).map((img, imgI) => (
                    <img
                      key={imgI}
                      src={img}
                      alt={c.name}
                      style={{
                        width: "100%", height: "100%", objectFit: "cover",
                        position: "absolute", inset: 0,
                        opacity: imgI === (slideIdx[c.categoryId] || 0) ? 1 : 0,
                        transition: "opacity 0.8s ease-in-out",
                      }}
                    />
                  )) : (
                    <div style={{ width: "100%", height: "100%", background: c.color }} />
                  )}
                </div>
                <div className="ec-cat-label">
                  <h3>{c.name}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductSkeleton() {
  return (
    <div className="ec-product-card">
      <div
        className="ec-product-img"
        style={{
          background: "#f0f0f0",
          height: 260,
          animation: "shimmer 1.2s infinite",
        }}
      />
      <div className="ec-product-info">
        <div
          style={{
            height: 12,
            background: "#f0f0f0",
            borderRadius: 4,
            marginBottom: 8,
            width: "40%",
            animation: "shimmer 1.2s infinite",
          }}
        />
        <div
          style={{
            height: 16,
            background: "#f0f0f0",
            borderRadius: 4,
            marginBottom: 8,
            animation: "shimmer 1.2s infinite",
          }}
        />
        <div
          style={{
            height: 14,
            background: "#f0f0f0",
            borderRadius: 4,
            width: "60%",
            animation: "shimmer 1.2s infinite",
          }}
        />
      </div>
    </div>
  );
}

function Products({ onAddCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  

  useFadeUp(ref, [products]);

  useEffect(() => {
    ProductService.getTopSelling(8)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="products" className="ec-section bg-gray" ref={ref}>
      <div className="container">
        <div className="ec-section-head fade-up">
          <h2>Sản phẩm bán chạy</h2>
          <a
            href="/san-pham"
            onClick={(e) => {
              e.preventDefault();
              router.push("/san-pham");
            }}
          >
            Xem tất cả
          </a>
        </div>
        <div className="ec-products">
          {loading
            ? Array.from({ length: 8 }, (_, i) => <ProductSkeleton key={i} />)
            : products.map((p, i) => (
                <div
                  className="ec-product-card fade-up"
                  key={p.id}
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  <div className="ec-product-img">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="ec-product-img-inner"
                      style={{ display: p.imageUrl ? "none" : "flex" }}
                    >
                      🛍️
                    </div>
                    {p.totalSold > 0 && (
                      <span className="ec-product-badge badge-hot">
                        🔥 {p.totalSold} đã bán
                      </span>
                    )}
                    <div className="ec-product-actions">
                      {p.stock > 0 ? (
                        <button
                          className="ec-add-cart"
                          onClick={() => onAddCart?.(p)}
                        >
                          Thêm vào giỏ
                        </button>
                      ) : (
                        <button
                          className="ec-add-cart"
                          disabled
                          style={{
                            background: "#ccc",
                            cursor: "not-allowed",
                            color: "#888",
                            opacity: 0.7,
                          }}
                        >
                          Hết hàng
                        </button>
                      )}
                      <button className="ec-wishlist">♡</button>
                  {p.salePrice && (
                    <div style={{ position: "absolute", top: 10, left: 10, background: "#e53935", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, zIndex: 2 }}>
                      -{Math.round((1 - p.salePrice / p.price) * 100)}%
                    </div>
                  )}
                    </div>
                  </div>
                  <div className="ec-product-info">
                    <p className="cat">
                      {p.totalSold > 0 ? `Đã bán ${p.totalSold}` : "Mới"}
                    </p>
                    <h3>{p.name}</h3>
                    <div className="ec-product-price">
                      {p.salePrice ? (
                        <>
                          <span className="ec-price" style={{ color: "red", fontWeight: "bold" }}>
                            {Number(p.salePrice).toLocaleString("vi-VN")}₫
                          </span>
                          <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.85em", marginLeft: 6 }}>
                            {Number(p.price).toLocaleString("vi-VN")}₫
                          </span>
                        </>
                      ) : (
                        <span className="ec-price">{Number(p.price).toLocaleString("vi-VN")}₫</span>
                      )}


                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

function CollectionCountdown({ endDate }) {
  const calc = () => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return { d:0, h:0, m:0, s:0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[{v:t.d,l:"Ngày"},{v:t.h,l:"Giờ"},{v:t.m,l:"Phút"},{v:t.s,l:"Giây"}].map(({v,l}) => (
        <div key={l} style={{
          background: "#1a1a1a", color: "#fff", borderRadius: 6,
          padding: "4px 10px", textAlign: "center", minWidth: 44
        }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{String(v).padStart(2,"0")}</div>
          <div style={{ fontSize: 9, opacity: 0.7 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function BannerSection() {
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [cur, setCur] = useState(0);
  const ref = useRef(null);
  useFadeUp(ref);

  useEffect(() => {
    fetch("http://localhost:5000/api/collections/active")
      .then(r => r.json())
      .then(data => { if (data?.length > 0) setCollections(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (collections.length <= 1) return;
    const t = setInterval(() => setCur(c => (c + 1) % collections.length), 4000);
    return () => clearInterval(t);
  }, [collections.length]);

  if (collections.length === 0) return (
    <section className="ec-feature-section" ref={ref}>
      <div className="ec-feature-inner">
        <div className="ec-feature-text fade-up">
          <p className="ec-feature-tag">BỘ SƯU TẬP</p>
          <h2 className="ec-feature-title">Chưa có<br />bộ sưu tập sale</h2>
          <p className="ec-feature-desc">Các chương trình sale sẽ sớm được cập nhật.</p>
        </div>
        <div className="ec-feature-slides fade-up">
          <div className="ec-feature-slide active" style={{ background: "#f0ece6" }}>
            <span style={{ fontSize: 80, opacity: 0.3 }}>🛍️</span>
          </div>
        </div>
      </div>
    </section>
  );

  const col = collections[cur];

  return (
    <section className="ec-feature-section" ref={ref}>
      <div className="ec-feature-inner">
        <div className="ec-feature-text fade-up">
          <p className="ec-feature-tag" style={{ color: "#e53935", letterSpacing: 2 }}>
            🔥 BỘ SƯU TẬP ĐANG SALE
          </p>
          <h2 className="ec-feature-title" key={`title-${cur}`}>{col.name}</h2>
          <p className="ec-feature-desc" key={`desc-${cur}`}>
            {col.description || "Ưu đãi có thời hạn — Đừng bỏ lỡ!"}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <span style={{
              background: "#e53935", color: "#fff", fontWeight: 700,
              fontSize: 20, borderRadius: 8, padding: "6px 14px"
            }}>-{col.discountPercent}%</span>
            <CollectionCountdown endDate={col.endDate} />
          </div>
          {collections.length > 1 && (
            <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
              {collections.map((_, i) => (
                <button key={i} onClick={() => setCur(i)} style={{
                  width: i === cur ? 28 : 10, height: 10,
                  borderRadius: 5, border: "none", cursor: "pointer",
                  background: i === cur ? "#1a1a1a" : "#ccc",
                  transition: "all 0.3s"
                }} />
              ))}
            </div>
          )}
          <button
            className="ec-btn ec-btn-dark"
            onClick={() => router.push(`/collections/${col.id}`)}
          >
            Xem bộ sưu tập →
          </button>
        </div>
        <div className="ec-feature-slides fade-up">
          {col.imageUrl ? (
            <div className="ec-feature-slide active" style={{
              background: `url(${col.imageUrl}) center/cover no-repeat`,
              borderRadius: 12
            }} />
          ) : (
            <div className="ec-feature-slide active" style={{ background: "#f0ece6" }}>
              <span style={{ fontSize: 80, opacity: 0.3 }}>🛍️</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


function Testimonials() {
  const [reviews, setReviews] = useState(TESTIMONIALS);
  const ref = useRef(null);
  useFadeUp(ref, [reviews]);

  useEffect(() => {
    fetch("http://localhost:5000/api/reviews/top?rating=5&take=6")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setReviews(data);
      })
      .catch(() => {});
  }, []);

  const initials = (n) =>
    n
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <section className="ec-section" ref={ref}>
      <div className="container">
        <div className="ec-section-head fade-up">
          <h2>Khách hàng nói gì</h2>
        </div>
        <div className="ec-testimonials">
          {reviews.map((t, i) => {
            const isApi = !!t.userId;
            const name = isApi ? t.userName || "Khách hàng" : t.name;
            const text = isApi ? t.comment : t.text;
            const role = isApi ? (t.productName ?? "Khách hàng") : t.role;
            const stars = isApi ? t.rating : t.stars;
            return (
              <div
                className="ec-testimonial fade-up"
                key={t.id ?? t.name}
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="ec-stars">{"★".repeat(stars)}</div>
                <p>"{text}"</p>
                <div className="ec-reviewer">
                  <div className="av">{initials(name)}</div>
                  <div>
                    <h5>{name}</h5>
                    <span>{role}</span>
                  </div>
                </div>
              </div>
            );
          })}
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
    if (email) {
      setDone(true);
      setEmail("");
      setTimeout(() => setDone(false), 4000);
    }
  };
  return (
    <section className="ec-newsletter">
      <div className="container">
        <h2>Đăng ký nhận ưu đãi</h2>
        <p>
          Nhận thông tin bộ sưu tập mới và ưu đãi độc quyền dành riêng cho thành
          viên.
        </p>
        {done ? (
          <p style={{ color: "#0a0a0a", fontWeight: 500 }}>
            ✓ Cảm ơn bạn đã đăng ký!
          </p>
        ) : (
          <form className="ec-newsletter-form" onSubmit={submit}>
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Đăng ký</button>
          </form>
        )}
        <p className="ec-newsletter-note">
          Bạn có thể hủy đăng ký bất cứ lúc nào.
        </p>
      </div>
    </section>
  );
}

export default function Home({ addToCart }) {
  return (
    <>
      <Topbar />
      <div style={{ paddingTop: "68px" }}>
        <Hero />
        <Categories />
        <Products onAddCart={addToCart} />
      </div>
      <BannerSection />
      <Testimonials />
      <Newsletter />
    </>
  );
}
