"use client";
import { useRef, useEffect } from "react";
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

const CONTACT_ITEMS = [
  {
    icon: "👤",
    title: "Người liên hệ",
    line1: "Triệu Vỹ",
    line2: "Phụ trách tư vấn & hỗ trợ khách hàng",
  },
  {
    icon: "📞",
    title: "Điện thoại",
    line1: "0906 645 842",
    line2: null,
    href: "tel:0906645842",
  },
  {
    icon: "✉",
    title: "Email",
    line1: "vyva2004@gmail.com",
    line2: null,
    href: "mailto:vyva2004@gmail.com",
  },
  {
    icon: "📍",
    title: "Địa chỉ",
    line1: "123 Nguyễn Huệ, Quận 1",
    line2: "TP. Hồ Chí Minh, Việt Nam",
  },
  {
    icon: "🕐",
    title: "Giờ làm việc",
    line1: "Thứ Hai – Thứ Sáu: 8:00 – 22:00",
    line2: "Thứ Bảy – Chủ Nhật: 9:00 – 20:00",
  },
];

export default function Contact() {
  const ref = useRef(null);
  useFadeUp(ref);

  return (
    <div style={{ paddingTop: "68px" }}>
      <section id="contact" className="ec-section" ref={ref}>
        <div className="container">
          <div className="ec-section-head fade-up">
            <h2>Liên hệ với chúng tôi</h2>
          </div>

          <div className="ec-contact-grid">
            {/* LEFT — Avatar + Contact Cards */}
            <div className="ec-contact-info">
              <div className="ec-contact-avatar-card fade-up">
                <div className="ec-avatar-circle">TV</div>
                <div className="ec-avatar-text">
                  <span className="ec-avatar-name">Triệu Vỹ</span>
                  <span className="ec-avatar-role">Tư vấn viên</span>
                </div>
                <div className="ec-avatar-badge">Sẵn sàng hỗ trợ</div>
              </div>

              {CONTACT_ITEMS.filter((_, i) => i > 0).map((item, i) => (
                <div
                  className="ec-contact-item fade-up"
                  key={item.title}
                  style={{ transitionDelay: `${(i + 1) * 0.1}s` }}
                >
                  <div className="ec-contact-icon">{item.icon}</div>
                  <div>
                    <h4>{item.title}</h4>
                    {item.href ? (
                      <p>
                        <a href={item.href}>{item.line1}</a>
                        {item.line2 && <><br />{item.line2}</>}
                      </p>
                    ) : (
                      <p>
                        {item.line1}
                        {item.line2 && <><br />{item.line2}</>}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT — CTA + Map */}
            <div className="ec-contact-right">
              <div className="ec-contact-cta fade-up">
                <div className="ec-cta-text">
                  <h3>Bắt đầu cuộc trò chuyện</h3>
                  <p>
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn qua điện thoại hoặc email.
                    Liên hệ ngay để được tư vấn nhanh nhất.
                  </p>
                </div>
                <div className="ec-cta-actions">
                  <a href="tel:0906645842" className="ec-cta-btn ec-cta-primary">
                    <span>📞</span> Gọi ngay
                  </a>
                  <a href="https://mail.google.com/mail/?view=cm&to=vyva2004@gmail.com" target="_blank" rel="noreferrer" className="ec-cta-btn ec-cta-secondary">
                    <span>✉</span> Gửi email
                  </a>
                </div>
              </div>

              <div className="ec-map fade-up" style={{ transitionDelay: "0.2s" }}>
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