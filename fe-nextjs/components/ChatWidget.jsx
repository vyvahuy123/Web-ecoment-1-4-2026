"use client";
import { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/chat.service';
import { useCart } from '@/contexts/CartContext';

function CardMessage({ metadata }) {
  try {
    const data = JSON.parse(metadata);
    if (data.type === "order") {
      return (
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 10, minWidth: 200 }}>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>Đơn hàng</div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{data.orderCode}</div>
          {data.items?.slice(0, 2).map((item, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }} />}
              <div><div style={{ fontSize: 12, fontWeight: 500 }}>{item.name}</div><div style={{ fontSize: 11, color: "#888" }}>{item.price?.toLocaleString("vi-VN")}d x{item.quantity}{item.size ? " | " + item.size : ""}{item.color ? " | " + item.color : ""}</div></div>
            </div>
          ))}
          <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>Trạng thái: {data.status}</div>
          {data.issueReason && <div style={{ fontSize: 11, color: "#e67e22", fontWeight: 600, marginTop: 2 }}>Vấn đề: {data.issueReason}</div>}
        </div>
      );
    }
  } catch(e) {}
  return null;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { cartOpen } = useCart();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [issueOrder, setIssueOrder] = useState(null);
  const [issueReason, setIssueReason] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setIsClient(true); }, []);

  const [token, setToken] = useState(null);

  useEffect(() => {
    if (isClient) setToken(localStorage.getItem('token'));
  }, [isClient]);
  const myId = isClient ? localStorage.getItem('userId') : null;

  useEffect(() => {
    fetch('http://localhost:5000/api/chat/admin-id')
      .then(res => res.json())
      .then(data => setAdminId(data.adminId))
      .catch(console.error);
  }, []);

  // Lắng nghe event từ trang Orders
  useEffect(() => {
    const handler = (e) => {
      setIssueOrder(e.detail);
      setIssueReason('');
      setOpen(true);
    };
    window.addEventListener('open-chat-issue', handler);
    return () => window.removeEventListener('open-chat-issue', handler);
  }, []);

  // Fetch đơn hàng Pending gần nhất, không hiện luôn
  useEffect(() => {
    if (!isClient || !token) return;
    fetch('http://localhost:5000/api/orders/my?page=1&pageSize=1', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(data => {
        const latest = data.items?.[0];
        if (!latest || latest.status !== 'Pending') return;
        // Kiểm tra đơn này đã từng gửi chưa
        const sent = JSON.parse(localStorage.getItem('sentOrderCards') || '[]');
        if (!sent.includes(latest.id)) setPendingOrder(latest);
      })
      .catch(console.error);
  }, [isClient, token]);

  useEffect(() => {
    if (!isClient || !token || !adminId) return;
    chatService.connect(
      (msg) => setMessages((prev) => [...prev, msg]),
      () => {}, () => {}, () => {}
    ).then(() => chatService.getMessages(adminId))
     .then((msgs) => setMessages(msgs || []))
     .catch(console.error);
    return () => chatService.disconnect();
  }, [isClient, token, adminId]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open]);

  const handleOpen = () => {
    const t = token || localStorage.getItem('token');
    if (!t) { window.location.href = '/dang-nhap'; return; }
    setOpen(true);
  };

  // Hiện gợi ý khi user bắt đầu gõ
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.length === 1 && pendingOrder && !dismissed) setShowSuggestion(true);
    if (val.length === 0) setShowSuggestion(false);
  };

  const send = async () => {
    const t = token || localStorage.getItem('token');
    if (!t) { window.location.href = '/dang-nhap'; return; }
    const text = input.trim();
    if (!text || !adminId) return;
    try {
      await chatService.sendMessage(adminId, text);
      setInput('');
      setShowSuggestion(false);
      inputRef.current?.focus();
    } catch (e) { console.error(e); }
  };

  const sendOrderCard = async () => {
    if (!pendingOrder || !adminId) return;
    try {
      const t = token || localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/orders/' + pendingOrder.id, {
        headers: { Authorization: 'Bearer ' + t }
      });
      const detail = await res.json();
      const meta = JSON.stringify({
        type: 'order',
        orderCode: detail.orderCode,
        status: detail.status,
        totalAmount: detail.totalAmount,
        items: (detail.items || []).map(item => ({
          name: item.productName, imageUrl: item.productImageUrl, price: item.unitPrice, quantity: item.quantity, size: item.variantSize, color: item.variantColor
        }))
      });
      await chatService.sendMessage(adminId, 'Toi muon hoi ve don hang ' + detail.orderCode, 'card', meta);
      // Lưu vào localStorage để không gợi ý lại
      const sent = JSON.parse(localStorage.getItem('sentOrderCards') || '[]');
      sent.push(pendingOrder.id);
      localStorage.setItem('sentOrderCards', JSON.stringify(sent));
      setPendingOrder(null);
      setShowSuggestion(false);
      setInput('');
    } catch (e) { console.error(e); }
  };

  const bubbleStyle = (isMe) => ({
    padding: '6px 12px',
    borderRadius: 16,
    maxWidth: '80%',
    wordBreak: 'break-word',
    fontSize: 13,
    background: isMe ? '#111' : '#f0f0f0',
    color: isMe ? '#fff' : '#111',
  });

  if (!isClient || cartOpen) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {open && (
        <div style={{ width: 320, height: 420, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ background: '#111', color: '#fff', padding: '12px 16px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Chat với shop</span>
            <span style={{ cursor: 'pointer' }} onClick={() => { setOpen(false); setDismissed(false); setShowSuggestion(false); }}>X</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 && (
              <div style={{ color: '#999', textAlign: 'center', marginTop: 40 }}>Xin chào! Shop có thể giúp gì cho bạn?</div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.senderId?.toString() === myId;
              const isCard = msg.messageType === 'card' && msg.metadata;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  {isCard
                    ? <CardMessage metadata={msg.metadata} />
                    : <div style={bubbleStyle(isMe)}>{msg.content}</div>
                  }
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          {showSuggestion && pendingOrder && (
            <div style={{ margin: '0 12px 6px', background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: '#999' }}>Đơn hàng đang chờ xử lý</div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{pendingOrder.orderCode}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setShowSuggestion(false); setDismissed(true); }} style={{ background: '#eee', border: 'none', borderRadius: 12, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Bỏ qua</button>
                <button onClick={sendOrderCard} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 12, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Gui</button>
              </div>
            </div>
          )}
          {issueOrder && (
            <div style={{ margin: '0 12px 6px', background: '#fff7f0', border: '1px solid #f0a500', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#e67e22', fontWeight: 600, marginBottom: 4 }}>Vấn đề với đơn hàng</div>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>{issueOrder.orderCode}</div>
              <select value={issueReason} onChange={e => setIssueReason(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, marginBottom: 8 }}>
                <option value="">-- Chọn lý do --</option>
                <option value="Sai size">Sai size</option>
                <option value="Hàng bị hỏng">Hàng bị hỏng</option>
                <option value="Thiếu sản phẩm">Thiếu sản phẩm</option>
                <option value="Khác">Khác</option>
              </select>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setIssueOrder(null)} style={{ flex: 1, background: '#eee', border: 'none', borderRadius: 8, padding: '6px', fontSize: 11, cursor: 'pointer' }}>Huy</button>
                <button disabled={!issueReason} onClick={async () => {
                  if (!issueReason || !adminId) return;
                  try {
                    const t = token || localStorage.getItem('token');
                    const res = await fetch('http://localhost:5000/api/orders/' + issueOrder.orderId, { headers: { Authorization: 'Bearer ' + t } });
                    const detail = await res.json();
                    const meta = JSON.stringify({ type: 'order', orderCode: detail.orderCode, status: detail.status, issueReason, totalAmount: detail.totalAmount, items: (detail.items||[]).map(item => ({ name: item.productName, imageUrl: item.productImageUrl, price: item.unitPrice, quantity: item.quantity, size: item.variantSize, color: item.variantColor })) });
                    await chatService.sendMessage(adminId, '[Vấn đề: ' + issueReason + '] Đơn hàng ' + detail.orderCode, 'card', meta);
                    setIssueOrder(null);
                    setIssueReason('');
                  } catch(e) { console.error(e); }
                }} style={{ flex: 1, background: issueReason ? '#e67e22' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, padding: '6px', fontSize: 11, cursor: issueReason ? 'pointer' : 'not-allowed' }}>Gui</button>
              </div>
            </div>
          )}
          <div style={{ padding: '8px 12px', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Nhắn tin nhắn..."
              style={{ flex: 1, border: '1px solid #ddd', borderRadius: 20, padding: '6px 12px', fontSize: 13, outline: 'none' }}
            />
            <button onClick={send} disabled={!input.trim()} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', cursor: 'pointer' }}>
              Go
            </button>
          </div>
        </div>
      )}
      {!open && (
        <button onClick={handleOpen} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 24, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          Chat
        </button>
      )}
    </div>
  );
}