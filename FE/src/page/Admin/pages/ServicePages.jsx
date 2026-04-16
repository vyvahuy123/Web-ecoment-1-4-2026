import { useState } from "react";
import ReviewService       from "@/services/review.service";
import PaymentService      from "@/services/payment.service";
import NotificationService from "@/services/notification.service";
import { useFetch } from "@/hooks/useFetch";

/* ── REVIEWS ──────────────────────────────────────────────────── */
const REVIEW_FILTERS = ["Chờ duyệt", "Đã duyệt", "Bị ẩn"];

export function ReviewsPage() {
  const [active, setActive] = useState("Chờ duyệt");
  const { data, loading, error, refetch } = useFetch(() => ReviewService.getAll(), []);
  const reviews = Array.isArray(data) ? data : (data?.items ?? []);

  const filtered = reviews.filter((r) => {
    if (active === "Chờ duyệt") return r.status === "pending";
    if (active === "Đã duyệt")  return r.status === "approved";
    return r.status === "hidden";
  });

  const handleApprove = async (id) => {
    await ReviewService.approve(id);
    refetch();
  };
  const handleHide = async (id) => {
    await ReviewService.hide(id);
    refetch();
  };

  return (
    <div>
      <div className="page-filter">
        {REVIEW_FILTERS.map((f) => (
          <button key={f} className={`filter-tab${active === f ? " active" : ""}`}
            onClick={() => setActive(f)}>{f}</button>
        ))}
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">Đánh giá ({loading ? "..." : filtered.length})</span>
        </div>
        {error && <div style={{ padding: "16px 24px", color: "var(--red-text)", fontSize: 14 }}>⚠️ {error}</div>}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Khách hàng</th><th>Sản phẩm</th><th>Sao</th>
                <th>Nội dung</th><th>Trạng thái</th><th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }, (_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }, (_, j) => (
                      <td key={j}><div className="skeleton-line" style={{ height: 14, borderRadius: 4 }} /></td>
                    ))}</tr>
                  ))
                : filtered.map((r) => (
                    <tr key={r.id}>
                      <td>{r.userName ?? r.user?.name}</td>
                      <td>{r.productName ?? r.product?.name}</td>
                      <td style={{ color: "#e6a817", letterSpacing: 1 }}>{"★".repeat(r.rating ?? r.stars ?? 0)}</td>
                      <td style={{ maxWidth: 200, color: "var(--g4)", fontSize: 12, fontStyle: "italic" }}>{r.content}</td>
                      <td>
                        <span className={`badge ${r.status === "pending" ? "badge-pending" : "badge-active"}`}>
                          {r.status === "pending" ? "Chờ duyệt" : "Đã duyệt"}
                        </span>
                      </td>
                      <td>
                        {r.status === "pending"
                          ? <button className="btn btn-sm btn-dark" onClick={() => handleApprove(r.id)}>Duyệt</button>
                          : <button className="btn btn-sm btn-outline" onClick={() => handleHide(r.id)}>Ẩn</button>
                        }
                      </td>
                    </tr>
                  ))
              }
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--g3)", padding: "28px 20px" }}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── PAYMENTS ─────────────────────────────────────────────────── */
const PAY_FILTERS = ["Tất cả", "Thành công", "Chờ TT", "Hoàn tiền", "Thất bại"];
const PAY_STATUS = {
  success:  { label: "Thành công", cls: "badge-paid"    },
  pending:  { label: "Chờ TT",     cls: "badge-pending" },
  refunded: { label: "Hoàn tiền",  cls: "badge-cancel"  },
  failed:   { label: "Thất bại",   cls: "badge-cancel"  },
};

