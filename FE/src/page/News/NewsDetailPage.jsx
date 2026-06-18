import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNewsDetail, NEWS_CATEGORIES } from "@/services/newsService";

const BASE_URL = "http://localhost:5000";

function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

const CAT_COLORS = {
  "new-arrival": { bg: "#f5f0eb", color: "#6b5a47" },
  "sale":        { bg: "#fff0f0", color: "#c0392b" },
  "event":       { bg: "#f0f5ff", color: "#2d5be3" },
  "tips":        { bg: "#f0fff4", color: "#27ae60" },
};

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNewsDetail(id)
      .then(setNews)
      .catch(() => navigate("/tin-tuc"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", paddingTop: 68, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f7f5" }}>
      <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbb" }}>Đang tải...</p>
    </div>
  );

  if (!news) return null;

  const cat = NEWS_CATEGORIES.find(c => c.value === news.category);
  const catStyle = CAT_COLORS[news.category] ?? { bg: "#f5f5f5", color: "#555" };
  const formattedDate = new Date(news.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f5", paddingTop: 68 }}>

      {/* Back */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 0" }}>
        <button
          onClick={() => navigate("/tin-tuc")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", display: "flex", alignItems: "center", gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.color = "#222"}
          onMouseLeave={e => e.currentTarget.style.color = "#aaa"}
        >
          ← Tin tức
        </button>
      </div>

      {/* Hero Image */}
      {getImageUrl(news.imageUrl) && (
        <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 24px" }}>
          <div style={{ aspectRatio: "16/7", overflow: "hidden" }}>
            <img
              src={getImageUrl(news.imageUrl)}
              alt={news.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      )}

      {/* Article */}
      <article style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          {cat && (
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px", background: catStyle.bg, color: catStyle.color }}>
              {cat.label}
            </span>
          )}
          <span style={{ fontSize: 12, color: "#aaa" }}>{formattedDate}</span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 300, color: "#222", lineHeight: 1.2, marginBottom: 20 }}>
          {news.title}
        </h1>

        {/* Description */}
        <p style={{ fontSize: 16, color: "#888", lineHeight: 1.8, marginBottom: 32, borderLeft: "2px solid #ccc", paddingLeft: 16 }}>
          {news.description}
        </p>

        {/* Divider */}
        <div style={{ width: 40, height: 1, background: "#ccc", marginBottom: 32 }} />

        {/* Content */}
        <div
          style={{ fontSize: 15, color: "#555", lineHeight: 1.9 }}
          dangerouslySetInnerHTML={{ __html: news.content?.replace(/\n/g, "<br/>") ?? "" }}
        />

        {/* Footer */}
        <div style={{ marginTop: 64, paddingTop: 24, borderTop: "1px solid #e8e4de", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => navigate("/tin-tuc")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa" }}
            onMouseEnter={e => e.currentTarget.style.color = "#222"}
            onMouseLeave={e => e.currentTarget.style.color = "#aaa"}
          >
            ← Quay lại
          </button>
          <button
            onClick={() => navigate("/san-pham")}
            style={{ padding: "12px 24px", background: "#222", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}
            onMouseEnter={e => e.currentTarget.style.background = "#444"}
            onMouseLeave={e => e.currentTarget.style.background = "#222"}
          >
            Xem sản phẩm
          </button>
        </div>
      </article>
    </div>
  );
}