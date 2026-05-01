import { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";

const fmt = (n) => Number(n).toLocaleString("vi-VN");
const fmtM = (n) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  return fmt(n);
};

const STATUS_VI = {
  Delivered: "Đã giao", Shipped: "Đang giao", Cancelled: "Đã hủy",
  Pending: "Chờ xác nhận", Processing: "Đang xử lý", Confirmed: "Đã xác nhận",
  PendingCancellation: "Chờ duyệt hủy"
};
const METHOD_VI = { COD: "COD", BankTransfer: "Chuyển khoản", VNPay: "VNPay", MoMo: "MoMo" };
const STATUS_COLOR = {
  Delivered: "#4ade80", Shipped: "#60a5fa", Cancelled: "#f87171",
  Pending: "#fbbf24", Processing: "#c084fc", Confirmed: "#34d399"
};
const RANK_COLORS = ["#a78bfa", "#4ade80", "#fbbf24", "#f87171", "#60a5fa"];
const PIE_COLORS = ["#a78bfa", "#4ade80", "#fbbf24", "#f87171", "#60a5fa", "#34d399"];

function BarChart({ data, valueKey, labelKey }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="db-bar-chart">
      {data.map((d, i) => {
        const pct = (d[valueKey] / max) * 100;
        const hasVal = d[valueKey] > 0;
        return (
          <div key={i} className="db-bar-col">
            <div className="db-bar-val-label">{hasVal ? fmtM(d[valueKey]) : ""}</div>
            <div className="db-bar-track">
              <div
                className={`db-bar-fill${hasVal ? "" : " empty"}`}
                style={{ height: hasVal ? `${Math.max(pct, 3)}%` : undefined }}
                title={`${d[labelKey]}: ${fmt(d[valueKey])}₫`}
              />
            </div>
            <div className="db-bar-x-label">{d[labelKey]}</div>
          </div>
        );
      })}
    </div>
  );
}

