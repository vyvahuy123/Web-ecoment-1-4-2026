import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CategoryService = {
  getAll: async () => {
    const res = await axios.get(`${API_URL}/category`);
    return res.data;
  },

  getById: async (id) => {
    const res = await axios.get(`${API_URL}/category/${id}`);
    return res.data;
  },
};

export default CategoryService;