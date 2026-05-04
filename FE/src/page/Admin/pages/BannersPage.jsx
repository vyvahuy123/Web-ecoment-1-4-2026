import { useState, useEffect } from "react";
import BannerService from "../../../services/banner.service";

const EMPTY = {
  tag: "", title: "", description: "",
  buttonText: "Shop Now", buttonHref: "#products",
  imageUrl: "", backgroundColor: "#f0f0f0",
  sortOrder: 0, isActive: true,
};

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const fetch = async () => {
    setLoading(true);
    try { setBanners(await BannerService.getAll()); }
    catch { setBanners([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setErr(""); setModalOpen(true); };
  const openEdit = (b) => {
    setEditTarget(b);
    setForm({
      tag: b.tag, title: b.title, description: b.description,
      buttonText: b.buttonText, buttonHref: b.buttonHref,
      imageUrl: b.imageUrl ?? "", backgroundColor: b.backgroundColor,
      sortOrder: b.sortOrder, isActive: b.isActive,
    });
    setErr("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return setErr("Tiêu đề không được để trống");
    setSaving(true); setErr("");
    try {
      if (editTarget) await BannerService.update(editTarget.id, form);
      else await BannerService.create(form);
      setModalOpen(false);
      fetch();
    } catch { setErr("Lỗi lưu banner"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa banner này?")) return;
    try { await BannerService.delete(id); fetch(); }
    catch { alert("Lỗi xóa banner"); }
  };

  const handleToggle = async (b) => {
    try {
      await BannerService.update(b.id, { ...b, imageUrl: b.imageUrl ?? "", isActive: !b.isActive });
      fetch();
    } catch {}
  };

  const inp = (field) => ({
    value: form[field],
    onChange: (e) => setForm(f => ({ ...f, [field]: e.target.value })),
    className: "modal-input",
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Banner</h1>
          <p style={{ fontSize: 13, color: "var(--g4)", marginTop: 4 }}>
            Quản lý các slide hero trên trang chủ
          </p>
        </div>
        <button className="btn btn-dark" onClick={openCreate}>+ Thêm banner</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--g4)" }}>Đang tải...</div>
        ) : banners.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--g4)" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🖼</div>
            <p>Chưa có banner nào. Thêm banner đầu tiên!</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Tiêu đề</th>
                <th>Tag</th>
                <th>Nút</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(b => (
                <tr key={b.id}>
                  <td>
                    <div style={{
                      width: 80, height: 48, borderRadius: 6,
                      background: b.imageUrl ? `url(${b.imageUrl}) center/cover` : b.backgroundColor,
                      border: "1px solid var(--g2)", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: "#999"
                    }}>
                      {!b.imageUrl && "No img"}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{b.title}</div>
                    <div style={{ fontSize: 11, color: "var(--g4)", marginTop: 2 }}>
                      {b.description?.slice(0, 50)}{b.description?.length > 50 ? "..." : ""}
                    </div>
                  </td>
                  <td><span className="badge badge-inactive">{b.tag}</span></td>
                  <td style={{ fontSize: 12 }}>{b.buttonText}</td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>{b.sortOrder}</td>
                  <td>
                    <button
                      onClick={() => handleToggle(b)}
                      className={`badge ${b.isActive ? "badge-active" : "badge-inactive"}`}
                      style={{ border: "none", cursor: "pointer" }}
                    >
                      {b.isActive ? "Hiển thị" : "Ẩn"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sm" onClick={() => openEdit(b)}>✎ Sửa</button>
                      <button className="btn btn-sm" style={{ color: "var(--red)" }}
                        onClick={() => handleDelete(b.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">{editTarget ? "Sửa banner" : "Thêm banner mới"}</span>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {err && <div className="modal-err">{err}</div>}

              <label>Tag (ví dụ: New Collection 2025)</label>
              <input {...inp("tag")} placeholder="Tag hiển thị trên slide" />

              <label>Tiêu đề *</label>
              <input {...inp("title")} placeholder="Tiêu đề chính (dùng \n để xuống dòng)" />

              <label>Mô tả</label>
              <textarea {...inp("description")} className="modal-input modal-textarea"
                placeholder="Mô tả ngắn" rows={3} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label>Text nút</label>
                  <input {...inp("buttonText")} placeholder="Shop Now" />
                </div>
                <div>
                  <label>Link nút</label>
                  <input {...inp("buttonHref")} placeholder="#products" />
                </div>
              </div>

              <label>URL ảnh nền</label>
              <input {...inp("imageUrl")} placeholder="https://... hoặc để trống" />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label>Màu nền (nếu không có ảnh)</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={form.backgroundColor}
                      onChange={e => setForm(f => ({ ...f, backgroundColor: e.target.value }))}
                      style={{ width: 40, height: 38, padding: 2, border: "1px solid var(--g2)", borderRadius: 4, cursor: "pointer" }} />
                    <input {...inp("backgroundColor")} style={{ flex: 1 }} />
                  </div>
                </div>
                <div>
                  <label>Thứ tự hiển thị</label>
                  <input type="number" value={form.sortOrder}
                    onChange={e => setForm(f => ({ ...f, sortOrder: +e.target.value }))}
                    className="modal-input" min={0} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: "pointer" }} />
                <label htmlFor="isActive" style={{ cursor: "pointer", marginBottom: 0 }}>
                  Hiển thị trên trang chủ
                </label>
              </div>

              {/* Preview */}
              {(form.imageUrl || form.backgroundColor) && (
                <div>
                  <label>Preview</label>
                  <div style={{
                    height: 80, borderRadius: 8, overflow: "hidden",
                    background: form.imageUrl
                      ? `url(${form.imageUrl}) center/cover no-repeat`
                      : form.backgroundColor,
                    border: "1px solid var(--g2)",
                    display: "flex", alignItems: "center", padding: "0 20px"
                  }}>
                    <div>
                      <div style={{ fontSize: 9, opacity: 0.7 }}>{form.tag}</div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{form.title?.replace(/\\n/g, " ")}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn btn-sm" onClick={() => setModalOpen(false)}>Hủy</button>
              <button className="btn btn-sm btn-dark" onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}