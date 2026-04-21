import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { AddressService, OrderService, VoucherService, PaymentService } from "../../services/checkout.service";
import "./Checkout.css";

const PAYMENT_METHODS = [
  { value: 0, label: "Thanh toán khi nhận hàng", icon: "🚚", desc: "Trả tiền mặt khi nhận hàng", type: "cod" },
  { value: 2, label: "VNPay", icon: "💳", desc: "ATM / Visa / QR Code VNPay", type: "gateway" },
  { value: 1, label: "Chuyển khoản ngân hàng", icon: "🏦", desc: "Sắp ra mắt", type: "soon" },
  { value: 3, label: "MoMo", icon: "🌸", desc: "Sắp ra mắt", type: "soon" },
  { value: 4, label: "ZaloPay", icon: "⚡", desc: "Sắp ra mắt", type: "soon" },
];

const SHIPPING_FEE = 30000;

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const cartItems = cart?.items ?? [];

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ fullName: "", phone: "", province: "", district: "", ward: "", street: "", isDefault: false });
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherResult, setVoucherResult] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    AddressService.getMyAddresses()
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => {})
      .finally(() => setLoadingAddr(false));
  }, []);

  const subTotal = cartItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discount = voucherResult?.discountAmount ?? 0;
  const total = subTotal + SHIPPING_FEE - discount;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const created = await AddressService.create(newAddress);
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      setShowAddForm(false);
      setNewAddress({ fullName: "", phone: "", province: "", district: "", ward: "", street: "", isDefault: false });
    } catch { alert("Không thể thêm địa chỉ. Vui lòng thử lại."); }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true); setVoucherError(""); setVoucherResult(null);
    try {
      const result = await VoucherService.validate({ code: voucherCode.trim(), orderAmount: subTotal });
      setVoucherResult(result);
    } catch (err) {
      setVoucherError(err?.response?.data?.message || "Mã voucher không hợp lệ.");
    } finally { setVoucherLoading(false); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return;
    setSubmitting(true); setError("");
    try {
      const payload = {
        shippingAddressId: selectedAddressId,
        paymentMethod,
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        voucherCode: voucherResult ? voucherCode.trim() : undefined,
        note: note || undefined,
      };
      const order = await OrderService.create(payload);

      if (paymentMethod === 2) {
        const { paymentUrl } = await PaymentService.createVNPayUrl(order.id);
        await clearCart();
        window.location.href = paymentUrl;
        return;
      }

      await clearCart();
      navigate(`/order-success/${order.orderCode}`, { state: { order } });
    } catch (err) {
      setError(err?.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally { setSubmitting(false); }
  };

  if (!cart || cartItems.length === 0) {
    return (
      <div className="co-empty">
        <p>Giỏ hàng trống.</p>
        <button onClick={() => navigate("/")}>Tiếp tục mua sắm</button>
      </div>
    );
  }

  return (
    <div className="co-wrap">
      <div className="co-header">
        <span className="co-brand">VYX STORE</span>
        <h1 className="co-title">Thanh toán</h1>
      </div>

      <div className="co-stepper">
        {["Địa chỉ", "Thanh toán", "Xác nhận"].map((label, i) => (
          <div key={i} className={`co-step ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "done" : ""}`}>
            <div className="co-step-circle">{step > i + 1 ? "✓" : i + 1}</div>
            <span>{label}</span>
            {i < 2 && <div className="co-step-line" />}
          </div>
        ))}
      </div>

      <div className="co-body">
        <div className="co-left">
          {step === 1 && (
            <div className="co-section">
              <h2 className="co-section-title">Địa chỉ giao hàng</h2>
              {loadingAddr ? <div className="co-loading">Đang tải địa chỉ…</div> : (
                <>
                  {addresses.length === 0 && !showAddForm && <p className="co-no-addr">Bạn chưa có địa chỉ nào.</p>}
                  <div className="co-addr-list">
                    {addresses.map((addr) => (
                      <label key={addr.id} className={`co-addr-card ${selectedAddressId === addr.id ? "selected" : ""}`}>
                        <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} />
                        <div className="co-addr-info">
                          <div className="co-addr-name">{addr.fullName} <span>{addr.phone}</span>{addr.isDefault && <em className="co-badge">Mặc định</em>}</div>
                          <div className="co-addr-detail">{addr.street}, {addr.ward}, {addr.district}, {addr.province}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {!showAddForm ? (
                    <button className="co-btn-add-addr" onClick={() => setShowAddForm(true)}>+ Thêm địa chỉ mới</button>
                  ) : (
                    <form className="co-addr-form" onSubmit={handleAddAddress}>
                      <h3>Địa chỉ mới</h3>
                      <div className="co-form-row">
                        <input placeholder="Họ và tên *" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} required />
                        <input placeholder="Số điện thoại *" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} required />
                      </div>
                      <div className="co-form-row">
                        <input placeholder="Tỉnh / Thành phố *" value={newAddress.province} onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })} required />
                        <input placeholder="Quận / Huyện *" value={newAddress.district} onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })} required />
                      </div>
                      <div className="co-form-row">
                        <input placeholder="Phường / Xã *" value={newAddress.ward} onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })} required />
                        <input placeholder="Số nhà, tên đường *" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} required />
                      </div>
                      <label className="co-checkbox">
                        <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
                        Đặt làm địa chỉ mặc định
                      </label>
                      <div className="co-form-actions">
                        <button type="submit" className="co-btn-primary">Lưu địa chỉ</button>
                        <button type="button" className="co-btn-ghost" onClick={() => setShowAddForm(false)}>Hủy</button>
                      </div>
                    </form>
                  )}
                  <div className="co-step-nav">
                    <button className="co-btn-primary" disabled={!selectedAddressId} onClick={() => setStep(2)}>Tiếp tục →</button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="co-section">
              <h2 className="co-section-title">Phương thức thanh toán</h2>
              <div className="co-payment-list">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.value} className={`co-payment-card ${paymentMethod === m.value ? "selected" : ""} ${m.type === "soon" ? "co-payment-soon" : ""}`}
                    onClick={(e) => { e.preventDefault(); if (m.type !== "soon") setPaymentMethod(m.value); }}>
                    <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value} readOnly disabled={m.type === "soon"} />
                    <span className="co-payment-icon">{m.icon}</span>
                    <div className="co-payment-info">
                      <div className="co-payment-label">{m.label}</div>
                      <div className="co-payment-desc">{m.desc}</div>
                    </div>
                    {m.type === "soon" && <span className="co-payment-badge">Sắp ra mắt</span>}
                  </label>
                ))}
              </div>

              {paymentMethod === 2 && (
                <div className="co-vnpay-info">
                  <span className="co-vnpay-info-icon">💳</span>
                  <div>
                    <div className="co-vnpay-info-title">Thanh toán qua VNPay</div>
                    <div className="co-vnpay-info-desc">Hỗ trợ ATM nội địa, Visa/Master/JCB, QR Code. Bạn sẽ được chuyển sang trang VNPay để hoàn tất thanh toán an toàn.</div>
                  </div>
                </div>
              )}

              <div className="co-voucher">
                <h3>Mã giảm giá</h3>
                <div className="co-voucher-row">
                  <input placeholder="Nhập mã voucher" value={voucherCode} onChange={(e) => { setVoucherCode(e.target.value); setVoucherResult(null); setVoucherError(""); }} />
                  <button className="co-btn-apply" onClick={handleApplyVoucher} disabled={voucherLoading || !voucherCode.trim()}>{voucherLoading ? "…" : "Áp dụng"}</button>
                </div>
                {voucherError && <p className="co-error">{voucherError}</p>}
                {voucherResult && <p className="co-voucher-ok">✓ Giảm {voucherResult.discountAmount?.toLocaleString("vi-VN")}₫{voucherResult.description ? ` — ${voucherResult.description}` : ""}</p>}
              </div>

              <div className="co-note">
                <h3>Ghi chú đơn hàng</h3>
                <textarea placeholder="Ghi chú cho người bán (tùy chọn)…" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
              </div>

              <div className="co-step-nav">
                <button className="co-btn-ghost" onClick={() => setStep(1)}>← Quay lại</button>
                <button className="co-btn-primary" onClick={() => setStep(3)}>Xem xác nhận →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="co-section">
              <h2 className="co-section-title">Xác nhận đơn hàng</h2>
              <div className="co-confirm-block">
                <div className="co-confirm-label">Giao đến</div>
                {selectedAddress && (
                  <div className="co-confirm-value">
                    <strong>{selectedAddress.fullName}</strong> — {selectedAddress.phone}<br />
                    {selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                  </div>
                )}
                <button className="co-link" onClick={() => setStep(1)}>Thay đổi</button>
              </div>
              <div className="co-confirm-block">
                <div className="co-confirm-label">Thanh toán</div>
                <div className="co-confirm-value">
                  {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
                  {paymentMethod === 2 && <span className="co-vnpay-redirect-note"> — Bạn sẽ được chuyển sang trang VNPay</span>}
                </div>
                <button className="co-link" onClick={() => setStep(2)}>Thay đổi</button>
              </div>
              <div className="co-confirm-items">
                <div className="co-confirm-label">Sản phẩm ({cartItems.length})</div>
                {cartItems.map((item) => (
                  <div key={item.productId} className="co-confirm-item">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.productName} />}
                    <div className="co-confirm-item-info"><span>{item.productName}</span><span>x{item.quantity}</span></div>
                    <span className="co-confirm-item-price">{(item.unitPrice * item.quantity).toLocaleString("vi-VN")}₫</span>
                  </div>
                ))}
              </div>
              {note && <div className="co-confirm-block"><div className="co-confirm-label">Ghi chú</div><div className="co-confirm-value">{note}</div></div>}
              {error && <p className="co-error co-error-lg">{error}</p>}
              <div className="co-step-nav">
                <button className="co-btn-ghost" onClick={() => setStep(2)}>← Quay lại</button>
                <button className="co-btn-place" onClick={handlePlaceOrder} disabled={submitting}>
                  {submitting ? "Đang xử lý…" : paymentMethod === 2 ? "Đặt hàng & Thanh toán VNPay →" : "Đặt hàng"}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="co-summary">
          <h2 className="co-summary-title">Tóm tắt đơn hàng</h2>
          <div className="co-summary-items">
            {cartItems.map((item) => (
              <div key={item.productId} className="co-summary-item">
                <div className="co-summary-item-img">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <div className="co-img-placeholder" />}
                  <span className="co-qty-badge">{item.quantity}</span>
                </div>
                <span className="co-summary-item-name">{item.productName}</span>
                <span className="co-summary-item-price">{(item.unitPrice * item.quantity).toLocaleString("vi-VN")}₫</span>
              </div>
            ))}
          </div>
          <div className="co-summary-rows">
            <div className="co-summary-row"><span>Tạm tính</span><span>{subTotal.toLocaleString("vi-VN")}₫</span></div>
            <div className="co-summary-row"><span>Phí vận chuyển</span><span>{SHIPPING_FEE.toLocaleString("vi-VN")}₫</span></div>
            {discount > 0 && <div className="co-summary-row co-discount"><span>Giảm giá</span><span>−{discount.toLocaleString("vi-VN")}₫</span></div>}
          </div>
          <div className="co-summary-total"><span>Tổng cộng</span><span>{total.toLocaleString("vi-VN")}₫</span></div>
          <p className="co-summary-note">Miễn phí đổi trả 30 ngày · Thanh toán bảo mật</p>
        </aside>
      </div>
    </div>
  );
}