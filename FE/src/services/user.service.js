import api from "../api/axiosConfig";

const UserService = {
  /**
   * Lấy danh sách users có phân trang - Admin
   * @param {{ page?, pageSize?, search? }} params
   * @returns {PagedResult<UserSummaryDto>}
   */
  getAll: async ({ page = 1, pageSize = 20, search } = {}) => {
    const { data } = await api.get("/users", {
      params: { page, pageSize, search },
    });
    return data;
  },

  /**
   * Lấy thông tin user theo ID
   * @param {string} id
   * @returns {UserDto}
   */
  getById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  /**
   * Tạo user mới (public)
   * @param {{ username, email, password, fullName }} payload
   * @returns {UserDto}
   */
  create: async (payload) => {
    const { data } = await api.post("/users", payload);
    return data;
  },

  /**
   * Cập nhật thông tin user
   * @param {string} id
   * @param {{ fullName?, email? }} payload
   * @returns {UserDto}
   */
  update: async (id, payload) => {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },

  /**
   * Deactivate (soft-delete) user - Admin
   * @param {string} id
   */
  deactivate: async (id) => {
    await api.delete(`/users/${id}`);
  },
};

export default UserService;