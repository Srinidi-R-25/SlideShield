'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, CheckCheck, X, AlertTriangle, Info, Radio, ShieldAlert } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { Notification } from '../lib/types';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await fetchApi<Notification[]>('/notifications');
      setNotifications(data);
      setUnread(data.filter((n) => !n.is_read).length);
    } catch {
      // Silently fail — user may not be logged in
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetchApi('/notifications/read-all', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch {}
    setLoading(false);
  };

  const markOneRead = async (id: number) => {
    try {
      await fetchApi(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const iconMap = {
    Critical: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
    Alert: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />,
    SOS: <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />,
    Info: <Info className="w-3.5 h-3.5 text-sky-400" />,
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
        title="Notifications"
      >
        {unread > 0 ? (
          <BellRing className="w-5 h-5 text-amber-400 animate-bounce" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          id="notification-panel"
          className="absolute right-0 top-12 w-80 glass-panel rounded-2xl border border-slate-700/60 shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Notifications
              {unread > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-bold">
                  {unread} new
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-xs gap-2">
                <Bell className="w-8 h-8 opacity-30" />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markOneRead(n.id)}
                  className={`px-4 py-3 border-b border-slate-800/60 cursor-pointer hover:bg-slate-800/40 transition-colors ${
                    !n.is_read ? 'bg-slate-800/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {iconMap[n.notification_type as keyof typeof iconMap] ?? iconMap.Info}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${!n.is_read ? 'text-slate-100' : 'text-slate-300'}`}>
                        {n.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {new Date(n.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
