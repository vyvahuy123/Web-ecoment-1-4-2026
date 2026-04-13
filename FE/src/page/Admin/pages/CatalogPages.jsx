import { useState } from "react";

/* ══════════════════════════════════════════════════════
   CATEGORIES
══════════════════════════════════════════════════════ */
const CATS = [
  { name: "Women",       slug: "women",       products: 124, status: "active" },
  { name: "Men",         slug: "men",         products: 98,  status: "active" },
  { name: "Accessories", slug: "accessories", products: 76,  status: "active" },
  { name: "New Arrivals",slug: "new-arrivals",products: 32,  status: "active" },
];

export function CategoriesPage() {
  return (
    <div>
      <div className="page-filter">
        <div className="filter-gap" />
        <button className="btn btn-sm btn-dark">+ Thêm danh mục</button>
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">Danh mục sản phẩm ({CATS.length})</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th>Số sản phẩm</th>
                <th>Trạng thái</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {CATS.map((c) => (
                <tr key={c.slug}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ color: "var(--g4)", fontFamily: "monospace", fontSize: 12 }}>{c.slug}</td>
                  <td>{c.products}</td>
                  <td><span className="badge badge-active">Hoạt động</span></td>
                  <td><button className="btn btn-icon">✎</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ORDERS
══════════════════════════════════════════════════════ */
const ORDERS = [
  { id: "#ORD-001", customer: "Nguyễn Linh", items: 2, total: "2.350.000₫", voucher: "SUMMER25",  pay: { label: "Đã TT",   cls: "badge-paid" },    status: { label: "Đang giao",  cls: "badge-shipped" } },
  { id: "#ORD-002", customer: "Trần Minh",   items: 1, total: "890.000₫",   voucher: "—",         pay: { label: "Chờ TT",  cls: "badge-pending" }, status: { label: "Chờ xử lý", cls: "badge-pending" } },
  { id: "#ORD-003", customer: "Phạm Thu Hà", items: 3, total: "1.190.000₫", voucher: "NEWUSER10", pay: { label: "Đã TT",   cls: "badge-paid" },    status: { label: "Đang giao",  cls: "badge-shipped" } },
  { id: "#ORD-004", customer: "Lê Văn An",   items: 1, total: "750.000₫",   voucher: "—",         pay: { label: "Hoàn TT", cls: "badge-cancel" },  status: { label: "Đã hủy",    cls: "badge-cancel" } },
  { id: "#ORD-005", customer: "Võ Thị Bích", items: 2, total: "1.240.000₫", voucher: "FLASH50",   pay: { label: "Đã TT",   cls: "badge-paid" },    status: { label: "Hoàn tất",   cls: "badge-active" } },
];

const ORDER_FILTERS = ["Tất cả", "Chờ xử lý", "Đang giao", "Hoàn tất", "Đã hủy"];

export function OrdersPage() {
  const [active, setActive] = useState("Tất cả");

  const filtered = ORDERS.filter((o) => {
    if (active === "Tất cả") return true;
    return o.status.label === active;
  });

  return (
    <div>
      <div className="page-filter">
        {ORDER_FILTERS.map((f) => (
          <button key={f} className={`filter-tab${active === f ? " active" : ""}`} onClick={() => setActive(f)}>{f}</button>
        ))}
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">Danh sách đơn hàng ({filtered.length})</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>SL</th>
                <th>Tổng tiền</th>
                <th>Voucher</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 500 }}>{o.id}</td>
                  <td>{o.customer}</td>
                  <td>{o.items} SP</td>
                  <td style={{ fontWeight: 500 }}>{o.total}</td>
                  <td style={{ color: o.voucher === "—" ? "var(--g3)" : "inherit" }}>{o.voucher}</td>
                  <td><span className={`badge ${o.pay.cls}`}>{o.pay.label}</span></td>
                  <td><span className={`badge ${o.status.cls}`}>{o.status.label}</span></td>
                  <td><button className="btn btn-icon">✎</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   VOUCHERS
══════════════════════════════════════════════════════ */
const VOUCHERS = [
  { code: "SUMMER25",  type: "Phần trăm", value: "25%",      used: 48, limit: "100",  expires: "14/04/2025", statusLabel: "Sắp hết",   cls: "badge-pending" },
  { code: "NEWUSER10", type: "Phần trăm", value: "10%",      used: 12, limit: "∞",    expires: "30/06/2025", statusLabel: "Còn hạn",   cls: "badge-active" },
  { code: "FLASH50",   type: "Cố định",   value: "50.000₫",  used: 99, limit: "100",  expires: "12/04/2025", statusLabel: "Nguy hiểm", cls: "badge-cancel" },
  { code: "WELCOME15", type: "Phần trăm", value: "15%",      used: 5,  limit: "∞",    expires: "31/12/2025", statusLabel: "Còn hạn",   cls: "badge-active" },
];

const VOUCHER_FILTERS = ["Tất cả", "Còn hạn", "Sắp hết", "Hết hạn"];

export function VouchersPage() {
  const [active, setActive] = useState("Tất cả");

  const filtered = VOUCHERS.filter((v) => {
    if (active === "Tất cả") return true;
    return v.statusLabel === active;
  });

  return (
    <div>
      <div className="page-filter">
        {VOUCHER_FILTERS.map((f) => (
          <button key={f} className={`filter-tab${active === f ? " active" : ""}`} onClick={() => setActive(f)}>{f}</button>
        ))}
        <div className="filter-gap" />
        <button className="btn btn-sm btn-dark">+ Tạo voucher</button>
      </div>
      <div className="card">
        <div className="card__head">
          <span className="card__title">Danh sách voucher ({filtered.length})</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Mã voucher</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đã dùng</th>
                <th>Giới hạn</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.code}>
                  <td style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 13 }}>{v.code}</td>
                  <td style={{ color: "var(--g4)" }}>{v.type}</td>
                  <td style={{ fontWeight: 500 }}>{v.value}</td>
                  <td>{v.used}</td>
                  <td>{v.limit}</td>
                  <td style={{ color: "var(--g4)" }}>{v.expires}</td>
                  <td><span className={`badge ${v.cls}`}>{v.statusLabel}</span></td>
                  <td><button className="btn btn-icon">✎</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
