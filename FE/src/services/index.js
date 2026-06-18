import api from "../api/axiosConfig";

// ── Address Service ────────────────────────────────────────────────────────────

export const AddressService = {
  /**
   * Lấy danh sách địa chỉ của user hiện tại
   * @returns {AddressDto[]}
   */
  getMyAddresses: async () => {
    const { data } = await api.get("/addresses");
    return data;
  },

  /**
   * Thêm địa chỉ mới
   * @param {{ fullName, phone, province, district, ward, street, isDefault }} payload
   * @returns {AddressDto}
   */
  create: async (payload) => {
    const { data } = await api.post("/addresses", payload);
    return data;
  },

  /**
   * Cập nhật địa chỉ
   * @param {string} id
   * @param {{ fullName, phone, province, district, ward, street, isDefault }} payload
   */
  update: async (id, payload) => {
    await api.put(`/addresses/${id}`, payload);
  },

  /**
   * Xóa địa chỉ
   * @param {string} id
   */
  delete: async (id) => {
    await api.delete(`/addresses/${id}`);
  },
};

// ── Payment Service ────────────────────────────────────────────────────────────

export const PaymentService = {
  /**
   * Tạo payment cho đơn hàng
   * @param {{ orderId, method, amount, ... }} payload
   * @returns {PaymentDto}
   */
  create: async (payload) => {
    const { data } = await api.post("/payments", payload);
    return data;
  },

  /**
   * Xác nhận thanh toán thành công - Admin
   * @param {string} id
   * @param {{ transactionId?, gatewayResponse? }} payload
   */
  confirm: async (id, payload) => {
    await api.patch(`/payments/${id}/confirm`, payload);
  },

  /**
   * Hoàn tiền - Admin
   * @param {string} id
   * @param {{ refundAmount: number, reason: string }} payload
   */
  refund: async (id, payload) => {
    await api.patch(`/payments/${id}/refund`, payload);
  },
};

// ── Review Service ─────────────────────────────────────────────────────────────

export const ReviewService = {
  /**
   * Lấy reviews của sản phẩm (public)
   * @param {string} productId
   * @param {{ page?, pageSize? }} params
   * @returns {ReviewDto[]}
   */
  getByProduct: async (productId, { page = 1, pageSize = 10 } = {}) => {
    const { data } = await api.get(`/reviews/product/${productId}`, {
      params: { page, pageSize },
    });
    return data;
  },

  /**
   * Tạo review cho sản phẩm đã mua
   * @param {{ productId, orderId, rating, comment?, imageUrls? }} payload
   * @returns {ReviewDto}
   */
  create: async (payload) => {
    const { data } = await api.post("/reviews", payload);
    return data;
  },

  /**
   * Duyệt review - Admin
   * @param {string} id
   */
  approve: async (id) => {
    await api.patch(`/reviews/${id}/approve`);
  },

  /**
   * Từ chối review - Admin
   * @param {string} id
   */
  reject: async (id) => {
    await api.patch(`/reviews/${id}/reject`);
  },

  /**
   * Admin phản hồi review
   * @param {string} id
   * @param {string} adminReply
   */
  reply: async (id, adminReply) => {
    await api.patch(`/reviews/${id}/reply`, { adminReply });
  },
};

// ── Notification Service ───────────────────────────────────────────────────────

export const NotificationService = {
  /**
   * Lấy danh sách thông báo của user
   * @param {{ page?, pageSize? }} params
   * @returns {{ items, total, unread }}
   */
  getMyNotifications: async ({ page = 1, pageSize = 20 } = {}) => {
    const { data } = await api.get("/notifications", {
      params: { page, pageSize },
    });
    return data;
  },

  /**
   * Đánh dấu 1 thông báo đã đọc
   * @param {string} id
   */
  markAsRead: async (id) => {
    await api.patch(`/notifications/${id}/read`);
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead: async () => {
    await api.patch("/notifications/read-all");
  },
};

// ── Voucher Service ────────────────────────────────────────────────────────────

export const VoucherService = {
  /**
   * Lấy danh sách voucher - Admin
   * @param {{ page?, pageSize? }} params
   * @returns {VoucherDto[]}
   */
  getAll: async ({ page = 1, pageSize = 50 } = {}) => {
    const { data } = await api.get("/vouchers", {
      params: { page, pageSize },
    });
    return data;
  },

  /**
   * Validate voucher trước khi đặt hàng
   * @param {{ code: string, orderAmount: number }} params
   * @returns {ValidateVoucherDto}
   */
  validate: async ({ code, orderAmount }) => {
    const { data } = await api.get("/vouchers/validate", {
      params: { code, orderAmount },
    });
    return data;
  },

  /**
   * Tạo voucher mới - Admin
   * @param {{ code, discountType, discountValue, minOrderAmount?, maxUsage?, expiresAt? }} payload
   * @returns {VoucherDto}
   */
  create: async (payload) => {
    const { data } = await api.post("/vouchers", payload);
    return data;
  },
};

// ── WishList Service ───────────────────────────────────────────────────────────

export const WishListService = {
  /**
   * Lấy danh sách sản phẩm yêu thích của user
   * @returns {WishListDto[]}
   */
  getMyWishList: async () => {
    const { data } = await api.get("/wishlists");
    return data;
  },

  /**
   * Thêm sản phẩm vào danh sách yêu thích
   * @param {string} productId
   * @returns {WishListDto}
   */
  add: async (productId) => {
    const { data } = await api.post(`/wishlists/${productId}`);
    return data;
  },

  /**
   * Xóa sản phẩm khỏi danh sách yêu thích
   * @param {string} productId
   */
  remove: async (productId) => {
    await api.delete(`/wishlists/${productId}`);
  },
};