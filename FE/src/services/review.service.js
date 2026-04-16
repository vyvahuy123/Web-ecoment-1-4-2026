// services/review.service.js
import api from "../api/axiosConfig";

const ReviewService = {
  getAll: (params) => api.get("/reviews", { params }).then(r => r.data),
  approve: (id) => api.patch(`/reviews/${id}/approve`).then(r => r.data),
  hide: (id) => api.patch(`/reviews/${id}/hide`).then(r => r.data),
};
export default ReviewService;