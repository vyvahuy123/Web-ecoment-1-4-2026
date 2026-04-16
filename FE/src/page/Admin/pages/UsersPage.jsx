import { useState } from "react";
import UserService from "@/services/user.service";
import { useFetch } from "@/hooks/useFetch";

const STATUS_MAP = {
  active:   { label: "Hoạt động", cls: "badge-active" },
  inactive: { label: "Bị khóa",   cls: "badge-inactive" },
};
const FILTERS = ["Tất cả", "Hoạt động", "Bị khóa"];

export default function UsersPage() {
  const [activeFilter, setActiveFilter] = useState("Tất cả");

  const { data, loading, error, refetch } = useFetch(
    () => UserService.getAll(),
    []
  );

  // Backend có thể trả về { items, totalCount } hoặc mảng thẳng
  const users = Array.isArray(data) ? data : (data?.items ?? []);

  const filtered = users.filter((u) => {
    if (activeFilter === "Hoạt động") return u.status === "active";
    if (activeFilter === "Bị khóa")   return u.status === "inactive";
    return true;
  });

  return (
    <div>
      <div className="page-filter">
        {FILTERS.map((f) => (
          <button key={f} className={`filter-tab${activeFilter === f ? " active" : ""}`}
            onClick={() => setActiveFilter(f)}>{f}</button>
        ))}
        <div className="filter-gap" />
        <button className="btn btn-sm btn-dark">+ Thêm user</button>
      </div>

      <div className="card">
        <div className="card__head">
          <span className="card__title">
            Danh sách người dùng ({loading ? "..." : filtered.length})
          </span>
        </div>

        {error && (
          <div style={{ padding: "16px 24px", color: "var(--red-text)", fontSize: 14 }}>
            ⚠️ {error} — <button className="btn btn-sm" onClick={refetch}>Thử lại</button>
          </div>
        )}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Người dùng</th><th>Email</th><th>Role</th>
                <th>Địa chỉ</th><th>Đơn hàng</th><th>Trạng thái</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }, (_, j) => (
                      <td key={j}><div className="skeleton-line" style={{ height: 14, borderRadius: 4 }} /></td>
                    ))}</tr>
                  ))
                : filtered.map((u) => {
                    const initials = u.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "??";
                    const statusKey = u.isActive === false ? "inactive" : (u.status ?? "active");
                    return (
                      <tr key={u.id ?? u.email}>
                        <td>
                          <div className="user-cell">
                            <div className="user-cell__avatar">{initials}</div>
                            <span className="user-cell__name">{u.name ?? u.fullName}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--g4)" }}>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === "Admin" ? "badge-new" : "badge-inactive"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.addressCount ?? u.addresses ?? 0} địa chỉ</td>
                        <td>{u.orderCount ?? u.orders ?? 0}</td>
                        <td>
                          <span className={`badge ${STATUS_MAP[statusKey]?.cls ?? "badge-inactive"}`}>
                            {STATUS_MAP[statusKey]?.label ?? "Không rõ"}
                          </span>
                        </td>
                        <td><button className="btn btn-icon">✎</button></td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}