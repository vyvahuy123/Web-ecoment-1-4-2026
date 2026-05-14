"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UserService from "@/services/user.service";

function Field({ label, value, onChange, show, onToggle, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          style={{ width: "100%", padding: "10px 40px 10px 14px", border: `1px solid ${error ? "#e74c3c" : "#ddd"}`, borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" }}
        />
        <button type="button" onClick={onToggle} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>
          {show ? "🙈" : "👁"}
        </button>
      </div>
      {error && <p style={{ fontSize: 12, color: "#e74c3c", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export default function ChangePassword() {
  const router = useRouter();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleShow = (k) => () => setShow(s => ({ ...s, [k]: !s[k] }));

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!form.newPassword) e.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (form.newPassword.length < 6) e.newPassword = "Mật khẩu tối thiểu 6 ký tự";
    if (!form.confirmPassword) e.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (form.confirmPassword !== form.newPassword) e.confirmPassword = "Mật khẩu không khớp";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setMsg({ type: "", text: "" }); setSaving(true);
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      await UserService.changePassword(stored.id, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message ?? err?.response?.data?.errors?.detail?.[0] ?? "Có lỗi xảy ra." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f5", paddingTop: 68 }}>
      <div style={{ borderBottom: "1px solid #e8e4de", padding: "48px 0 32px", background: "#fff" }}>
        <div className="container">
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>INDIAS</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 300, color: "#222" }}>Đổi mật khẩu</h1>
        </div>
      </div>

      <div className="container" style={{ padding: "40px 24px", maxWidth: 480 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 28, border: "1px solid #eee" }}>

          {msg.text && (
            <p style={{ fontSize: 13, color: msg.type === "success" ? "#27ae60" : "#e74c3c", marginBottom: 20, padding: "10px 14px", background: msg.type === "success" ? "#f0fff4" : "#fff0f0", borderRadius: 6 }}>
              {msg.text}
            </p>
          )}

          <Field label="Mật khẩu hiện tại" value={form.currentPassword} onChange={set("currentPassword")} show={show.current} onToggle={toggleShow("current")} error={errors.currentPassword} />
          <Field label="Mật khẩu mới" value={form.newPassword} onChange={set("newPassword")} show={show.next} onToggle={toggleShow("next")} error={errors.newPassword} />
          <Field label="Xác nhận mật khẩu mới" value={form.confirmPassword} onChange={set("confirmPassword")} show={show.confirm} onToggle={toggleShow("confirm")} error={errors.confirmPassword} />

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button onClick={handleSubmit} disabled={saving} style={{ padding: "10px 28px", background: "#222", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
              {saving ? "Đang lưu..." : "Đổi mật khẩu"}
            </button>
            <button onClick={() => router.push("/tai-khoan")} style={{ padding: "10px 20px", background: "transparent", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
