'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, UserPlus, Heart, MessageSquare, Briefcase,
  Check, CheckCheck, Trash2, RefreshCw, Users, ThumbsUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  FOLLOW:             { icon: <UserPlus size={18} />,     color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/40' },
  CONNECTION_REQUEST: { icon: <Users size={18} />,        color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  CONNECTION_ACCEPTED:{ icon: <Users size={18} />,        color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/40' },
  LIKE:               { icon: <ThumbsUp size={18} />,     color: 'text-rose-500',   bg: 'bg-rose-100 dark:bg-rose-900/40' },
  COMMENT:            { icon: <MessageSquare size={18} />,color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/40' },
  MESSAGE:            { icon: <MessageSquare size={18} />,color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/40' },
  BID_RECEIVED:       { icon: <Briefcase size={18} />,    color: 'text-amber-500',  bg: 'bg-amber-100 dark:bg-amber-900/40' },
  JOB_POST:           { icon: <Briefcase size={18} />,    color: 'text-cyan-500',   bg: 'bg-cyan-100 dark:bg-cyan-900/40' },
};

const DEFAULT_TYPE = { icon: <Bell size={18} />, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data || []);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err?.response?.data?.message || 'Failed to load notifications. Please try again.');
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleClick = (notification: any) => {
    if (!notification.isRead) markAsRead(notification.id);
    if (notification.link) { router.push(notification.link); return; }
    switch (notification.type) {
      case 'CONNECTION_REQUEST':
      case 'CONNECTION_ACCEPTED':
      case 'FOLLOW': router.push('/network'); break;
      case 'LIKE':
      case 'COMMENT':
      case 'GROUP_POST': router.push('/feed'); break;
      case 'MESSAGE': router.push('/messages'); break;
      case 'BID_RECEIVED':
      case 'JOB_POST': router.push('/jobs'); break;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-gray-950 text-foreground">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="font-semibold text-blue-600">{unreadCount}</span> unread
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg transition-colors"
              >
                <CheckCheck size={15} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => fetchNotifications()} className="ml-3 px-3 py-1 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : notifications.length > 0 ? (
            <AnimatePresence>
              {notifications.map((n, index) => {
                const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_TYPE;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => handleClick(n)}
                    className={`relative flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm group ${
                      n.isRead
                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                        : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50'
                    }`}
                  >
                    {/* Unread dot */}
                    {!n.isRead && (
                      <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                    )}

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <p className={`text-sm font-semibold ${n.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                        {n.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>

                    {/* Mark read button */}
                    {!n.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                        className="shrink-0 p-1.5 rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors opacity-0 group-hover:opacity-100"
                        title="Mark as read"
                      >
                        <Check size={15} />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Bell size={28} className="text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No notifications yet</p>
              <p className="text-sm text-gray-400 mb-6">When you get notifications, they'll appear here.</p>
              <button
                onClick={() => {
                  api.post('/notifications/test').then(() => fetchNotifications());
                }}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Test Notifications
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
