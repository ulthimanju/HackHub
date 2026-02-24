import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

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

/**
 * Real-time notification system backed by STOMP/WebSocket with localStorage persistence.
 *
 * Subscribes to two channels when the user is authenticated:
 * - `/user/queue/alerts`  — personal alerts (registration approvals/rejections)
 * - `/topic/global-alerts` — broadcast alerts (results announced)
 *
 * Notifications are capped at 50 entries and persisted per-user in localStorage.
 *
 * @param {{ id: string }|null} user - The authenticated user; pass null/undefined to disconnect.
 * @returns {{
 *   notifications: object[],
 *   unreadCount: number,
 *   markAsRead: (id: string) => void,
 *   markAllAsRead: () => void,
 *   clearAll: () => void,
 * }}
 */
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
    const token = localStorage.getItem('token');
    if (!token) return; // no JWT → don't connect

    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const client = new Client({
      brokerURL: `${wsProtocol}://${window.location.host}/ws-notifications/websocket`,
      connectHeaders: { Authorization: `Bearer ${token}` },
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