export function PaymentsPage() {
  const [active, setActive] = useState("Tất cả");
  const { data, loading, error } = useFetch(() => PaymentService.getAll(), []);
  const payments = Array.isArray(data) ? data : (data?.items ?? []);

  const filtered = payments.filter((p) => {
    if (active === "Tất cả") return true;
    return PAY_STATUS[p.status]?.label === active;
  });

  return (
    <div>
      <div className="page-filter">
        {PAY_FILTERS.map((f) => (
          <button key={f} className={`filter-tab${active === f ? " active" : ""}`}
            onClick={() => setActive(f)}>{f}</button>
        ))}
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">Lịch sử thanh toán ({loading ? "..." : filtered.length})</span>
        </div>
        {error && <div style={{ padding: "16px 24px", color: "var(--red-text)", fontSize: 14 }}>⚠️ {error}</div>}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Mã GD</th><th>Đơn hàng</th><th>Phương thức</th>
                <th>Số tiền</th><th>Ngày</th><th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }, (_, j) => (
                      <td key={j}><div className="skeleton-line" style={{ height: 14, borderRadius: 4 }} /></td>
                    ))}</tr>
                  ))
                : filtered.map((p) => {
                    const st = PAY_STATUS[p.status] ?? { label: p.status, cls: "badge-inactive" };
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>#{p.id ?? p.transactionId}</td>
                        <td style={{ color: "var(--g4)" }}>#{p.orderId ?? p.orderCode}</td>
                        <td><span className="badge badge-inactive">{p.method ?? p.paymentMethod}</span></td>
                        <td style={{ fontWeight: 500 }}>{Number(p.amount).toLocaleString("vi-VN")}₫</td>
                        <td style={{ color: "var(--g4)" }}>
                          {new Date(p.createdAt ?? p.date).toLocaleDateString("vi-VN")}
                        </td>
                        <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── NOTIFICATIONS ────────────────────────────────────────────── */
const NOTIF_BADGE = {
  new:  { label: "Mới",      cls: "badge-new"      },
  ok:   { label: "OK",       cls: "badge-active"   },
  warn: { label: "Cảnh báo", cls: "badge-pending"  },
  info: { label: "Thông tin",cls: "badge-inactive" },
};
const NOTIF_FILTERS = ["Tất cả", "Chưa đọc"];

export function NotificationsPage() {
  const [active, setActive] = useState("Tất cả");
  const { data, loading, error, refetch } = useFetch(() => NotificationService.getAll(), []);
  const notifs = Array.isArray(data) ? data : (data?.items ?? []);

  const filtered = notifs.filter((n) =>
    active === "Chưa đọc" ? !n.isRead && !n.read : true
  );

  const handleMarkAll = async () => {
    await NotificationService.markAllRead();
    refetch();
  };

  return (
    <div>
      <div className="page-filter">
        {NOTIF_FILTERS.map((f) => (
          <button key={f} className={`filter-tab${active === f ? " active" : ""}`}
            onClick={() => setActive(f)}>{f}</button>
        ))}
        <div className="filter-gap" />
        <button className="btn btn-sm btn-outline" onClick={handleMarkAll}>Đánh dấu đã đọc</button>
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">Thông báo ({loading ? "..." : filtered.length})</span>
        </div>
        {error && <div style={{ padding: "16px 24px", color: "var(--red-text)", fontSize: 14 }}>⚠️ {error}</div>}
        <div className="list-rows">
          {loading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="list-row">
                  <div className="skeleton-line" style={{ height: 14, borderRadius: 4, flex: 1 }} />
                </div>
              ))
            : filtered.map((n) => {
                const badge = NOTIF_BADGE[n.type] ?? NOTIF_BADGE.info;
                return (
                  <div key={n.id} className="list-row" style={{ opacity: (n.isRead || n.read) ? 0.65 : 1 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon ?? "🔔"}</span>
                    <div className="list-row__main">{n.message ?? n.text}</div>
                    <div className="list-row__time">{n.createdAt
                      ? new Date(n.createdAt).toLocaleString("vi-VN")
                      : n.time}
                    </div>
                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  </div>
                );
              })
          }
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--g3)", padding: "28px 0", fontSize: 13 }}>
              Không có thông báo nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}