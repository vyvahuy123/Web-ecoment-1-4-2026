import api from "../api/axiosConfig";

const OrderService = {
  /**
   * Lấy danh sách đơn hàng của user hiện tại
   * @param {{ page?, pageSize? }} params
   * @returns {PagedResult<OrderSummaryDto>}
   */
  getMyOrders: async ({ page = 1, pageSize = 10 } = {}) => {
    const { data } = await api.get("/orders/my", {
      params: { page, pageSize },
    });
    return data;
  },

  /**
   * Lấy chi tiết 1 đơn hàng
   * @param {string} id
   * @returns {OrderDto}
   */
  getById: async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  /**
   * Tạo đơn hàng mới
   * @param {{
   *   shippingAddressId: string,
   *   paymentMethod: string,
   *   items: Array<{ productId: string, quantity: number }>,
   *   voucherCode?: string,
   *   note?: string
   * }} payload
   * @returns {OrderDto}
   */
  create: async (payload) => {
    const { data } = await api.post("/orders", payload);
    return data;
  },

  /**
   * Huỷ đơn hàng (chỉ Pending/Confirmed)
   * @param {string} id
   * @param {string} reason
   * @returns {OrderDto}
   */
  cancel: async (id, reason) => {
    const { data } = await api.patch(`/orders/${id}/cancel`, { reason });
    return data;
  },

  // ── Admin ────────────────────────────────────────────────────────────────

  /**
   * Lấy tất cả đơn hàng - Admin
   * @param {{ page?, pageSize?, status? }} params
   * @returns {PagedResult<OrderSummaryDto>}
   */
  getAll: async ({ page = 1, pageSize = 20, status } = {}) => {
    const { data } = await api.get("/orders", {
      params: { page, pageSize, status },
    });
    return data;
  },

  /**
   * Cập nhật trạng thái đơn hàng - Admin
   * @param {string} id
   * @param {string} newStatus - OrderStatus enum value
   * @returns {OrderDto}
   */
  updateStatus: async (id, newStatus) => {
    const { data } = await api.patch(`/orders/${id}/status`, { newStatus });
    return data;
  },
};

export default OrderService;