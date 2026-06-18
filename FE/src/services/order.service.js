import api from "../api/axiosConfig";
const OrderService = {
  getMyOrders: (page = 1, pageSize = 10) =>
    api.get("/orders/my", { params: { page, pageSize } }).then(r => r.data),
  getById: (id) =>
    api.get("/orders/" + id).then(r => r.data),
  getByIdAdmin: (id) =>
    api.get(`/orders/${id}/detail`).then(r => r.data),
  create: (payload) =>
    api.post("/orders", payload).then(r => r.data),
  cancel: (id, reason) =>
    api.patch("/orders/" + id + "/cancel", { reason }).then(r => r.data),
  getAll: (params) =>
    api.get("/orders", { params }).then(r => r.data),
  updateStatus: (id, newStatus) =>
    api.patch("/orders/" + id + "/status", { newStatus }).then(r => r.data),
  approveCancellation: (id) =>
    api.patch("/orders/" + id + "/approve-cancellation").then(r => r.data),
};
export default OrderService;
