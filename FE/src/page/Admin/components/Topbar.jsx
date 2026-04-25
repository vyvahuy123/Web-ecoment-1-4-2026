const PAGE_TITLES = {
  dashboard:     "Dashboard",
  users:         "Người dùng",
  products:      "Sản phẩm",
  categories:    "Danh mục sản phẩm",
  orders:        "Đơn hàng",
  vouchers:      "Voucher",
  reviews:       "Đánh giá",
  payments:      "Thanh toán",
  notifications: "Thông báo",
};

export default function Topbar({ activePage }) {
  return (
    <header className="topbar">
      <div className="topbar__title">{PAGE_TITLES[activePage] ?? "Dashboard"}</div>
      <div className="topbar__right">
        <div className="topbar__search">
          <span style={{ fontSize: 13 }}>🔍</span>
          Tìm kiếm...
        </div>
        <button className="topbar__icon-btn">
          🔔
          <span className="topbar__dot" />
        </button>
      </div>
    </header>
  );
}
