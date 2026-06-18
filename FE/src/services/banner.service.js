import api from "../api/axiosConfig";

const BannerService = {
  getActive: () => api.get("/banners").then(r => r.data),
  getAll: () => api.get("/banners/all").then(r => r.data),
  create: (data) => api.post("/banners", data).then(r => r.data),
  update: (id, data) => api.put(`/banners/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/banners/${id}`),
};

export default BannerService;