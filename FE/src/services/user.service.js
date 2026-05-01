import api from "../api/axiosConfig";

const UserService = {
  getAll:     (params) => api.get("/users", { params }).then(r => r.data),
  getOrders:  (userId, page = 1, pageSize = 20) => api.get(`/orders/user/${userId}`, { params: { page, pageSize } }).then(r => r.data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }).then(r => r.data),
  activate:   (id) => api.patch(`/users/${id}/activate`).then(r => r.data),
  deactivate: (id) => api.delete(`/users/${id}`).then(r => r.data),
  update:     (id, data) => api.put(`/users/${id}`, data).then(r => r.data),
};

export default UserService;