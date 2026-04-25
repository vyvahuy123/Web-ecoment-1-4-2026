import "../styles/components.css";

const STATS = [
  { label: "Doanh thu tháng",  value: "124.5M₫",  sub: "↑ 12.3% so với tháng trước",  cls: "up" },
  { label: "Đơn hàng mới",     value: "348",       sub: "↑ 8.1% so với tháng trước",   cls: "up" },
  { label: "Người dùng",       value: "1.842",     sub: "↑ 5.6% so với tháng trước",   cls: "up" },
  { label: "Sản phẩm",         value: "96",        sub: "8 sản phẩm hết hàng",          cls: "" },
];

const ORDERS = [
  { id: "#ORD-001", customer: "Nguyễn Linh",  total: "2.350.000₫", status: "Đã thanh toán", cls: "badge-paid" },
  { id: "#ORD-002", customer: "Trần Minh",    total: "890.000₫",   status: "Chờ xử lý",     cls: "badge-pending" },
  { id: "#ORD-003", customer: "Phạm Thu Hà",  total: "1.190.000₫", status: "Đang giao",     cls: "badge-shipped" },
  { id: "#ORD-004", customer: "Lê Văn An",    total: "750.000₫",   status: "Đã hủy",        cls: "badge-cancel" },
];

const CATS = [
  { label: "Women",       pct: 78, count: "124 SP" },
  { label: "Men",         pct: 60, count: "98 SP" },
  { label: "Accessories", pct: 48, count: "76 SP" },
  { label: "New Arrivals",pct: 20, count: "32 SP" },
];

const REVIEWS = [
  { user: "Nguyễn A", product: "Linen Blazer", stars: 5 },
  { user: "Trần B",   product: "Slip Dress",   stars: 4 },
];

const VOUCHERS = [
  { code: "SUMMER25",  desc: "-25% · còn 3 ngày",  cls: "badge-pending" },
  { code: "NEWUSER10", desc: "-10% · còn 7 ngày",  cls: "badge-active" },
  { code: "FLASH50",   desc: "-50% · còn 1 ngày",  cls: "badge-cancel" },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        {STATS.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card__label">{s.label}</div>
            <div className="stat-card__value">{s.value}</div>
            <div className={`stat-card__sub ${s.cls}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid-2">
        {/* Recent orders */}
        <div className="card">
          <div className="card__head">
            <span className="card__title">Đơn hàng gần đây</span>
            <button className="btn btn-sm btn-outline">Xem tất cả</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 500 }}>{o.id}</td>
                    <td>{o.customer}</td>
                    <td>{o.total}</td>
                    <td><span className={`badge ${o.cls}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category bar chart */}
        <div className="card">
          <div className="card__head">
            <span className="card__title">Danh mục bán chạy</span>
          </div>
          <div className="bar-chart">
            {CATS.map((c) => (
              <div className="bar-row" key={c.label}>
                <div className="bar-label">{c.label}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${c.pct}%` }} />
                </div>
                <div className="bar-value">{c.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid-2 mt-16">
        {/* Pending reviews */}
        <div className="card">
          <div className="card__head">
            <span className="card__title">Đánh giá chờ duyệt</span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Khách</th>
                  <th>Sản phẩm</th>
                  <th>Sao</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {REVIEWS.map((r) => (
                  <tr key={r.user}>
                    <td>{r.user}</td>
                    <td>{r.product}</td>
                    <td>{"★".repeat(r.stars)}</td>
                    <td><button className="btn btn-sm btn-dark">Duyệt</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vouchers expiring */}
        <div className="card">
          <div className="card__head">
            <span className="card__title">Voucher sắp hết hạn</span>
          </div>
          <div className="list-rows">
            {VOUCHERS.map((v) => (
              <div className="list-row" key={v.code}>
                <div className="list-row__main">
                  <strong>{v.code}</strong> · {v.desc}
                </div>
                <span className={`badge ${v.cls}`}>
                  {v.cls === "badge-active" ? "Còn hạn" : v.cls === "badge-pending" ? "Sắp hết" : "Nguy hiểm"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
