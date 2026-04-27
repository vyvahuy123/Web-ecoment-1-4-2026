import * as signalR from "@microsoft/signalr";
import api from "../api/axiosConfig";

const BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

let connection = null;
let connectingPromise = null;

export const chatService = {
  async connect(onMessage, onUserOnline, onUserOffline, onMessagesRead) {
    // Nếu đã connected -> chỉ gắn lại listeners
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      connection.off("ReceiveMessage");
      connection.off("UserOnline");
      connection.off("UserOffline");
      connection.off("MessagesRead");
      connection.on("ReceiveMessage", onMessage);
      connection.on("UserOnline", onUserOnline);
      connection.on("UserOffline", onUserOffline);
      connection.on("MessagesRead", onMessagesRead);
      return connection;
    }

    // Nếu đang connecting -> chờ promise cũ
    if (connectingPromise) return connectingPromise;

    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE}/hubs/chat`, { accessTokenFactory: () => localStorage.getItem("token") })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("ReceiveMessage", onMessage);
    connection.on("UserOnline", onUserOnline);
    connection.on("UserOffline", onUserOffline);
    connection.on("MessagesRead", onMessagesRead);

    connectingPromise = connection.start().then(() => {
      connectingPromise = null;
      return connection;
    }).catch((e) => {
      connectingPromise = null;
      connection = null;
      throw e;
    });

    return connectingPromise;
  },

  async disconnect() {
    if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
      await connection.stop();
    }
    connection = null;
    connectingPromise = null;
  },

  async sendMessage(receiverId, content) {
    if (!connection) throw new Error("Chua ket noi SignalR");
    await connection.invoke("SendMessage", receiverId, content);
  },

  async markAsRead(senderId) {
    if (!connection) return;
    await connection.invoke("MarkAsRead", senderId);
  },

  getConversations: () => api.get("/chat/conversations").then((r) => r.data),
  getMessages: (userId, page = 1) => api.get(`/chat/messages/${userId}?page=${page}`).then((r) => r.data),
};