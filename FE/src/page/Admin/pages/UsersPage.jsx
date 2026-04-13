import { useState } from "react";

const USERS = [
  { initials: "NL", name: "Nguyễn Linh",  email: "linh@email.com", role: "User",  addresses: 3, orders: 12, status: "active" },
  { initials: "TM", name: "Trần Minh",    email: "minh@email.com", role: "User",  addresses: 1, orders: 5,  status: "active" },
  { initials: "PH", name: "Phạm Thu Hà",  email: "ha@email.com",   role: "User",  addresses: 2, orders: 8,  status: "inactive" },
  { initials: "LA", name: "Lê Văn An",    email: "an@email.com",   role: "Admin", addresses: 1, orders: 0,  status: "active" },
  { initials: "VB", name: "Võ Thị Bích",  email: "bich@email.com", role: "User",  addresses: 2, orders: 3,  status: "active" },
];

const STATUS_MAP = {
  active:   { label: "Hoạt động", cls: "badge-active" },
  inactive: { label: "Bị khóa",   cls: "badge-inactive" },
};
const FILTERS = ["Tất cả", "Hoạt động", "Bị khóa"];

export default function UsersPage() {
  const [active, setActive] = useState("Tất cả");

  const filtered = USERS.filter((u) => {
    if (active === "Hoạt động") return u.status === "active";
    if (active === "Bị khóa")   return u.status === "inactive";
    return true;
  });

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
        <button className="btn btn-sm btn-dark">+ Thêm user</button>
      </div>

      <div className="card">
        <div className="card__head">
          <span className="card__title">Danh sách người dùng ({filtered.length})</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Role</th>
                <th>Địa chỉ</th>
                <th>Đơn hàng</th>
                <th>Trạng thái</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.email}>
                  <td>
                    <div className="user-cell">
                      <div className="user-cell__avatar">{u.initials}</div>
                      <span className="user-cell__name">{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--g4)" }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === "Admin" ? "badge-new" : "badge-inactive"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.addresses} địa chỉ</td>
                  <td>{u.orders}</td>
                  <td>
                    <span className={`badge ${STATUS_MAP[u.status].cls}`}>
                      {STATUS_MAP[u.status].label}
                    </span>
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
