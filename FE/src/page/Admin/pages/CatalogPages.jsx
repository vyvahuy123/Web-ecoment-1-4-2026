import { useState, useEffect, useCallback } from "react";
import OrderService from "@/services/order.service";
import VoucherService from "@/services/voucher.service";
import CategoryService from "@/services/category.service";

/* ─────────────────────────────────────────────────────────────── */
/*  HELPERS                                                        */
/* ─────────────────────────────────────────────────────────────── */
function fmt(n) {
  return Number(n ?? 0).toLocaleString("vi-VN") + "₫";
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}
function fmtDatetime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN");
}

/* ─────────────────────────────────────────────────────────────── */
/*  CATEGORIES                                                     */
/* ─────────────────────────────────────────────────────────────── */
export function CategoriesPage() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const fetchCats = async () => {
    setLoading(true);
    try {
      const data = await CategoryService.getAll();
      setCats(Array.isArray(data) ? data : (data?.items ?? []));
    } catch {
      setCats([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchCats(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: "", description: "" });
    setErr("");
    setModalOpen(true);
  };
  const openEdit = (c) => {
    setEditTarget(c);
    setForm({ name: c.name, description: c.description ?? "" });
    setErr("");
    setModalOpen(true);
  };
  const handleSave = async () => {
    if (!form.name.trim()) { setErr("Vui lòng nhập tên danh mục."); return; }
    setSaving(true); setErr("");
    try {
      if (editTarget) await CategoryService.update(editTarget.id, form.name, form.description);
      else await CategoryService.create(form.name, form.description);
      setModalOpen(false);
      fetchCats();
    } catch (e) {
      setErr(e?.message ?? "Lỗi khi lưu.");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    try {
      await CategoryService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchCats();
    } catch (e) {
      alert(e?.message ?? "Xóa thất bại.");
    }
  };

  return (
    <div>
      <div className="page-filter">
        <div className="filter-gap" />
        <button className="btn btn-sm btn-dark" onClick={openCreate}>+ Thêm danh mục</button>
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">Danh mục sản phẩm ({loading ? "..." : cats.length})</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }, (_, i) => (
                  <tr key={i}>{Array.from({ length: 4 }, (_, j) => (
                    <td key={j}><div className="skeleton-line" style={{ height: 14, borderRadius: 4 }} /></td>
                  ))}</tr>
                ))
                : cats.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ color: "var(--g4)", fontSize: 13 }}>{c.description ?? "—"}</td>
                    <td><span className="badge badge-active">Hoạt động</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-icon" onClick={() => openEdit(c)}>✎</button>
                        <button className="btn btn-icon btn-icon-danger" onClick={() => setDeleteTarget(c)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-head">
              <span className="modal-title">{editTarget ? "Sửa danh mục" : "Thêm danh mục"}</span>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {err && <div className="modal-err">{err}</div>}
              <label>Tên danh mục *</label>
              <input className="modal-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="VD: Áo khoác" />
              <label>Mô tả</label>
              <textarea className="modal-input modal-textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Mô tả ngắn..." rows={3} />
            </div>
            <div className="modal-foot">
              <button className="btn btn-sm" onClick={() => setModalOpen(false)} disabled={saving}>Hủy</button>
              <button className="btn btn-sm btn-dark" onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu..." : editTarget ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-head">
              <span className="modal-title">Xác nhận xóa</span>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: "#555" }}>
                Bạn có chắc muốn xóa danh mục <strong>{deleteTarget.name}</strong>?
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn btn-sm" onClick={() => setDeleteTarget(null)}>Hủy</button>
              <button className="btn btn-sm btn-danger" onClick={handleDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  ORDERS                                                         */
/* ─────────────────────────────────────────────────────────────── */
const ORDER_STATUS_MAP = {
  Pending:             { label: "Chờ xử lý",      cls: "badge-pending" },
  Confirmed:           { label: "Đã xác nhận",     cls: "badge-shipped" },
  Processing:          { label: "Đang xử lý",      cls: "badge-shipped" },
  Shipped:             { label: "Đang giao",        cls: "badge-shipped" },
  Delivered:           { label: "Đã giao",          cls: "badge-active"  },
  Cancelled:           { label: "Đã hủy",           cls: "badge-cancel"  },
  Refunded:            { label: "Đã hoàn tiền",     cls: "badge-cancel"  },
  PendingCancellation: { label: "Chờ duyệt hủy",   cls: "badge-pending" },
};
const PAY_STATUS_MAP = {
  Unpaid:   { label: "Chưa TT",  cls: "badge-pending" },
  Paid:     { label: "Đã TT",    cls: "badge-active"  },
  Refunded: { label: "Hoàn TT",  cls: "badge-cancel"  },
  Failed:   { label: "Thất bại", cls: "badge-cancel"  },
};
const PAY_METHOD_MAP = {
  0: "COD",
  1: "Chuyển khoản",
  2: "VNPay",
  3: "MoMo",
  4: "ZaloPay",
};
const STATUS_MAP_TO_INT = { Pending: 0, Confirmed: 1, Processing: 2, Shipped: 3, Delivered: 4, Cancelled: 5 };
const STATUS_TRANSITIONS = {
  Pending:    ["Confirmed", "Cancelled"],
  Confirmed:  ["Processing", "Cancelled"],
  Processing: ["Shipped"],
  Shipped:    ["Delivered"],
};
const ALL_FILTERS = [
  { key: "all",                label: "Tất cả" },
  { key: "Pending",            label: "Chờ xử lý" },
  { key: "Confirmed",          label: "Đã xác nhận" },
  { key: "Processing",         label: "Đang xử lý" },
  { key: "Shipped",            label: "Đang giao" },
  { key: "Delivered",          label: "Đã giao" },
  { key: "PendingCancellation",label: "Chờ duyệt hủy" },
  { key: "Cancelled",          label: "Đã hủy" },
  { key: "Refunded",           label: "Đã hoàn tiền" },
];

export function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [page, setPage]                 = useState(1);
  const [totalCount, setTotalCount]     = useState(0);
  const pageSize = 15;

  // Detail modal
  const [detailOrder, setDetailOrder]   = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status modal
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus]       = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusErr, setStatusErr]       = useState("");

  // Approve cancellation
  const [approveTarget, setApproveTarget] = useState(null);
  const [approveSaving, setApproveSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = { page, pageSize };
      if (activeFilter !== "all") params.status = activeFilter;
      const data = await OrderService.getAll(params);
      setOrders(Array.isArray(data) ? data : (data?.items ?? []));
      setTotalCount(data?.totalCount ?? data?.total ?? 0);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? "Lỗi tải đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Reset page khi đổi filter
  useEffect(() => { setPage(1); }, [activeFilter]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetailOrder({ _loading: true });
    try {
      const data = await OrderService.getById(id);
      setDetailOrder(data);
    } catch {
      setDetailOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const openStatusModal = (o) => {
    setStatusTarget(o);
    const transitions = STATUS_TRANSITIONS[o.status] ?? [];
    setNewStatus(transitions[0] ?? "");
    setStatusErr("");
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setStatusSaving(true); setStatusErr("");
    try {
      await OrderService.updateStatus(statusTarget.id, STATUS_MAP_TO_INT[newStatus] ?? newStatus);
      setStatusTarget(null);
      fetchOrders();
    } catch (e) {
      setStatusErr(e?.response?.data?.message ?? e?.message ?? "Lỗi cập nhật.");
    } finally {
      setStatusSaving(false);
    }
  };

  const handleApproveCancellation = async () => {
    setApproveSaving(true);
    try {
      await OrderService.approveCancellation(approveTarget.id);
      setApproveTarget(null);
      fetchOrders();
    } catch (e) {
      alert(e?.response?.data?.message ?? "Lỗi duyệt hủy.");
    } finally {
      setApproveSaving(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      {/* Filter tabs */}
      <div className="page-filter" style={{ flexWrap: "wrap", gap: 4 }}>
        {ALL_FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-tab${activeFilter === f.key ? " active" : ""}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card__head">
          <span className="card__title">
            Đơn hàng ({loading ? "..." : totalCount})
          </span>
        </div>

        {error && (
          <div style={{ padding: "16px 24px", color: "var(--red-text)", fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>SL</th>
                <th>Tổng tiền</th>
                <th>Voucher</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }, (_, j) => (
                      <td key={j}><div className="skeleton-line" style={{ height: 14, borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
                : orders.map((o) => {
                  const st  = ORDER_STATUS_MAP[o.status]        ?? { label: o.status,        cls: "badge-inactive" };
                  const pay = PAY_STATUS_MAP[o.paymentStatus]   ?? { label: o.paymentStatus, cls: "badge-inactive" };
                  const canChangeStatus = !!STATUS_TRANSITIONS[o.status]?.length;
                  const canApproveCancellation = o.status === "PendingCancellation";

                  return (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 13 }}>
                        #{o.orderCode ?? o.id?.slice(0, 8).toUpperCase()}
                      </td>
                      <td style={{ color: "var(--g4)", fontSize: 13 }}>{fmtDate(o.createdAt)}</td>
                      <td>{o.itemCount ?? "—"} SP</td>
                      <td style={{ fontWeight: 500 }}>{fmt(o.totalAmount)}</td>
                      <td style={{ color: o.voucherCode ? "inherit" : "var(--g3)", fontFamily: "monospace", fontSize: 12 }}>
                        {o.voucherCode ?? "—"}
                      </td>
                      <td><span className={`badge ${pay.cls}`}>{pay.label}</span></td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn btn-icon" title="Xem chi tiết" onClick={() => openDetail(o.id)}>👁</button>
                          {canApproveCancellation && (
                            <button className="btn btn-icon" title="Duyệt hủy" style={{ color: "var(--red-text)" }} onClick={() => setApproveTarget(o)}>✓</button>
                          )}
                          {canChangeStatus && !canApproveCancellation && (
                            <button className="btn btn-icon" title="Cập nhật trạng thái" onClick={() => openStatusModal(o)}>✎</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "16px 24px" }}>
            <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? <span key={i} style={{ padding: "0 4px", color: "var(--g3)" }}>…</span>
                  : <button key={p} className={`btn btn-sm${page === p ? " btn-dark" : ""}`} onClick={() => setPage(p)}>{p}</button>
              )}
            <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680, maxHeight: "85vh", overflowY: "auto" }}>
            <div className="modal-head">
              <span className="modal-title">
                Chi tiết đơn #{detailOrder.orderCode ?? detailOrder.id?.slice(0, 8).toUpperCase()}
              </span>
              <button className="modal-close" onClick={() => setDetailOrder(null)}>✕</button>
            </div>

            {detailOrder._loading ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--g3)" }}>Đang tải...</div>
            ) : (
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Info row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <InfoBlock label="Trạng thái">
                    <span className={`badge ${ORDER_STATUS_MAP[detailOrder.status]?.cls ?? "badge-inactive"}`}>
                      {ORDER_STATUS_MAP[detailOrder.status]?.label ?? detailOrder.status}
                    </span>
                  </InfoBlock>
                  <InfoBlock label="Thanh toán">
                    <span className={`badge ${PAY_STATUS_MAP[detailOrder.paymentStatus]?.cls ?? "badge-inactive"}`}>
                      {PAY_STATUS_MAP[detailOrder.paymentStatus]?.label ?? detailOrder.paymentStatus}
                    </span>
                    <span style={{ marginLeft: 6, fontSize: 12, color: "var(--g4)" }}>
                      {PAY_METHOD_MAP[detailOrder.paymentMethod] ?? detailOrder.paymentMethod}
                    </span>
                  </InfoBlock>
                  <InfoBlock label="Ngày đặt">{fmtDatetime(detailOrder.createdAt)}</InfoBlock>
                  <InfoBlock label="Ngày TT">{fmtDatetime(detailOrder.paidAt)}</InfoBlock>
                  <InfoBlock label="Ngày giao">{fmtDatetime(detailOrder.shippedAt)}</InfoBlock>
                  <InfoBlock label="Ngày nhận">{fmtDatetime(detailOrder.deliveredAt)}</InfoBlock>
                </div>

                {/* Shipping */}
                <div style={{ background: "var(--bg2, #f5f5f5)", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g3)", letterSpacing: "0.08em", marginBottom: 8 }}>ĐỊA CHỈ GIAO HÀNG</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{detailOrder.shippingFullName} — {detailOrder.shippingPhone}</div>
                  <div style={{ fontSize: 13, color: "var(--g4)", marginTop: 2 }}>
                    {detailOrder.shippingStreet}, {detailOrder.shippingWard}, {detailOrder.shippingDistrict}, {detailOrder.shippingProvince}
                  </div>
                  {detailOrder.note && (
                    <div style={{ fontSize: 12, color: "var(--g3)", marginTop: 4 }}>Ghi chú: {detailOrder.note}</div>
                  )}
                  {detailOrder.cancelReason && (
                    <div style={{ fontSize: 12, color: "var(--red-text)", marginTop: 4 }}>Lý do hủy: {detailOrder.cancelReason}</div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g3)", letterSpacing: "0.08em", marginBottom: 8 }}>SẢN PHẨM</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(detailOrder.items ?? []).map((item) => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border, #eee)" }}>
                        {item.productImageUrl && (
                          <img src={item.productImageUrl} alt={item.productName} style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", background: "#f0f0f0" }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{item.productName}</div>
                          <div style={{ fontSize: 12, color: "var(--g4)" }}>x{item.quantity} × {fmt(item.unitPrice)}</div>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{fmt(item.totalPrice)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <SumRow label="Tạm tính" value={fmt(detailOrder.subTotal)} />
                  <SumRow label="Phí vận chuyển" value={fmt(detailOrder.shippingFee)} />
                  {detailOrder.discountAmount > 0 && (
                    <SumRow label={`Voucher (${detailOrder.voucherCode})`} value={`-${fmt(detailOrder.discountAmount)}`} highlight />
                  )}
                  <SumRow label="Tổng cộng" value={fmt(detailOrder.totalAmount)} bold />
                </div>
              </div>
            )}

            <div className="modal-foot">
              <button className="btn btn-sm" onClick={() => setDetailOrder(null)}>Đóng</button>
              {!detailOrder._loading && STATUS_TRANSITIONS[detailOrder.status]?.length > 0 && (
                <button className="btn btn-sm btn-dark" onClick={() => { setDetailOrder(null); openStatusModal(detailOrder); }}>
                  Cập nhật trạng thái
                </button>
              )}
              {!detailOrder._loading && detailOrder.status === "PendingCancellation" && (
                <button className="btn btn-sm btn-danger" onClick={() => { setDetailOrder(null); setApproveTarget(detailOrder); }}>
                  Duyệt hủy đơn
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Update Status Modal ── */}
      {statusTarget && (
        <div className="modal-overlay" onClick={() => setStatusTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-head">
              <span className="modal-title">Cập nhật trạng thái</span>
              <button className="modal-close" onClick={() => setStatusTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              {statusErr && <div className="modal-err">{statusErr}</div>}
              <div style={{ fontSize: 13, color: "var(--g4)", marginBottom: 12 }}>
                Đơn: <strong>#{statusTarget.orderCode ?? statusTarget.id?.slice(0, 8).toUpperCase()}</strong>
              </div>
              <label>Trạng thái mới *</label>
              <select className="modal-input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {(STATUS_TRANSITIONS[statusTarget.status] ?? []).map((s) => (
                  <option key={s} value={s}>{ORDER_STATUS_MAP[s]?.label ?? s}</option>
                ))}
              </select>
            </div>
            <div className="modal-foot">
              <button className="btn btn-sm" onClick={() => setStatusTarget(null)} disabled={statusSaving}>Hủy</button>
              <button className="btn btn-sm btn-dark" onClick={handleUpdateStatus} disabled={statusSaving || !newStatus}>
                {statusSaving ? "Đang lưu..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Cancellation Modal ── */}
      {approveTarget && (
        <div className="modal-overlay" onClick={() => setApproveTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-head">
              <span className="modal-title">Duyệt hủy đơn hàng</span>
              <button className="modal-close" onClick={() => setApproveTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: "#555" }}>
                Xác nhận duyệt yêu cầu hủy đơn <strong>#{approveTarget.orderCode ?? approveTarget.id?.slice(0, 8).toUpperCase()}</strong>?
              </p>
              {approveTarget.cancelReason && (
                <p style={{ fontSize: 13, color: "var(--g4)", marginTop: 8 }}>
                  Lý do: <em>{approveTarget.cancelReason}</em>
                </p>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn btn-sm" onClick={() => setApproveTarget(null)} disabled={approveSaving}>Hủy</button>
              <button className="btn btn-sm btn-danger" onClick={handleApproveCancellation} disabled={approveSaving}>
                {approveSaving ? "Đang xử lý..." : "Xác nhận duyệt hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* small helpers */
function InfoBlock({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g3)", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13 }}>{children}</div>
    </div>
  );
}
function SumRow({ label, value, bold, highlight }) {
  return (
    <div style={{ display: "flex", gap: 24, fontSize: bold ? 15 : 13, fontWeight: bold ? 700 : 400, color: highlight ? "var(--red-text, #e53)" : "inherit" }}>
      <span style={{ color: "var(--g4)", minWidth: 140, textAlign: "right" }}>{label}</span>
      <span style={{ minWidth: 100, textAlign: "right" }}>{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  VOUCHERS                                                       */
/* ─────────────────────────────────────────────────────────────── */
const VOUCHER_FILTERS = ["Tất cả", "Còn hạn", "Sắp hết", "Hết hạn", "Chưa bắt đầu"];

function getVoucherStatus(v) {
  const now = new Date();
  const start = new Date(v.startDate);
  const end   = new Date(v.endDate);
  if (now < start) return "Chưa bắt đầu";
  if (now > end)   return "Hết hạn";
  const diffDays = Math.ceil((end - now) / 86400000);
  if (diffDays <= 3) return "Sắp hết";
  return "Còn hạn";
}
const VOUCHER_CLS = {
  "Còn hạn":       "badge-active",
  "Sắp hết":       "badge-pending",
  "Hết hạn":       "badge-cancel",
  "Chưa bắt đầu":  "badge-inactive",
};

const EMPTY_VOUCHER_FORM = {
  code: "", type: "Percentage", discountValue: "", maxDiscountAmount: "",
  minOrderAmount: "", totalQuantity: "", maxUsagePerUser: 1,
  startDate: "", endDate: "", isActive: true, description: "",
};

export function VouchersPage() {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [vouchers, setVouchers]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]               = useState(EMPTY_VOUCHER_FORM);
  const [saving, setSaving]           = useState(false);
  const [formErr, setFormErr]         = useState("");

  const fetchVouchers = async () => {
    setLoading(true); setError("");
    try {
      const data = await VoucherService.getAll();
      setVouchers(Array.isArray(data) ? data : (data?.items ?? []));
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? "Lỗi tải voucher.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchVouchers(); }, []);

  const withStatus = vouchers.map((v) => ({ ...v, _status: getVoucherStatus(v) }));
  const filtered   = withStatus.filter((v) => activeFilter === "Tất cả" || v._status === activeFilter);

  const openCreate = () => {
  setEditTarget(null);
  setForm(EMPTY_VOUCHER_FORM);
  setFormErr("");
  setModalOpen(true);
  setTimeout(() => { document.querySelector(".modal-box")?.scrollTo(0, 0); }, 50);
};
  const openEdit = (v) => {
    setEditTarget(v);
    setForm({
      code:             v.code,
      type:             v.type,
      discountValue:    v.discountValue,
      maxDiscountAmount:v.maxDiscountAmount ?? "",
      minOrderAmount:   v.minOrderAmount,
      totalQuantity:    v.totalQuantity,
      maxUsagePerUser:  v.maxUsagePerUser,
      startDate:        v.startDate?.slice(0, 10) ?? "",
      endDate:          v.endDate?.slice(0, 10)   ?? "",
      isActive:         v.isActive,
      description:      v.description ?? "",
    });
    setFormErr("");
    setModalOpen(true);
    setTimeout(() => { document.querySelector(".modal-box")?.scrollTo(0, 0); }, 50);
  };

  const validateForm = () => {
    if (!form.code.trim())          return "Vui lòng nhập mã voucher.";
    if (!form.discountValue)        return "Vui lòng nhập giá trị giảm.";
    if (!form.totalQuantity)        return "Vui lòng nhập số lượng.";
    if (!form.startDate)            return "Vui lòng chọn ngày bắt đầu.";
    if (!form.endDate)              return "Vui lòng chọn ngày kết thúc.";
    if (new Date(form.endDate) <= new Date(form.startDate)) return "Ngày kết thúc phải sau ngày bắt đầu.";
    return "";
  };

  const handleSave = async () => {
    const e = validateForm();
    if (e) { setFormErr(e); return; }
    setSaving(true); setFormErr("");
    const payload = {
      ...form,
      discountValue:     Number(form.discountValue),
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      minOrderAmount:    Number(form.minOrderAmount || 0),
      totalQuantity:     Number(form.totalQuantity),
      maxUsagePerUser:   Number(form.maxUsagePerUser || 1),
    };
    try {
      if (editTarget) await VoucherService.update(editTarget.id, payload);
      else            await VoucherService.create(payload);
      setModalOpen(false);
      fetchVouchers();
    } catch (err) {
      setFormErr(err?.response?.data?.message ?? err?.message ?? "Lỗi khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await VoucherService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchVouchers();
    } catch (e) {
      alert(e?.response?.data?.message ?? "Xóa thất bại.");
    }
  };

  const f = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div>
      <div className="page-filter">
        {VOUCHER_FILTERS.map((ft) => (
          <button key={ft} className={`filter-tab${activeFilter === ft ? " active" : ""}`} onClick={() => setActiveFilter(ft)}>{ft}</button>
        ))}
        <div className="filter-gap" />
        <button className="btn btn-sm btn-dark" onClick={openCreate}>+ Tạo voucher</button>
      </div>

      <div className="card">
        <div className="card__head">
          <span className="card__title">Voucher ({loading ? "..." : filtered.length})</span>
        </div>

        {error && (
          <div style={{ padding: "16px 24px", color: "var(--red-text)", fontSize: 14 }}>⚠️ {error}</div>
        )}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th>Đã dùng / Tổng</th>
                <th>Hiệu lực</th>
                <th>Trạng thái</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }, (_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }, (_, j) => (
                    <td key={j}><div className="skeleton-line" style={{ height: 14, borderRadius: 4 }} /></td>
                  ))}</tr>
                ))
                : filtered.map((v) => (
                  <tr key={v.id ?? v.code}>
                    <td style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>{v.code}</td>
                    <td style={{ color: "var(--g4)" }}>{v.type === "Percentage" ? "Phần trăm" : "Cố định"}</td>
                    <td style={{ fontWeight: 500 }}>
                      {v.type === "Percentage"
                        ? `${v.discountValue}%${v.maxDiscountAmount ? ` (tối đa ${fmt(v.maxDiscountAmount)})` : ""}`
                        : fmt(v.discountValue)}
                    </td>
                    <td>{v.minOrderAmount > 0 ? fmt(v.minOrderAmount) : "—"}</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{v.usedQuantity}</span>
                      <span style={{ color: "var(--g3)" }}> / {v.totalQuantity}</span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--g4)" }}>
                      {fmtDate(v.startDate)} → {fmtDate(v.endDate)}
                    </td>
                    <td>
                      <span className={`badge ${VOUCHER_CLS[v._status] ?? "badge-inactive"}`}>{v._status}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-icon" onClick={() => openEdit(v)}>✎</button>
                        <button className="btn btn-icon btn-icon-danger" onClick={() => setDeleteTarget(v)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div className="modal-head">
              <span className="modal-title">{editTarget ? "Sửa voucher" : "Tạo voucher mới"}</span>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {formErr && <div className="modal-err">{formErr}</div>}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label>Mã voucher *</label>
                  <input className="modal-input" value={form.code} onChange={f("code")} placeholder="VD: SUMMER20" style={{ textTransform: "uppercase" }} />
                </div>
                <div>
                  <label>Loại giảm giá *</label>
                  <select className="modal-input" value={form.type} onChange={f("type")}>
                    <option value="Percentage">Phần trăm (%)</option>
                    <option value="FixedAmount">Số tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label>Giá trị giảm * {form.type === "Percentage" ? "(%)" : "(₫)"}</label>
                  <input className="modal-input" type="number" min="0" value={form.discountValue} onChange={f("discountValue")} placeholder={form.type === "Percentage" ? "VD: 20" : "VD: 50000"} />
                </div>
                {form.type === "Percentage" && (
                  <div>
                    <label>Giảm tối đa (₫)</label>
                    <input className="modal-input" type="number" min="0" value={form.maxDiscountAmount} onChange={f("maxDiscountAmount")} placeholder="VD: 200000" />
                  </div>
                )}
                <div>
                  <label>Đơn tối thiểu (₫)</label>
                  <input className="modal-input" type="number" min="0" value={form.minOrderAmount} onChange={f("minOrderAmount")} placeholder="0 = không giới hạn" />
                </div>
                <div>
                  <label>Số lượng *</label>
                  <input className="modal-input" type="number" min="1" value={form.totalQuantity} onChange={f("totalQuantity")} placeholder="VD: 100" />
                </div>
                <div>
                  <label>Số lần dùng / user</label>
                  <input className="modal-input" type="number" min="1" value={form.maxUsagePerUser} onChange={f("maxUsagePerUser")} />
                </div>
                <div>
                  <label>Ngày bắt đầu *</label>
                  <input className="modal-input" type="date" value={form.startDate} onChange={f("startDate")} />
                </div>
                <div>
                  <label>Ngày kết thúc *</label>
                  <input className="modal-input" type="date" value={form.endDate} onChange={f("endDate")} />
                </div>
              </div>

              <div>
                <label>Mô tả</label>
                <textarea className="modal-input modal-textarea" value={form.description} onChange={f("description")} placeholder="Mô tả ngắn về voucher..." rows={2} />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                <input type="checkbox" checked={form.isActive} onChange={f("isActive")} />
                Kích hoạt ngay
              </label>
            </div>
            <div className="modal-foot">
              <button className="btn btn-sm" onClick={() => setModalOpen(false)} disabled={saving}>Hủy</button>
              <button className="btn btn-sm btn-dark" onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu..." : editTarget ? "Cập nhật" : "Tạo voucher"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-head">
              <span className="modal-title">Xác nhận xóa</span>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: "#555" }}>
                Bạn có chắc muốn xóa voucher <strong>{deleteTarget.code}</strong>?
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn btn-sm" onClick={() => setDeleteTarget(null)}>Hủy</button>
              <button className="btn btn-sm btn-danger" onClick={handleDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}