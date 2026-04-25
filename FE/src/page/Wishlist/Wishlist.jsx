import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

const BASE_URL = "http://localhost:5000";
const fmt = (n) => Number(n).toLocaleString("vi-VN");

function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

export default function Wishlist() {
  const { wishlist, loading, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (item) => {
    try {
      await addItem(item.productId, 1);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: 68 }}>
      {/* Hero */}
      <section style={{ background: "#f8f7f5", padding: "48px 0 36px", borderBottom: "1px solid #eee" }}>
        <div className="container">
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "#999", marginBottom: 10 }}>
            VYX Store
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 300 }}>
            Yêu thích
          </h1>
        </div>
      </section>

      <section style={{ padding: "48px 0 80px" }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#999" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
              <p>Đang tải...</p>
            </div>
          ) : !localStorage.getItem("token") ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.3 }}>♡</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, marginBottom: 12 }}>Vui lòng đăng nhập</h2>
              <p style={{ color: "#999", marginBottom: 32 }}>Đăng nhập để lưu sản phẩm yêu thích.</p>
              <a href="/dang-nhap" className="ec-btn ec-btn-dark">Đăng nhập</a>
            </div>
          ) : wishlist.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.3 }}>♡</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, marginBottom: 12 }}>Chưa có sản phẩm yêu thích</h2>
              <p style={{ color: "#999", marginBottom: 32 }}>Bấm ♡ trên sản phẩm để lưu vào danh sách yêu thích.</p>
              <a href="/san-pham" className="ec-btn ec-btn-dark">Khám phá sản phẩm</a>
            </div>
          ) : (
            <>
              <p style={{ color: "#999", fontSize: 13, marginBottom: 24 }}>{wishlist.length} sản phẩm</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
                {wishlist.map((item) => (
                  <div key={item.id} style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden", transition: "box-shadow 0.2s", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                  >
                    {/* Image */}
                    <div style={{ position: "relative", height: 240, background: "#f5f5f5", overflow: "hidden" }}
                      onClick={() => navigate(`/san-pham/${item.productId}`)}
                    >
                      {getImageUrl(item.productImageUrl) ? (
                        <img
                          src={getImageUrl(item.productImageUrl)}
                          alt={item.productName}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 60, opacity: 0.3 }}>🛍️</div>
                      )}
                      {/* Remove wishlist btn */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(item.productId); }}
                        style={{ position: "absolute", top: 12, right: 12, background: "#fff", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", color: "#e74c3c" }}
                      >
                        ♥
                      </button>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "16px" }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        onClick={() => navigate(`/san-pham/${item.productId}`)}
                      >
                        {item.productName}
                      </h3>
                      <p style={{ color: "#e74c3c", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                        {fmt(item.productPrice)}₫
                      </p>
                      <button
                        onClick={() => handleAddToCart(item)}
                        style={{ width: "100%", padding: "10px", background: "#111", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}