import api from "../api/axiosConfig";

const CategoryService = {
  getAll: async () => {
    const res = await api.get("/category");
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/category/${id}`);
    return res.data;
  },

  create: async (name, description) => {
    const res = await api.post("/category", { name, description });
    return res.data;
  },

  update: async (id, name, description) => {
    await api.put(`/category/${id}`, { name, description });
  },

  delete: async (id) => {
    await api.delete(`/category/${id}`);
  },
};

export default CategoryService;