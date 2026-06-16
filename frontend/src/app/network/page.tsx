'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, UserCheck, UserX, UserMinus, Search,
  MapPin, Bell, Check, X, Globe, ChevronRight, Briefcase
} from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface UserCard {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  profile?: { headline?: string; location?: string };
}

interface ConnectionRequest {
  id: string;
  createdAt: string;
  sender?: UserCard;
  receiver?: UserCard;
}

interface Connection {
  id: string;
  createdAt: string;
  user: UserCard;
}

type Tab = 'connections' | 'requests' | 'discover';

export default function NetworkPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('connections');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [incoming, setIncoming] = useState<ConnectionRequest[]>([]);
  const [outgoing, setOutgoing] = useState<ConnectionRequest[]>([]);
  const [discover, setDiscover] = useState<UserCard[]>([]);
  const [stats, setStats] = useState({ connectionsCount: 0, followingCount: 0, followersCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [connRes, reqRes, statsRes, discoverRes] = await Promise.all([
        api.get('/networking/connections'),
        api.get('/networking/connections/requests'),
        api.get('/networking/network-stats'),
        api.get('/networking/people-you-may-know'),
      ]);
      setConnections(connRes.data);
      setIncoming(reqRes.data.incoming);
      setOutgoing(reqRes.data.outgoing);
      setStats(statsRes.data);
      setDiscover(discoverRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await api.post(`/networking/connections/accept/${requestId}`);
      setIncoming(prev => prev.filter(r => r.id !== requestId));
      showToast('Connection accepted!');
      fetchAll();
    } catch (err) { console.error(err); }
    finally { setProcessingId(null); }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await api.post(`/networking/connections/reject/${requestId}`);
      setIncoming(prev => prev.filter(r => r.id !== requestId));
      showToast('Request ignored.');
    } catch (err) { console.error(err); }
    finally { setProcessingId(null); }
  };

  const handleRemove = async (targetUserId: string) => {
    setProcessingId(targetUserId);
    try {
      await api.delete(`/networking/connections/${targetUserId}`);
      setConnections(prev => prev.filter(c => c.user.id !== targetUserId));
      showToast('Connection removed.');
    } catch (err) { console.error(err); }
    finally { setProcessingId(null); }
  };

  const handleConnect = async (targetUserId: string) => {
    setProcessingId(targetUserId);
    try {
      await api.post(`/networking/connections/request/${targetUserId}`);
      setDiscover(prev => prev.filter(u => u.id !== targetUserId));
      showToast('Connection request sent!');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to send request');
    }
    finally { setProcessingId(null); }
  };

  const filteredConnections = connections.filter(c =>
    `${c.user.firstName} ${c.user.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'connections', label: 'Connections', count: stats.connectionsCount },
    { key: 'requests', label: 'Requests', count: incoming.length },
    { key: 'discover', label: 'Discover People' },
  ];

  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-[#1B1B1B] text-foreground font-sans">
      <Navbar />

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[100] flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold"
          >
            <Check className="w-4 h-4" /> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto pt-[80px] pb-20 px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 pt-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Network</h1>
          <p className="text-gray-500 mt-1">Manage your connections and grow your professional circle.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Connections', value: stats.connectionsCount, icon: <UserCheck className="w-5 h-5 text-blue-600" /> },
            { label: 'Following', value: stats.followingCount, icon: <Users className="w-5 h-5 text-violet-500" /> },
            { label: 'Followers', value: stats.followersCount, icon: <Globe className="w-5 h-5 text-emerald-500" /> },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-white/5 rounded-2xl border border-border p-5 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex border-b border-border">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {/* Connections Tab */}
                {activeTab === 'connections' && (
                  <motion.div key="connections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {/* Search */}
                    <div className="relative mb-5">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search connections..."
                        className="w-full h-10 pl-9 pr-4 border border-gray-200 dark:border-white/10 rounded-xl text-sm bg-gray-50 dark:bg-white/5 focus:outline-none focus:border-blue-400 transition-colors"
                      />
                    </div>

                    {filteredConnections.length === 0 ? (
                      <div className="text-center py-16 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No connections yet</p>
                        <p className="text-sm mt-1">Go to Discover to send connection requests</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {filteredConnections.map(conn => (
                          <ConnectionCard
                            key={conn.id}
                            user={conn.user}
                            action={
                              <button
                                onClick={() => handleRemove(conn.user.id)}
                                disabled={processingId === conn.user.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 dark:border-white/10 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-50"
                              >
                                <UserMinus className="w-3.5 h-3.5" /> Remove
                              </button>
                            }
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                  <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {incoming.length === 0 && outgoing.length === 0 ? (
                      <div className="text-center py-16 text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No pending requests</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {incoming.length > 0 && (
                          <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                              Incoming ({incoming.length})
                            </h3>
                            <div className="space-y-3">
                              {incoming.map(req => (
                                <div key={req.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-gray-50 dark:bg-white/5">
                                  <Link href={`/profile/${req.sender?.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
                                      {req.sender?.avatar
                                        ? <img src={req.sender.avatar} className="w-full h-full object-cover" alt="" />
                                        : req.sender?.firstName?.[0]
                                      }
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                                        {req.sender?.firstName} {req.sender?.lastName}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">{req.sender?.profile?.headline || 'ProConnect Member'}</p>
                                    </div>
                                  </Link>
                                  <div className="flex gap-2 shrink-0">
                                    <button
                                      onClick={() => handleAccept(req.id)}
                                      disabled={processingId === req.id}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Accept
                                    </button>
                                    <button
                                      onClick={() => handleReject(req.id)}
                                      disabled={processingId === req.id}
                                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                                    >
                                      <X className="w-3.5 h-3.5" /> Ignore
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {outgoing.length > 0 && (
                          <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                              Sent ({outgoing.length})
                            </h3>
                            <div className="space-y-3">
                              {outgoing.map(req => (
                                <div key={req.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-gray-50 dark:bg-white/5">
                                  <Link href={`/profile/${req.receiver?.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
                                      {req.receiver?.avatar
                                        ? <img src={req.receiver.avatar} className="w-full h-full object-cover" alt="" />
                                        : req.receiver?.firstName?.[0]
                                      }
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                                        {req.receiver?.firstName} {req.receiver?.lastName}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">{req.receiver?.profile?.headline || 'ProConnect Member'}</p>
                                    </div>
                                  </Link>
                                  <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800 shrink-0">
                                    Pending
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Discover Tab */}
                {activeTab === 'discover' && (
                  <motion.div key="discover" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {discover.length === 0 ? (
                      <div className="text-center py-16 text-gray-400">
                        <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No suggestions right now</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {discover.map(person => (
                          <ConnectionCard
                            key={person.id}
                            user={person}
                            action={
                              <button
                                onClick={() => handleConnect(person.id)}
                                disabled={processingId === person.id}
                                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                              >
                                <UserPlus className="w-4 h-4" /> Connect
                              </button>
                            }
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ConnectionCard({ user, action }: { user: UserCard; action: React.ReactNode }) {
  const colors = ['bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-orange-500', 'bg-pink-600'];
  const color = colors[user.firstName.charCodeAt(0) % colors.length];

  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-gray-50 dark:bg-white/5 hover:border-blue-200 dark:hover:border-blue-800 transition-all">
      <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden`}>
          {user.avatar
            ? <img src={user.avatar} className="w-full h-full object-cover" alt="" />
            : user.firstName[0]
          }
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate hover:text-blue-600 transition-colors">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.profile?.headline || 'ProConnect Member'}</p>
          {user.profile?.location && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {user.profile.location}
            </p>
          )}
        </div>
      </Link>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
