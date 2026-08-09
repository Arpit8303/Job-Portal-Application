import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MdChat, MdClose, MdSend, MdDelete, MdSmartToy,
  MdPerson, MdKeyboardArrowDown,
} from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Axios helpers ────────────────────────────────────────────────────────────
const chatApi = {
  getHistory: () => api.get('/chat/history').then((r) => r.data),
  sendMessage: (message) => api.post('/chat/message', { message }).then((r) => r.data),
  clearHistory: () => api.delete('/chat/clear').then((r) => r.data),
};

// ─── Message bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`chat-bubble-row ${isUser ? 'chat-bubble-row--user' : 'chat-bubble-row--bot'}`}>
      {!isUser && (
        <div className="chat-avatar chat-avatar--bot" title="JobLedger Assistant">
          <MdSmartToy />
        </div>
      )}
      <div className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--bot'}`}>
        {/* Render markdown-lite: bold, bullet points */}
        <ChatMarkdown text={msg.content} />
        <span className="chat-bubble__time">
          {msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            : ''}
        </span>
      </div>
      {isUser && (
        <div className="chat-avatar chat-avatar--user" title="You">
          <MdPerson />
        </div>
      )}
    </div>
  );
};

// ─── Minimal markdown renderer (bold + newlines + bullets) ───────────────────
const ChatMarkdown = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="chat-markdown">
      {lines.map((line, i) => {
        // Convert **bold** text
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part
        );
        // Bullet point
        if (line.trim().startsWith('•') || /^\d+\./.test(line.trim())) {
          return <p key={i} className="chat-list-item">{parts}</p>;
        }
        return line ? <p key={i}>{parts}</p> : <br key={i} />;
      })}
    </div>
  );
};

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="chat-bubble-row chat-bubble-row--bot">
    <div className="chat-avatar chat-avatar--bot"><MdSmartToy /></div>
    <div className="chat-bubble chat-bubble--bot chat-bubble--typing">
      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
    </div>
  </div>
);

// ─── Quick prompts ────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  '🔍 Find React jobs',
  '📋 My applications',
  '⭐ Recommend me jobs',
  '💰 Salary tips',
];

// ─── Main ChatWidget ──────────────────────────────────────────────────────────
const ChatWidget = () => {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [historyLoaded, setHist]  = useState(false);
  const [unread, setUnread]       = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // ── Auto-scroll to bottom ──────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open, scrollToBottom]);

  // ── Load history on first open ─────────────────────────────────────────────
  useEffect(() => {
    if (open && !historyLoaded) {
      chatApi.getHistory()
        .then((data) => {
          setMessages(data.messages || []);
          setHist(true);
        })
        .catch(() => setHist(true));
    }
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, historyLoaded]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg, timestamp: new Date() }]);
    setLoading(true);

    try {
      const data = await chatApi.sendMessage(msg);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      }]);
      if (!open) setUnread((n) => n + 1);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      if (err.response?.status === 429) {
        toast.error('Slow down! Too many messages.');
      }
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `⚠️ ${errMsg}`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Clear history ──────────────────────────────────────────────────────────
  const handleClear = async () => {
    if (!window.confirm('Clear all chat history?')) return;
    try {
      await chatApi.clearHistory();
      setMessages([]);
      toast.success('Chat cleared');
    } catch {
      toast.error('Failed to clear chat');
    }
  };

  // ── Enter key ──────────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-widget">
      {/* ── Floating bubble button ──────────────────────────────────────── */}
      <button
        id="chat-widget-toggle"
        className={`chat-widget__bubble ${open ? 'chat-widget__bubble--open' : ''}`}
        onClick={() => setOpen((p) => !p)}
        aria-label="Open JobLedger Assistant"
        title="JobLedger Assistant"
      >
        {open ? <MdKeyboardArrowDown /> : <MdChat />}
        {!open && unread > 0 && (
          <span className="chat-widget__unread">{unread}</span>
        )}
      </button>

      {/* ── Chat panel ─────────────────────────────────────────────────── */}
      {open && (
        <div className="chat-widget__panel" role="dialog" aria-label="Chat with JobLedger Assistant">
          {/* Header */}
          <div className="chat-widget__header">
            <div className="chat-widget__header-info">
              <div className="chat-widget__header-avatar">
                <MdSmartToy />
                <span className="chat-widget__online-dot" />
              </div>
              <div>
                <p className="chat-widget__header-name">JobLedger Assistant</p>
                <p className="chat-widget__header-status">
                  {loading ? 'Typing…' : 'Online · Powered by Cohere AI'}
                </p>
              </div>
            </div>
            <div className="chat-widget__header-actions">
              <button
                className="chat-widget__icon-btn"
                onClick={handleClear}
                title="Clear history"
                id="chat-clear-btn"
              >
                <MdDelete />
              </button>
              <button
                className="chat-widget__icon-btn"
                onClick={() => setOpen(false)}
                title="Close"
                id="chat-close-btn"
              >
                <MdClose />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-widget__messages" id="chat-messages-container">
            {/* Welcome message */}
            {messages.length === 0 && !loading && (
              <div className="chat-widget__welcome">
                <div className="chat-widget__welcome-avatar"><MdSmartToy /></div>
                <p className="chat-widget__welcome-title">Hi! I'm JobLedger Assistant 👋</p>
                <p className="chat-widget__welcome-sub">
                  I can help you find jobs, check your applications, and give career advice.
                </p>
                <div className="chat-widget__quick-prompts">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      className="chat-widget__quick-btn"
                      onClick={() => handleSend(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-widget__input-area">
            <textarea
              ref={inputRef}
              id="chat-input"
              className="chat-widget__input"
              placeholder="Ask about jobs, applications, career tips…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={2000}
              disabled={loading}
            />
            <button
              id="chat-send-btn"
              className="chat-widget__send-btn"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              title="Send message"
            >
              <MdSend />
            </button>
          </div>
          <p className="chat-widget__footer">
            Scoped to job search topics · Powered by Cohere Command
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
