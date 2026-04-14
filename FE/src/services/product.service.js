import api from "../api/axiosConfig";

const ProductService = {
  /**
   * Lấy danh sách sản phẩm có phân trang + filter (public)
   * @param {{ page?, pageSize?, search?, categoryId? }} params
   * @returns {PagedResult<ProductSummaryDto>}
   */
  getAll: async ({ page = 1, pageSize = 20, search, categoryId } = {}) => {
    const { data } = await api.get("/products", {
      params: { page, pageSize, search, categoryId },
    });
    return data;
  },

  /**
   * Lấy chi tiết 1 sản phẩm (public)
   * @param {string} id
   * @returns {ProductDto}
   */
  getById: async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  /**
   * Tạo sản phẩm mới - Admin
   * @param {{ name, price, description?, imageUrl?, categoryId, stock }} payload
   * @returns {ProductDto}
   */
  create: async (payload) => {
    const { data } = await api.post("/products", payload);
    return data;
  },

  /**
   * Cập nhật sản phẩm - Admin
   * @param {string} id
   * @param {{ name, price, description?, imageUrl? }} payload
   * @returns {ProductDto}
   */
  update: async (id, payload) => {
    const { data } = await api.put(`/products/${id}`, payload);
    return data;
  },

  /**
   * Điều chỉnh tồn kho (nhập/xuất) - Admin
   * delta > 0 là nhập kho, delta < 0 là xuất kho
   * @param {string} id
   * @param {{ delta: number, reason: string }} payload
   * @returns {ProductDto}
   */
  adjustStock: async (id, payload) => {
    const { data } = await api.patch(`/products/${id}/stock`, payload);
    return data;
  },

  /**
   * Xóa sản phẩm (soft delete) - Admin
   * @param {string} id
   */
  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },
  getTopSelling: async (limit = 8) => {
  const { data } = await api.get("/products/top-selling", { params: { limit } });
  return data;
},
};

export default ProductService;