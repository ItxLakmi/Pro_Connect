'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, UserPlus, Heart, MessageSquare, Briefcase, Check } from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'FOLLOW': return <UserPlus className="text-blue-400" />;
      case 'LIKE': return <Heart className="text-red-400" />;
      case 'COMMENT': return <MessageSquare className="text-green-400" />;
      case 'BID_RECEIVED': return <Briefcase className="text-purple-400" />;
      default: return <Bell className="text-gray-400" />;
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
                  className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                    notification.isRead 
                      ? 'bg-card border-border opacity-60' 
                      : 'bg-card border-blue-500/20 shadow-lg shadow-blue-500/5'
                  }`}
                >
                  <div className={`p-3 rounded-xl bg-white/5 shrink-0`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-200">{notification.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{notification.content}</p>
                    <span className="text-[10px] text-gray-600 mt-2 block">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
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
              <p className="text-gray-500">No new notifications.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
