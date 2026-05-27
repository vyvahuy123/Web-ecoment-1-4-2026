const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/page/Auth/Auth.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Thêm ForgotPasswordFlow component trước LoginForm
const forgotComponent = `
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
              value={otp} onChange={e => setOtp(e.target.value.replace(/\\D/g, ""))}
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

`;

code = code.replace('function LoginForm({ onSuccess }) {', forgotComponent + 'function LoginForm({ onSuccess }) {');

// 2. Thêm state showForgot vào LoginForm
code = code.replace(
  `function LoginForm({ onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });`,
  `function LoginForm({ onSuccess, onForgot }) {
  const [form, setForm] = useState({ email: "", password: "" });`
);

// 3. Thay link Quên mật khẩu thành button có onClick
code = code.replace(
  `<div className="au-forgot"><a href="#">Quên mật khẩu?</a></div>`,
  `<div className="au-forgot"><button type="button" style={{background:"none",border:"none",cursor:"pointer",color:"inherit",fontSize:"inherit",textDecoration:"underline"}} onClick={onForgot}>Quên mật khẩu?</button></div>`
);

fs.writeFileSync(path, code);
console.log('Done:', code.includes('ForgotPasswordFlow') ? 'OK' : 'FAILED');
