import "./Footer.css";

export default function Footer() {
  return (
    <footer className="ec-footer">
      <div className="container">
        <div className="ec-footer-grid">
          <div>
            <span className="ec-footer-logo">INDIAS</span>
            <p>Thời trang tối giản cho cuộc sống hiện đại. Chất lượng không thỏa hiệp, phong cách không ồn ào.</p>
            <div className="ec-footer-social">
              {["IG", "FB", "TK", "YT"].map((s) => <a key={s} href="#">{s}</a>)}
            </div>
          </div>
          <div>
            <h4>Mua sắm</h4>
            <ul>
              {["Mới về", "Phụ nữ", "Đàn ông", "Phụ kiện", "Sale"].map((l) => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <h4>Hỗ trợ</h4>
            <ul>
              {["Câu hỏi thường gặp", "Chính sách đổi trả", "Hướng dẫn size", "Theo dõi đơn hàng", "Liên hệ"].map((l) => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <h4>Công ty</h4>
            <ul>
              {["Về chúng tôi", "Blog", "Tuyển dụng", "Bền vững", "Đại lý"].map((l) => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
            <div style={{ marginTop: 24, fontSize: 13, lineHeight: 1.8 }}>
              <p>📞 1800 1234</p>
              <p>✉ hello@indias.vn</p>
              <p>🕐 8:00 – 22:00 hàng ngày</p>
            </div>
          </div>
        </div>
        <div className="ec-footer-bottom">
          <p>© 2025 Indias. All rights reserved.</p>
          <div className="ec-footer-bottom-links">
            {["Chính sách bảo mật", "Điều khoản sử dụng", "Cookie"].map((l) => <a key={l} href="#">{l}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
