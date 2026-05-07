// services/payment.service.js
import api from "../api/axiosConfig";

const PaymentService = {
  getAll: (params) => api.get("/payments", { params }).then(r => r.data),
};
export default PaymentService;