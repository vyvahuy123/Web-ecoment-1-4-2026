"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import "./Auth.css";

function InputField({ label, type = "text", value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className={`au-field ${error ? "has-error" : ""}`}>
      <label className="au-label">{label}</label>
      <div className="au-input-wrap">
        <input
          className="au-input"
          type={isPassword && show ? "text" : type}
          value={value} onChange={onChange} placeholder={placeholder} autoComplete="off"
        />
        {isPassword && (
          <button type="button" className="au-eye" onClick={() => setShow(!show)}>
            {show ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {error && <span className="au-field-error">{error}</span>}
    </div>
  );
}

function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const vals = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = vals.map((c, idx) => idx === i ? v : c);
    onChange(arr.join(""));
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !vals[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "8px 0 20px" }}>
      {vals.map((v, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1}
          value={v}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          style={{
            width: 48, height: 56, textAlign: "center", fontSize: 22, fontWeight: 700,
            border: v ? "2px solid #0a0a0a" : "2px solid #e0e0e0",
            borderRadius: 10, outline: "none", background: v ? "#f9f9f9" : "#fff",
            transition: "border 0.2s", caretColor: "transparent",
            fontFamily: "inherit"
          }}
          onFocus={e => e.target.style.borderColor = "#0a0a0a"}
          onBlur={e => e.target.style.borderColor = v ? "#0a0a0a" : "#e0e0e0"}
        />
      ))}
    </div>
  );
}

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) { setError("Vui lòng nhập email"); return; }
    setError(""); setLoading(true);
    try {
      await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStep(2);
    } catch { setError("Có lỗi xảy ra, vui lòng thử lại."); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setError("Vui lòng nhập đủ 6 số"); return; }
    if (!newPassword) { setError("Vui lòng nhập mật khẩu mới"); return; }
    if (newPassword !== confirmPassword) { setError("Mật khẩu không khớp"); return; }
    if (newPassword.length < 6) { setError("Mật khẩu tối thiểu 6 ký tự"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otp, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data?.errors?.detail?.[0] ?? "Mã OTP không hợp lệ hoặc đã hết hạn.");
        return;
      }
      setSuccess("Đặt lại mật khẩu thành công!");
      setTimeout(() => router.push("/dang-nhap"), 2000);
    } catch { setError("Có lỗi xảy ra, vui lòng thử lại."); }
    finally { setLoading(false); }
  };

  return (
    <div className="au-page">
      <div className="au-wrap">
        <div className="au-left">
          <div className="au-left-inner">
            <div className="au-left-title">
              <span>Khôi phục</span>
              <em>tài khoản</em>
            </div>
            <p className="au-left-desc">
              {step === 1
                ? "Nhập email đăng ký, chúng tôi sẽ gửi mã xác nhận 6 số về hộp thư của bạn."
                : "Kiểm tra hộp thư và nhập mã xác nhận cùng mật khẩu mới."}
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
              {[1, 2].map(s => (
                <div key={s} style={{
                  width: s <= step ? 32 : 12, height: 4, borderRadius: 2,
                  background: s <= step ? "#fff" : "rgba(255,255,255,0.3)",
                  transition: "all 0.3s"
                }} />
              ))}
            </div>
          </div>
        </div>

        <div className="au-right">
          <div className="au-right-inner">
            <div className="au-form-container">
              {success ? (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                  <h3 style={{ marginBottom: 8, fontSize: 22 }}>Thành công!</h3>
                  <p style={{ color: "#666", marginBottom: 4 }}>{success}</p>
                  <p style={{ color: "#999", fontSize: 13 }}>Đang chuyển về trang đăng nhập...</p>
                </div>
              ) : step === 1 ? (
                <>
                  <h2 className="au-form-title">Quên mật khẩu</h2>
                  <p style={{ color: "#888", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                    Nhập email đăng ký của bạn. Chúng tôi sẽ gửi mã xác nhận 6 số.
                  </p>
                  <form onSubmit={handleSendOtp} noValidate>
                    <InputField
                      label="Email" type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="hello@indias.vn"
                    />
                    {error && <div className="au-server-error">{error}</div>}
                    <button className="au-submit" type="submit" disabled={loading} style={{ marginTop: 16 }}>
                      {loading ? <span className="au-spinner" /> : "Gửi mã xác nhận →"}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="au-form-title">Nhập mã xác nhận</h2>
                  <p style={{ color: "#888", fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
                    Mã 6 số đã được gửi đến
                  </p>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 20 }}>{email}</p>
                  <form onSubmit={handleResetPassword} noValidate>
                    <label className="au-label">Mã xác nhận</label>
                    <OtpInput value={otp} onChange={setOtp} />
                    <InputField
                      label="Mật khẩu mới" type="password" value={newPassword}
                      onChange={e => setNewPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự"
                    />
                    <InputField
                      label="Xác nhận mật khẩu" type="password" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu"
                    />
                    {error && <div className="au-server-error">{error}</div>}
                    <button className="au-submit" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                      {loading ? <span className="au-spinner" /> : "Đặt lại mật khẩu"}
                    </button>
                    <button type="button" onClick={() => { setStep(1); setOtp(""); setError(""); }}
                      style={{ width: "100%", marginTop: 10, background: "none",
                        border: "1px solid #e0e0e0", borderRadius: 8, padding: "11px",
                        cursor: "pointer", fontSize: 13, color: "#666", transition: "all 0.2s" }}>
                      ← Gửi lại mã khác
                    </button>
                  </form>
                </>
              )}
              <div style={{ textAlign: "center", marginTop: 28 }}>
                <button onClick={() => router.push("/dang-nhap")}
                  style={{ background: "none", border: "none", cursor: "pointer",
                    color: "#999", fontSize: 13 }}>
                  ← Quay lại đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
