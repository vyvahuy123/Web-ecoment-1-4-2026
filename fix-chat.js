const fs = require('fs');
const path = 'E:/CleanArchitecture/fe-nextjs/components/ChatWidget.jsx';

const code = `"use client";
import { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/chat.service';
import { useCart } from '@/contexts/CartContext';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { cartOpen } = useCart();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setIsClient(true); }, []);

  const [token, setToken] = useState(null);

  useEffect(() => {
    if (isClient) setToken(localStorage.getItem('token'));
  }, [isClient]);
  const myId = isClient ? localStorage.getItem('userId') : null;

  useEffect(() => {
    fetch('/api/chat/admin-id')
      .then(res => res.json())
      .then(data => setAdminId(data.adminId))
      .catch(console.error);
  }, []);

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
    if (!token) { window.location.href = '/dang-nhap'; return; }
    setOpen(true);
  };

  const send = async () => {
    if (!token) { window.location.href = '/dang-nhap'; return; }
    const text = input.trim();
    if (!text || !adminId) return;
    try {
      await chatService.sendMessage(adminId, text);
      setInput('');
      inputRef.current?.focus();
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
            <span>Chat voi shop</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setOpen(false)}>X</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.length === 0 && (
              <div style={{ color: '#999', textAlign: 'center', marginTop: 40 }}>Xin chao! Shop co the giup gi cho ban?</div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.senderId?.toString() === myId;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={bubbleStyle(isMe)}>{msg.content}</div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Nhan tin nhan..."
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
`;

fs.writeFileSync(path, code, 'utf8');
console.log('Done');
