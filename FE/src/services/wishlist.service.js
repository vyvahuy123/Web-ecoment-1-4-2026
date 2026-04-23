import api from "../api/axiosConfig";

const WishlistService = {
  getMyWishlist: () =>
    api.get("/wishlists").then(r => r.data),

  add: (productId) =>
    api.post(`/wishlists/${productId}`).then(r => r.data),

  remove: (productId) =>
    api.delete(`/wishlists/${productId}`).then(r => r.data),
};

export default WishlistService;