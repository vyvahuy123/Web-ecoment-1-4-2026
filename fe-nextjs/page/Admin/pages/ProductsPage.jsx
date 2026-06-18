"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import ProductService from "@/services/product.service";
import CategoryService from "@/services/category.service";

const EMPTY_FORM = {
  name: "", price: "", salePrice: "", description: "", imageUrl: "", imageFile: null, categoryId: "",
};

const sid = (v) => (v == null ? "" : String(v));


function VariantSection({ productId }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ color: "", size: "", price: "", stock: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [editId, setEditId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getVariants(productId);
      setVariants(data || []);
    } catch { setVariants([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (productId) load(); }, [productId]);

  const resetForm = () => { setForm({ color: "", size: "", price: "", stock: "" }); setEditId(null); setErr(""); };

  const handleSave = async () => {
    if (!form.color.trim() || !form.size.trim() || !form.price || !form.stock) {
      setErr("Vui lòng điền đầy đủ Màu, Size, Giá, Số lượng."); return;
    }
    setSaving(true); setErr("");
    try {
      const payload = { color: form.color.trim(), size: form.size.trim(), price: Number(form.price), stock: Number(form.stock) };
      if (editId) {
        await ProductService.updateVariant(editId, payload);
      } else {
        await ProductService.createVariant(productId, payload);
      }
      resetForm();
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message ?? e?.response?.data?.errors?.detail?.[0] ?? "Lỗi khi lưu variant.");
    } finally { setSaving(false); }
  };

  const handleEdit = (v) => {
    setForm({ color: v.color, size: v.size, price: String(v.price), stock: String(v.stock) });
    setEditId(v.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa variant này?")) return;
    try { await ProductService.deleteVariant(id); await load(); }
    catch { alert("Lỗi khi xóa."); }
  };

  return (
    <div style={{ marginTop: 20, borderTop: "1px solid #eee", paddingTop: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>🎨 Phân loại (Màu / Size)</div>
      {err && <div className="modal-err">{err}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
        <input className="modal-input" style={{ margin: 0 }} value={form.color} onChange={e => setForm(f => ({...f, color: e.target.value}))} placeholder="Màu (VD: Đen)" />
        <input className="modal-input" style={{ margin: 0 }} value={form.size} onChange={e => setForm(f => ({...f, size: e.target.value}))} placeholder="Size (VD: M)" />
        <input className="modal-input" style={{ margin: 0 }} type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="Giá" />
        <input className="modal-input" style={{ margin: 0 }} type="number" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} placeholder="Tồn kho" />
        <div style={{ display: "flex", gap: 4 }}>
          <button className="btn btn-sm btn-dark" onClick={handleSave} disabled={saving} style={{ whiteSpace: "nowrap" }}>
            {saving ? "..." : editId ? "Cập nhật" : "+ Thêm"}
          </button>
          {editId && <button className="btn btn-sm" onClick={resetForm}>✕</button>}
        </div>
      </div>
      {loading ? <div style={{ color: "#999", fontSize: 13 }}>Đang tải...</div> : variants.length === 0 ? (
        <div style={{ color: "#999", fontSize: 13, textAlign: "center", padding: "12px 0" }}>Chưa có phân loại nào</div>
      ) : (
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>Màu</th>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>Size</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>Giá</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>Tồn kho</th>
              <th style={{ padding: "6px 8px" }}></th>
            </tr>
          </thead>
          <tbody>
            {variants.map(v => (
              <tr key={v.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "6px 8px" }}><span style={{ background: "#f0f0f0", borderRadius: 4, padding: "2px 8px" }}>{v.color}</span></td>
                <td style={{ padding: "6px 8px" }}>{v.size}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{Number(v.price).toLocaleString("vi-VN")}₫</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{v.stock}</td>
                <td style={{ padding: "6px 8px", display: "flex", gap: 4, justifyContent: "center" }}>
                  <button className="btn btn-sm" onClick={() => handleEdit(v)} style={{ fontSize: 11 }}>Sửa</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(v.id)} style={{ fontSize: 11 }}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ProductModal({ open, onClose, onSave, initial, categories }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(initial
      ? {
          name:        initial.name        ?? "",
          price:       initial.price       ?? "",
          salePrice:   initial.salePrice   ?? "",
          description: initial.description ?? "",
          imageUrl:    initial.imageUrl    ?? "",
          imageFile:   null,
          categoryId:  sid(initial.categoryId),
        }
      : EMPTY_FORM
    );
    setPreviewUrl(initial?.imageUrl ?? "");
    setErr("");
    setActiveTab("info");
  }, [initial, open]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setForm((f) => ({ ...f, imageFile: file, imageUrl: "" }));
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    setForm((f) => ({ ...f, imageFile: null, imageUrl: "" }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { setErr("Vui lòng điền tên và giá."); return; }
    setSaving(true); setErr("");
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      const serverMsg = e?.response?.data?.message ?? e?.response?.data ?? e?.message;
      setErr(typeof serverMsg === "string" ? serverMsg : "Lỗi khi lưu sản phẩm.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">{initial ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {initial?.id && (
          <div style={{ display: "flex", borderBottom: "1px solid #eee", padding: "0 20px" }}>
            {[{key:"info",label:"📋 Thông tin"},{key:"variants",label:"🎨 Phân loại"}].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} type="button" style={{
                padding: "10px 16px", border: "none", background: "none", cursor: "pointer",
                fontSize: 13, fontWeight: activeTab === t.key ? 600 : 400,
                color: activeTab === t.key ? "#0a0a0a" : "#888",
                borderBottom: activeTab === t.key ? "2px solid #0a0a0a" : "2px solid transparent",
                marginBottom: -1, transition: "all 0.2s"
              }}>{t.label}</button>
            ))}
          </div>
        )}
        <div className="modal-body" style={{ display: activeTab === "info" ? "flex" : "none" }}>
          {err && <div className="modal-err">{err}</div>}

          <label>Tên sản phẩm *</label>
          <input className="modal-input" value={form.name} onChange={set("name")} placeholder="VD: Oversized Linen Blazer" />

          <label>Giá (VNĐ) *</label>
          <input className="modal-input" type="number" value={form.price} onChange={set("price")} placeholder="890000" />
          <label>Giá sale (VNĐ) <span style={{color:"#999",fontSize:12}}>(để trống nếu không sale)</span></label>
          <input className="modal-input" type="number" value={form.salePrice} onChange={set("salePrice")} placeholder="VD: 450000" />

          <label>Danh mục</label>
          <select className="modal-input" value={form.categoryId} onChange={set("categoryId")}>
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={sid(c.id)}>{c.name}</option>
            ))}
          </select>

          <label>Mô tả</label>
          <textarea className="modal-input modal-textarea" value={form.description} onChange={set("description")} placeholder="Mô tả ngắn về sản phẩm..." rows={3} />

          <label>Ảnh sản phẩm</label>
          <div className="file-upload-area" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
            <span className="file-upload-icon">📁</span>
            <span className="file-upload-text">{form.imageFile ? form.imageFile.name : "Nhấn để chọn ảnh từ máy tính"}</span>
            <span className="file-upload-hint">PNG, JPG, WEBP tối đa 5MB</span>
          </div>

          {previewUrl && (
            <div className="form-img-preview">
              <img src={previewUrl} alt="preview" onError={(e) => (e.target.style.display = "none")} />
              <button className="btn btn-sm btn-danger" style={{ marginTop: 6, fontSize: 12 }} onClick={handleRemoveImage} type="button">Xóa ảnh</button>
            </div>
          )}
        </div>
        {initial?.id && activeTab === "variants" && (
          <div className="modal-body"><VariantSection productId={initial.id} /></div>
        )}
        <div className="modal-foot">
          <button className="btn btn-sm" onClick={onClose} disabled={saving}>Hủy</button>
          <button className="btn btn-sm btn-dark" onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : initial ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StockModal({ open, onClose, onSave, product }) {
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { setDelta(""); setReason(""); setErr(""); }, [open]);

  if (!open || !product) return null;

  const handleSave = async () => {
    const d = parseInt(delta, 10);
    if (!delta || isNaN(d) || d === 0) { setErr("Nhập số lượng thay đổi (dương = nhập, âm = xuất)."); return; }
    if (!reason.trim()) { setErr("Vui lòng nhập lý do."); return; }
    setSaving(true); setErr("");
    try {
      await onSave(product.id, d, reason);
      onClose();
    } catch (e) {
      setErr(e?.message ?? "Lỗi khi cập nhật tồn kho.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">Điều chỉnh tồn kho</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: 12, fontSize: 14, color: "#555" }}>
            Sản phẩm: <strong>{product.name}</strong> — Tồn kho hiện tại: <strong>{product.stock ?? product.stockQuantity ?? 0}</strong>
          </p>
          {err && <div className="modal-err">{err}</div>}
          <label>Số lượng thay đổi * (+ nhập kho / − xuất kho)</label>
          <input className="modal-input" type="number" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="VD: 10 hoặc -5" />
          <label>Lý do *</label>
          <input className="modal-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Nhập hàng mới, Hàng lỗi..." />
        </div>
        <div className="modal-foot">
          <button className="btn btn-sm" onClick={onClose} disabled={saving}>Hủy</button>
          <button className="btn btn-sm btn-dark" onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ open, onClose, onConfirm, product }) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { setErr(""); }, [open]);

  if (!open || !product) return null;

  const handleConfirm = async () => {
    setDeleting(true); setErr("");
    try {
      await onConfirm(product.id);
      onClose();
    } catch (e) {
      const serverMsg = e?.response?.data?.message ?? e?.response?.data ?? e?.message;
      setErr(typeof serverMsg === "string" ? serverMsg : "Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-head">
          <span className="modal-title">Xác nhận xóa</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: "#555" }}>
            Bạn có chắc muốn xóa sản phẩm <strong>{product.name}</strong>? Hành động này không thể hoàn tác.
          </p>
          {err && <div className="modal-err" style={{ marginTop: 8 }}>{err}</div>}
        </div>
        <div className="modal-foot">
          <button className="btn btn-sm" onClick={onClose} disabled={deleting}>Hủy</button>
          <button className="btn btn-sm btn-danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [inputVal, setInputVal]         = useState("");
  const [activeCat, setActiveCat]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [stockTarget, setStockTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const PAGE_SIZE = 20;

  useEffect(() => {
    CategoryService.getAll()
      .then((res) => {
        const data = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(inputVal); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [inputVal]);

  useEffect(() => { setPage(1); }, [activeCat]);

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const result = await ProductService.getAll({
        page, pageSize: PAGE_SIZE,
        search: search || undefined,
        categoryId: activeCat || undefined,
      });
      setProducts(result.items ?? []);
      setTotal(result.totalCount ?? result.total ?? result.items?.length ?? 0);
    } catch (e) {
      setError(e?.message ?? "Không thể tải sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCat]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const resolveImageUrl = async (form) => {
    if (form.imageFile) return await ProductService.uploadImage(form.imageFile);
    return form.imageUrl || null;
  };

  const handleCreate = async (form) => {
    const imageUrl = await resolveImageUrl(form);
    await ProductService.create({ name: form.name, price: Number(form.price), description: form.description || null, imageUrl, categoryId: form.categoryId || null, salePrice: form.salePrice ? Number(form.salePrice) : null });
    fetchProducts();
  };

  const handleUpdate = async (form) => {
    const imageUrl = await resolveImageUrl(form);
    await ProductService.update(editTarget.id, { name: form.name, price: Number(form.price), description: form.description || null, imageUrl, categoryId: form.categoryId || null, salePrice: form.salePrice ? Number(form.salePrice) : null });
    fetchProducts();
  };

  const handleAdjustStock = async (id, delta, reason) => {
    await ProductService.adjustStock(id, { delta, reason });
    fetchProducts();
  };

  const handleDelete = async (id) => {
    await ProductService.delete(id);
    fetchProducts();
  };

  const openEdit = async (p) => {
    try {
      const detail = await ProductService.getById(p.id);
      setEditTarget(detail);
    } catch {
      setEditTarget(p);
    }
    setModalOpen(true);
  };

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const FILTERS    = [{ id: null, name: "Tất cả" }, ...categories];

  return (
    <div>
      <div className="page-filter">
        {FILTERS.map((f) => (
          <button key={f.id ?? "all"} className={`filter-tab${activeCat === f.id ? " active" : ""}`} onClick={() => setActiveCat(f.id)}>
            {f.name}
          </button>
        ))}
        <div className="filter-gap" />
        <input className="pd-admin-search" type="text" placeholder="Tìm sản phẩm..." value={inputVal} onChange={(e) => setInputVal(e.target.value)} style={{ marginRight: 8 }} />
        <button className="btn btn-sm btn-dark" onClick={openCreate}>+ Thêm sản phẩm</button>
      </div>

      <div className="card">
        <div className="card__head">
          <span className="card__title">Danh sách sản phẩm ({loading ? "..." : total})</span>
        </div>

        {error && (
          <div style={{ padding: "16px 24px", color: "var(--red-text)", fontSize: 14 }}>
            ⚠️ {error} — <button className="btn btn-sm" onClick={fetchProducts}>Thử lại</button>
          </div>
        )}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Ảnh</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }, (_, j) => (
                      <td key={j}><div className="skeleton-line" style={{ height: 14, borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#aaa", padding: 32 }}>Không tìm thấy sản phẩm nào.</td>
                </tr>
              ) : (
                products.map((p) => {
                  const stock = p.stock ?? p.stockQuantity ?? 0;
                  const catName = categories.find((c) => sid(c.id) === sid(p.categoryId))?.name ?? p.categoryName ?? "—";
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, maxWidth: 220 }}>{p.name}</td>
                      <td>{catName}</td>
                      <td>{Number(p.price).toLocaleString("vi-VN")}₫</td>
                      <td>
                        <span style={{ color: stock === 0 ? "var(--red-text)" : "inherit", fontWeight: stock === 0 ? 500 : 400 }}>
                          {stock === 0 ? "Hết hàng" : stock}
                        </span>
                      </td>
                      <td style={{ color: "var(--g4)" }}>{p.imageUrl ? "1 ảnh" : "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn btn-icon" title="Chỉnh sửa" onClick={() => openEdit(p)}>✎</button>
                          <button className="btn btn-icon" title="Điều chỉnh kho" onClick={() => setStockTarget(p)}>📦</button>
                          <button className="btn btn-icon btn-icon-danger" title="Xóa" onClick={() => setDeleteTarget(p)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pd-pagination" style={{ padding: "16px 24px" }}>
            <button className="pd-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Trước</button>
            <span className="pd-page-info">Trang {page} / {totalPages}</span>
            <button className="pd-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Sau →</button>
          </div>
        )}
      </div>

      <ProductModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={editTarget ? handleUpdate : handleCreate} initial={editTarget} categories={categories} />
      <StockModal open={!!stockTarget} onClose={() => setStockTarget(null)} onSave={handleAdjustStock} product={stockTarget} />
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} product={deleteTarget} />
    </div>
  );
}