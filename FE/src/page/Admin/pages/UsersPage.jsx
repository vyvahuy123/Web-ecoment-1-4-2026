import { useState } from "react";
import UserService from "@/services/user.service";
import { useFetch } from "@/hooks/useFetch";

const STATUS_MAP = {
  active:   { label: "Hoạt động", cls: "badge-active" },
  inactive: { label: "Bị khóa",   cls: "badge-inactive" },
};
const FILTERS = ["Tất cả", "Hoạt động", "Bị khóa"];

// ── User Detail Panel ──────────────────────────────────────────────────────
function UserDetailPanel({ user, onClose, onRefetch }) {
  const [orders, setOrders]       = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await UserService.getOrders(user.id);
      setOrders(Array.isArray(data) ? data : (data?.items ?? []));
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useState(() => { loadOrders(); }, []);

  const handleToggleStatus = async () => {
    try {
      if (user.isActive) {
        await UserService.deactivate(user.id);
        setActionMsg("Đã khóa tài khoản.");
      } else {
        await UserService.activate(user.id);
        setActionMsg("Đã kích hoạt tài khoản.");
      }
      onRefetch();
    } catch (e) {
      setActionMsg(e?.message ?? "Lỗi.");
    }
  };

  const handleChangeRole = async (newRole) => {
    try {
      await UserService.updateRole(user.id, newRole);
      setActionMsg(`Đã đổi role thành ${newRole}.`);
      onRefetch();
    } catch (e) {
      setActionMsg(e?.message ?? "Lỗi.");
    }
  };

  const initials = (user.fullName ?? user.name ?? "??")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const currentRole = user.roles?.[0] ?? "Customer";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 560, maxHeight: "80vh", overflowY: "auto" }}>
        <div className="modal-head">
          <span className="modal-title">Chi tiết người dùng</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* User info */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
            <div className="user-cell__avatar" style={{ width: 52, height: 52, fontSize: 18, borderRadius: "50%", background: "#1a1a1a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{user.fullName ?? user.name}</div>
              <div style={{ color: "var(--g4)", fontSize: 13 }}>{user.email}</div>
              <div style={{ color: "var(--g4)", fontSize: 12, marginTop: 2 }}>
                Tham gia: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                {user.lastLoginAt && ` · Đăng nhập lần cuối: ${new Date(user.lastLoginAt).toLocaleDateString("vi-VN")}`}
              </div>
            </div>
          </div>

          {actionMsg && (
            <div style={{ padding: "8px 12px", background: "#f0f9f0", border: "1px solid #c3e6cb", borderRadius: 6, fontSize: 13, marginBottom: 12, color: "#2d6a2d" }}>
              {actionMsg}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {/* Đổi role */}
            <button
              className={`btn btn-sm ${currentRole === "Admin" ? "btn-dark" : ""}`}
              onClick={() => handleChangeRole(currentRole === "Admin" ? "Customer" : "Admin")}
            >
              {currentRole === "Admin" ? "↓ Hạ xuống Customer" : "↑ Nâng lên Admin"}
            </button>

            {/* Khóa/Mở khóa */}
            <button
              className={`btn btn-sm ${user.isActive ? "btn-danger" : ""}`}
              onClick={handleToggleStatus}
            >
              {user.isActive ? "🔒 Khóa tài khoản" : "🔓 Kích hoạt"}
            </button>
          </div>

          {/* Orders */}
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
            Lịch sử đơn hàng
          </div>
          {loadingOrders ? (
            <div style={{ color: "var(--g4)", fontSize: 13 }}>Đang tải...</div>
          ) : orders?.length === 0 ? (
            <div style={{ color: "var(--g3)", fontSize: 13 }}>Chưa có đơn hàng nào.</div>
          ) : (
            <table className="table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>#{o.id?.slice(0, 8)}</td>
                    <td>{Number(o.total ?? o.totalAmount ?? 0).toLocaleString("vi-VN")}₫</td>
                    <td><span className="badge badge-pending">{o.status}</span></td>
                    <td style={{ color: "var(--g4)" }}>{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-sm" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [selectedUser, setSelectedUser] = useState(null);

  const { data, loading, error, refetch } = useFetch(() => UserService.getAll(), []);
  const users = Array.isArray(data) ? data : (data?.items ?? []);

  const filtered = users.filter((u) => {
    if (activeFilter === "Hoạt động") return u.isActive === true;
    if (activeFilter === "Bị khóa")   return u.isActive === false;
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
          <span className="card__title">Danh sách người dùng ({loading ? "..." : filtered.length})</span>
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
                <th>Người dùng</th>
                <th>Email</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }, (_, j) => (
                      <td key={j}><div className="skeleton-line" style={{ height: 14, borderRadius: 4 }} /></td>
                    ))}</tr>
                  ))
                : filtered.map((u) => {
                    const initials = (u.fullName ?? u.name ?? "??")
                      .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                    const statusKey = u.isActive === false ? "inactive" : "active";
                    return (
                      <tr key={u.id ?? u.email} style={{ cursor: "pointer" }}
                        onClick={() => setSelectedUser(u)}>
                        <td>
                          <div className="user-cell">
                            <div className="user-cell__avatar">{initials}</div>
                            <span className="user-cell__name">{u.fullName ?? u.name}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--g4)" }}>{u.email}</td>
                        <td>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {(u.roles ?? []).map((r) => (
                              <span key={r} className={`badge ${r === "Admin" ? "badge-new" : "badge-inactive"}`}>{r}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${STATUS_MAP[statusKey]?.cls}`}>
                            {STATUS_MAP[statusKey]?.label}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-icon" onClick={() => setSelectedUser(u)}>👁</button>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRefetch={() => { refetch(); setSelectedUser(null); }}
        />
      )}
    </div>
  );
}