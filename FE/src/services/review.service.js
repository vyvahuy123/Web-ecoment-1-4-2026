import api from "../api/axiosConfig";

const ReviewService = {
  getProductReviews: (productId, page = 1, pageSize = 10) =>
    api.get(`/reviews/product/${productId}`, { params: { page, pageSize } }).then(r => r.data),

  create: (payload) =>
    api.post("/reviews", payload).then(r => r.data),

  // Admin
  getAll: (params) =>
    api.get("/reviews", { params }).then(r => r.data),

  approve: (id) =>
    api.patch(`/reviews/${id}/approve`).then(r => r.data),

  reject: (id) =>
    api.patch(`/reviews/${id}/reject`).then(r => r.data),

  reply: (id, adminReply) =>
    api.patch(`/reviews/${id}/reply`, { adminReply }).then(r => r.data),
};

export default ReviewService;