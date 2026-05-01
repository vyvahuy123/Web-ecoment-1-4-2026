import { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";

const fmt = (n) => Number(n).toLocaleString("vi-VN");
const fmtM = (n) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
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
  Delivered: "#22c55e", Shipped: "#3b82f6", Cancelled: "#ef4444",
  Pending: "#f59e0b", Processing: "#8b5cf6", Confirmed: "#06b6d4"
};

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function MiniBar({ value, max, color = "#6366f1" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ background: "#f1f5f9", borderRadius: 4, height: 6, width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.6s" }} />
    </div>
  );
}

function KpiCard({ label, value, sub, color = "#6366f1", icon }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: `4px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a" }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 28 }}>{icon}</div>
      </div>
    </div>
  );
}

function BarChart({ data, valueKey, labelKey, color = "#6366f1", height = 160 }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height, paddingTop: 8 }}>
      {data.map((d, i) => {
        const pct = (d[valueKey] / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 9, color: "#94a3b8", whiteSpace: "nowrap" }}>
              {d[valueKey] > 0 ? fmtM(d[valueKey]) : ""}
            </div>
            <div
              title={`${d[labelKey]}: ${fmt(d[valueKey])}₫`}
              style={{
                width: "100%", borderRadius: "4px 4px 0 0",
                height: `${Math.max(pct, d[valueKey] > 0 ? 4 : 0)}%`,
                background: color, transition: "height 0.5s", cursor: "pointer",
                minHeight: d[valueKey] > 0 ? 4 : 0
              }}
            />
            <div style={{ fontSize: 9, color: "#94a3b8" }}>{d[labelKey]}</div>
          </div>
        );
      })}
    </div>
  );
}

function PieChart({ data, size = 120 }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  let cumulative = 0;
  const slices = data.map((d, i) => {
    const pct = total > 0 ? d.count / total : 0;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start, color: COLORS[i % COLORS.length] };
  });

  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;

  const describeArc = (startPct, endPct) => {
    const start = startPct * 2 * Math.PI - Math.PI / 2;
    const end = endPct * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = endPct - startPct > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={size} height={size}>
        {slices.map((s, i) => (
          s.pct > 0 && <path key={i} d={describeArc(s.start, s.start + s.pct)} fill={s.color} opacity={0.85} />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">{total}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: "#475569" }}>{s.label}</span>
            <span style={{ fontWeight: 600, color: "#0f172a", marginLeft: "auto" }}>{(s.pct * 100).toFixed(0)}%</span>
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#94a3b8", fontSize: 14 }}>
      ⏳ Đang tải dữ liệu...
    </div>
  );

  if (!data) return (
    <div style={{ padding: 32, color: "#ef4444" }}>Không thể tải dữ liệu dashboard.</div>
  );

  const periodLabel = quarter > 0 ? `Q${quarter}/${year}` : `Năm ${year}`;

  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header + Filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Báo cáo doanh thu</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", marginTop: 2 }}>Tổng quan kinh doanh — {periodLabel}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={year} onChange={e => setYear(+e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#fff", cursor: "pointer" }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={quarter} onChange={e => setQuarter(+e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#fff", cursor: "pointer" }}>
            <option value={0}>Cả năm</option>
            <option value={1}>Quý 1 (T1-T3)</option>
            <option value={2}>Quý 2 (T4-T6)</option>
            <option value={3}>Quý 3 (T7-T9)</option>
            <option value={4}>Quý 4 (T10-T12)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <KpiCard label="Doanh thu" value={`${fmtM(data.totalRevenue)}₫`} sub={`${fmt(data.totalRevenue)}₫`} color="#6366f1" icon="💰" />
        <KpiCard label="Đơn hàng" value={data.totalOrders} sub={`TB: ${fmtM(data.averageOrderValue)}₫/đơn`} color="#22c55e" icon="📦" />
        <KpiCard label="Tỷ lệ hoàn thành" value={`${data.completionRate.toFixed(1)}%`} color="#f59e0b" icon="✅" />
        <KpiCard label="Khách hàng" value={data.totalCustomers} sub={`+${data.newCustomers} mới`} color="#06b6d4" icon="👥" />
      </div>

      {/* Monthly Revenue Chart */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a", marginBottom: 16 }}>
          📈 Doanh thu theo tháng — {year}
        </div>
        <BarChart data={data.monthlyRevenue} valueKey="revenue" labelKey="monthName" color="#6366f1" height={180} />
      </div>

      {/* Quarterly Comparison */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a", marginBottom: 16 }}>
          📊 So sánh doanh thu theo quý — {year}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {data.quarterlyRevenue.map((q, i) => (
            <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "16px", textAlign: "center", border: quarter === q.quarter ? "2px solid #6366f1" : "2px solid transparent" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", marginBottom: 6 }}>{q.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{fmtM(q.revenue)}₫</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{q.orders} đơn</div>
              <MiniBar value={q.revenue} max={Math.max(...data.quarterlyRevenue.map(x => x.revenue), 1)} color="#6366f1" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

        {/* Top Products */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a", marginBottom: 16 }}>🏆 Top sản phẩm</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.topProducts.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{i + 1}</div>
                {p.imageUrl && <img src={p.imageUrl} alt={p.productName} style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.productName}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Đã bán: {p.totalSold}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", flexShrink: 0 }}>{fmtM(p.totalRevenue)}₫</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a", marginBottom: 16 }}>💳 Phương thức TT</div>
          <PieChart data={data.paymentMethods.map(m => ({ ...m, label: METHOD_VI[m.method] ?? m.method }))} />
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {data.paymentMethods.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#475569" }}>{METHOD_VI[m.method] ?? m.method}</span>
                <span style={{ fontWeight: 600 }}>{fmtM(m.amount)}₫</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a", marginBottom: 16 }}>📋 Trạng thái đơn hàng</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.orderStatuses.map((s, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: STATUS_COLOR[s.status] ?? "#64748b", fontWeight: 600 }}>{STATUS_VI[s.status] ?? s.status}</span>
                  <span style={{ fontWeight: 700 }}>{s.count}</span>
                </div>
                <MiniBar value={s.count} max={Math.max(...data.orderStatuses.map(x => x.count), 1)} color={STATUS_COLOR[s.status] ?? "#64748b"} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}