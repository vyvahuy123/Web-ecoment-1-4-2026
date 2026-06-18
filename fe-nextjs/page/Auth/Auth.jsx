"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "./Auth.css";
import AuthService from "@/services/auth.service";

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
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
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


function ForgotPasswordFlow({ onBack }) {
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP + mật khẩu mới
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStep(2);
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp) { setError("Vui lòng nhập mã OTP"); return; }
    if (!newPassword) { setError("Vui lòng nhập mật khẩu mới"); return; }
    if (newPassword !== confirmPassword) { setError("Mật khẩu không khớp"); return; }
    if (newPassword.length < 6) { setError("Mật khẩu tối thiểu 6 ký tự"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otp, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data?.errors?.detail?.[0] ?? "Mã OTP không hợp lệ hoặc đã hết hạn.");
        return;
      }
      setSuccess("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
      setTimeout(() => onBack(), 2000);
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="au-form">
      <div style={{ marginBottom: 24 }}>
        <button type="button" onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#666", fontSize: 13, display: "flex", alignItems: "center", gap: 4
        }}>
          ← Quay lại đăng nhập
        </button>
      </div>

      {success ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ color: "#22c55e", fontWeight: 600 }}>{success}</p>
        </div>
      ) : step === 1 ? (
        <form onSubmit={handleSendOtp} noValidate>
          <h3 style={{ marginBottom: 8, fontSize: 18 }}>Quên mật khẩu</h3>
          <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>
            Nhập email của bạn, chúng tôi sẽ gửi mã xác nhận.
          </p>
          <InputField
            label="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="hello@indias.vn"
          />
          {error && <div className="au-server-error">{error}</div>}
          <button className="au-submit" type="submit" disabled={loading}>
            {loading ? <span className="au-spinner" /> : "Gửi mã xác nhận"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} noValidate>
          <h3 style={{ marginBottom: 8, fontSize: 18 }}>Nhập mã xác nhận</h3>
          <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>
            Mã 6 số đã được gửi đến <strong>{email}</strong>
          </p>
          <div className="au-field">
            <label className="au-label">Mã OTP</label>
            <input
              className="au-input"
              type="text" maxLength={6}
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              style={{ letterSpacing: 8, fontSize: 20, textAlign: "center" }}
            />
          </div>
          <InputField
            label="Mật khẩu mới" type="password" value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
          <InputField
            label="Xác nhận mật khẩu" type="password" value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && <div className="au-server-error">{error}</div>}
          <button className="au-submit" type="submit" disabled={loading}>
            {loading ? <span className="au-spinner" /> : "Đặt lại mật khẩu"}
          </button>
          <button type="button" onClick={() => { setStep(1); setError(""); }}
            style={{ width: "100%", marginTop: 8, background: "none", border: "1px solid #ddd",
              borderRadius: 6, padding: "10px", cursor: "pointer", fontSize: 13, color: "#666" }}>
            Gửi lại mã
          </button>
        </form>
      )}
    </div>
  );
}

function LoginForm({ onSuccess, onForgot }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email không hợp lệ";
    if (!form.password) e.password = "Vui lòng nhập mật khẩu";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setServerError(""); setLoading(true);
    try {
      const data = await AuthService.login(form.email, form.password);
      onSuccess?.(data, "login");
    } catch (err) {
      setServerError(err.message ?? "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="au-form" onSubmit={submit} noValidate>
      <InputField label="Email" type="email" value={form.email} onChange={set("email")} placeholder="hello@indias.vn" error={errors.email} />
      <InputField label="Mật khẩu" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" error={errors.password} />
      <div className="au-forgot"><a href="/quen-mat-khau">Quên mật khẩu?</a></div>
      {serverError && <div className="au-server-error">{serverError}</div>}
      <button className="au-submit" type="submit" disabled={loading}>
        {loading ? <span className="au-spinner" /> : "Đăng nhập"}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }) {
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
    if (!form.username.trim()) e.username = "Vui lòng nhập tên đăng nhập";
    if (!form.email) e.email = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email không hợp lệ";
    if (!form.password) e.password = "Vui lòng nhập mật khẩu";
    else if (form.password.length < 6) e.password = "Mật khẩu tối thiểu 6 ký tự";
    if (!form.confirm) e.confirm = "Vui lòng xác nhận mật khẩu";
    else if (form.confirm !== form.password) e.confirm = "Mật khẩu không khớp";
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setServerError(""); setLoading(true);
    try {
      const data = await AuthService.register({
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      onSuccess?.(data, "register");
    } catch (err) {
      setServerError(err.message ?? "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Yếu", "Trung bình", "Mạnh"][strength];
  const strengthClass = ["", "weak", "medium", "strong"][strength];

  return (
    <form className="au-form" onSubmit={submit} noValidate>
      <InputField label="Họ và tên" value={form.fullName} onChange={set("fullName")} placeholder="Nguyễn Văn A" error={errors.fullName} />
      <InputField label="Tên đăng nhập" value={form.username} onChange={set("username")} placeholder="nguyenvana" error={errors.username} />
      <InputField label="Email" type="email" value={form.email} onChange={set("email")} placeholder="hello@indias.vn" error={errors.email} />
      <InputField label="Mật khẩu" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" error={errors.password} />
      {form.password && (
        <div className="au-strength">
          <div className="au-strength-bars">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`au-strength-bar ${strength >= n ? strengthClass : ""}`} />
            ))}
          </div>
          <span className={`au-strength-label ${strengthClass}`}>{strengthLabel}</span>
        </div>
      )}
      <InputField label="Xác nhận mật khẩu" type="password" value={form.confirm} onChange={set("confirm")} placeholder="••••••••" error={errors.confirm} />
      {serverError && <div className="au-server-error">{serverError}</div>}
      <button className="au-submit" type="submit" disabled={loading}>
        {loading ? <span className="au-spinner" /> : "Tạo tài khoản"}
      </button>
      <p className="au-terms">
        Bằng cách đăng ký, bạn đồng ý với <a href="#">Điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật</a> của INDIAS.
      </p>
    </form>
  );
}

