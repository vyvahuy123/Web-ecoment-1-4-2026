import * as signalR from "@microsoft/signalr";
import api from "../api/axiosConfig";

const BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
let connection = null;

export const notificationService = {
  async connect(onNotification) {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      connection.off("ReceiveNotification");
      connection.on("ReceiveNotification", onNotification);
      return connection;
    }
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE}/hubs/notifications`, {
        accessTokenFactory: () => localStorage.getItem("token")
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("ReceiveNotification", onNotification);
    await connection.start();
    return connection;
  },

  async disconnect() {
    if (connection) { await connection.stop(); connection = null; }
  },

  getAll: (params) => api.get("/notifications", { params }).then(r => r.data),
  getUnreadCount: () => api.get("/notifications/unread-count").then(r => r.data.count),
  markAllRead: () => api.patch("/notifications/read-all").then(r => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then(r => r.data),
};
// Default export để tương thích với import cũ
const NotificationService = {
  getAll: notificationService.getAll,
  markAllRead: notificationService.markAllRead,
  getUnreadCount: notificationService.getUnreadCount,
  markRead: notificationService.markRead,
};
export default NotificationService;
