import { useState } from "react";

const PRODUCTS = [
  { name: "Oversized Linen Blazer", cat: "Women",      price: "1.890.000₫", stock: 24,  images: 3, badge: "new" },
  { name: "Slim Fit Chino Pants",   cat: "Men",        price: "890.000₫",   stock: 0,   images: 2, badge: "sale" },
  { name: "Silk Slip Dress",        cat: "Women",      price: "2.350.000₫", stock: 12,  images: 4, badge: "new" },
  { name: "Structured Tote Bag",    cat: "Accessories",price: "1.450.000₫", stock: 7,   images: 3, badge: null },
  { name: "Merino Wool Turtleneck", cat: "Men",        price: "1.190.000₫", stock: 0,   images: 2, badge: "sale" },
  { name: "Wide-Leg Trousers",      cat: "Women",      price: "990.000₫",   stock: 18,  images: 3, badge: null },
  { name: "Canvas Sneakers",        cat: "Men",        price: "750.000₫",   stock: 31,  images: 2, badge: "new" },
  { name: "Leather Card Holder",    cat: "Accessories",price: "350.000₫",   stock: 45,  images: 2, badge: null },
];

const FILTERS = ["Tất cả", "Women", "Men", "Accessories"];

const BADGE_MAP = {
  new:  { label: "Mới",  cls: "badge-new" },
  sale: { label: "Sale", cls: "badge-cancel" },
};

export default function ProductsPage() {
  const [active, setActive] = useState("Tất cả");

  const filtered = PRODUCTS.filter((p) =>
    active === "Tất cả" ? true : p.cat === active
  );

  return (
    <div>
      <div className="page-filter">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-tab${active === f ? " active" : ""}`}
            onClick={() => setActive(f)}
          >
            {f}
          </button>
        ))}
        <div className="filter-gap" />
        <button className="btn btn-sm btn-dark">+ Thêm sản phẩm</button>
      </div>

      <div className="card">
        <div className="card__head">
          <span className="card__title">Danh sách sản phẩm ({filtered.length})</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Ảnh</th>
                <th>Badge</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.name}>
                  <td style={{ fontWeight: 500, maxWidth: 220 }}>{p.name}</td>
                  <td>{p.cat}</td>
                  <td>{p.price}</td>
                  <td>
                    <span style={{ color: p.stock === 0 ? "var(--red-text)" : "inherit", fontWeight: p.stock === 0 ? 500 : 400 }}>
                      {p.stock === 0 ? "Hết hàng" : p.stock}
                    </span>
                  </td>
                  <td style={{ color: "var(--g4)" }}>{p.images} ảnh</td>
                  <td>
                    {p.badge
                      ? <span className={`badge ${BADGE_MAP[p.badge].cls}`}>{BADGE_MAP[p.badge].label}</span>
                      : <span style={{ color: "var(--g3)" }}>—</span>
                    }
                  </td>
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
