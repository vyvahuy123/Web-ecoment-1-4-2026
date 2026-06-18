import { useEffect, useRef } from "react";
import "./About.css";

const VALUES = [
  { num: "01", title: "Tối giản", desc: "Chúng tôi tin rằng vẻ đẹp thực sự nằm ở sự tinh gọn — loại bỏ mọi thứ dư thừa, giữ lại những gì cốt lõi nhất." },
  { num: "02", title: "Bền vững", desc: "Mỗi sản phẩm được làm từ nguyên liệu có nguồn gốc rõ ràng, quy trình sản xuất có trách nhiệm với môi trường." },
  { num: "03", title: "Vượt thời gian", desc: "Không chạy theo xu hướng nhất thời. Chúng tôi tạo ra những thiết kế có thể đồng hành cùng bạn nhiều năm." },
];

const STATS = [
  { number: "2018", label: "Năm thành lập" },
  { number: "12K+", label: "Khách hàng tin tưởng" },
  { number: "3", label: "Bộ sưu tập mỗi năm" },
  { number: "100%", label: "Nguyên liệu tự nhiên" },
];

const TEAM = [
  { name: "Nguyễn Vân Anh", role: "Nhà sáng lập & Giám đốc sáng tạo", initial: "VA" },
  { name: "Trần Minh Khôi", role: "Giám đốc thiết kế", initial: "MK" },
  { name: "Lê Thu Hương", role: "Trưởng phòng chất lượng", initial: "TH" },
];

function useFadeUp(ref) {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("ab-visible", e.isIntersecting)),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".ab-fade").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ref]);
}

export default function About() {
  const ref = useRef(null);
  useFadeUp(ref);

  return (
    <div className="ab-page" ref={ref} style={{ paddingTop: "68px" }}>

      {/* Hero */}
      <section className="ab-hero">
        <div className="ab-hero-label ab-fade">Câu chuyện của chúng tôi</div>
        <h1 className="ab-hero-title ab-fade">
          Thời trang<br />
          <em>có lương tâm</em>
        </h1>
        <p className="ab-hero-sub ab-fade">
          INDIAS ra đời từ một niềm tin đơn giản — rằng quần áo tốt không cần phải to tiếng.
        </p>
        <div className="ab-hero-line ab-fade" />
      </section>

      {/* Story */}
      <section className="ab-story">
        <div className="ab-story-inner">
          <div className="ab-story-text ab-fade">
            <span className="ab-drop">I</span>
            <p>
              NDIAS bắt đầu từ một căn phòng nhỏ ở Hà Nội năm 2018, khi nhà sáng lập Vân Anh
              không tìm được những bộ quần áo phản ánh đúng phong cách sống của mình —
              tối giản, có chiều sâu, và không gây hại cho hành tinh.
            </p>
            <p>
              Từ một xưởng may nhỏ với 5 người thợ lành nghề, chúng tôi đã lớn lên cùng
              cộng đồng những người yêu thích thời trang có ý thức. Mỗi đường chỉ, mỗi
              tấm vải đều mang theo một câu chuyện về sự cẩn thận và trân trọng.
            </p>
            <p>
              Ngày nay, INDIAS phục vụ hàng nghìn khách hàng khắp Việt Nam — nhưng triết
              lý vẫn không thay đổi: <strong>ít hơn, tốt hơn, lâu bền hơn.</strong>
            </p>
          </div>
          <div className="ab-story-visual ab-fade">
            <div className="ab-visual-block">
              <div className="ab-visual-img">🧵</div>
              <div className="ab-visual-caption">Xưởng may Hà Nội, 2018</div>
            </div>
            <div className="ab-visual-accent">
              <span>"Mặc ít hơn,<br/>nghĩ nhiều hơn."</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="ab-stats">
        {STATS.map((s, i) => (
          <div className="ab-stat ab-fade" key={s.label} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="ab-stat-num">{s.number}</div>
            <div className="ab-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Values */}
      <section className="ab-values">
        <div className="ab-section-head ab-fade">
          <h2>Giá trị cốt lõi</h2>
        </div>
        <div className="ab-values-list">
          {VALUES.map((v, i) => (
            <div className="ab-value ab-fade" key={v.num} style={{ transitionDelay: `${i * 0.15}s` }}>
              <span className="ab-value-num">{v.num}</span>
              <div className="ab-value-body">
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="ab-team">
        <div className="ab-section-head ab-fade">
          <h2>Đội ngũ sáng lập</h2>
        </div>
        <div className="ab-team-grid">
          {TEAM.map((m, i) => (
            <div className="ab-member ab-fade" key={m.name} style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className="ab-member-avatar">{m.initial}</div>
              <h4>{m.name}</h4>
              <p>{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="ab-cta ab-fade">
        <h2>Cùng nhau xây dựng<br />tủ quần áo có ý nghĩa</h2>
        <a href="/san-pham" className="ab-cta-btn">Khám phá bộ sưu tập</a>
      </section>

    </div>
  );
}