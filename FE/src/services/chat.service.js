import * as signalR from "@microsoft/signalr";
import api from "../api/axiosConfig";

const BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

let connection = null;

export const chatService = {
  async connect(onMessage, onUserOnline, onUserOffline, onMessagesRead) {
    const token = localStorage.getItem("token");
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE}/hubs/chat`, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("ReceiveMessage", onMessage);
    connection.on("UserOnline",     onUserOnline);
    connection.on("UserOffline",    onUserOffline);
    connection.on("MessagesRead",   onMessagesRead);

    await connection.start();
    return connection;
  },

  async disconnect() {
    if (connection) { await connection.stop(); connection = null; }
  },

  async sendMessage(receiverId, content) {
    if (!connection) throw new Error("Chưa kết nối SignalR");
    await connection.invoke("SendMessage", receiverId, content);
  },

  async markAsRead(senderId) {
    if (!connection) return;
    await connection.invoke("MarkAsRead", senderId);
  },

  getConversations: () => api.get("/chat/conversations").then((r) => r.data),
  getMessages: (userId, page = 1) => api.get(`/chat/messages/${userId}?page=${page}`).then((r) => r.data),
};
