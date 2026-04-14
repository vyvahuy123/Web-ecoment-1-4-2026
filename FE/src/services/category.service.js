import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CategoryService = {
  getAll: async () => {
    const res = await axios.get(`${API_URL}/api/category`);
    return res.data;
  },

  getById: async (id) => {
    const res = await axios.get(`${API_URL}/api/category/${id}`);
    return res.data;
  },
};

export default CategoryService;