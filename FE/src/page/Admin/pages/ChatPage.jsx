import { useState, useRef, useEffect, useCallback } from "react";
import { chatService } from "../../../services/chat.service";
import "../styles/chat.css";

const QUICK_REPLIES = [
  "Cam on ban da lien he! ",
  "Shop se kiem tra va phan hoi som nhat co the.",
  "Don hang cua ban dang duoc xu ly.",
  "Ban vui long cho shop biet ma don hang nhe!",
  "Shop xin loi vi su bat tien nay ",
];

function getInitials(name = "") {
  return name.split(" ").slice(-2).map((w) => w[0]?.toUpperCase()).join("");
}

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [onlineIds, setOnlineIds] = useState(new Set());
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showQuick, setShowQuick] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const selectedIdRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
      setOnlineIds(new Set(data.filter((c) => c.isOnline).map((c) => c.userId)));
    } catch (e) {
      console.error("Loi load conversations:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const openChat = useCallback(async (userId) => {
    setSelectedId(userId);
    selectedIdRef.current = userId;
    setMessages([]);
    try {
      const msgs = await chatService.getMessages(userId);
      setMessages(msgs);
      await chatService.markAsRead(userId);
      setConversations((prev) =>
        prev.map((c) => c.userId === userId ? { ...c, unread: 0 } : c)
      );
    } catch (e) {
      console.error("Loi load messages:", e);
    }
  }, []);

  const onMessage = useCallback((msg) => {
    const curId = selectedIdRef.current;
    if (msg.senderId === curId || msg.receiverId === curId) {
      setMessages((prev) => [...prev, msg]);
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.userId === msg.senderId
            ? { ...c, unread: (c.unread || 0) + 1, lastMessage: { content: msg.content, sentAt: msg.sentAt, fromMe: false } }
            : c
        )
      );
    }
  }, []);

  const onUserOnline = useCallback((uid) => setOnlineIds((s) => new Set([...s, uid])), []);
  const onUserOffline = useCallback((uid) => setOnlineIds((s) => { const n = new Set(s); n.delete(uid); return n; }), []);
  const onMessagesRead = useCallback(() => {}, []);

  useEffect(() => {
    loadConversations();
    chatService
      .connect(onMessage, onUserOnline, onUserOffline, onMessagesRead)
      .catch((e) => console.error("SignalR connect error:", e));
    return () => { chatService.disconnect(); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !selectedId) return;
    try {
      await chatService.sendMessage(selectedId, text);
      setInput("");
      setShowQuick(false);
      inputRef.current?.focus();
    } catch (e) {
      console.error("Loi gui tin:", e);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const selected = conversations.find((c) => c.userId === selectedId);
  const filtered = conversations.filter((c) =>
    (c.fullName || c.username)?.toLowerCase().includes(search.toLowerCase())
  );
  const totalUnread = conversations.reduce((s, c) => s + (c.unread || 0), 0);
  const myId = localStorage.getItem("userId");

  if (loading) return <div className="chat-layout" style={{ alignItems: "center", justifyContent: "center" }}>Dang tai...</div>;

  return (
    <div className="chat-layout">
      <div className="chat-sidebar">
        <div className="chat-sidebar__head">
          <div className="chat-sidebar__title">
            Tin nhan
            {totalUnread > 0 && <span className="chat-total-badge">{totalUnread}</span>}
          </div>
          <input
            className="chat-search"
            placeholder="Tim khach hang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="chat-user-list">
          {filtered.map((c) => {
            const isOnline = onlineIds.has(c.userId);
            const name = c.fullName || c.username;
            return (
              <div
                key={c.userId}
                className={"chat-user-item" + (selectedId === c.userId ? " active" : "") + (c.unread > 0 ? " unread" : "")}
                onClick={() => openChat(c.userId)}
              >
                <div className="chat-user-avatar">
                  {getInitials(name)}
                  <span className={"chat-status-dot" + (isOnline ? " online" : "")} />
                </div>
                <div className="chat-user-info">
                  <div className="chat-user-row">
                    <span className="chat-user-name">{name}</span>
                    <span className="chat-user-time">
                      {c.lastMessage?.sentAt ? new Date(c.lastMessage.sentAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <div className="chat-user-row">
                    <span className="chat-user-last">{c.lastMessage?.fromMe ? "Ban: " : ""}{c.lastMessage?.content}</span>
                    {c.unread > 0 && <span className="chat-unread-badge">{c.unread}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="chat-empty-list">
              {conversations.length === 0 ? "Chua co tin nhan nao" : "Khong tim thay khach hang"}
            </div>
          )}
        </div>
      </div>

      {selectedId ? (
        <div className="chat-window">
          <div className="chat-window__head">
            <div className="chat-window__user">
              <div className="chat-user-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                {getInitials(selected?.fullName || selected?.username)}
                <span className={"chat-status-dot" + (onlineIds.has(selectedId) ? " online" : "")} />
              </div>
              <div>
                <div className="chat-window__name">{selected?.fullName || selected?.username}</div>
                <div className="chat-window__status">{onlineIds.has(selectedId) ? "Dang online" : "Offline"}</div>
              </div>
            </div>
            <div className="chat-window__actions">
              <button className="btn btn-sm btn-outline">Xem don hang</button>
              <button className="btn btn-sm btn-outline">Ho so</button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => {
              const isMe = msg.senderId === myId || msg.senderId?.toString() === myId;
              return (
                <div key={msg.id} className={"chat-msg-wrap" + (isMe ? " admin" : "")}>
                  {!isMe && <div className="chat-msg-avatar">{getInitials(selected?.fullName || selected?.username)}</div>}
                  <div className="chat-msg-col">
                    <div className={"chat-bubble" + (isMe ? " admin" : "")}>{msg.content}</div>
                    <div className="chat-msg-time">
                      {new Date(msg.sentAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {showQuick && (
            <div className="chat-quick">
              <div className="chat-quick__title">Tra loi nhanh</div>
              <div className="chat-quick__list">
                {QUICK_REPLIES.map((q, i) => (
                  <button key={i} className="chat-quick__item"
                    onClick={() => { setInput(q); setShowQuick(false); inputRef.current?.focus(); }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chat-input-area">
            <button className={"chat-quick-btn" + (showQuick ? " active" : "")} onClick={() => setShowQuick((v) => !v)} title="Tra loi nhanh">⚡</button>
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Nhap tin nhan... (Enter de gui)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button className={"chat-send-btn" + (input.trim() ? " active" : "")} onClick={sendMessage} disabled={!input.trim()}>➤</button>
          </div>
        </div>
      ) : (
        <div className="chat-window" style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
          <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div>Chon mot cuoc tro chuyen de bat dau</div>
          </div>
        </div>
      )}
    </div>
  );
}