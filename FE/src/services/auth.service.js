import api from "../api/axiosConfig";

const AuthService = {
  /**
   * Đăng nhập
   * @param {string} email
   * @param {string} password
   * @returns {{ accessToken, accessTokenExpiry, user }}
   */
  login: async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", data.accessToken);
  localStorage.setItem("user", JSON.stringify(data.user)); // ← thêm dòng này
  return data;
},

  /**
   * Đăng ký tài khoản mới
   * @param {{ username, email, password, fullName }} payload
   * @returns {{ accessToken, accessTokenExpiry, user }}
   */
  register: async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  localStorage.setItem("token", data.accessToken);
  localStorage.setItem("user", JSON.stringify(data.user)); // ← thêm dòng này
  return data;
},

  /**
   * Làm mới access token dùng refresh token cookie (httpOnly)
   * Gọi khi access token hết hạn
   * @param {string} accessToken - token cũ
   * @returns {{ accessToken, accessTokenExpiry }}
   */
  refresh: async (accessToken) => {
    const { data } = await api.post("/auth/refresh", { accessToken });
    localStorage.setItem("token", data.accessToken);
    return data;
  },

  /**
   * Đăng xuất - thu hồi refresh token, xóa cookie phía server
   */
  logout: async () => {
  await api.post("/auth/logout");
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // ← thêm dòng này
},
};

export default AuthService;