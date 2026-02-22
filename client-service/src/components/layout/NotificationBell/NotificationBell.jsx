import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { theme } from '../../../utils/theme';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusAccent(status) {
  if (status === 'APPROVED')           return 'border-l-green-500';
  if (status === 'REJECTED')           return 'border-l-red-500';
  if (status === 'RESULTS_ANNOUNCED')  return 'border-l-brand-500';
  return 'border-l-brand-400';
}

export default function NotificationBell({ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`relative p-1.5 rounded-lg transition-all duration-150 ${
          open ? 'bg-brand-50 text-brand-600' : 'text-ink-muted hover:bg-surface-hover hover:text-ink-secondary'
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 ${theme.primary.bg} text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-surface-border z-50 overflow-hidden min-w-[300px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
            <span className="font-display font-semibold text-sm text-ink-primary">Notifications</span>
            <div className="flex items-center gap-0.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-muted hover:text-ink-secondary transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-ink-muted hover:text-red-500 transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-muted transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-ink-muted gap-2">
                <Bell className="w-7 h-7 opacity-25" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`px-4 py-3 border-b border-surface-border cursor-pointer border-l-2 transition-colors ${
                    n.read
                      ? 'bg-white border-l-transparent hover:bg-surface-hover'
                      : `${statusAccent(n.status)} bg-brand-50/40 hover:bg-brand-50`
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.read ? 'text-ink-secondary' : 'text-ink-primary font-medium'} truncate`}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{n.message}</p>
                      )}
                    </div>
                    <span className="text-xxs text-ink-muted whitespace-nowrap mt-0.5 shrink-0">
                      {timeAgo(n.timestamp)}
                    </span>
                  </div>
                  {!n.read && (
                    <span className={`inline-block mt-1 w-1.5 h-1.5 rounded-full ${theme.primary.bg}`} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
