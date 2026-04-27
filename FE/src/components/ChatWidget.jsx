import { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/chat.service';

const ADMIN_ID = import.meta.env.VITE_ADMIN_ID || '';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const myId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || !myId) return;
    chatService.connect(
      (msg) => setMessages((prev) => [...prev, msg]),
      () => {}, () => {}, () => {}
    ).then(() => {
      setConnected(true);
      return chatService.getMessages(ADMIN_ID);
    }).then((msgs) => setMessages(msgs || []))
    .catch(console.error);
    return () => chatService.disconnect();
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || !ADMIN_ID) return;
    try {
      await chatService.sendMessage(ADMIN_ID, text);
      setInput('');
      inputRef.current?.focus();
    } catch (e) { console.error(e); }
  };

  if (!token) return null;

  const bubbleStyle = (isMe) => ({
    maxWidth: '75%',
    padding: '8px 12px',
    borderRadius: 16,
    background: isMe ? '#111' : '#f0f0f0',
    color: isMe ? '#fff' : '#111',
    fontSize: 13,
  });

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
            {messages.map((msg) => {
              const isMe = msg.senderId?.toString() === myId;
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={bubbleStyle(isMe)}>{msg.content}</div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8, gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Nhan tin nhan..."
              style={{ flex: 1, border: '1px solid #ddd', borderRadius: 20, padding: '6px 12px', fontSize: 13, outline: 'none' }}
            />
            <button onClick={send} disabled={!input.trim() || !connected} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', cursor: 'pointer' }}>
              Go
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} style={{ width: 52, height: 52, borderRadius: '50%', background: '#111', color: '#fff', border: 'none', fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Chat
      </button>
    </div>
  );
}