import { useState } from "react";
import "./Orders.css";

const TRACK_STEPS = [
  { label: "Đặt hàng",    icon: "✓" },
  { label: "Xác nhận",    icon: "✓" },
  { label: "Đang giao",   icon: "🚚" },
  { label: "Đã nhận",     icon: "★" },
];

const ORDERS = [
  {
    id: "#ORD-001",
    date: "10/04/2025",
    status: "shipping",
    statusLabel: "Đang giao hàng",
    trackStep: 2,
    total: 2350000,
    voucher: "SUMMER25",
    items: [
      { name: "Oversized Linen Blazer", cat: "Women", emoji: "🧥", variant: "Size M · Be", price: 1890000, qty: 1 },
      { name: "Silk Slip Dress",        cat: "Women", emoji: "👗", variant: "Size S · Trắng", price: 460000, qty: 1 },
    ],
  },
  {
    id: "#ORD-002",
    date: "08/04/2025",
    status: "done",
    statusLabel: "Đã hoàn thành",
    trackStep: 3,
    total: 890000,
    voucher: null,
    items: [
      { name: "Slim Fit Chino Pants", cat: "Men", emoji: "👖", variant: "Size 30 · Nâu", price: 890000, qty: 1 },
    ],
  },
  {
    id: "#ORD-003",
    date: "05/04/2025",
    status: "pending",
    statusLabel: "Chờ xử lý",
    trackStep: 0,
    total: 1800000,
    voucher: null,
    items: [
      { name: "Structured Tote Bag",    cat: "Accessories", emoji: "👜", variant: "Màu Đen",      price: 1450000, qty: 1 },
      { name: "Leather Card Holder",    cat: "Accessories", emoji: "💳", variant: "Màu Nâu",      price: 350000,  qty: 1 },
    ],
  },
  {
    id: "#ORD-004",
    date: "01/04/2025",
    status: "cancel",
    statusLabel: "Đã hủy",
    trackStep: -1,
    total: 750000,
    voucher: null,
    items: [
      { name: "Canvas Sneakers", cat: "Men", emoji: "👟", variant: "Size 42 · Trắng", price: 750000, qty: 1 },
    ],
  },
];

const TABS = [
  { id: "all",      label: "Tất cả" },
  { id: "pending",  label: "Chờ xử lý" },
  { id: "shipping", label: "Đang giao" },
  { id: "done",     label: "Hoàn thành" },
  { id: "cancel",   label: "Đã hủy" },
];

const STATUS_CLS = {
  pending:  "status-pending",
  shipping: "status-shipping",
  done:     "status-done",
  cancel:   "status-cancel",
};

const fmt = (n) => n.toLocaleString("vi-VN");

function Tracker({ step }) {
  if (step < 0) return null;
  const pct = (step / (TRACK_STEPS.length - 1)) * 100;
  return (
    <div className="order-track">
      <div className="track-steps">
        <div className="track-line" style={{ width: `calc(${pct}% - 28px)` }} />
        {TRACK_STEPS.map((s, i) => (
          <div
            key={s.label}
            className={`track-step${i < step ? " done" : ""}${i === step ? " current" : ""}`}
          >
            <div className="track-dot">
              {i <= step ? s.icon : ""}
            </div>
            <span className="track-step__label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="order-card">
      {/* Head */}
      <div className="order-card__head">
        <div className="order-card__meta">
          <span className="order-card__id">{order.id}</span>
          <span className="order-card__date">{order.date}</span>
          {order.voucher && (
            <span style={{ fontSize: 11, color: "var(--gray-4)" }}>
              🎟 {order.voucher}
            </span>
          )}
        </div>
        <span className={`order-status ${STATUS_CLS[order.status]}`}>
          {order.statusLabel}
        </span>
      </div>

      {/* Tracker */}
      {order.status !== "cancel" && <Tracker step={order.trackStep} />}

      {/* Items */}
      <div className="order-card__body">
        <div className="order-items-list">
          {(expanded ? order.items : order.items.slice(0, 1)).map((item, i) => (
            <div className="order-item" key={i}>
              <div className="order-item__img">{item.emoji}</div>
              <div className="order-item__info">
                <p className="order-item__cat">{item.cat}</p>
                <h4 className="order-item__name">{item.name}</h4>
                <p className="order-item__variant">{item.variant}</p>
              </div>
              <span className="order-item__qty">x{item.qty}</span>
              <span className="order-item__price">{fmt(item.price)}₫</span>
            </div>
          ))}
          {order.items.length > 1 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "var(--gray-4)", letterSpacing: "0.06em",
                textTransform: "uppercase", padding: "4px 0", textAlign: "left",
              }}
            >
              {expanded
                ? "Thu gọn ↑"
                : `Xem thêm ${order.items.length - 1} sản phẩm ↓`}
            </button>
          )}
        </div>
      </div>

      {/* Foot */}
      <div className="order-card__foot">
        <div className="order-card__total">
          <span style={{ color: "var(--gray-4)" }}>Tổng cộng:</span>
          <strong>{fmt(order.total)}₫</strong>
        </div>
        <div className="order-card__actions">
          {order.status === "done" && (
            <button className="ec-btn ec-btn-outline" style={{ padding: "8px 20px", fontSize: 11 }}>
              Đánh giá
            </button>
          )}
          {order.status === "done" && (
            <button className="ec-btn ec-btn-dark" style={{ padding: "8px 20px", fontSize: 11 }}>
              Mua lại
            </button>
          )}
          {order.status === "pending" && (
            <button
              className="ec-btn ec-btn-outline"
              style={{ padding: "8px 20px", fontSize: 11, color: "#c0392b", borderColor: "#c0392b" }}
            >
              Hủy đơn
            </button>
          )}
          {order.status === "shipping" && (
            <button className="ec-btn ec-btn-outline" style={{ padding: "8px 20px", fontSize: 11 }}>
              Liên hệ shop
            </button>
          )}
          <button className="ec-btn ec-btn-outline" style={{ padding: "8px 20px", fontSize: 11 }}>
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [tab, setTab] = useState("all");

  const filtered = tab === "all"
    ? ORDERS
    : ORDERS.filter((o) => o.status === tab);

  return (
    <div className="orders-page">
      {/* Hero */}
      <section className="orders-hero">
        <div className="container">
          <p className="orders-hero__tag">VYX Store</p>
          <h1 className="orders-hero__title">Đơn hàng của tôi</h1>
        </div>
      </section>

      {/* Body */}
      <section className="orders-body">
        <div className="container">
          {/* Tabs */}
          <div className="orders-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`orders-tab${tab === t.id ? " active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                {t.id !== "all" && (
                  <span style={{ marginLeft: 6, color: "var(--gray-3)" }}>
                    ({ORDERS.filter((o) => o.status === t.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Orders */}
          {filtered.length === 0 ? (
            <div className="orders-empty">
              <div className="orders-empty__icon">📦</div>
              <h2 className="orders-empty__title">Chưa có đơn hàng</h2>
              <p className="orders-empty__sub">Bạn chưa có đơn hàng nào trong mục này.</p>
              <a href="/" className="ec-btn ec-btn-dark">Khám phá sản phẩm</a>
            </div>
          ) : (
            filtered.map((o) => <OrderCard key={o.id} order={o} />)
          )}
        </div>
      </section>
    </div>
  );
}