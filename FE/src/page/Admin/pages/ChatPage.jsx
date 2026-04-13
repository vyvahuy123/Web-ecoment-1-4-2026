import { useState, useRef, useEffect } from "react";
import "../styles/chat.css";

const USERS = [
  {
    id: 1, name: "Nguyễn Linh", initials: "NL", role: "Khách hàng",
    unread: 2, online: true, lastMsg: "Cho tôi hỏi về size áo...", lastTime: "08:42",
    messages: [
      { id: 1, from: "user", text: "Chào shop! Cho mình hỏi áo Oversized Linen Blazer còn size M không?", time: "08:30" },
      { id: 2, from: "admin", text: "Chào bạn! Size M hiện còn 3 cái bạn nhé 😊", time: "08:32" },
      { id: 3, from: "user", text: "Vậy giá có giảm không shop? Mình thấy bên ngoài đang sale.", time: "08:40" },
      { id: 4, from: "user", text: "Cho tôi hỏi về size áo...", time: "08:42" },
    ],
  },
  {
    id: 2, name: "Trần Minh", initials: "TM", role: "Khách hàng",
    unread: 0, online: true, lastMsg: "Đơn hàng của mình khi nào giao?", lastTime: "07:15",
    messages: [
      { id: 1, from: "user", text: "Shop ơi đơn #ORD-002 của mình khi nào giao vậy?", time: "07:10" },
      { id: 2, from: "admin", text: "Đơn của bạn đang được xử lý, dự kiến giao trong 2-3 ngày bạn nhé!", time: "07:12" },
      { id: 3, from: "user", text: "Đơn hàng của mình khi nào giao?", time: "07:15" },
    ],
  },
  {
    id: 3, name: "Phạm Thu Hà", initials: "PH", role: "Khách hàng",
    unread: 5, online: false, lastMsg: "Mình muốn đổi màu sản phẩm", lastTime: "Hôm qua",
    messages: [
      { id: 1, from: "user", text: "Shop có thể đổi màu cho mình không? Mình order nhầm màu rồi 😢", time: "Hôm qua" },
      { id: 2, from: "user", text: "Mình muốn đổi màu sản phẩm", time: "Hôm qua" },
    ],
  },
  {
    id: 4, name: "Lê Văn An", initials: "LA", role: "Khách hàng",
    unread: 0, online: false, lastMsg: "Cảm ơn shop nhiều nhé!", lastTime: "2 ngày trước",
    messages: [
      { id: 1, from: "user", text: "Mình nhận hàng rồi, chất lượng rất tốt!", time: "2 ngày trước" },
      { id: 2, from: "admin", text: "Cảm ơn bạn đã tin tưởng shop! Hẹn gặp lại 🙏", time: "2 ngày trước" },
      { id: 3, from: "user", text: "Cảm ơn shop nhiều nhé!", time: "2 ngày trước" },
    ],
  },
  {
    id: 5, name: "Võ Thị Bích", initials: "VB", role: "Khách hàng",
    unread: 1, online: true, lastMsg: "Shop có ship COD không?", lastTime: "06:55",
    messages: [
      { id: 1, from: "user", text: "Shop có ship COD không?", time: "06:55" },
    ],
  },
];

const QUICK_REPLIES = [
  "Cảm ơn bạn đã liên hệ! 🙏",
  "Shop sẽ kiểm tra và phản hồi sớm nhất có thể.",
  "Đơn hàng của bạn đang được xử lý.",
  "Bạn vui lòng cho shop biết mã đơn hàng nhé!",
  "Shop xin lỗi vì sự bất tiện này 🙏",
];

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState(1);
  const [userList, setUserList]     = useState(USERS);
  const [input, setInput]           = useState("");
  const [search, setSearch]         = useState("");
  const [showQuick, setShowQuick]   = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const selected  = userList.find((u) => u.id === selectedId);
  const filtered  = userList.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  // Scroll to bottom khi có tin mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages?.length, selectedId]);

  // Đánh dấu đã đọc khi mở conversation
  const openChat = (id) => {
    setSelectedId(id);
    setUserList((prev) =>
      prev.map((u) => u.id === id ? { ...u, unread: 0 } : u)
    );
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg = {
      id: Date.now(),
      from: "admin",
      text,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
    setUserList((prev) =>
      prev.map((u) =>
        u.id === selectedId
          ? { ...u, messages: [...u.messages, newMsg], lastMsg: text, lastTime: "Vừa xong" }
          : u
      )
    );
    setInput("");
    setShowQuick(false);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const useQuick = (text) => {
    setInput(text);
    setShowQuick(false);
    inputRef.current?.focus();
  };

  const totalUnread = userList.reduce((s, u) => s + u.unread, 0);

  return (
    <div className="chat-layout">

      {/* ── LEFT: User list ─────────────────────────── */}
      <div className="chat-sidebar">
        <div className="chat-sidebar__head">
          <div className="chat-sidebar__title">
            Tin nhắn
            {totalUnread > 0 && (
              <span className="chat-total-badge">{totalUnread}</span>
            )}
          </div>
          <input
            className="chat-search"
            placeholder="Tìm khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="chat-user-list">
          {filtered.map((u) => (
            <div
              key={u.id}
              className={`chat-user-item${selectedId === u.id ? " active" : ""}${u.unread > 0 ? " unread" : ""}`}
              onClick={() => openChat(u.id)}
            >
              <div className="chat-user-avatar">
                {u.initials}
                <span className={`chat-status-dot${u.online ? " online" : ""}`} />
              </div>
              <div className="chat-user-info">
                <div className="chat-user-row">
                  <span className="chat-user-name">{u.name}</span>
                  <span className="chat-user-time">{u.lastTime}</span>
                </div>
                <div className="chat-user-row">
                  <span className="chat-user-last">{u.lastMsg}</span>
                  {u.unread > 0 && (
                    <span className="chat-unread-badge">{u.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="chat-empty-list">Không tìm thấy khách hàng</div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Chat window ──────────────────────── */}
      <div className="chat-window">

        {/* Header */}
        <div className="chat-window__head">
          <div className="chat-window__user">
            <div className="chat-user-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
              {selected?.initials}
              <span className={`chat-status-dot${selected?.online ? " online" : ""}`} />
            </div>
            <div>
              <div className="chat-window__name">{selected?.name}</div>
              <div className="chat-window__status">
                {selected?.online ? "🟢 Đang online" : "⚫ Offline"}
              </div>
            </div>
          </div>
          <div className="chat-window__actions">
            <button className="btn btn-sm btn-outline">Xem đơn hàng</button>
            <button className="btn btn-sm btn-outline">Hồ sơ</button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {selected?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-msg-wrap${msg.from === "admin" ? " admin" : ""}`}
            >
              {msg.from === "user" && (
                <div className="chat-msg-avatar">{selected.initials}</div>
              )}
              <div className="chat-msg-col">
                <div className={`chat-bubble${msg.from === "admin" ? " admin" : ""}`}>
                  {msg.text}
                </div>
                <div className="chat-msg-time">{msg.time}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {showQuick && (
          <div className="chat-quick">
            <div className="chat-quick__title">Trả lời nhanh</div>
            <div className="chat-quick__list">
              {QUICK_REPLIES.map((q, i) => (
                <button key={i} className="chat-quick__item" onClick={() => useQuick(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <button
            className={`chat-quick-btn${showQuick ? " active" : ""}`}
            onClick={() => setShowQuick((v) => !v)}
            title="Trả lời nhanh"
          >
            ⚡
          </button>
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
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}