function PieChart({ data, size = 130 }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  let cum = 0;
  const slices = data.map((d, i) => {
    const pct = total > 0 ? d.count / total : 0;
    const start = cum; cum += pct;
    return { ...d, pct, start, color: PIE_COLORS[i % PIE_COLORS.length] };
  });
  const r = size / 2 - 8, cx = size / 2, cy = size / 2;
  const arc = (s, e) => {
    const a1 = s * 2 * Math.PI - Math.PI / 2;
    const a2 = e * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${e - s > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z`;
  };
  return (
    <div className="db-pie-wrap">
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => s.pct > 0 && (
          <path key={i} d={arc(s.start, s.start + s.pct)} fill={s.color} opacity={0.9} />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.52} fill="#161b22" />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize={12} fontWeight={800} fill="#e6edf3">{total}</text>
      </svg>
      <div className="db-pie-legend">
        {slices.map((s, i) => (
          <div key={i} className="db-pie-legend-item">
            <div className="db-pie-dot" style={{ background: s.color }} />
            <span className="db-pie-legend-label">{s.label}</span>
            <span className="db-pie-legend-pct">{(s.pct * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    setLoading(true);
    const params = { year };
    if (quarter > 0) params.quarter = quarter;
    api.get("/dashboard/stats", { params })
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [year, quarter]);

  if (loading) return (
    <div className="db-loading">
      <div className="db-loading-dot" />
      <div className="db-loading-dot" />
      <div className="db-loading-dot" />
    </div>
  );

  if (!data) return (
    <div className="db-loading" style={{ color: "#f87171" }}>⚠ Không thể tải dữ liệu</div>
  );

  const periodLabel = quarter > 0 ? `Q${quarter}/${year}` : `Năm ${year}`;
  const maxQ = Math.max(...data.quarterlyRevenue.map(q => q.revenue), 1);

  return (
    <div className="dashboard-root">

      {/* Header */}
      <div className="db-header">
        <div>
          <div className="db-header__title">Báo cáo doanh thu</div>
          <div className="db-header__sub">Tổng quan kinh doanh — {periodLabel}</div>
        </div>
        <div className="db-filters">
          <select className="db-select" value={year} onChange={e => setYear(+e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="db-select" value={quarter} onChange={e => setQuarter(+e.target.value)}>
            <option value={0}>Cả năm</option>
            <option value={1}>Quý 1 (T1–T3)</option>
            <option value={2}>Quý 2 (T4–T6)</option>
            <option value={3}>Quý 3 (T7–T9)</option>
            <option value={4}>Quý 4 (T10–T12)</option>
          </select>
        </div>
      </div>

      {/* KPI */}
      <div className="db-kpi-grid">
        {[
          { label: "Doanh thu", value: `${fmtM(data.totalRevenue)}₫`, sub: fmt(data.totalRevenue) + "₫", color: "#a78bfa", icon: "💰" },
          { label: "Đơn hàng", value: data.totalOrders, sub: `TB ${fmtM(data.averageOrderValue)}₫/đơn`, color: "#4ade80", icon: "📦" },
          { label: "Tỷ lệ hoàn thành", value: `${data.completionRate.toFixed(1)}%`, sub: `${data.orderStatuses.find(s=>s.status==="Delivered")?.count ?? 0} đơn hoàn thành`, color: "#fbbf24", icon: "✅" },
          { label: "Khách hàng", value: data.totalCustomers, sub: `+${data.newCustomers} mới kỳ này`, color: "#60a5fa", icon: "👥" },
        ].map((k, i) => (
          <div key={i} className="db-kpi-card" style={{ "--kpi-color": k.color }}>
            <div className="db-kpi-top">
              <div className="db-kpi-label">{k.label}</div>
              <div className="db-kpi-icon">{k.icon}</div>
            </div>
            <div className="db-kpi-value">{k.value}</div>
            <div className="db-kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly Chart */}
      <div className="db-card">
        <div className="db-card-title">Doanh thu theo tháng — {year}</div>
        <BarChart data={data.monthlyRevenue} valueKey="revenue" labelKey="monthName" />
      </div>

      {/* Quarterly */}
      <div className="db-card">
        <div className="db-card-title">So sánh doanh thu theo quý — {year}</div>
        <div className="db-quarter-grid">
          {data.quarterlyRevenue.map((q, i) => (
            <div key={i} className={`db-quarter-card${quarter === q.quarter ? " active" : ""}`}>
              <div className="db-quarter-label">{q.label}</div>
              <div className="db-quarter-revenue">{fmtM(q.revenue)}₫</div>
              <div className="db-quarter-orders">{q.orders} đơn</div>
              <div className="db-mini-bar">
                <div className="db-mini-bar-fill" style={{ width: `${(q.revenue / maxQ) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="db-bottom-grid">

        {/* Top Products */}
        <div className="db-card">
          <div className="db-card-title">Top sản phẩm</div>
          <div className="db-product-list">
            {data.topProducts.map((p, i) => (
              <div key={i} className="db-product-item">
                <div className="db-product-rank" style={{ background: RANK_COLORS[i] }}>{i + 1}</div>
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.productName} className="db-product-img"
                    onError={e => e.target.style.display = "none"} />
                )}
                <div className="db-product-info">
                  <div className="db-product-name">{p.productName}</div>
                  <div className="db-product-sold">Đã bán: {p.totalSold}</div>
                </div>
                <div className="db-product-revenue">{fmtM(p.totalRevenue)}₫</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="db-card">
          <div className="db-card-title">Phương thức thanh toán</div>
          <PieChart data={data.paymentMethods.map((m, i) => ({
            ...m, label: METHOD_VI[m.method] ?? m.method
          }))} />
          <div className="db-payment-detail">
            {data.paymentMethods.map((m, i) => (
              <div key={i} className="db-payment-row">
                <span>{METHOD_VI[m.method] ?? m.method}</span>
                <span>{fmtM(m.amount)}₫</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div className="db-card">
          <div className="db-card-title">Trạng thái đơn hàng</div>
          <div className="db-status-list">
            {data.orderStatuses.map((s, i) => {
              const max = Math.max(...data.orderStatuses.map(x => x.count), 1);
              return (
                <div key={i} className="db-status-item">
                  <div className="db-status-row">
                    <span className="db-status-name" style={{ color: STATUS_COLOR[s.status] ?? "#8b949e" }}>
                      {STATUS_VI[s.status] ?? s.status}
                    </span>
                    <span className="db-status-count">{s.count}</span>
                  </div>
                  <div className="db-mini-bar">
                    <div className="db-mini-bar-fill"
                      style={{ width: `${(s.count / max) * 100}%`, background: STATUS_COLOR[s.status] ?? "#a78bfa" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}