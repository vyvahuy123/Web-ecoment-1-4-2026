import { useState } from "react";
import ReviewService       from "@/services/review.service";
import PaymentService      from "@/services/payment.service";
import NotificationService from "@/services/notification.service";
import { useFetch } from "@/hooks/useFetch";

/* ── REVIEWS ──────────────────────────────────────────────────── */
export function ReviewsPage() {
  const [active, setActive] = useState('Tat ca');
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const { data, loading, error, refetch } = useFetch(() => ReviewService.getAll(), []);
  const reviews = Array.isArray(data) ? data : (data?.items ?? []);

  const filtered = reviews.filter((r) => {
    if (active === 'Chua phan hoi') return !r.adminReply;
    if (active === 'Da phan hoi') return !!r.adminReply;
    return true;
  });

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      await ReviewService.reply(id, replyText.trim());
      setReplyingId(null);
      setReplyText('');
      refetch();
    } catch (e) { console.error(e); }
    finally { setReplyLoading(false); }
  };

  return (
    <div>
      <div className='page-filter'>
        {['Tat ca', 'Chua phan hoi', 'Da phan hoi'].map((f) => (
          <button key={f} className={'filter-tab' + (active === f ? ' active' : '')} onClick={() => setActive(f)}>{f}</button>
        ))}
      </div>
      <div className='card'>
        <div className='card__head'>
          <span className='card__title'>Danh gia ({loading ? '...' : filtered.length})</span>
        </div>
        {error && <div style={{ padding: '16px 24px', color: 'var(--red-text)', fontSize: 14 }}>loi {error}</div>}
        <div className='table-wrap'>
          <table className='table'>
            <thead>
              <tr>
                <th>Khach hang</th><th>San pham</th><th>Sao</th><th>Noi dung</th><th>Phan hoi admin</th><th>Hanh dong</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 4 }, (_, i) => (
                <tr key={i}>{Array.from({ length: 6 }, (_, j) => (
                  <td key={j}><div className='skeleton-line' style={{ height: 14, borderRadius: 4 }} /></td>
                ))}</tr>
              )) : filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.userName}</td>
                  <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.productName}</td>
                  <td style={{ color: '#e6a817' }}>{'star'.repeat(r.rating ?? 0).split('').map(() => '*').join('')}{r.rating ?? 0} sao</td>
                  <td style={{ maxWidth: 160, color: 'var(--g4)', fontSize: 12, fontStyle: 'italic' }}>{r.comment}</td>
                  <td style={{ maxWidth: 200 }}>
                    {replyingId === r.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <textarea rows={2} value={replyText} onChange={e => setReplyText(e.target.value)}
                          placeholder='Nhap phan hoi...'
                          style={{ width: '100%', fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', resize: 'none' }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className='btn btn-sm btn-dark' disabled={replyLoading} onClick={() => handleReply(r.id)}>{replyLoading ? '...' : 'Gui'}</button>
                          <button className='btn btn-sm btn-outline' onClick={() => { setReplyingId(null); setReplyText(''); }}>Huy</button>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: r.adminReply ? 'var(--g4)' : '#bbb', fontStyle: r.adminReply ? 'normal' : 'italic' }}>
                        {r.adminReply ?? 'Chua phan hoi'}
                      </span>
                    )}
                  </td>
                  <td>
                    <button className='btn btn-sm btn-dark' onClick={() => { setReplyingId(r.id); setReplyText(r.adminReply ?? ''); }}>
                      {r.adminReply ? 'Sua' : 'Phan hoi'}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--g3)', padding: '28px 20px' }}>Khong co du lieu</td></tr>
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

export function NotificationsPage({ onNavigate }) {
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
                  <div key={n.id} className="list-row" style={{ cursor: "pointer" }} onClick={() => { if (n.type === "Order") onNavigate?.("orders"); }} style={{ opacity: (n.isRead || n.read) ? 0.65 : 1 }}>
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