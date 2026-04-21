import { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";

const fmt = (n) => Number(n).toLocaleString("vi-VN");
const BASE_URL = "http://localhost:5000";

function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

export default function CartDrawer() {
  const { cart, loading, cartOpen, setCartOpen, updateItem, removeItem, clearCart, fetchCart } = useCart();

  useEffect(() => {
    if (cartOpen) fetchCart();
  }, [cartOpen, fetchCart]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setCartOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setCartOpen]);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  const items = cart?.items ?? [];
  const grandTotal = cart?.grandTotal ?? 0;

  return (
    <>
      <div onClick={() => setCartOpen(false)} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000,
        opacity: cartOpen ? 1 : 0, pointerEvents: cartOpen ? "auto" : "none",
        transition: "opacity 0.3s ease",
      }} />

      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(420px, 100vw)",
        background: "#fff", zIndex: 1001, display: "flex", flexDirection: "column",
        transform: cartOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🛒</span>
            <span style={{ fontWeight: 700, fontSize: 18 }}>Giỏ hàng</span>
            {items.length > 0 && (
              <span style={{ background: "#111", color: "#fff", borderRadius: 999, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>
                {cart?.totalItems ?? 0}
              </span>
            )}
          </div>
          <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#666", padding: 4 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <p>Đang tải giỏ hàng...</p>
            </div>
          ) : !localStorage.getItem("token") ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
              <p style={{ color: "#555", marginBottom: 20 }}>Vui lòng đăng nhập để xem giỏ hàng</p>
              <a href="/dang-nhap" style={{ background: "#111", color: "#fff", padding: "10px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Đăng nhập</a>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
              <p style={{ color: "#555", marginBottom: 8, fontWeight: 600 }}>Giỏ hàng trống</p>
              <p style={{ color: "#999", fontSize: 14, marginBottom: 24 }}>Thêm sản phẩm vào giỏ để bắt đầu</p>
              <button onClick={() => setCartOpen(false)} style={{ background: "#111", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button onClick={clearCart} style={{ background: "none", border: "none", color: "#e74c3c", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>Xóa tất cả</button>
              </div>
              {items.map((item) => (
                <div key={item.cartItemId} style={{ display: "flex", gap: 14, marginBottom: 16, padding: 14, borderRadius: 12, border: "1px solid #f0f0f0" }}>
                  <div style={{ width: 72, height: 72, borderRadius: 10, background: "#f5f5f5", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {getImageUrl(item.productImageUrl)
                      ? <img src={getImageUrl(item.productImageUrl)} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                      : <span style={{ fontSize: 28 }}>🛍️</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.productName}</p>
                    <p style={{ color: "#e74c3c", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{fmt(item.unitPrice)}₫</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => updateItem(item.productId, item.quantity - 1)} disabled={item.quantity <= 1} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: item.quantity <= 1 ? "not-allowed" : "pointer", fontSize: 16, fontWeight: 600 }}>−</button>
                      <span style={{ fontWeight: 600, fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                      <button onClick={() => updateItem(item.productId, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 600 }}>+</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{fmt(item.totalPrice)}₫</span>
                    <button onClick={() => removeItem(item.productId)} style={{ background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: 18, padding: 2 }} onMouseEnter={e => e.currentTarget.style.color = "#e74c3c"} onMouseLeave={e => e.currentTarget.style.color = "#bbb"}>🗑</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ borderTop: "1px solid #f0f0f0", padding: "20px 24px", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ color: "#555", fontSize: 15 }}>Tổng cộng</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#111" }}>{fmt(grandTotal)}₫</span>
            </div>
            <a href="/cart" onClick={() => setCartOpen(false)} style={{ display: "block", textAlign: "center", background: "#111", color: "#fff", padding: 14, borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
              Xem giỏ hàng →
            </a>
            <button onClick={() => setCartOpen(false)} style={{ display: "block", width: "100%", textAlign: "center", background: "none", border: "1px solid #ddd", color: "#555", padding: 11, borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14, marginTop: 10 }}>
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </>
  );
}