import api from "../api/axiosConfig";

const UserService = {
  getAll: (params) => api.get("/users", { params }).then(r => r.data),
  update: (id, data) => api.put(`/users/${id}`, data).then(r => r.data),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`).then(r => r.data),
};

export default UserService;