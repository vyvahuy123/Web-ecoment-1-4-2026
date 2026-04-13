import { useState } from "react";
import "./Cart.css";

const INIT_ITEMS = [
  { id: 1, name: "Oversized Linen Blazer", cat: "Women",      price: 1890000, oldPrice: null,    qty: 1, emoji: "🧥", variant: "Size M · Màu Be" },
  { id: 2, name: "Slim Fit Chino Pants",   cat: "Men",        price: 890000,  oldPrice: 1200000, qty: 2, emoji: "👖", variant: "Size 30 · Màu Nâu" },
  { id: 3, name: "Structured Tote Bag",    cat: "Accessories",price: 1450000, oldPrice: null,    qty: 1, emoji: "👜", variant: "Màu Đen" },
];

const SUGGEST = [
  { name: "Silk Slip Dress",        cat: "Women", price: "2.350.000", emoji: "👗", badge: "new" },
  { name: "Merino Wool Turtleneck", cat: "Men",   price: "1.190.000", emoji: "🧣", badge: "sale" },
  { name: "Canvas Sneakers",        cat: "Men",   price: "750.000",   emoji: "👟", badge: "new" },
  { name: "Leather Card Holder",    cat: "Accessories", price: "350.000", emoji: "💳", badge: null },
];

const fmt = (n) => n.toLocaleString("vi-VN");

const SHIPPING = 30000;
const VOUCHERS = { SUMMER25: 0.25, NEWUSER10: 0.10 };

export default function Cart({ onCheckout }) {
  const [items, setItems]       = useState(INIT_ITEMS);
  const [voucher, setVoucher]   = useState("");
  const [applied, setApplied]   = useState(null);
  const [vMsg, setVMsg]         = useState("");

  const updateQty = (id, delta) =>
    setItems((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear  = ()   => setItems([]);

  const applyVoucher = () => {
    const code = voucher.trim().toUpperCase();
    if (VOUCHERS[code]) {
      setApplied({ code, pct: VOUCHERS[code] });
      setVMsg(`✓ Áp dụng thành công! Giảm ${VOUCHERS[code] * 100}%`);
    } else {
      setApplied(null);
      setVMsg("✕ Mã không hợp lệ hoặc đã hết hạn");
    }
  };

  const subtotal  = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount  = applied ? Math.round(subtotal * applied.pct) : 0;
  const total     = subtotal - discount + (items.length > 0 ? SHIPPING : 0);

  return (
    <div className="cart-page">
      {/* Hero */}
      <section className="cart-hero">
        <div className="container">
          <p className="cart-hero__tag">VYX Store</p>
          <h1 className="cart-hero__title">Giỏ hàng</h1>
        </div>
      </section>

      {/* Body */}
      <section className="cart-body">
        <div className="container">
          {items.length === 0 ? (
            /* Empty */
            <div className="cart-empty">
              <div className="cart-empty__icon">🛒</div>
              <h2 className="cart-empty__title">Giỏ hàng trống</h2>
              <p className="cart-empty__sub">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
              <a href="/" className="ec-btn ec-btn-dark">Tiếp tục mua sắm</a>
            </div>
          ) : (
            <div className="cart-grid">
              {/* Left - Items */}
              <div>
                <div className="cart-items-head">
                  <h2>Sản phẩm ({items.reduce((s, i) => s + i.qty, 0)})</h2>
                  <button className="cart-clear" onClick={clear}>Xóa tất cả</button>
                </div>

                {items.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item__img">{item.emoji}</div>

                    <div className="cart-item__info">
                      <p className="cart-item__cat">{item.cat}</p>
                      <h3 className="cart-item__name">{item.name}</h3>
                      <p className="cart-item__variant">{item.variant}</p>
                      <div className="cart-item__qty">
                        <button onClick={() => updateQty(item.id, -1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, +1)}>+</button>
                      </div>
                    </div>

                    <div className="cart-item__right">
                      <div>
                        <div className="cart-item__price">{fmt(item.price * item.qty)}₫</div>
                        {item.oldPrice && (
                          <div className="cart-item__old">{fmt(item.oldPrice * item.qty)}₫</div>
                        )}
                      </div>
                      <button className="cart-item__remove" onClick={() => remove(item.id)}>
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
                {discount > 0 && (
                  <div className="cart-summary__row">
                    <span className="cart-summary__discount">Giảm giá ({applied.code})</span>
                    <span className="cart-summary__discount">−{fmt(discount)}₫</span>
                  </div>
                )}
                <div className="cart-summary__row total">
                  <span>Tổng cộng</span>
                  <span>{fmt(total)}₫</span>
                </div>

                {/* Voucher */}
                <div className="cart-voucher">
                  <input
                    placeholder="Mã voucher"
                    value={voucher}
                    onChange={(e) => { setVoucher(e.target.value); setVMsg(""); }}
                    onKeyDown={(e) => e.key === "Enter" && applyVoucher()}
                  />
                  <button onClick={applyVoucher}>Áp dụng</button>
                </div>
                {vMsg && (
                  <p style={{
                    fontSize: 12,
                    marginTop: -8,
                    marginBottom: 4,
                    color: vMsg.startsWith("✓") ? "#27ae60" : "#c0392b"
                  }}>
                    {vMsg}
                  </p>
                )}

                <button
                  className="cart-checkout-btn"
                  onClick={() => onCheckout && onCheckout()}
                >
                  Tiến hành thanh toán →
                </button>
                <p className="cart-note">
                  Miễn phí đổi trả trong 30 ngày · Thanh toán bảo mật
                </p>
              </div>
            </div>
          )}

          {/* Suggested */}
          <div className="cart-suggest">
            <h2 className="cart-suggest__title">Có thể bạn thích</h2>
            <div className="cart-suggest-grid">
              {SUGGEST.map((p) => (
                <div className="ec-product-card" key={p.name}>
                  <div className="ec-product-img">
                    <div className="ec-product-img-inner">{p.emoji}</div>
                    {p.badge && (
                      <span className={`ec-product-badge badge-${p.badge}`}>
                        {p.badge === "new" ? "Mới" : "Sale"}
                      </span>
                    )}
                    <div className="ec-product-actions">
                      <button className="ec-add-cart">Thêm vào giỏ</button>
                      <button className="ec-wishlist">♡</button>
                    </div>
                  </div>
                  <div className="ec-product-info">
                    <p className="cat">{p.cat}</p>
                    <h3>{p.name}</h3>
                    <div className="ec-product-price">
                      <span className="ec-price">{p.price}₫</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}