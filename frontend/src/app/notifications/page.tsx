'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, UserPlus, Heart, MessageSquare, Briefcase, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { getRelativeTime, getFullDateTime } from '@/lib/timeFormat';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTest, setCreatingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      const errorMsg = error?.response?.status === 404 
        ? 'Notifications endpoint not found. Please restart the backend server.'
        : error?.response?.data?.message || 'Failed to load notifications';
      setError(errorMsg);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const createTestNotifications = async () => {
    try {
      setError(null);
      setCreatingTest(true);
      const response = await api.post('/notifications/test');
      console.log('Test notifications created:', response.data);
      // Refresh notifications after creating test ones
      await fetchNotifications();
    } catch (error: any) {
      console.error('Error creating test notifications:', error);
      const errorMsg = error?.response?.status === 404 
        ? 'Test endpoint not found. Backend API issue.'
        : error?.response?.data?.message || 'Failed to create test notifications';
      setError(errorMsg);
    } finally {
      setCreatingTest(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'FOLLOW': return <UserPlus className="text-blue-400" />;
      case 'LIKE': return <Heart className="text-red-400" />;
      case 'COMMENT': return <MessageSquare className="text-green-400" />;
      case 'BID_RECEIVED': return <Briefcase className="text-purple-400" />;
      default: return <Bell className="text-gray-400" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Optionally mark as read automatically
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.link) {
      router.push(notification.link);
      return;
    }

    switch (notification.type) {
      case 'CONNECTION_REQUEST':
      case 'CONNECTION_ACCEPTED':
      case 'FOLLOW':
        router.push('/network');
        break;
      case 'LIKE':
      case 'COMMENT':
      case 'GROUP_POST':
        router.push('/feed');
        break;
      case 'BID_RECEIVED':
      case 'JOB_POST':
        router.push('/jobs');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 py-24">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <button onClick={markAllAsRead} className="text-sm text-blue-400 hover:underline">Mark all as read</button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-sm text-red-400">
              <p className="font-semibold mb-2">⚠️ Error</p>
              <p>{error}</p>
              <button
                onClick={() => fetchNotifications()}
                className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all text-xs font-semibold"
              >
                Retry
              </button>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length > 0 ? (
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
                    notification.isRead 
                      ? 'bg-card border-border opacity-60 hover:opacity-100' 
                      : 'bg-card border-blue-500/20 shadow-lg shadow-blue-500/5'
                  }`}
                >
                  <div className={`p-3 rounded-xl bg-white/5 shrink-0`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-200">{notification.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{notification.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-600">
                        {getRelativeTime(notification.createdAt)}
                      </span>
                      <span className="text-[10px] text-gray-700" title={getFullDateTime(notification.createdAt)}>
                        ({getFullDateTime(notification.createdAt)})
                      </span>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="p-2 hover:bg-white/5 rounded-lg text-blue-400 transition-all"
                      title="Mark as read"
                    >
                      <Check size={18} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm">
              <Bell size={48} className="mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500 mb-6">No new notifications.</p>
              <button
                onClick={createTestNotifications}
                disabled={creatingTest}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all"
              >
                {creatingTest ? 'Creating...' : 'Create Test Notifications'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
