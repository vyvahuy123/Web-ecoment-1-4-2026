"use client";
import { useState } from "react";
import UserService from "@/services/user.service";
import { useFetch } from "@/hooks/useFetch";
import { OrderDetailModal } from "@/page/Admin/pages/OrderDetailModal";

const STATUS_MAP = {
  active:   { label: "Hoạt động", cls: "badge-active" },
  inactive: { label: "Bị khóa",   cls: "badge-inactive" },
};
const FILTERS = ["Tất cả", "Hoạt động", "Bị khóa"];

const ORDER_STATUS_MAP = {
  Pending:    { label: "Chờ xử lý",  cls: "badge-pending" },
  Processing: { label: "Đang xử lý", cls: "badge-new" },
  Shipped:    { label: "Đang giao",  cls: "badge-active" },
  Delivered:  { label: "Hoàn thành", cls: "badge-active" },
  Cancelled:  { label: "Đã hủy",     cls: "badge-inactive" },
};

function StatCard({ label, value, sub }) {
  return (
    <div style={{ flex: 1, minWidth: 100, background: "var(--bg2,#f9f9f9)", borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontSize: 11, color: "var(--g4)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--g4)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function UserDetailPanel({ user, onClose, onRefetch }) {
  const [orders, setOrders]               = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [actionMsg, setActionMsg]         = useState("");
  const [tab, setTab]                     = useState("orders");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await UserService.getOrders(user.id);
      setOrders(Array.isArray(data) ? data : (data?.items ?? []));
    } catch { setOrders([]); }
    finally { setLoadingOrders(false); }
  };

  useState(() => { loadOrders(); }, []);

  const handleToggleStatus = async () => {
    try {
      if (user.isActive) { await UserService.deactivate(user.id); setActionMsg("Đã khóa tài khoản."); }
      else { await UserService.activate(user.id); setActionMsg("Đã kích hoạt tài khoản."); }
      onRefetch();
    } catch (e) { setActionMsg(e?.message ?? "Lỗi."); }
  };

  const handleChangeRole = async (newRole) => {
    try {
      await UserService.updateRole(user.id, newRole);
      setActionMsg("Đã đổi role thành " + newRole + ".");
      onRefetch();
    } catch (e) { setActionMsg(e?.message ?? "Lỗi."); }
  };

  const initials     = (user.fullName ?? user.name ?? "??").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const currentRole  = user.roles?.[0] ?? "Customer";
  const totalSpent   = (orders ?? []).reduce((s, o) => s + Number(o.total ?? o.totalAmount ?? 0), 0);
  const pendingCount = (orders ?? []).filter(o => o.status === "Pending").length;
  const joinedDays   = user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt)) / 86400000) : null;

  const tabs = [
    { id: "orders", label: "Đơn hàng (" + (orders?.length ?? "...") + ")" },
    { id: "info",   label: "Thông tin" },
  ];

  return (
    <>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 600, maxHeight: "85vh", overflowY: "auto" }}>
        <div className="modal-head">
          <span className="modal-title">Chi tiết người dùng</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, fontSize: 20, borderRadius: "50%", background: "#1a1a1a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{user.fullName ?? user.name}</div>
              <div style={{ color: "var(--g4)", fontSize: 13 }}>{user.email}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                {(user.roles ?? []).map(r => (
                  <span key={r} className={"badge " + (r === "Admin" ? "badge-new" : "badge-inactive")}>{r}</span>
                ))}
                <span className={"badge " + (user.isActive !== false ? "badge-active" : "badge-inactive")}>
                  {user.isActive !== false ? "Hoạt động" : "Bị khóa"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <StatCard label="Tổng đơn"      value={orders?.length ?? "—"} />
            <StatCard label="Tổng chi tiêu" value={orders ? totalSpent.toLocaleString("vi-VN") + "₫" : "—"} />
            <StatCard label="Chờ xử lý"     value={pendingCount} />
            <StatCard label="Ngày tham gia" value={joinedDays !== null ? joinedDays + " ngày" : "—"}
              sub={user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : ""} />
          </div>

          {actionMsg && (
            <div style={{ padding: "8px 12px", background: "#f0f9f0", border: "1px solid #c3e6cb", borderRadius: 6, fontSize: 13, marginBottom: 12, color: "#2d6a2d" }}>
              {actionMsg}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <button className={"btn btn-sm " + (currentRole === "Admin" ? "btn-dark" : "")}
              onClick={() => handleChangeRole(currentRole === "Admin" ? "Customer" : "Admin")}>
              {currentRole === "Admin" ? "↓ Hạ xuống Customer" : "↑ Nâng lên Admin"}
            </button>
            <button className={"btn btn-sm " + (user.isActive ? "btn-danger" : "")} onClick={handleToggleStatus}>
              {user.isActive ? "🔒 Khóa tài khoản" : "🔓 Kích hoạt"}
            </button>
          </div>

          <div style={{ display: "flex", borderBottom: "1px solid var(--border,#eee)", marginBottom: 14 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "8px 16px", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                  background: "none", border: "none",
                  borderBottom: tab === t.id ? "2px solid #1a1a1a" : "2px solid transparent",
                  cursor: "pointer", color: tab === t.id ? "#1a1a1a" : "var(--g4)" }}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "orders" && (
            loadingOrders ? (
              <div style={{ color: "var(--g4)", fontSize: 13 }}>Đang tải...</div>
            ) : orders?.length === 0 ? (
              <div style={{ color: "var(--g3)", fontSize: 13 }}>Chưa có đơn hàng nào.</div>
            ) : (
              <table className="table" style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Mã đơn</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày đặt</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((o) => {
                    const st = ORDER_STATUS_MAP[o.status] ?? { label: o.status, cls: "badge-pending" };
                    return (
                      <tr key={o.id} style={{ cursor: "pointer" }}
                        onClick={() => setSelectedOrderId(o.id)}>
                        <td style={{ fontFamily: "monospace", fontSize: 12 }}>#{o.id?.slice(0, 8)}</td>
                        <td style={{ fontWeight: 600 }}>{Number(o.total ?? o.totalAmount ?? 0).toLocaleString("vi-VN")}₫</td>
                        <td><span className={"badge " + st.cls}>{st.label}</span></td>
                        <td style={{ color: "var(--g4)" }}>{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}

          {tab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              {[
                ["Họ tên",             user.fullName ?? user.name ?? "—"],
                ["Email",              user.email ?? "—"],
                ["Số điện thoại",      user.phoneNumber ?? user.phone ?? "—"],
                ["Địa chỉ",            user.address ?? "—"],
                ["Ngày tham gia",      user.createdAt ? new Date(user.createdAt).toLocaleString("vi-VN") : "—"],
                ["Đăng nhập lần cuối", user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("vi-VN") : "Chưa có dữ liệu"],
                ["Trạng thái",         user.isActive !== false ? "Đang hoạt động" : "Bị khóa"],
                ["Role",               (user.roles ?? []).join(", ") || "—"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", borderBottom: "1px solid var(--border,#f0f0f0)", paddingBottom: 8 }}>
                  <span style={{ width: 160, color: "var(--g4)", flexShrink: 0 }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-sm" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
    {selectedOrderId && <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />}
  </>
  );
}

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
          <button key={f} className={"filter-tab" + (activeFilter === f ? " active" : "")}
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
                <th>Người dùng</th><th>Email</th><th>Role</th><th>Trạng thái</th><th style={{ width: 60 }}></th>
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
                    const initials  = (u.fullName ?? u.name ?? "??").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                    const statusKey = u.isActive === false ? "inactive" : "active";
                    return (
                      <tr key={u.id ?? u.email} style={{ cursor: "pointer" }} onClick={() => setSelectedUser(u)}>
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
                              <span key={r} className={"badge " + (r === "Admin" ? "badge-new" : "badge-inactive")}>{r}</span>
                            ))}
                          </div>
                        </td>
                        <td><span className={"badge " + STATUS_MAP[statusKey]?.cls}>{STATUS_MAP[statusKey]?.label}</span></td>
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
        <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)}
          onRefetch={() => { refetch(); setSelectedUser(null); }} />
      )}
    </div>
  );
}
