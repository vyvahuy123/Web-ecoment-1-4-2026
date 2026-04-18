import { useState, useEffect } from "react";
import OrderService from "@/services/order.service";
import VoucherService from "@/services/voucher.service";
import { useFetch } from "@/hooks/useFetch";


/* ── CATEGORIES (nếu có API) ──────────────────────────────────── */
import CategoryService from "@/services/category.service";

export function CategoriesPage() {
  const [cats, setCats]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]             = useState({ name: "", description: "" });
  const [saving, setSaving]         = useState(false);
  const [err, setErr]               = useState("");

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
      if (editTarget) {
        await CategoryService.update(editTarget.id, form.name, form.description);
      } else {
        await CategoryService.create(form.name, form.description);
      }
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
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal thêm/sửa */}
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

      {/* Modal xác nhận xóa */}
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

/* ── ORDERS ───────────────────────────────────────────────────── */
const ORDER_FILTERS = [
  "Tất cả",
  "Chờ xử lý",
  "Đang giao",
  "Hoàn tất",
  "Đã hủy",
];

// Map trạng thái backend → label hiển thị (tuỳ chỉnh theo API của bạn)
const ORDER_STATUS = {
  pending: { label: "Chờ xử lý", cls: "badge-pending" },
  shipping: { label: "Đang giao", cls: "badge-shipped" },
  completed: { label: "Hoàn tất", cls: "badge-active" },
  cancelled: { label: "Đã hủy", cls: "badge-cancel" },
};
const PAY_STATUS = {
  paid: { label: "Đã TT", cls: "badge-paid" },
  pending: { label: "Chờ TT", cls: "badge-pending" },
  refunded: { label: "Hoàn TT", cls: "badge-cancel" },
};

export function OrdersPage() {
  const [active, setActive] = useState("Tất cả");
  const { data, loading, error, refetch } = useFetch(
    () => OrderService.getAll(),
    [],
  );
  const orders = Array.isArray(data) ? data : (data?.items ?? []);

  const filtered = orders.filter((o) => {
    if (active === "Tất cả") return true;
    return ORDER_STATUS[o.status]?.label === active;
  });

  return (
    <div>
      <div className="page-filter">
        {ORDER_FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-tab${active === f ? " active" : ""}`}
            onClick={() => setActive(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">
            Đơn hàng ({loading ? "..." : filtered.length})
          </span>
        </div>
        {error && (
          <div
            style={{
              padding: "16px 24px",
              color: "var(--red-text)",
              fontSize: 14,
            }}
          >
            ⚠️ {error}
          </div>
        )}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>SL</th>
                <th>Tổng tiền</th>
                <th>Voucher</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }, (_, j) => (
                        <td key={j}>
                          <div
                            className="skeleton-line"
                            style={{ height: 14, borderRadius: 4 }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((o) => {
                    const st = ORDER_STATUS[o.status] ?? {
                      label: o.status,
                      cls: "badge-inactive",
                    };
                    const pay = PAY_STATUS[o.payStatus ?? o.paymentStatus] ?? {
                      label: "—",
                      cls: "badge-inactive",
                    };
                    return (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 500 }}>
                          #{o.id ?? o.orderCode}
                        </td>
                        <td>{o.customerName ?? o.customer?.name}</td>
                        <td>{o.itemCount ?? o.items?.length ?? "—"} SP</td>
                        <td style={{ fontWeight: 500 }}>
                          {Number(o.total ?? o.totalAmount).toLocaleString(
                            "vi-VN",
                          )}
                          ₫
                        </td>
                        <td
                          style={{
                            color: o.voucherCode ? "inherit" : "var(--g3)",
                          }}
                        >
                          {o.voucherCode ?? "—"}
                        </td>
                        <td>
                          <span className={`badge ${pay.cls}`}>
                            {pay.label}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${st.cls}`}>{st.label}</span>
                        </td>
                        <td>
                          <button className="btn btn-icon">✎</button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── VOUCHERS ─────────────────────────────────────────────────── */
const VOUCHER_FILTERS = ["Tất cả", "Còn hạn", "Sắp hết", "Hết hạn"];

function getVoucherStatus(v) {
  if (v.statusLabel) return v.statusLabel; // nếu backend trả sẵn
  const now = new Date();
  const expires = new Date(v.expiresAt ?? v.expiredAt ?? v.expires);
  const diffDays = Math.ceil((expires - now) / 86400000);
  if (diffDays <= 0) return "Hết hạn";
  if (diffDays <= 3) return "Sắp hết";
  return "Còn hạn";
}
const VOUCHER_CLS = {
  "Còn hạn": "badge-active",
  "Sắp hết": "badge-pending",
  "Hết hạn": "badge-cancel",
};

export function VouchersPage() {
  const [active, setActive] = useState("Tất cả");
  const { data, loading, error } = useFetch(() => VoucherService.getAll(), []);
  const vouchers = Array.isArray(data) ? data : (data?.items ?? []);

  const withStatus = vouchers.map((v) => ({
    ...v,
    _status: getVoucherStatus(v),
  }));
  const filtered = withStatus.filter(
    (v) => active === "Tất cả" || v._status === active,
  );

  return (
    <div>
      <div className="page-filter">
        {VOUCHER_FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-tab${active === f ? " active" : ""}`}
            onClick={() => setActive(f)}
          >
            {f}
          </button>
        ))}
        <div className="filter-gap" />
        <button className="btn btn-sm btn-dark">+ Tạo voucher</button>
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">
            Voucher ({loading ? "..." : filtered.length})
          </span>
        </div>
        {error && (
          <div
            style={{
              padding: "16px 24px",
              color: "var(--red-text)",
              fontSize: 14,
            }}
          >
            ⚠️ {error}
          </div>
        )}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đã dùng</th>
                <th>Giới hạn</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }, (_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }, (_, j) => (
                        <td key={j}>
                          <div
                            className="skeleton-line"
                            style={{ height: 14, borderRadius: 4 }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((v) => (
                    <tr key={v.id ?? v.code}>
                      <td
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {v.code}
                      </td>
                      <td style={{ color: "var(--g4)" }}>
                        {v.type === "percent" ? "Phần trăm" : "Cố định"}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {v.type === "percent"
                          ? `${v.value}%`
                          : `${Number(v.value).toLocaleString("vi-VN")}₫`}
                      </td>
                      <td>{v.usedCount ?? v.used ?? 0}</td>
                      <td>{v.maxUsage ?? v.limit ?? "∞"}</td>
                      <td style={{ color: "var(--g4)" }}>
                        {new Date(
                          v.expiresAt ?? v.expiredAt ?? v.expires,
                        ).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        <span
                          className={`badge ${VOUCHER_CLS[v._status] ?? "badge-inactive"}`}
                        >
                          {v._status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-icon">✎</button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
