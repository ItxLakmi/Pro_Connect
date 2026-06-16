'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Plus, Globe, GraduationCap,
  Heart, Cpu, ArrowRight, Lock, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const TYPE_TABS = [
  { key: '', label: 'All', icon: Globe, color: 'from-blue-500 to-indigo-500' },
  { key: 'INDUSTRY', label: 'Industry', icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
  { key: 'UNIVERSITY', label: 'University', icon: GraduationCap, color: 'from-green-500 to-emerald-500' },
  { key: 'WOMEN_PROFESSIONAL', label: 'Women Pro', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { key: 'TECH', label: 'Tech', icon: Cpu, color: 'from-purple-500 to-violet-500' },
];

const TYPE_COLOR: Record<string, string> = {
  INDUSTRY: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  UNIVERSITY: 'bg-green-500/10 text-green-400 border-green-500/30',
  WOMEN_PROFESSIONAL: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  TECH: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

const TYPE_LABEL: Record<string, string> = {
  INDUSTRY: 'Industry',
  UNIVERSITY: 'University',
  WOMEN_PROFESSIONAL: 'Women Pro',
  TECH: 'Tech',
};

export default function CommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '', description: '', type: 'TECH', category: '', isPrivate: false,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, [activeTab, search]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (activeTab) params.type = activeTab;
      if (search) params.search = search;
      const res = await api.get('/community', { params });
      setCommunities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.MouseEvent, communityId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setJoining(communityId);
    try {
      await api.post(`/community/${communityId}/join`);
      fetchCommunities();
    } catch (err) {
      console.error(err);
    } finally {
      setJoining(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/community', createForm);
      router.push(`/community/${res.data.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const isMember = (community: any) =>
    community.members && community.members.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <div className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 text-blue-400 text-sm font-medium mb-6"
          >
            <Users size={14} />
            Community & Networking Hub
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent"
          >
            Find Your Community
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Connect with professionals in industry groups, university networks, women-led communities, and tech circles.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Search + Create */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 mb-8"
        >
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search communities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} />
            Create
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {TYPE_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all border ${
                  active
                    ? `bg-gradient-to-r ${tab.color} text-white border-transparent shadow-lg`
                    : 'bg-card border-border text-gray-400 hover:border-white/20'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Community Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-3xl h-64 animate-pulse" />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 text-gray-500"
          >
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No communities found</p>
            <p className="text-sm mt-1">Be the first to create one!</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {communities.map((community, index) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/community/${community.id}`} className="block">
                    <div className="bg-card border border-border rounded-3xl overflow-hidden hover:border-blue-500/40 transition-all shadow-sm hover:shadow-blue-500/10 hover:shadow-lg group">
                      {/* Cover */}
                      <div className={`h-24 bg-gradient-to-br ${TYPE_TABS.find(t => t.key === community.type)?.color || 'from-blue-500 to-indigo-500'} relative`}>
                        {community.coverImage && (
                          <img src={community.coverImage} alt="" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full border backdrop-blur-sm bg-black/30 text-white border-white/20`}>
                            {TYPE_LABEL[community.type]}
                          </span>
                        </div>
                        {community.isPrivate && (
                          <div className="absolute top-3 right-3">
                            <Lock size={14} className="text-white/80" />
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                          {community.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">
                          {community.category}
                        </p>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
                          {community.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Users size={14} />
                            <span>{community._count?.members || 0} members</span>
                          </div>

                          {isMember(community) ? (
                            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-medium">
                              ✓ Joined
                            </span>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => handleJoin(e, community.id)}
                              disabled={joining === community.id}
                              className="flex items-center gap-1 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-medium transition-all"
                            >
                              {joining === community.id ? '...' : (
                                <>Join <ArrowRight size={12} /></>
                              )}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Create Community Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-black mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Create Community
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-1">Community Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. FinTech Professionals"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-1">Type *</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="INDUSTRY">Industry</option>
                    <option value="UNIVERSITY">University</option>
                    <option value="WOMEN_PROFESSIONAL">Women Professional</option>
                    <option value="TECH">Tech</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-1">Category *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. FinTech, Python, MIT, Healthcare"
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-1">Description *</label>
                  <textarea
                    required
                    placeholder="What is this community about?"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.isPrivate}
                    onChange={(e) => setCreateForm({ ...createForm, isPrivate: e.target.checked })}
                    className="w-4 h-4 rounded accent-blue-500"
                  />
                  <span className="text-sm text-gray-400">Private community (invite only)</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 bg-background border border-border rounded-xl py-3 font-bold hover:border-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl py-3 font-bold disabled:opacity-50 transition-all"
                  >
                    {creating ? 'Creating...' : 'Create Community'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