export default function Auth({ defaultTab = "login", onLoginSuccess }) {
  const [tab, setTab] = useState(defaultTab);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("right");
  const [success, setSuccess] = useState(null);
  const [showForgot, setShowForgot] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      router.push("/");
    }
  }, []);

  const switchTab = (newTab) => {
    if (newTab === tab || animating) return;
    setDirection(newTab === "register" ? "right" : "left");
    setAnimating(true);
    setTimeout(() => { setTab(newTab); setAnimating(false); }, 300);
  };

  const handleSuccess = (data, type) => {
    setSuccess({ data, type });
    onLoginSuccess?.(data);
    window.dispatchEvent(new Event("user-logged-in"));
    try {
      const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
      const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? payload["role"] ?? "";
      setTimeout(() => { router.push(role === "Admin" ? "/admin" : "/"); }, 1500);
    } catch { setTimeout(() => { router.push("/"); }, 1500); }
  };

  if (success) {
    return (
      <div className="au-page" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
        <div className="au-success-wrap" style={{textAlign:"center"}}>
          <div className="au-success-icon">✓</div>
          <h2>{success.type === 'login' ? 'Chào mừng trở lại!' : 'Tài khoản đã được tạo!'}</h2>
          <p>Xin chào, <strong>{success.data?.user?.fullName || success.data?.user?.email}</strong></p>
          <a href="/" className="au-submit" style={{textDecoration:"none",display:"inline-flex",alignItems:"center",justifyContent:"center",marginTop:8}}>
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="au-page">
      <div className="au-wrap">

        {/* Left panel */}
        <div className="au-left">
          <div className="au-left-inner">
            <a href="/" className="au-brand">INDIAS</a>
            <h2 className="au-left-title">
              Phong cách<br /><em>bắt đầu từ đây</em>
            </h2>
            <p className="au-left-desc">
              Tham gia cùng hàng nghìn khách hàng đang tạo nên tủ quần áo có ý nghĩa.
            </p>
            <div className="au-left-deco">
              <span>🧥</span><span>👜</span><span>👟</span>
            </div>
          </div>
          <div className="au-left-circles">
            <div className="au-circle c1" />
            <div className="au-circle c2" />
          </div>
        </div>

        {/* Right panel */}
        <div className="au-right">
          <div className="au-right-inner">
            <div className="au-tabs">
              <button className={`au-tab ${tab === "login" ? "active" : ""}`} onClick={() => switchTab("login")} type="button">
                Đăng nhập
              </button>
              <button className={`au-tab ${tab === "register" ? "active" : ""}`} onClick={() => switchTab("register")} type="button">
                Đăng ký
              </button>
            </div>

            <div
              className="au-form-container"
              style={{
                animation: animating
                  ? `au-slide-out-${direction} 0.3s ease forwards`
                  : "au-slide-in 0.35s ease forwards",
              }}
            >
              <div className="au-tab-head">
                <h3>{tab === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}</h3>
                <p>
                  {tab === "login"
                    ? "Đăng nhập để tiếp tục mua sắm và theo dõi đơn hàng."
                    : "Đăng ký để nhận ưu đãi độc quyền dành cho thành viên."}
                </p>
              </div>

              {tab === "login"
                ? showForgot
                  ? <ForgotPasswordFlow onBack={() => setShowForgot(false)} />
                  : <LoginForm onSuccess={handleSuccess} onForgot={() => setShowForgot(true)} />
                : <RegisterForm onSuccess={handleSuccess} />
              }

              <div className="au-divider"><span>hoặc</span></div>

              <div className="au-switch">
                {tab === "login" ? (
                  <p>Chưa có tài khoản? <button type="button" onClick={() => switchTab("register")}>Đăng ký ngay</button></p>
                ) : (
                  <p>Đã có tài khoản? <button type="button" onClick={() => switchTab("login")}>Đăng nhập</button></p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
