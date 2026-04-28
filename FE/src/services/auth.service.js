import api from "../api/axiosConfig";

const AuthService = {
  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("userId", data.user?.id ?? "");
    return data;
  },
  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("userId", data.user?.id ?? "");
    return data;
  },
  refresh: async (accessToken) => {
    const { data } = await api.post("/auth/refresh", { accessToken });
    localStorage.setItem("token", data.accessToken);
    return data;
  },
  logout: async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default AuthService;
