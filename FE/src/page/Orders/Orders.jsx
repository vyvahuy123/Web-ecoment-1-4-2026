import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./Orders.css";
import OrderService from "@/services/order.service";
import ReviewService from "@/services/review.service";

const BASE_URL = "http://localhost:5000";

// Map OrderStatus enum từ backend
const STATUS_MAP = {
  Pending:             { label: 'Chờ xác nhận',  cls: 'status-pending',  trackStep: 0 },
  Confirmed:           { label: 'Đã xác nhận',   cls: 'status-pending',  trackStep: 1 },
  Processing:          { label: 'Đang xử lý',    cls: 'status-shipping', trackStep: 1 },
  Shipped:             { label: 'Đang giao',      cls: 'status-shipping', trackStep: 2 },
  Delivered:           { label: 'Đã giao',        cls: 'status-done',     trackStep: 3 },
  Cancelled:           { label: 'Đã hủy',         cls: 'status-cancel',   trackStep: -1 },
  Refunded:            { label: 'Hoàn tiền',      cls: 'status-cancel',   trackStep: -1 },
  PendingCancellation: { label: 'Chờ duyệt hủy', cls: 'status-pending',  trackStep: -1 },
};

const PAYMENT_METHOD_MAP = {
  0: "COD",
  1: "Chuyển khoản",
  2: "VNPay",
  3: "MoMo",
  4: "ZaloPay",
};

const PAYMENT_STATUS_MAP = {
  0: "Chưa thanh toán",
  1: "Đã thanh toán",
  2: "Đã hoàn tiền",
  3: "Thất bại",
};

const TRACK_STEPS = [
  { label: "Đặt hàng",  icon: "✓" },
  { label: "Xác nhận",  icon: "✓" },
  { label: "Đang giao", icon: "🚚" },
  { label: "Đã nhận",   icon: "★" },
];

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "0",   label: "Chờ xác nhận" },
  { id: "3",   label: "Đang giao" },
  { id: "4",   label: "Hoàn thành" },
  { id: "5",   label: "Đã hủy" },
];

const fmt = (n) => Number(n).toLocaleString("vi-VN");

function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

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
            <div className="track-dot">{i <= step ? s.icon : ""}</div>
            <span className="track-step__label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function ReviewModal({ order, item, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const BASE = "http://localhost:5000";
  const imgUrl = item.productImageUrl?.startsWith("http")
    ? item.productImageUrl
    : item.productImageUrl ? BASE + item.productImageUrl : null;

  const handleSubmit = async () => {
    if (!rating) return setErr("Vui long chon so sao.");
    setSubmitting(true); setErr("");
    try {
      await ReviewService.create({ productId: item.productId, orderId: order.id, rating, comment });
      onSuccess();
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.errors?.detail?.[0] ?? e?.response?.data?.message ?? "Loi gui danh gia.");
    } finally { setSubmitting(false); }
  };

  return createPortal(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:16,padding:32,width:480,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{margin:0,fontSize:18,fontWeight:700}}>Danh gia san pham</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer"}}>x</button>
        </div>
        <div style={{display:"flex",gap:14,alignItems:"center",background:"#f8f8f8",borderRadius:10,padding:14,marginBottom:20}}>
          {imgUrl && <img src={imgUrl} alt={item.productName} style={{width:72,height:72,objectFit:"cover",borderRadius:8}}/>}
          <div>
            <div style={{fontWeight:600,fontSize:15}}>{item.productName}</div>
            <div style={{color:"#888",fontSize:13,marginTop:4}}>x{item.quantity} - {Number(item.unitPrice).toLocaleString("vi-VN")} VND</div>
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Chat luong san pham</div>
          <div style={{display:"flex",gap:6}}>
            {[1,2,3,4,5].map(s=>(
              <span key={s} style={{fontSize:32,cursor:"pointer",color:s<=(hover||rating)?"#f5a623":"#ddd"}}
                onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)} onClick={()=>setRating(s)}>*</span>
            ))}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Nhan xet</div>
          <textarea value={comment} onChange={e=>setComment(e.target.value)}
            placeholder="Chia se cam nhan cua ban..."
            style={{width:"100%",minHeight:100,borderRadius:8,border:"1px solid #e0e0e0",padding:"10px 12px",fontSize:14,resize:"vertical",boxSizing:"border-box"}}/>
        </div>
        {err && <div style={{color:"#e74c3c",fontSize:13,marginBottom:12}}>{err}</div>}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"10px 24px",borderRadius:8,border:"1px solid #ddd",background:"#fff",cursor:"pointer"}}>Huy</button>
          <button onClick={handleSubmit} disabled={submitting}
            style={{padding:"10px 24px",borderRadius:8,border:"none",background:"#111",color:"#fff",cursor:"pointer",opacity:submitting?0.7:1}}>
            {submitting?"Dang gui...":"Gui danh gia"}
          </button>
        </div>
      </div>
    </div>
  , document.body);
}

