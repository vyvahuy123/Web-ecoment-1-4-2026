import api from "../api/axiosConfig";

const VoucherService = {
  getAll: (params) =>
    api.get("/vouchers", { params }).then(r => r.data),
  create: (data) =>
    api.post("/vouchers", data).then(r => r.data),
  update: (id, data) =>
    api.put(`/vouchers/${id}`, data).then(r => r.data),
  delete: (id) =>
    api.delete(`/vouchers/${id}`).then(r => r.data),
};

export default VoucherService;