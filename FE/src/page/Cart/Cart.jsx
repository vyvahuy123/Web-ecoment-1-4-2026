import { useCart } from "@/contexts/CartContext";
import "./Cart.css";

const BASE_URL = "http://localhost:5000";
const SHIPPING = 30000;
const fmt = (n) => Number(n).toLocaleString("vi-VN");

function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

export default function Cart() {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();

  const items = cart?.items ?? [];
  const subtotal = cart?.grandTotal ?? 0;
  const total = subtotal + (items.length > 0 ? SHIPPING : 0);

  if (loading) {
    return (
      <div className="cart-page">
        <section className="cart-hero">
          <div className="container">
            <p className="cart-hero__tag">VYX Store</p>
            <h1 className="cart-hero__title">Giỏ hàng</h1>
          </div>
        </section>
        <div style={{ textAlign: "center", padding: "80px 0", color: "#999" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (!localStorage.getItem("token")) {
    return (
      <div className="cart-page">
        <section className="cart-hero">
          <div className="container">
            <p className="cart-hero__tag">VYX Store</p>
            <h1 className="cart-hero__title">Giỏ hàng</h1>
          </div>
        </section>
        <div className="cart-empty">
          <div className="cart-empty__icon">🔐</div>
          <h2 className="cart-empty__title">Vui lòng đăng nhập</h2>
          <p className="cart-empty__sub">Đăng nhập để xem giỏ hàng của bạn.</p>
          <a href="/dang-nhap" className="ec-btn ec-btn-dark">Đăng nhập</a>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <section className="cart-hero">
        <div className="container">
          <p className="cart-hero__tag">VYX Store</p>
          <h1 className="cart-hero__title">Giỏ hàng</h1>
        </div>
      </section>

      <section className="cart-body">
        <div className="container">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty__icon">🛒</div>
              <h2 className="cart-empty__title">Giỏ hàng trống</h2>
              <p className="cart-empty__sub">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
              <a href="/san-pham" className="ec-btn ec-btn-dark">Tiếp tục mua sắm</a>
            </div>
          ) : (
            <div className="cart-grid">
              {/* Left */}
              <div>
                <div className="cart-items-head">
                  <h2>Sản phẩm ({cart?.totalItems ?? 0})</h2>
                  <button className="cart-clear" onClick={clearCart}>Xóa tất cả</button>
                </div>

                {items.map((item) => (
                  <div className="cart-item" key={item.cartItemId}>
                    <div className="cart-item__img">
                      {getImageUrl(item.productImageUrl) ? (
                        <img
                          src={getImageUrl(item.productImageUrl)}
                          alt={item.productName}
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : <span style={{ fontSize: 28 }}>🛍️</span>}
                    </div>

                    <div className="cart-item__info">
                      <h3 className="cart-item__name">{item.productName}</h3>
                      <p style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>
                        {fmt(item.unitPrice)}₫ / sản phẩm
                      </p>
                      <div className="cart-item__qty">
                        <button onClick={() => updateItem(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateItem(item.productId, item.quantity + 1)}>+</button>
                      </div>
                    </div>

                    <div className="cart-item__right">
                      <div className="cart-item__price">{fmt(item.totalPrice)}₫</div>
                      <button className="cart-item__remove" onClick={() => removeItem(item.productId)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right - Summary */}
              <div className="cart-summary">
                <div className="cart-summary__title">Tóm tắt đơn hàng</div>
                <div className="cart-summary__row label">
                  <span>Tạm tính</span>
                  <span>{fmt(subtotal)}₫</span>
                </div>
                <div className="cart-summary__row label">
                  <span>Phí vận chuyển</span>
                  <span>{fmt(SHIPPING)}₫</span>
                </div>
                <div className="cart-summary__row total">
                  <span>Tổng cộng</span>
                  <span>{fmt(total)}₫</span>
                </div>
                <a href="/checkout" className="cart-checkout-btn" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
                  Tiến hành thanh toán →
                </a>
                <p className="cart-note">Miễn phí đổi trả trong 30 ngày · Thanh toán bảo mật</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}