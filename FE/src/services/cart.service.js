import api from "../api/axiosConfig";

const CartService = {
  /**
   * Lấy giỏ hàng hiện tại của user
   * @returns {CartDto}
   */
  getMyCart: async () => {
    const { data } = await api.get("/carts");
    return data;
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {{ productId: string, quantity: number }} payload
   * @returns {CartDto}
   */
  addItem: async (payload) => {
    const { data } = await api.post("/carts/items", payload);
    return data;
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   * @param {string} productId
   * @param {number} quantity
   */
  updateItem: async (productId, quantity) => {
    await api.put(`/carts/items/${productId}`, { quantity });
  },

  /**
   * Xóa 1 sản phẩm khỏi giỏ hàng
   * @param {string} productId
   */
  removeItem: async (productId) => {
    await api.delete(`/carts/items/${productId}`);
  },

  /**
   * Xóa toàn bộ giỏ hàng
   */
  clear: async () => {
    await api.delete("/carts");
  },
};

export default CartService;