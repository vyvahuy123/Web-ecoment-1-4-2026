import { useState, useRef, useEffect, useCallback } from "react";
import { chatService } from "../../../services/chat.service";
import "../styles/chat.css";

const QUICK_REPLIES = [
  "Cảm ơn bạn đã liên hệ! 🙏",
  "Shop sẽ kiểm tra và phản hồi sớm nhất có thể.",
  "Đơn hàng của bạn đang được xử lý.",
  "Bạn vui lòng cho shop biết mã đơn hàng nhé!",
  "Shop xin lỗi vì sự bất tiện này 🙏",
];

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);   // list bên trái
  const [messages, setMessages]           = useState([]);   // tin của cuộc trò chuyện đang mở
  const [selectedId, setSelectedId]       = useState(null); // userId đang chat
  const [onlineIds, setOnlineIds]         = useState(new Set());
  const [input, setInput]                 = useState("");
  const [search, setSearch]               = useState("");
  const [showQuick, setShowQuick]         = useState(false);
  const [loading, setLoading]             = useState(true);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // ── Lấy danh sách conversations ──────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
      // Đánh dấu ai đang online
      setOnlineIds(new Set(data.filter((c) => c.isOnline).map((c) => c.userId)));
    } catch (e) {
      console.error("Lỗi load conversations:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Mở chat với 1 user ───────────────────────────────────────────────────
  const openChat = useCallback(async (userId) => {
    setSelectedId(userId);
    setMessages([]);
    try {
      const msgs = await chatService.getMessages(userId);
      setMessages(msgs);
      await chatService.markAsRead(userId);
      // Reset unread trong list
      setConversations((prev) =>
        prev.map((c) => c.userId === userId ? { ...c, unread: 0 } : c)
      );
    } catch (e) {
      console.error("Lỗi load messages:", e);
    }
  }, []);

  // ── SignalR callbacks ────────────────────────────────────────────────────
  const onMessage = useCallback((msg) => {
    // Nếu đang mở đúng conversation → append
    setSelectedId((curId) => {
      if (msg.senderId === curId || msg.receiverId === curId) {
        setMessages((prev) => [...prev, msg]);
        // Mark read nếu mình là receiver
        const myId = localStorage.getItem("userId");
        if (msg.senderId === curId && msg.receiverId === myId) {
          chatService.markAsRead(curId);
        }
      } else {
        // Tăng unread trong sidebar
        setConversations((prev) =>
          prev.map((c) =>
            c.userId === msg.senderId ? { ...c, unread: c.unread + 1, lastMessage: { content: msg.content, sentAt: msg.sentAt, fromMe: false } } : c
          )
        );
      }
      return curId;
    });
  }, []);

  const onUserOnline  = useCallback((uid) => setOnlineIds((s) => new Set([...s, uid])), []);
  const onUserOffline = useCallback((uid) => setOnlineIds((s) => { const n = new Set(s); n.delete(uid); return n; }), []);
  const onMessagesRead = useCallback(() => {}, []); // có thể hiện tick xanh sau

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadConversations();

    chatService
      .connect(onMessage, onUserOnline, onUserOffline, onMessagesRead)
      .catch((e) => console.error("SignalR connect error:", e));

    return () => { chatService.disconnect(); };
  }, [loadConversations, onMessage, onUserOnline, onUserOffline, onMessagesRead]);

  // ── Scroll bottom ────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ── Gửi tin ──────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !selectedId) return;
    try {
      await chatService.sendMessage(selectedId, text);
      setInput("");
      setShowQuick(false);
      inputRef.current?.focus();
    } catch (e) {
      console.error("Lỗi gửi tin:", e);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const selected    = conversations.find((c) => c.userId === selectedId);
  const filtered    = conversations.filter((c) =>
    (c.fullName || c.username)?.toLowerCase().includes(search.toLowerCase())
  );
  const totalUnread = conversations.reduce((s, c) => s + (c.unread || 0), 0);
  const myId        = localStorage.getItem("userId");

  if (loading) return <div className="chat-layout" style={{ alignItems: "center", justifyContent: "center" }}>Đang tải...</div>;

  return (
    <div className="chat-layout">

      {/* ── LEFT ──────────────────────────────────────────────────────────── */}
      <div className="chat-sidebar">
        <div className="chat-sidebar__head">
          <div className="chat-sidebar__title">
            Tin nhắn
            {totalUnread > 0 && <span className="chat-total-badge">{totalUnread}</span>}
          </div>
          <input
            className="chat-search"
            placeholder="Tìm khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="chat-user-list">
          {filtered.map((c) => {
            const isOnline = onlineIds.has(c.userId);
            const name     = c.fullName || c.username;
            return (
              <div
                key={c.userId}
                className={`chat-user-item${selectedId === c.userId ? " active" : ""}${c.unread > 0 ? " unread" : ""}`}
                onClick={() => openChat(c.userId)}
              >
                <div className="chat-user-avatar">
                  {getInitials(name)}
                  <span className={`chat-status-dot${isOnline ? " online" : ""}`} />
                </div>
                <div className="chat-user-info">
                  <div className="chat-user-row">
                    <span className="chat-user-name">{name}</span>
                    <span className="chat-user-time">
                      {c.lastMessage?.sentAt
                        ? new Date(c.lastMessage.sentAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </span>
                  </div>
                  <div className="chat-user-row">
                    <span className="chat-user-last">
                      {c.lastMessage?.fromMe ? "Bạn: " : ""}{c.lastMessage?.content}
                    </span>
                    {c.unread > 0 && <span className="chat-unread-badge">{c.unread}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="chat-empty-list">
              {conversations.length === 0 ? "Chưa có tin nhắn nào" : "Không tìm thấy khách hàng"}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT ─────────────────────────────────────────────────────────── */}
      {selectedId ? (
        <div className="chat-window">
          <div className="chat-window__head">
            <div className="chat-window__user">
              <div className="chat-user-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                {getInitials(selected?.fullName || selected?.username)}
                <span className={`chat-status-dot${onlineIds.has(selectedId) ? " online" : ""}`} />
              </div>
              <div>
                <div className="chat-window__name">{selected?.fullName || selected?.username}</div>
                <div className="chat-window__status">
                  {onlineIds.has(selectedId) ? "🟢 Đang online" : "⚫ Offline"}
                </div>
              </div>
            </div>
            <div className="chat-window__actions">
              <button className="btn btn-sm btn-outline">Xem đơn hàng</button>
              <button className="btn btn-sm btn-outline">Hồ sơ</button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => {
              const isMe = msg.senderId === myId || msg.senderId?.toString() === myId;
              return (
                <div key={msg.id} className={`chat-msg-wrap${isMe ? " admin" : ""}`}>
                  {!isMe && (
                    <div className="chat-msg-avatar">
                      {getInitials(selected?.fullName || selected?.username)}
                    </div>
                  )}
                  <div className="chat-msg-col">
                    <div className={`chat-bubble${isMe ? " admin" : ""}`}>{msg.content}</div>
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
              <div className="chat-quick__title">Trả lời nhanh</div>
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
            <button
              className={`chat-quick-btn${showQuick ? " active" : ""}`}
              onClick={() => setShowQuick((v) => !v)}
              title="Trả lời nhanh"
            >⚡</button>
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Nhập tin nhắn... (Enter để gửi)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button
              className={`chat-send-btn${input.trim() ? " active" : ""}`}
              onClick={sendMessage}
              disabled={!input.trim()}
            >➤</button>
          </div>
        </div>
      ) : (
        <div className="chat-window" style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
          <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div>Chọn một cuộc trò chuyện để bắt đầu</div>
          </div>
        </div>
      )}
    </div>
  );
}