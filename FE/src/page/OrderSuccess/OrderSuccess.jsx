import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./OrderSuccess.css";

const STATUS_LABEL = {
  0: "Chờ xác nhận",
  1: "Đã xác nhận",
  2: "Đang xử lý",
  3: "Đang vận chuyển",
  4: "Đã giao",
  5: "Đã huỷ",
};

const PAYMENT_LABEL = {
  0: "Thanh toán khi nhận hàng (COD)",
  1: "Chuyển khoản ngân hàng",
  2: "VNPay",
  3: "MoMo",
  4: "ZaloPay",
};

export default function OrderSuccess() {
  const { orderCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  return (
    <div className="os-wrap">
      <div className="os-card">
        {/* Icon */}
        <div className="os-icon">
          <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="25" stroke="#111" strokeWidth="1.5" />
            <path d="M15 26.5L22 33.5L37 18.5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="os-brand">VYX STORE</p>
        <h1 className="os-title">Đặt hàng thành công!</h1>
        <p className="os-subtitle">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
        </p>

        <div className="os-code-block">
          <span className="os-code-label">Mã đơn hàng</span>
          <span className="os-code">{orderCode}</span>
        </div>

        {order && (
          <div className="os-details">
            {/* Địa chỉ */}
            <div className="os-detail-row">
              <span className="os-detail-label">Giao đến</span>
              <span className="os-detail-value">
                {order.shippingFullName} — {order.shippingPhone}<br />
                {order.shippingStreet}, {order.shippingWard}, {order.shippingDistrict}, {order.shippingProvince}
              </span>
            </div>

            {/* Thanh toán */}
            <div className="os-detail-row">
              <span className="os-detail-label">Thanh toán</span>
              <span className="os-detail-value">{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</span>
            </div>

            {/* Trạng thái */}
            <div className="os-detail-row">
              <span className="os-detail-label">Trạng thái</span>
              <span className="os-detail-value">{STATUS_LABEL[order.status] ?? "—"}</span>
            </div>

            {/* Items */}
            {order.items?.length > 0 && (
              <div className="os-items">
                {order.items.map((item) => (
                  <div key={item.id} className="os-item">
                    {item.productImageUrl && (
                      <img src={item.productImageUrl} alt={item.productName} />
                    )}
                    <div className="os-item-info">
                      <span className="os-item-name">{item.productName}</span>
                      <span className="os-item-qty">x{item.quantity}</span>
                    </div>
                    <span className="os-item-price">
                      {item.totalPrice.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="os-totals">
              <div className="os-total-row">
                <span>Tạm tính</span>
                <span>{order.subTotal?.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="os-total-row">
                <span>Phí vận chuyển</span>
                <span>{order.shippingFee?.toLocaleString("vi-VN")}₫</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="os-total-row os-discount">
                  <span>Giảm giá</span>
                  <span>−{order.discountAmount?.toLocaleString("vi-VN")}₫</span>
                </div>
              )}
              <div className="os-total-row os-grand-total">
                <span>Tổng cộng</span>
                <span>{order.totalAmount?.toLocaleString("vi-VN")}₫</span>
              </div>
            </div>
          </div>
        )}

        <div className="os-actions">
          <button className="os-btn-primary" onClick={() => navigate("/")}>
            Tiếp tục mua sắm
          </button>
          <button className="os-btn-ghost" onClick={() => navigate("/orders")}>
            Xem đơn hàng của tôi
          </button>
        </div>
      </div>
    </div>
  );
}