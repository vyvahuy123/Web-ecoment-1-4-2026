"use client";
import { useState, useEffect } from "react";
import OrderService from "@/services/order.service";

const ORDER_STATUS_MAP = {
  Pending:             { label: "Chờ xử lý",    cls: "badge-pending" },
  Processing:          { label: "Đang xử lý",   cls: "badge-new" },
  Shipped:             { label: "Đang giao",    cls: "badge-active" },
  Delivered:           { label: "Hoàn thành",   cls: "badge-active" },
  Cancelled:           { label: "Đã hủy",       cls: "badge-inactive" },
  PendingCancellation: { label: "Chờ duyệt hủy",cls: "badge-pending" },
};
const PAY_STATUS_MAP = {
  Unpaid: { label: "Chưa TT", cls: "badge-pending" },
  Paid:   { label: "Đã TT",   cls: "badge-active" },
};
const PAY_METHOD_MAP = {
  COD:    "COD",
  VNPay:  "VNPay",
  Stripe: "Stripe",
};

function fmt(n) { return Number(n ?? 0).toLocaleString("vi-VN") + "₫"; }
function fmtDatetime(d) { if (!d) return "—"; return new Date(d).toLocaleString("vi-VN"); }

function InfoBlock({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--g4)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{children}</div>
    </div>
  );
}
function SumRow({ label, value, bold, highlight }) {
  return (
    <div style={{ display: "flex", gap: 24, justifyContent: "flex-end" }}>
      <span style={{ color: "var(--g4)", fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 400, fontSize: bold ? 15 : 13, color: highlight ? "var(--red-text)" : "inherit", minWidth: 90, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    setOrder({ _loading: true });
    OrderService.getByIdAdmin(orderId)
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [orderId]);

  if (!orderId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 680, maxHeight: "85vh", overflowY: "auto" }}>
        <div className="modal-head">
          <span className="modal-title">
            Chi tiết đơn #{order?.orderCode ?? orderId?.slice(0, 8).toUpperCase()}
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {!order || order._loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--g3)" }}>Đang tải...</div>
        ) : (
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <InfoBlock label="Trạng thái">
                <span className={"badge " + (ORDER_STATUS_MAP[order.status]?.cls ?? "badge-inactive")}>
                  {ORDER_STATUS_MAP[order.status]?.label ?? order.status}
                </span>
              </InfoBlock>
              <InfoBlock label="Thanh toán">
                <span className={"badge " + (PAY_STATUS_MAP[order.paymentStatus]?.cls ?? "badge-inactive")}>
                  {PAY_STATUS_MAP[order.paymentStatus]?.label ?? order.paymentStatus}
                </span>
                <span style={{ marginLeft: 6, fontSize: 12, color: "var(--g4)" }}>
                  {PAY_METHOD_MAP[order.paymentMethod] ?? order.paymentMethod}
                </span>
              </InfoBlock>
              <InfoBlock label="Ngày đặt">{fmtDatetime(order.createdAt)}</InfoBlock>
              <InfoBlock label="Ngày TT">{fmtDatetime(order.paidAt)}</InfoBlock>
              <InfoBlock label="Ngày giao">{fmtDatetime(order.shippedAt)}</InfoBlock>
              <InfoBlock label="Ngày nhận">{fmtDatetime(order.deliveredAt)}</InfoBlock>
            </div>

            <div style={{ background: "var(--bg2,#f5f5f5)", borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g3)", letterSpacing: "0.08em", marginBottom: 8 }}>ĐỊA CHỈ GIAO HÀNG</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{order.shippingFullName} — {order.shippingPhone}</div>
              <div style={{ fontSize: 13, color: "var(--g4)", marginTop: 2 }}>
                {order.shippingStreet}, {order.shippingWard}, {order.shippingDistrict}, {order.shippingProvince}
              </div>
              {order.note && <div style={{ fontSize: 12, color: "var(--g3)", marginTop: 4 }}>Ghi chú: {order.note}</div>}
              {order.cancelReason && (
                <div style={{ background: "#fff3f3", border: "1px solid #ffcccc", borderRadius: 8, padding: "12px 16px", marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#c0392b", marginBottom: 4 }}>⚠ LÝ DO HỦY ĐƠN</div>
                  <div style={{ fontSize: 13, color: "#c0392b" }}>{order.cancelReason}</div>
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g3)", letterSpacing: "0.08em", marginBottom: 8 }}>SẢN PHẨM</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(order.items ?? []).map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border,#eee)" }}>
                    {item.productImageUrl && (
                      <img src={item.productImageUrl} alt={item.productName}
                        style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", background: "#f0f0f0" }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.productName}</div>
                      <div style={{ fontSize: 12, color: "var(--g4)" }}>x{item.quantity} × {fmt(item.unitPrice)}</div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{fmt(item.totalPrice)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <SumRow label="Tạm tính" value={fmt(order.subTotal)} />
              <SumRow label="Phí vận chuyển" value={fmt(order.shippingFee)} />
              {order.discountAmount > 0 && (
                <SumRow label={"Voucher (" + order.voucherCode + ")"} value={"-" + fmt(order.discountAmount)} highlight />
              )}
              <SumRow label="Tổng cộng" value={fmt(order.totalAmount)} bold />
            </div>
          </div>
        )}

        <div className="modal-foot">
          <button className="btn btn-sm" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
