import { useState, useEffect, useRef } from "react";

const EMPTY_FORM = {
  name: "", price: "", description: "", imageUrl: "", imageFile: null, categoryId: "",
};

export default function ProductForm({ open, onClose, onSave, initial, categories }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            name: initial.name ?? "",
            price: initial.price ?? "",
            description: initial.description ?? "",
            imageUrl: initial.imageUrl ?? "",
            imageFile: null,
            categoryId: initial.categoryId != null ? String(initial.categoryId) : "",
          }
        : EMPTY_FORM
    );
    setPreviewUrl(initial?.imageUrl ?? "");
    setErr("");
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
    if (!form.name.trim() || !form.price) {
      setErr("Vui lòng điền tên và giá.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setErr(e?.message ?? "Lỗi khi lưu sản phẩm.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box product-form-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">
            {initial ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body product-form-body">
          {err && <div className="modal-err">{err}</div>}

          {/* Row 1: Tên + Giá */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tên sản phẩm *</label>
              <input
                className="modal-input"
                value={form.name}
                onChange={set("name")}
                placeholder="VD: Oversized Linen Blazer"
              />
            </div>
            <div className="form-group form-group--sm">
              <label className="form-label">Giá (VNĐ) *</label>
              <input
                className="modal-input"
                type="number"
                value={form.price}
                onChange={set("price")}
                placeholder="890000"
              />
            </div>
          </div>

          {/* Row 2: Danh mục */}
          <div className="form-group">
            <label className="form-label">Danh mục</label>
            <select className="modal-input" value={form.categoryId} onChange={set("categoryId")}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Row 3: Upload ảnh */}
          <div className="form-group">
            <label className="form-label">Ảnh sản phẩm</label>
            <div className="file-upload-area" onClick={() => fileRef.current?.click()}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <span className="file-upload-icon">📁</span>
              <span className="file-upload-text">
                {form.imageFile ? form.imageFile.name : "Nhấn để chọn ảnh từ máy tính"}
              </span>
              <span className="file-upload-hint">PNG, JPG, WEBP tối đa 5MB</span>
            </div>
          </div>

          {/* Preview ảnh */}
          {previewUrl && (
            <div className="form-img-preview">
              <img
                src={previewUrl}
                alt="preview"
                onError={(e) => (e.target.style.display = "none")}
              />
              <button
                className="btn btn-sm btn-danger"
                style={{ marginTop: 6, fontSize: 12 }}
                onClick={handleRemoveImage}
                type="button"
              >
                Xóa ảnh
              </button>
            </div>
          )}

          {/* Row 4: Mô tả */}
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              className="modal-input modal-textarea"
              value={form.description}
              onChange={set("description")}
              placeholder="Mô tả ngắn về sản phẩm..."
              rows={3}
            />
          </div>
        </div>

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