import api from "../api/axiosConfig";

const OrderService = {
  getAll: (params) => api.get("/orders", { params }).then(r => r.data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }).then(r => r.data),
};

export default OrderService;