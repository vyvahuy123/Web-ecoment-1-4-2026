import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`);

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.config?.url);
    const status = error.response?.status;
    const message =
      error.response?.data?.message ??
      error.response?.data?.title ??
      "Đã xảy ra lỗi";

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/dang-nhap";
    }

    return Promise.reject({ status, message });
  }
);

export default api;