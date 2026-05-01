import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import ProductService from "@/services/product.service";
import ReviewService from "@/services/review.service";

const BASE_URL = "http://localhost:5000";
const fmt = (n) => Number(n).toLocaleString("vi-VN");

function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("vi-VN");
}

function StarRating({ value, onChange, size = 24 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3,4,5].map(s => (
        <span
          key={s}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{ fontSize: size, cursor: onChange ? "pointer" : "default", color: s <= (hover || value) ? "#f39c12" : "#ddd", transition: "color 0.15s" }}
        >★</span>
      ))}
    </div>
  );
}

function ReviewForm({ productId, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    if (!comment.trim()) { setErr("Vui lòng nhập nhận xét."); return; }
    setSubmitting(true); setErr("");
    try {
      await ReviewService.create({ productId, orderId: null, rating, comment, imageUrls: null });
      setComment(""); setRating(5);
      onSuccess?.();
    } catch (e) {
      setErr(e?.response?.data?.message ?? "Lỗi khi gửi đánh giá.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#f8f7f5", borderRadius: 12, padding: 20, marginBottom: 24 }}>
      <h4 style={{ fontWeight: 600, marginBottom: 12 }}>Viết đánh giá</h4>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: "#999", marginBottom: 6 }}>Đánh giá của bạn</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
        style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 13, resize: "vertical", minHeight: 80, boxSizing: "border-box" }}
      />
      {err && <p style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{err}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ marginTop: 12, padding: "10px 24px", background: "#111", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
      >
        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingCart, setAddingCart] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const isAdmin = (() => { try { const u = localStorage.getItem("user"); return u ? JSON.parse(u)?.roles?.includes("Admin") ?? false : false; } catch { return false; } })();
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const handleAdminReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      await ReviewService.reply(reviewId, replyText.trim());
      setReplyingId(null);
      setReplyText('');
      fetchReviews(reviewPage);
    } catch(e) { console.error(e); }
    finally { setReplyLoading(false); }
  };

  const isLiked = product ? isWishlisted(product.id) : false;

  useEffect(() => {
    setLoading(true);
    ProductService.getById(id)
      .then(setProduct)
      .catch(() => navigate("/san-pham"))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchReviews = async (page = 1) => {
    try {
      const data = await ReviewService.getProductReviews(id, page, 5);
      setReviews(data.items ?? data ?? []);
      setReviewTotal(data.totalCount ?? data.total ?? (data.items ?? data ?? []).length);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => { if (id) fetchReviews(reviewPage); }, [id, reviewPage]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingCart(true);
    try { await addItem(product.id, qty); }
    catch (e) { console.error(e); }
    finally { setAddingCart(false); }
  };

  if (loading) return (
    <div style={{ paddingTop: 68, textAlign: "center", padding: "120px 0", color: "#999" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
      <p>Đang tải sản phẩm...</p>
    </div>
  );

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : [{ imageUrl: product.imageUrl }];
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const totalPages = Math.ceil(reviewTotal / 5);

  return (
    <div style={{ minHeight: "100vh", paddingTop: 68 }}>
      <div className="container" style={{ padding: "48px 24px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 32, fontSize: 13, color: "#999" }}>
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/")}>Trang chủ</span>
          <span>›</span>
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/san-pham")}>Sản phẩm</span>
          <span>›</span>
          <span style={{ color: "#111" }}>{product.name}</span>
        </div>

        {/* Product Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 64 }}>

          {/* Left - Images */}
          <div>
            <div style={{ aspectRatio: "1", borderRadius: 16, overflow: "hidden", background: "#f5f5f5", marginBottom: 12 }}>
              {getImageUrl(images[activeImg]?.imageUrl) ? (
                <img
                  src={getImageUrl(images[activeImg]?.imageUrl)}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 80, opacity: 0.2 }}>🛍️</div>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 8 }}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", cursor: "pointer", border: i === activeImg ? "2px solid #111" : "2px solid transparent", background: "#f5f5f5" }}
                  >
                    {getImageUrl(img.imageUrl) && <img src={getImageUrl(img.imageUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right - Info */}
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <h1 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 600, lineHeight: 1.2 }}>{product.name}</h1>
              <button
                onClick={() => toggleWishlist(product.id)}
                style={{ background: "none", border: "1px solid #ddd", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, flexShrink: 0, color: isLiked ? "#e74c3c" : "#ccc", transition: "all 0.2s" }}
              >
                {isLiked ? "♥" : "♡"}
              </button>
            </div>

            {avgRating && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <StarRating value={Math.round(avgRating)} size={16} />
                <span style={{ fontSize: 13, color: "#999" }}>{avgRating} ({reviewTotal} đánh giá)</span>
              </div>
            )}

            <p style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 700, color: "#e74c3c", marginBottom: 16 }}>
              {fmt(product.price)}₫
            </p>

            {product.description && (
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#999" }}>Kho:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: product.stock > 0 ? "#27ae60" : "#e74c3c" }}>
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
              </span>
            </div>

            {product.stock > 0 && (
              <>
                {/* Qty */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: 13, color: "#999" }}>Số lượng:</span>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
                    <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width: 36, height: 36, background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>−</button>
                    <span style={{ width: 40, textAlign: "center", fontWeight: 600 }}>{qty}</span>
                    <button onClick={() => setQty(q => Math.min(product.stock, q+1))} style={{ width: 36, height: 36, background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>+</button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingCart}
                  style={{ width: "100%", padding: "14px", background: "#111", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 15, marginBottom: 12, transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#333"}
                  onMouseLeave={e => e.currentTarget.style.background = "#111"}
                >
                  {addingCart ? "Đang thêm..." : "🛒 Thêm vào giỏ hàng"}
                </button>
              </>
            )}

            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#999", marginTop: 16 }}>
              <span>✓ Miễn phí đổi trả 30 ngày</span>
              <span>✓ Thanh toán bảo mật</span>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ borderTop: "1px solid #eee", paddingTop: 48 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, marginBottom: 24 }}>
            Đánh giá ({reviewTotal})
          </h2>

          {/* Review Form */}
          {localStorage.getItem("token") && (
            <ReviewForm productId={id} onSuccess={() => fetchReviews(1)} />
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
              <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            <>
              {reviews.map(review => (
                <div key={review.id} style={{ padding: "20px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 }}>
                        {review.userName?.charAt(0)?.toUpperCase() ?? "U"}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{review.userName}</p>
                        <p style={{ fontSize: 12, color: "#999" }}>{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <StarRating value={review.rating} size={14} />
                  </div>
                  {review.comment && <p style={{ fontSize: 14, color: "#444", lineHeight: 1.6, marginBottom: 8 }}>{review.comment}</p>}
                  {review.adminReply && (
                    <div style={{ background: "#f8f7f5", borderRadius: 8, padding: "10px 14px", marginTop: 8, borderLeft: "3px solid #111" }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 4 }}>PHAN HOI TU SHOP</p>
                      <p style={{ fontSize: 13, color: "#444" }}>{review.adminReply}</p>
                    </div>
                  )}
                  {isAdmin && (
                    replyingId === review.id ? (
                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                        <textarea rows={2} value={replyText} onChange={e => setReplyText(e.target.value)}
                          placeholder="Nhap phan hoi tu shop..."
                          style={{ width: "100%", fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", resize: "none" }} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button disabled={replyLoading} onClick={() => handleAdminReply(review.id)}
                            style={{ padding: "7px 18px", background: "#111", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
                            {replyLoading ? "..." : "Gui phan hoi"}
                          </button>
                          <button onClick={() => { setReplyingId(null); setReplyText(""); }}
                            style={{ padding: "7px 18px", background: "none", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
                            Huy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setReplyingId(review.id); setReplyText(review.adminReply || ""); }}
                        style={{ marginTop: 8, padding: "5px 14px", background: "none", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, cursor: "pointer", color: "#666" }}>
                        {review.adminReply ? "Sua phan hoi" : "Phan hoi"}
                      </button>
                    )
                  )}

                </div>
              ))}
              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
                  <button disabled={reviewPage === 1} onClick={() => setReviewPage(p => p-1)} style={{ padding: "8px 20px", border: "1px solid #ddd", background: "none", borderRadius: 6, cursor: reviewPage === 1 ? "not-allowed" : "pointer", opacity: reviewPage === 1 ? 0.4 : 1 }}>← Trước</button>
                  <span style={{ padding: "8px 16px", fontSize: 13, color: "#999" }}>{reviewPage} / {totalPages}</span>
                  <button disabled={reviewPage === totalPages} onClick={() => setReviewPage(p => p+1)} style={{ padding: "8px 20px", border: "1px solid #ddd", background: "none", borderRadius: 6, cursor: reviewPage === totalPages ? "not-allowed" : "pointer", opacity: reviewPage === totalPages ? 0.4 : 1 }}>Sau →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}