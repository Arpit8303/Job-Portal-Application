import { useState, useEffect, useRef, useCallback } from 'react';
import { io as SocketIO } from 'socket.io-client';
import { MdNotifications, MdNotificationsNone, MdDone, MdDoneAll, MdClose, MdWork, MdEvent, MdInfo } from 'react-icons/md';
import { useAppContext } from '../context/AppContext';
import notificationService from '../services/notificationService';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// ─── Icon by notification type ───────────────────────────────────────────────
const TypeIcon = ({ type }) => {
  switch (type) {
    case 'status_change':    return <MdWork style={{ color: '#818cf8' }} />;
    case 'job_alert':        return <MdWork style={{ color: '#22c55e' }} />;
    case 'interview_reminder': return <MdEvent style={{ color: '#f59e0b' }} />;
    default:                 return <MdInfo style={{ color: '#60a5fa' }} />;
  }
};

// ─── Time ago helper ─────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const NotificationBell = () => {
  const { auth } = useAppContext();
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const [hasMore, setHasMore]             = useState(false);
  const [page, setPage]                   = useState(1);
  const [animateBell, setAnimateBell]     = useState(false);
  const dropdownRef = useRef(null);
  const socketRef   = useRef(null);

  // ── Fetch notifications ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (p = 1, append = false) => {
    if (!auth.token) return;
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(p, 15);
      setUnreadCount(data.unreadCount);
      setHasMore(p < data.numOfPage);
      setNotifications(prev =>
        append ? [...prev, ...data.notifications] : data.notifications
      );
    } catch (err) {
      console.error('[NotificationBell] fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (auth.user?.userId || auth.user?._id) {
      fetchNotifications(1);
    }
  }, [auth.user, fetchNotifications]);

  // ── Socket.io setup ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!auth.user) return;
    const userId = auth.user._id || auth.user.userId;
    if (!userId) return;

    const socket = SocketIO(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      socket.emit('join', userId);
    });

    // New notification arrives
    socket.on('notification:new', ({ notification, unreadCount: count }) => {
      setUnreadCount(count);
      setNotifications(prev => [notification, ...prev]);
      // Bell wiggle animation
      setAnimateBell(true);
      setTimeout(() => setAnimateBell(false), 800);
    });

    // Unread count sync
    socket.on('notification:unread_count', ({ unreadCount: count }) => {
      setUnreadCount(count);
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, [auth.user]);

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Mark one as read ─────────────────────────────────────────────────────
  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[NotificationBell] markAsRead error:', err.message);
    }
  };

  // ── Mark all as read ─────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[NotificationBell] markAllRead error:', err.message);
    }
  };

  // ── Delete one ───────────────────────────────────────────────────────────
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('[NotificationBell] delete error:', err.message);
    }
  };

  // ── Load more ────────────────────────────────────────────────────────────
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      {/* ─── Bell Button ──────────────────────────────────────────────── */}
      <button
        id="notification-bell-btn"
        className={`notification-bell__btn ${animateBell ? 'notification-bell__btn--ring' : ''}`}
        onClick={() => setOpen(prev => !prev)}
        aria-label="Notifications"
        title="Notifications"
      >
        {unreadCount > 0
          ? <MdNotifications style={{ fontSize: '22px' }} />
          : <MdNotificationsNone style={{ fontSize: '22px' }} />
        }
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ─── Dropdown Panel ───────────────────────────────────────────── */}
      {open && (
        <div className="notification-bell__panel" role="dialog" aria-label="Notifications panel">
          {/* Header */}
          <div className="notification-bell__header">
            <h3 className="notification-bell__title">
              Notifications
              {unreadCount > 0 && (
                <span className="notification-bell__header-badge">{unreadCount}</span>
              )}
            </h3>
            <div className="notification-bell__header-actions">
              {unreadCount > 0 && (
                <button
                  className="notification-bell__action-btn"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                >
                  <MdDoneAll /> <span>All read</span>
                </button>
              )}
              <button
                className="notification-bell__action-btn notification-bell__action-btn--close"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
              >
                <MdClose />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="notification-bell__list">
            {loading && notifications.length === 0 ? (
              <div className="notification-bell__empty">
                <div className="notification-bell__spinner" />
                <p>Loading…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-bell__empty">
                <MdNotificationsNone style={{ fontSize: '40px', opacity: 0.3 }} />
                <p>You're all caught up!</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={`notification-bell__item ${n.read ? '' : 'notification-bell__item--unread'}`}
                  onClick={() => !n.read && handleMarkRead(n._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && !n.read && handleMarkRead(n._id)}
                >
                  <span className="notification-bell__item-icon">
                    <TypeIcon type={n.type} />
                  </span>
                  <div className="notification-bell__item-content">
                    <p className="notification-bell__item-msg">{n.message}</p>
                    <span className="notification-bell__item-time">{timeAgo(n.createdAt)}</span>
                  </div>
                  <div className="notification-bell__item-actions">
                    {!n.read && (
                      <button
                        className="notification-bell__mini-btn"
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }}
                        title="Mark as read"
                      >
                        <MdDone />
                      </button>
                    )}
                    <button
                      className="notification-bell__mini-btn notification-bell__mini-btn--delete"
                      onClick={(e) => handleDelete(n._id, e)}
                      title="Delete notification"
                    >
                      <MdClose />
                    </button>
                  </div>
                </div>
              ))
            )}

            {hasMore && !loading && (
              <button className="notification-bell__load-more" onClick={handleLoadMore}>
                Load more
              </button>
            )}
            {loading && notifications.length > 0 && (
              <div className="notification-bell__loading-more">
                <div className="notification-bell__spinner notification-bell__spinner--sm" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
