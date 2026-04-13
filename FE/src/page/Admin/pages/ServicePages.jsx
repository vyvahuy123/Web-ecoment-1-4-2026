import { useState } from "react";

/* ══════════════════════════════════════════════════════
   REVIEWS
══════════════════════════════════════════════════════ */
const REVIEWS = [
  { user: "Nguyễn A", product: "Linen Blazer",      stars: 5, content: "Chất vải đẹp, may đo chuẩn, giao nhanh.", status: "pending" },
  { user: "Trần B",   product: "Silk Slip Dress",   stars: 4, content: "Mặc rất thoải mái, màu đẹp y hình.",     status: "pending" },
  { user: "Lê C",     product: "Structured Tote Bag",stars: 5, content: "Túi chắc chắn, khóa xịn, da mịn.",     status: "approved" },
  { user: "Phạm D",   product: "Canvas Sneakers",   stars: 3, content: "Size hơi nhỏ, nên order lên 1 size.",   status: "approved" },
];

const REVIEW_FILTERS = ["Chờ duyệt", "Đã duyệt", "Bị ẩn"];

export function ReviewsPage() {
  const [active, setActive] = useState("Chờ duyệt");

  const filtered = REVIEWS.filter((r) => {
    if (active === "Chờ duyệt") return r.status === "pending";
    if (active === "Đã duyệt")  return r.status === "approved";
    return r.status === "hidden";
  });

  return (
    <div>
      <div className="page-filter">
        {REVIEW_FILTERS.map((f) => (
          <button key={f} className={`filter-tab${active === f ? " active" : ""}`} onClick={() => setActive(f)}>{f}</button>
        ))}
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">Đánh giá sản phẩm ({filtered.length})</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Sao</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td>{r.user}</td>
                  <td>{r.product}</td>
                  <td style={{ color: "#e6a817", letterSpacing: 1 }}>{"★".repeat(r.stars)}</td>
                  <td style={{ maxWidth: 200, color: "var(--g4)", fontSize: 12, fontStyle: "italic" }}>
                    {r.content}
                  </td>
                  <td>
                    <span className={`badge ${r.status === "pending" ? "badge-pending" : "badge-active"}`}>
                      {r.status === "pending" ? "Chờ duyệt" : "Đã duyệt"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 6 }}>
                    {r.status === "pending"
                      ? <button className="btn btn-sm btn-dark">Duyệt</button>
                      : <button className="btn btn-sm btn-outline">Ẩn</button>
                    }
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--g3)", padding: "28px 20px" }}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAYMENTS
══════════════════════════════════════════════════════ */
const PAYMENTS = [
  { id: "#PAY-001", order: "#ORD-001", method: "VNPAY",  amount: "2.350.000₫", date: "10/04/2025", statusLabel: "Thành công", cls: "badge-paid" },
  { id: "#PAY-002", order: "#ORD-003", method: "COD",    amount: "1.190.000₫", date: "09/04/2025", statusLabel: "Thành công", cls: "badge-paid" },
  { id: "#PAY-003", order: "#ORD-004", method: "VNPAY",  amount: "750.000₫",   date: "08/04/2025", statusLabel: "Hoàn tiền",  cls: "badge-cancel" },
  { id: "#PAY-004", order: "#ORD-002", method: "MoMo",   amount: "890.000₫",   date: "11/04/2025", statusLabel: "Chờ TT",     cls: "badge-pending" },
  { id: "#PAY-005", order: "#ORD-005", method: "ZaloPay",amount: "1.240.000₫", date: "11/04/2025", statusLabel: "Thành công", cls: "badge-paid" },
];

const PAY_FILTERS = ["Tất cả", "Thành công", "Chờ TT", "Hoàn tiền", "Thất bại"];

export function PaymentsPage() {
  const [active, setActive] = useState("Tất cả");

  const filtered = PAYMENTS.filter((p) =>
    active === "Tất cả" ? true : p.statusLabel === active
  );

  return (
    <div>
      <div className="page-filter">
        {PAY_FILTERS.map((f) => (
          <button key={f} className={`filter-tab${active === f ? " active" : ""}`} onClick={() => setActive(f)}>{f}</button>
        ))}
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">Lịch sử thanh toán ({filtered.length})</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Mã GD</th>
                <th>Đơn hàng</th>
                <th>Phương thức</th>
                <th>Số tiền</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.id}</td>
                  <td style={{ color: "var(--g4)" }}>{p.order}</td>
                  <td>
                    <span className="badge badge-inactive">{p.method}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.amount}</td>
                  <td style={{ color: "var(--g4)" }}>{p.date}</td>
                  <td><span className={`badge ${p.cls}`}>{p.statusLabel}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════════════════════ */
const NOTIFS = [
  { icon: "📦", text: "Đơn hàng #ORD-002 cần xử lý",          time: "2 phút trước",  type: "new",  read: false },
  { icon: "⭐", text: "Review mới từ Nguyễn A chờ duyệt",      time: "15 phút trước", type: "new",  read: false },
  { icon: "✅", text: "Thanh toán #PAY-001 thành công",         time: "1 giờ trước",   type: "ok",   read: false },
  { icon: "⚠️", text: "Voucher FLASH50 còn 1 ngày hết hạn",    time: "3 giờ trước",   type: "warn", read: true },
  { icon: "🚚", text: "Đơn #ORD-003 đã được giao hàng",        time: "Hôm qua",       type: "ok",   read: true },
  { icon: "👤", text: "Người dùng mới đăng ký: Võ Thị Bích",  time: "Hôm qua",       type: "info", read: true },
];

const NOTIF_BADGE = {
  new:  { label: "Mới",     cls: "badge-new" },
  ok:   { label: "OK",      cls: "badge-active" },
  warn: { label: "Cảnh báo",cls: "badge-pending" },
  info: { label: "Thông tin",cls: "badge-inactive" },
};

const NOTIF_FILTERS = ["Tất cả", "Chưa đọc"];

export function NotificationsPage() {
  const [active, setActive] = useState("Tất cả");

  const filtered = NOTIFS.filter((n) =>
    active === "Chưa đọc" ? !n.read : true
  );

  return (
    <div>
      <div className="page-filter">
        {NOTIF_FILTERS.map((f) => (
          <button key={f} className={`filter-tab${active === f ? " active" : ""}`} onClick={() => setActive(f)}>{f}</button>
        ))}
        <div className="filter-gap" />
        <button className="btn btn-sm btn-outline">Đánh dấu đã đọc</button>
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">Thông báo hệ thống ({filtered.length})</span>
        </div>
        <div className="list-rows">
          {filtered.map((n, i) => (
            <div
              className="list-row"
              key={i}
              style={{ opacity: n.read ? 0.65 : 1 }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              <div className="list-row__main">{n.text}</div>
              <div className="list-row__time">{n.time}</div>
              <span className={`badge ${NOTIF_BADGE[n.type].cls}`}>
                {NOTIF_BADGE[n.type].label}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--g3)", padding: "28px 0", fontSize: 13 }}>
              Không có thông báo nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
