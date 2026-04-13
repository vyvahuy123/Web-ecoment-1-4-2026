import { useState, useEffect, useRef, useCallback } from "react";
import "./Products.css";
import ProductService from "@/services/product.service";

const SORT_OPTIONS = [
  { value: "default", label: "Mặc định" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
];

// Chạy lại observe mỗi khi products thay đổi
function useFadeUp(ref, deps) {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) =>
          e.target.classList.toggle("visible", e.isIntersecting)
        ),
      { threshold: 0.08 }
    );
    ref.current?.querySelectorAll(".fade-up").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ref, ...deps]); // re-observe khi deps thay đổi
}

function ProductCard({ p, onAddCart, delay }) {
  return (
    <div className="pd-card fade-up" style={{ transitionDelay: `${delay}s` }}>
      <div className="pd-card-img">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="pd-card-image"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="pd-card-emoji"
          style={{ display: p.imageUrl ? "none" : "flex" }}
        >
          🛍️
        </div>
        <div className="pd-card-actions">
          <button className="pd-btn-cart" onClick={() => onAddCart(p)}>
            Thêm vào giỏ
          </button>
          <button className="pd-btn-wish">♡</button>
        </div>
      </div>
      <div className="pd-card-info">
        <p className="pd-card-desc">{p.description}</p>
        <h3 className="pd-card-name">{p.name}</h3>
        <div className="pd-card-price">
          <span className="pd-price">
            {Number(p.price).toLocaleString("vi-VN")}₫
          </span>
        </div>
      </div>
    </div>
  );
}

function CategoryHero() {
  return (
    <div className="pd-hero" style={{ background: "#f0ece6" }}>
      <div className="pd-hero-inner">
        <h1>Toàn bộ sản phẩm</h1>
        <p>Khám phá trọn bộ sưu tập — từ trang phục đến phụ kiện và giày dép.</p>
      </div>
      <div className="pd-hero-deco">✦</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="pd-card pd-skeleton">
      <div className="pd-card-img skeleton-img" />
      <div className="pd-card-info">
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

export default function Products({ onAddCart }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [sort, setSort]         = useState("default");
  const [inputVal, setInputVal] = useState("");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const ref = useRef(null);

  // Truyền products vào deps để re-observe sau khi data load
  useFadeUp(ref, [products]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(inputVal); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [inputVal]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ProductService.getAll({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
      });
      setProducts(result.items ?? []);
      setTotal(result.totalCount ?? result.total ?? result.items?.length ?? 0);
    } catch (err) {
      setError(err.message ?? "Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const sorted = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="pd-page" ref={ref} style={{ paddingTop: "68px" }}>
      <CategoryHero />

      <div className="pd-main">
        <div className="pd-controls">
          <div className="pd-toolbar">
            <div className="pd-search-wrap">
              <span className="pd-search-icon">⌕</span>
              <input
                className="pd-search"
                type="text"
                placeholder="Tìm sản phẩm..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
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
            <span className="pd-count">
              {loading ? "..." : `${total} sản phẩm`}
            </span>
          </div>
        </div>

        {error && (
          <div className="pd-empty">
            <p>⚠️ {error}</p>
            <button className="pd-btn-retry" onClick={fetchProducts}>Thử lại</button>
          </div>
        )}

        {loading && !error && (
          <div className="pd-grid">
            {Array.from({ length: 8 }, (_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
          </div>
        )}

        {!loading && !error && sorted.length === 0 && (
          <div className="pd-empty">
            <p>Không tìm thấy sản phẩm nào.</p>
          </div>
        )}

        {!loading && !error && sorted.length > 0 && (
          <>
            <div className="pd-grid">
              {sorted.map((p, i) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  onAddCart={onAddCart}
                  delay={(i % 8) * 0.07}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pd-pagination">
                <button
                  className="pd-page-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Trước
                </button>
                <span className="pd-page-info">Trang {page} / {totalPages}</span>
                <button
                  className="pd-page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}