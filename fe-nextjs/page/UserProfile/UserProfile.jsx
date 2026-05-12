"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserService from "@/services/user.service";

const BASE_URL = "http://localhost:5000";

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/dang-nhap"); return; }
    const u = JSON.parse(stored);
    UserService.getById(u.id)
      .then(data => { setUser(data); setForm({ fullName: data.fullName ?? "", email: data.email }); })
      .catch(() => router.push("/dang-nhap"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setMsg({ type: "", text: "" });
    try {
      const updated = await UserService.update(user.id, { fullName: form.fullName, email: form.email });
      setUser(updated);
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, fullName: form.fullName, email: form.email }));
      setMsg({ type: "success", text: "Cập nhật thành công!" });
      setEditing(false);
    } catch (e) {
      setMsg({ type: "error", text: e?.response?.data?.errors?.detail?.[0] ?? "Có lỗi xảy ra." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", paddingTop: 68, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
      <p>Đang tải...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f5", paddingTop: 68 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #e8e4de", padding: "48px 0 32px", background: "#fff" }}>
        <div className="container">
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>INDIAS</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 300, color: "#222" }}>Tài khoản</h1>
        </div>
      </div>

      <div className="container" style={{ padding: "40px 24px", maxWidth: 720 }}>
        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #eee" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#222", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 600, flexShrink: 0 }}>
            {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{user?.fullName || user?.username}</h2>
            <p style={{ fontSize: 13, color: "#999" }}>{user?.email}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {user?.roles?.map(r => (
                <span key={r} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 8px", background: r === "Admin" ? "#222" : "#f0ece6", color: r === "Admin" ? "#fff" : "#6b5a47", borderRadius: 2 }}>{r}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Info Form */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #eee", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Thông tin cá nhân</h3>
            {!editing && (
              <button onClick={() => setEditing(true)} style={{ fontSize: 12, padding: "6px 16px", border: "1px solid #222", background: "transparent", cursor: "pointer", borderRadius: 4 }}>
                Chỉnh sửa
              </button>
            )}
          </div>

          {msg.text && (
            <p style={{ fontSize: 13, color: msg.type === "success" ? "#27ae60" : "#e74c3c", marginBottom: 16, padding: "10px 14px", background: msg.type === "success" ? "#f0fff4" : "#fff0f0", borderRadius: 6 }}>
              {msg.text}
            </p>
          )}

          <div style={{ display: "grid", gap: 16 }}>
            {/* Username (readonly) */}
            <div>
              <label style={{ fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Tên đăng nhập</label>
              <input value={user?.username ?? ""} disabled style={{ width: "100%", padding: "10px 14px", border: "1px solid #eee", borderRadius: 6, fontSize: 14, background: "#f8f8f8", color: "#999", boxSizing: "border-box" }} />
            </div>

            {/* Full Name */}
            <div>
              <label style={{ fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Họ và tên</label>
              <input
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                disabled={!editing}
                placeholder="Nhập họ và tên"
                style={{ width: "100%", padding: "10px 14px", border: `1px solid ${editing ? "#222" : "#eee"}`, borderRadius: 6, fontSize: 14, background: editing ? "#fff" : "#f8f8f8", color: editing ? "#222" : "#555", boxSizing: "border-box", outline: "none" }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
              <input
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                disabled={!editing}
                placeholder="Nhập email"
                style={{ width: "100%", padding: "10px 14px", border: `1px solid ${editing ? "#222" : "#eee"}`, borderRadius: 6, fontSize: 14, background: editing ? "#fff" : "#f8f8f8", color: editing ? "#222" : "#555", boxSizing: "border-box", outline: "none" }}
              />
            </div>

            {/* Last login */}
            <div>
              <label style={{ fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Đăng nhập lần cuối</label>
              <input value={user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("vi-VN") : "Chưa có"} disabled style={{ width: "100%", padding: "10px 14px", border: "1px solid #eee", borderRadius: 6, fontSize: 14, background: "#f8f8f8", color: "#999", boxSizing: "border-box" }} />
            </div>
          </div>

          {editing && (
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={handleSave} disabled={saving} style={{ padding: "10px 28px", background: "#222", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button onClick={() => { setEditing(false); setForm({ fullName: user?.fullName ?? "", email: user?.email ?? "" }); setMsg({ type: "", text: "" }); }} style={{ padding: "10px 20px", background: "transparent", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
                Hủy
              </button>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Đơn hàng của tôi", icon: "📦", href: "/orders" },
            { label: "Yêu thích", icon: "♡", href: "/yeu-thich" },
            { label: "Địa chỉ giao hàng", icon: "📍", href: "/tai-khoan/dia-chi" },
            { label: "Đổi mật khẩu", icon: "🔒", href: "/tai-khoan/doi-mat-khau" },
          ].map(item => (
            <div key={item.href} onClick={() => router.push(item.href)} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#222"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#eee"}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
