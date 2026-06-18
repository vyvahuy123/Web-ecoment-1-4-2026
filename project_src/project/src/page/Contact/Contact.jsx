import { useState, useRef, useEffect } from "react";
import "./Contact.css";

function useFadeUp(ref) {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("visible", e.isIntersecting)),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".fade-up").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ref]);
}

export default function Contact() {
  const ref = useRef(null);
  useFadeUp(ref);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "Tư vấn sản phẩm", message: "",
  });
  const [sent, setSent] = useState(false);
  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };
  const SUBJECTS = ["Tư vấn sản phẩm", "Đổi / trả hàng", "Theo dõi đơn hàng", "Hợp tác kinh doanh", "Khác"];

  return (
    <div style={{ paddingTop: "68px" }}>
      <section id="contact" className="ec-section" ref={ref}>
        <div className="container">
          <div className="ec-section-head fade-up">
            <h2>Liên hệ với chúng tôi</h2>
          </div>
          <div className="ec-contact-grid">
            <div className="ec-contact-info">
              {[
                { icon: "📍", title: "Địa chỉ", line1: "123 Nguyễn Huệ, Quận 1", line2: "TP. Hồ Chí Minh, Việt Nam" },
                { icon: "📞", title: "Điện thoại", line1: "1800 1234 (Miễn phí)", line2: "028 3822 1234" },
                { icon: "✉", title: "Email", line1: "hello@indias.vn", line2: "support@indias.vn" },
                { icon: "🕐", title: "Giờ làm việc", line1: "Thứ Hai – Thứ Sáu: 8:00 – 22:00", line2: "Thứ Bảy – Chủ Nhật: 9:00 – 20:00" },
              ].map((item, i) => (
                <div className="ec-contact-item fade-up" key={item.title} style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="ec-contact-icon">{item.icon}</div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.line1}<br />{item.line2}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="ec-contact-right">
              <div className="ec-contact-form fade-up">
                <h3>Gửi tin nhắn</h3>
                {sent && <div className="ec-cf-alert">✓ Tin nhắn đã được gửi! Chúng tôi sẽ phản hồi trong 24h.</div>}
                <form onSubmit={submit}>
                  <div className="ec-cf-row">
                    <div className="ec-cf-group">
                      <label>Họ tên</label>
                      <input type="text" name="name" placeholder="Nguyễn Văn A" value={form.name} onChange={change} required />
                    </div>
                    <div className="ec-cf-group">
                      <label>Email</label>
                      <input type="email" name="email" placeholder="email@example.com" value={form.email} onChange={change} required />
                    </div>
                  </div>
                  <div className="ec-cf-row">
                    <div className="ec-cf-group">
                      <label>Số điện thoại</label>
                      <input type="tel" name="phone" placeholder="0901 234 567" value={form.phone} onChange={change} />
                    </div>
                    <div className="ec-cf-group">
                      <label>Chủ đề</label>
                      <select name="subject" value={form.subject} onChange={change}>
                        {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="ec-cf-group">
                    <label>Nội dung</label>
                    <textarea name="message" placeholder="Nhập nội dung tin nhắn..." value={form.message} onChange={change} required />
                  </div>
                  <button type="submit" className="ec-cf-submit">
                    {sent ? "Đã gửi ✓" : "Gửi tin nhắn"}
                  </button>
                </form>
              </div>
              <div className="ec-map fade-up">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4602592896394!2d106.70193147480814!3d10.777525589376742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a9d8d1bb3%3A0xd3d7b7c3a5a8b2e6!2zTmd1eeG7hW4gSHXhu4csIFF14bqtbiAxLCBUUC4gSOG7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2svn!4v1710000000000"
                  title="Store Location"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
