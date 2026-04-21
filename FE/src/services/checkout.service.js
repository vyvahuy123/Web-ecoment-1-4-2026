import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AddressService = {
  getMyAddresses: () => API.get("/addresses/my").then((r) => r.data),
  create: (data) => API.post("/addresses", data).then((r) => r.data),
};

export const VoucherService = {
  validate: (data) => API.post("/vouchers/validate", data).then((r) => r.data),
};

export const OrderService = {
  create: (data) => API.post("/orders", data).then((r) => r.data),
};

export const PaymentService = {
  // Tạo URL VNPay — trả về { paymentUrl }
  createVNPayUrl: (orderId) =>
    API.post("/payments/vnpay/create-url", { orderId }).then((r) => r.data),
};