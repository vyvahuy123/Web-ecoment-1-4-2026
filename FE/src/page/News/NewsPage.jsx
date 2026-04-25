import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNewsList, NEWS_CATEGORIES } from "@/services/newsService";

const BASE_URL = "http://localhost:5000";

function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
}

const CAT_COLORS = {
  "new-arrival": { bg: "#f5f0eb", color: "#6b5a47" },
  "sale":        { bg: "#fff0f0", color: "#c0392b" },
  "event":       { bg: "#f0f5ff", color: "#2d5be3" },
  "tips":        { bg: "#f0fff4", color: "#27ae60" },
};

function CategoryBadge({ category }) {
  const cat = NEWS_CATEGORIES.find(c => c.value === category);
  const style = CAT_COLORS[category] ?? { bg: "#f5f5f5", color: "#555" };
  return (
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px", background: style.bg, color: style.color, borderRadius: 2 }}>
      {cat?.label || category}
    </span>
  );
}

function NewsCard({ news, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onClick(news.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer" }}
    >
      {/* Image */}
      <div style={{ aspectRatio: "4/3", overflow: "hidden", background: "#f0ece6", marginBottom: 16 }}>
        {getImageUrl(news.imageUrl) ? (
          <img
            src={getImageUrl(news.imageUrl)}
            alt={news.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease", transform: hovered ? "scale(1.05)" : "scale(1)" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 40 }}>✦</div>
        )}
      </div>

      {/* Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <CategoryBadge category={news.category} />
        <span style={{ fontSize: 11, color: "#999" }}>{formatDate(news.createdAt)}</span>
      </div>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 400, color: hovered ? "#888" : "#222", lineHeight: 1.4, marginBottom: 8, transition: "color 0.2s", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {news.title}
      </h3>
      <p style={{ fontSize: 13, color: "#777", lineHeight: 1.6, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {news.description}
      </p>
      <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: hovered ? "#222" : "#aaa", borderBottom: `1px solid ${hovered ? "#222" : "#ccc"}`, paddingBottom: 2, transition: "all 0.2s" }}>
        Đọc thêm
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div>
      <div style={{ aspectRatio: "4/3", background: "#f0f0f0", marginBottom: 16, animation: "shimmer 1.2s infinite" }} />
      <div style={{ height: 10, background: "#f0f0f0", width: "30%", marginBottom: 8 }} />
      <div style={{ height: 16, background: "#f0f0f0", marginBottom: 8 }} />
      <div style={{ height: 12, background: "#f0f0f0", width: "70%" }} />
    </div>
  );
}

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getNewsList({ category: activeCategory || undefined, page })
      .then(data => {
        setNews(data.items ?? []);
        setTotalPages(data.totalPages ?? Math.ceil((data.totalCount ?? 0) / 9));
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, [activeCategory, page]);

  const handleCategory = (cat) => { setActiveCategory(cat); setPage(1); };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f5", paddingTop: 68 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #e8e4de", padding: "64px 0 48px" }}>
        <div className="container">
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#aaa", marginBottom: 12 }}>INDIAS</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 300, color: "#222", marginBottom: 12 }}>Tin Tức</h1>
          <p style={{ fontSize: 14, color: "#888", maxWidth: 400 }}>
            Cập nhật những bộ sưu tập mới nhất, chương trình ưu đãi và xu hướng thời trang.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container" style={{ padding: "24px 24px 0" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[{ value: "", label: "Tất cả" }, ...NEWS_CATEGORIES].map(cat => (
            <button
              key={cat.value}
              onClick={() => handleCategory(cat.value)}
              style={{
                padding: "8px 16px", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
                border: `1px solid ${activeCategory === cat.value ? "#222" : "#ccc"}`,
                background: activeCategory === cat.value ? "#222" : "transparent",
                color: activeCategory === cat.value ? "#fff" : "#777",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="container" style={{ padding: "32px 24px 80px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 40 }}>
            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : news.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#bbb" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>Chưa có tin tức nào</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 40 }}>
            {news.map(item => <NewsCard key={item.id} news={item} onClick={(id) => navigate(`/tin-tuc/${id}`)} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 48 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  width: 36, height: 36, fontSize: 13,
                  border: `1px solid ${page === i + 1 ? "#222" : "#ccc"}`,
                  background: page === i + 1 ? "#222" : "transparent",
                  color: page === i + 1 ? "#fff" : "#777",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}