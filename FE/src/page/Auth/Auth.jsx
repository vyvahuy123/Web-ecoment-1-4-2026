import { useState } from "react";
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

function LoginForm({ onSuccess }) {
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
      <div className="au-forgot"><a href="#">Quên mật khẩu?</a></div>
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

  const switchTab = (newTab) => {
    if (newTab === tab || animating) return;
    setDirection(newTab === "register" ? "right" : "left");
    setAnimating(true);
    setTimeout(() => { setTab(newTab); setAnimating(false); }, 300);
  };

  const handleSuccess = (data, type) => {
    setSuccess({ data, type });
    // Gọi callback lên App nếu có (để update navbar, redirect...)
    onLoginSuccess?.(data);
  };

  if (success) {
    return (
      <div className="au-page">
        <div className="au-success-wrap">
          <div className="au-success-icon">✓</div>
          <h2>{success.type === "login" ? "Chào mừng trở lại!" : "Tài khoản đã được tạo!"}</h2>
          <p>Xin chào, <strong>{success.data?.user?.fullName || success.data?.user?.email}</strong></p>
          <a
            href="/"
            className="au-submit"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}
          >
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
                ? <LoginForm onSuccess={handleSuccess} />
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