"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AddressService } from "@/services/checkout.service";

const EMPTY_FORM = { fullName: "", phone: "", province: "", district: "", ward: "", street: "", isDefault: false };

export default function AddressPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    AddressService.getMyAddresses()
      .then(setAddresses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    setSaving(true); setMsg({ type: "", text: "" });
    try {
      if (editingId) {
        await AddressService.update(editingId, form);
        setAddresses(prev => prev.map(a => a.id === editingId ? { ...a, ...form } : a));
        setMsg({ type: "success", text: "Cập nhật địa chỉ thành công!" });
      } else {
        const created = await AddressService.create(form);
        setAddresses(prev => [...prev, created]);
        setMsg({ type: "success", text: "Thêm địa chỉ thành công!" });
      }
      setShowForm(false); setEditingId(null); setForm(EMPTY_FORM);
    } catch {
      setMsg({ type: "error", text: "Có lỗi xảy ra." });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr.id);
    setForm({ fullName: addr.fullName, phone: addr.phone, province: addr.province, district: addr.district, ward: addr.ward, street: addr.street, isDefault: addr.isDefault });
    setShowForm(true);
    setMsg({ type: "", text: "" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    try {
      await AddressService.delete(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch {
      setMsg({ type: "error", text: "Không thể xóa địa chỉ." });
    }
  };

  const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, boxSizing: "border-box", outline: "none" };
  const labelStyle = { fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f5", paddingTop: 68 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #e8e4de", padding: "48px 0 32px", background: "#fff" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <button onClick={() => router.push("/tai-khoan")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#999" }}>← Tài khoản</button>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 300, color: "#222" }}>Địa chỉ giao hàng</h1>
        </div>
      </div>

      <div className="container" style={{ padding: "40px 24px", maxWidth: 720 }}>
        {msg.text && (
          <p style={{ fontSize: 13, color: msg.type === "success" ? "#27ae60" : "#e74c3c", marginBottom: 16, padding: "10px 14px", background: msg.type === "success" ? "#f0fff4" : "#fff0f0", borderRadius: 6 }}>
            {msg.text}
          </p>
        )}

        {/* Address List */}
        {loading ? <p style={{ color: "#999" }}>Đang tải...</p> : (
          <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
            {addresses.length === 0 && !showForm && (
              <div style={{ textAlign: "center", padding: "48px 0", color: "#bbb", background: "#fff", borderRadius: 12, border: "1px solid #eee" }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>📍</p>
                <p style={{ fontSize: 13, letterSpacing: "0.1em" }}>Chưa có địa chỉ nào</p>
              </div>
            )}
            {addresses.map(addr => (
              <div key={addr.id} style={{ background: "#fff", borderRadius: 12, padding: 20, border: `1px solid ${addr.isDefault ? "#222" : "#eee"}`, position: "relative" }}>
                {addr.isDefault && <span style={{ position: "absolute", top: 12, right: 12, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", background: "#222", color: "#fff", padding: "2px 8px", borderRadius: 2 }}>Mặc định</span>}
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{addr.fullName}</p>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{addr.phone}</p>
                <p style={{ fontSize: 13, color: "#888" }}>{[addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(", ")}</p>
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button onClick={() => handleEdit(addr)} style={{ fontSize: 12, padding: "5px 14px", border: "1px solid #ddd", background: "transparent", borderRadius: 4, cursor: "pointer" }}>Chỉnh sửa</button>
                  <button onClick={() => handleDelete(addr.id)} style={{ fontSize: 12, padding: "5px 14px", border: "1px solid #fcc", background: "transparent", borderRadius: 4, cursor: "pointer", color: "#e74c3c" }}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }} style={{ width: "100%", padding: "12px", border: "1px dashed #ccc", background: "transparent", borderRadius: 10, cursor: "pointer", fontSize: 14, color: "#666" }}>
            + Thêm địa chỉ mới
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #eee", marginTop: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>{editingId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Họ và tên</label>
                <input style={inputStyle} value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Nguyễn Văn A" />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Số điện thoại</label>
                <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901234567" />
              </div>
              <div>
                <label style={labelStyle}>Tỉnh / Thành phố</label>
                <input style={inputStyle} value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} placeholder="TP. Hồ Chí Minh" />
              </div>
              <div>
                <label style={labelStyle}>Quận / Huyện</label>
                <input style={inputStyle} value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} placeholder="Quận 1" />
              </div>
              <div>
                <label style={labelStyle}>Phường / Xã</label>
                <input style={inputStyle} value={form.ward} onChange={e => setForm(f => ({ ...f, ward: e.target.value }))} placeholder="Phường Bến Nghé" />
              </div>
              <div>
                <label style={labelStyle}>Địa chỉ cụ thể</label>
                <input style={inputStyle} value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} placeholder="123 Nguyễn Huệ" />
              </div>
              <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} />
                <label htmlFor="isDefault" style={{ fontSize: 13, cursor: "pointer" }}>Đặt làm địa chỉ mặc định</label>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={handleSubmit} disabled={saving} style={{ padding: "10px 28px", background: "#222", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm địa chỉ"}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setMsg({ type: "", text: "" }); }} style={{ padding: "10px 20px", background: "transparent", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
