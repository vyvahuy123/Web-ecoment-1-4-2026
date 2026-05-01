import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ??
      error.response?.data?.title ??
      "Đã xảy ra lỗi";

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject({ status, message });
  }
);

export default api;
