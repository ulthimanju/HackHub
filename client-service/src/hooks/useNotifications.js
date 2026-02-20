import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const MAX_NOTIFICATIONS = 50;

function storageKey(userId) {
  return `ehub_notifications_${userId}`;
}

function loadStored(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(userId, notifications) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(notifications));
  } catch {
    // ignore quota errors
  }
}

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const clientRef = useRef(null);
  const userIdRef = useRef(null);

  // Load from localStorage when user changes
  useEffect(() => {
    if (user?.id) {
      setNotifications(loadStored(user.id));
      userIdRef.current = user.id;
    } else {
      setNotifications([]);
      userIdRef.current = null;
    }
  }, [user?.id]);

  const addNotification = useCallback((raw) => {
    const userId = userIdRef.current;
    if (!userId) return;

    const notification = {
      id: `${Date.now()}-${Math.random()}`,
      type: raw.type || (raw.status === 'RESULTS_ANNOUNCED' ? 'RESULTS' : 'INFO'),
      title: buildTitle(raw),
      message: raw.message || '',
      eventId: raw.eventId || null,
      eventName: raw.eventName || null,
      status: raw.status || null,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => {
      const updated = [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
      persist(userId, updated);
      return updated;
    });
  }, []);

  // Connect STOMP
  useEffect(() => {
    if (!user?.id) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws-notifications'),
      connectHeaders: { 'X-User-Id': user.id },
      reconnectDelay: 5000,
      onConnect: () => {
        // User-specific alerts (registration approvals/rejections)
        client.subscribe('/user/queue/alerts', (frame) => {
          try {
            addNotification(JSON.parse(frame.body));
          } catch {
            // malformed message
          }
        });
        // Global broadcasts (results announced)
        client.subscribe('/topic/global-alerts', (frame) => {
          try {
            addNotification(JSON.parse(frame.body));
          } catch {
            // malformed message
          }
        });
      },
      onStompError: () => {
        // will auto-reconnect via reconnectDelay
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [user?.id, addNotification]);

  const markAsRead = useCallback((id) => {
    const userId = userIdRef.current;
    if (!userId) return;
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      persist(userId, updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const userId = userIdRef.current;
    if (!userId) return;
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      persist(userId, updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    const userId = userIdRef.current;
    if (!userId) return;
    setNotifications([]);
    localStorage.removeItem(storageKey(userId));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markAsRead, markAllAsRead, clearAll };
}

function buildTitle(raw) {
  if (raw.type === 'REGISTRATION_UPDATE') {
    const statusMap = {
      APPROVED: '✅ Registration Approved',
      REJECTED: '❌ Registration Rejected',
      PENDING: '⏳ Registration Pending',
    };
    return statusMap[raw.status] || 'Registration Update';
  }
  if (raw.status === 'RESULTS_ANNOUNCED') return '🏆 Results Announced';
  return 'Notification';
}
