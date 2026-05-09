"use client";
import * as signalR from "@microsoft/signalr";
import api from "../api/axiosConfig";

const BASE = "http://localhost:5000";
let connection = null;

export const chatService = {
  async connect(onMessage, onUserOnline, onUserOffline, onMessagesRead) {
    if (typeof window === "undefined") return null;
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
    connection = null;
    const token = localStorage.getItem("token");
    if (!token) return null;
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE}/hubs/chat`, {
        accessTokenFactory: () => localStorage.getItem("token"),
        
        
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();
    connection.on("ReceiveMessage", onMessage);
    connection.on("UserOnline", onUserOnline);
    connection.on("UserOffline", onUserOffline);
    connection.on("MessagesRead", onMessagesRead);
    await connection.start();
    return connection;
  },
  async disconnect() {
    if (connection) {
      try {
        if (connection.state === signalR.HubConnectionState.Connected) {
          await connection.stop();
        }
      } catch(e) {}
    }
    connection = null;
  },
  async sendMessage(receiverId, content) {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error("Chua ket noi SignalR");
    }
    await connection.invoke("SendMessage", receiverId, content);
  },
  async markAsRead(senderId) {
    if (!connection) return;
    await connection.invoke("MarkAsRead", senderId);
  },
  getConversations: () => api.get("/chat/conversations").then((r) => r.data),
  getMessages: (userId, page = 1) => api.get(`/chat/messages/${userId}?page=${page}`).then((r) => r.data),
};
