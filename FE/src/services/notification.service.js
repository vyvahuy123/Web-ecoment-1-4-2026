import api from "../api/axiosConfig";

const NotificationService = {
  getAll: (params) => api.get("/notifications", { params }).then(r => r.data),
  markAllRead: ()   => api.patch("/notifications/read-all").then(r => r.data),
};
export default NotificationService;