function OrderCard({ order, onCancel, reviewedOrders = [] }) {
  const navigate = useNavigate();
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewed, setReviewed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const status = STATUS_MAP[order.status] ?? { label: "Không xác định", cls: "status-pending", trackStep: 0 };

  const loadDetail = async () => {
    if (detail) { setExpanded(v => !v); return; }
    setLoadingDetail(true);
    try {
      const data = await OrderService.getById(order.id);
      setDetail(data);
      setExpanded(true);
    } catch {
      alert("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return alert("Vui lòng nhập lý do hủy");
    setCancelling(true);
    try {
      await onCancel(order.id, cancelReason);
      setShowCancel(false);
      setCancelReason("");
    } finally {
      setCancelling(false);
    }
  };

  const items = detail?.items ?? [];

  return (
    <div className="order-card">
      {/* Header */}
      <div className="order-card__head">
        <div className="order-card__meta">
          <span className="order-card__id">{order.orderCode}</span>
          <span className="order-card__date">{formatDate(order.createdAt)}</span>
          <span style={{ fontSize: 11, color: "var(--gray-4)" }}>
            {order.itemCount} sản phẩm
          </span>
          {detail?.voucherCode && (
            <span style={{ fontSize: 11, color: "var(--gray-4)" }}>
              🎟 {detail.voucherCode}
            </span>
          )}
        </div>
        <span className={`order-status ${status.cls}`}>{status.label}</span>
      </div>

      {/* Tracker */}
      {order.status !== 'Cancelled' && order.status !== 'Refunded' && (
        <Tracker step={status.trackStep} />
      )}

      {/* Detail khi expanded */}
      {expanded && detail && (
        <div className="order-card__body">
          {/* Địa chỉ giao hàng */}
          <div style={{ marginBottom: 16, padding: "12px 0", borderBottom: "1px solid var(--gray-2)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-4)", marginBottom: 6 }}>
              Địa chỉ giao hàng
            </p>
            <p style={{ fontSize: 13 }}>
              <strong>{detail.shippingFullName}</strong> · {detail.shippingPhone}
            </p>
            <p style={{ fontSize: 12, color: "var(--gray-4)", marginTop: 2 }}>
              {detail.shippingStreet}, {detail.shippingWard}, {detail.shippingDistrict}, {detail.shippingProvince}
            </p>
          </div>

          {/* Sản phẩm */}
          <div className="order-items-list">
            {items.map((item) => (
              <div className="order-item" key={item.id}>
                <div className="order-item__img">
                  {getImageUrl(item.productImageUrl) ? (
                    <img
                      src={getImageUrl(item.productImageUrl)}
                      alt={item.productName}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  ) : "🛍️"}
                </div>
                <div className="order-item__info">
                  <h4 className="order-item__name">{item.productName}</h4>
                  <p style={{ fontSize: 12, color: "var(--gray-4)" }}>
                    {fmt(item.unitPrice)}₫ / sản phẩm
                  </p>
                </div>
                <span className="order-item__qty">x{item.quantity}</span>
                <span className="order-item__price">{fmt(item.totalPrice)}₫</span>
              </div>
            ))}
          </div>

          {/* Chi tiết thanh toán */}
          <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid var(--gray-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "var(--gray-4)" }}>Tạm tính</span>
              <span>{fmt(detail.subTotal)}₫</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "var(--gray-4)" }}>Phí vận chuyển</span>
              <span>{fmt(detail.shippingFee)}₫</span>
            </div>
            {detail.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "#27ae60" }}>Giảm giá</span>
                <span style={{ color: "#27ae60" }}>−{fmt(detail.discountAmount)}₫</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "var(--gray-4)" }}>Thanh toán</span>
              <span>{PAYMENT_METHOD_MAP[detail.paymentMethod] ?? "COD"} · {PAYMENT_STATUS_MAP[detail.paymentStatus] ?? ""}</span>
            </div>
            {detail.note && (
              <div style={{ fontSize: 12, color: "var(--gray-4)", marginTop: 8 }}>
                📝 Ghi chú: {detail.note}
              </div>
            )}
            {detail.cancelReason && (
              <div style={{ fontSize: 12, color: "#c0392b", marginTop: 8 }}>
                ❌ Lý do hủy: {detail.cancelReason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel form */}
      {showCancel && (
        <div style={{ padding: "16px 22px", borderTop: "1px solid var(--gray-2)", background: "#fff8f8" }}>
          <p style={{ fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Lý do hủy đơn:</p>
          <textarea
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            placeholder="Nhập lý do hủy..."
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid var(--gray-2)", fontSize: 13, resize: "vertical", minHeight: 72 }}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{ padding: "8px 20px", background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}
            >
              {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
            </button>
            <button
              onClick={() => setShowCancel(false)}
              style={{ padding: "8px 20px", background: "none", border: "1px solid var(--gray-2)", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
            >
              Quay lại
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="order-card__foot">
        <div className="order-card__total">
          <span style={{ color: "var(--gray-4)" }}>Tổng cộng:</span>
          <strong>{fmt(order.totalAmount)}₫</strong>
        </div>
        <div className="order-card__actions">
          {order.status === 'Delivered' && (
            <button className="ec-btn ec-btn-outline" style={{ padding: "8px 20px", fontSize: 11, opacity: reviewed ? 0.5 : 1, cursor: reviewed ? "not-allowed" : "pointer" }} disabled={reviewed} onClick={async () => {
                if (detail) { setReviewItem(detail.items?.[0]); return; }
                try {
                  const d = await OrderService.getById(order.id);
                  setDetail(d);
                  setReviewItem(d.items?.[0]);
                } catch {}
              }}>
              Đánh giá
            </button>
          )}
          {reviewItem && (
        <ReviewModal order={order} item={reviewItem} onClose={()=>setReviewItem(null)} onSuccess={()=>{ setReviewItem(null); setReviewed(true); }} />
      )}
      {(order.status === 'Pending' || order.status === 'Confirmed') && (
            <button
              className="ec-btn ec-btn-outline"
              style={{ padding: "8px 20px", fontSize: 11, color: "#c0392b", borderColor: "#c0392b" }}
              onClick={() => setShowCancel(v => !v)}
            >
              Hủy đơn
            </button>
          )}
          <button
            className="ec-btn ec-btn-outline"
            style={{ padding: "8px 20px", fontSize: 11 }}
            onClick={loadDetail}
            disabled={loadingDetail}
          >
            {loadingDetail ? "..." : expanded ? "Thu gọn ↑" : "Chi tiết ↓"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [tab, setTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [reviewedOrders, setReviewedOrders] = useState(() => JSON.parse(localStorage.getItem("reviewedOrders") || "[]"));
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await OrderService.getMyOrders(page, 10);
      setOrders(data.items ?? []);
      setTotalPages(Math.ceil((data.totalCount ?? data.items?.length ?? 0) / 10));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = async (id, reason) => {
    await OrderService.cancel(id, reason);
    fetchOrders();
  };

  const filtered = tab === "all"
    ? orders
    : orders.filter(o => o.status === tab);

  const tabCount = (statusId) => orders.filter(o => o.status === statusId).length;

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
                {t.id !== "all" && tabCount(t.id) > 0 && (
                  <span style={{ marginLeft: 6, color: "var(--gray-3)" }}>
                    ({tabCount(t.id)})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--gray-4)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <p>Đang tải đơn hàng...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="orders-empty">
              <div className="orders-empty__icon">📦</div>
              <h2 className="orders-empty__title">Chưa có đơn hàng</h2>
              <p className="orders-empty__sub">Bạn chưa có đơn hàng nào trong mục này.</p>
              <a href="/san-pham" className="ec-btn ec-btn-dark">Khám phá sản phẩm</a>
            </div>
          ) : (
            <>
              {filtered.map((o) => (
                <OrderCard key={o.id} order={o} onCancel={handleCancel} reviewedOrders={reviewedOrders} />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 32 }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    style={{ padding: "8px 20px", border: "1px solid var(--gray-2)", background: "none", borderRadius: 6, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1 }}
                  >
                    ← Trước
                  </button>
                  <span style={{ padding: "8px 16px", fontSize: 13, color: "var(--gray-4)" }}>
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    style={{ padding: "8px 20px", border: "1px solid var(--gray-2)", background: "none", borderRadius: 6, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}