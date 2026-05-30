'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Heart, MessageCircle, Send, MoreVertical,
  Lock, Globe, Shield, Crown, Trash2, Pin, TrendingUp,
  GraduationCap, Cpu, LogOut,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';

const TYPE_LABEL: Record<string, string> = {
  INDUSTRY: 'Industry',
  UNIVERSITY: 'University',
  WOMEN_PROFESSIONAL: 'Women Professional',
  TECH: 'Tech',
};

const TYPE_GRADIENT: Record<string, string> = {
  INDUSTRY: 'from-amber-500 to-orange-600',
  UNIVERSITY: 'from-green-500 to-emerald-600',
  WOMEN_PROFESSIONAL: 'from-pink-500 to-rose-600',
  TECH: 'from-purple-500 to-violet-600',
};

const ROLE_BADGE: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  ADMIN: { label: 'Admin', icon: <Crown size={12} />, cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  MODERATOR: { label: 'Mod', icon: <Shield size={12} />, cls: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  MEMBER: { label: 'Member', icon: null, cls: 'text-gray-400 bg-gray-400/10 border-gray-400/30' },
};

function PostCard({
  post, myRole, myId, communityId, onRemove, onLike
}: {
  post: any; myRole: string | null; myId: string | undefined;
  communityId: string; onRemove: (id: string) => void; onLike: (id: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const canModerate = myRole === 'ADMIN' || myRole === 'MODERATOR' || post.author?.id === myId;

  const loadComments = async () => {
    if (commentsLoaded) return;
    try {
      const res = await api.get(`/community/posts/${post.id}/comments`);
      setComments(res.data);
      setCommentsLoaded(true);
    } catch (err) { console.error(err); }
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/community/posts/${post.id}/comments`, { content: newComment });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleRemoveComment = async (commentId: string) => {
    try {
      await api.delete(`/community/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border rounded-2xl overflow-hidden transition-all ${
        post.isPinned ? 'border-amber-500/40 shadow-amber-500/10 shadow-md' : 'border-border hover:border-white/20'
      }`}
    >
      {post.isPinned && (
        <div className="flex items-center gap-2 px-5 py-2 bg-amber-500/10 text-amber-400 text-xs font-bold border-b border-amber-500/20">
          <Pin size={12} /> Pinned Post
        </div>
      )}
      <div className="p-5">
        {/* Author row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm shrink-0">
              {post.author?.firstName?.[0] || '?'}
            </div>
            <div>
              <p className="font-bold text-sm">{post.author?.firstName} {post.author?.lastName}</p>
              <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {canModerate && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-600 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <MoreVertical size={18} />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 top-8 bg-card border border-border rounded-xl py-1 shadow-xl z-10 min-w-[140px]"
                  >
                    <button
                      onClick={() => { onRemove(post.id); setShowMenu(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} /> Remove Post
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <p className="text-gray-200 leading-relaxed mb-5 whitespace-pre-wrap">{post.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-6 pt-4 border-t border-white/5 text-gray-500">
          <button
            onClick={() => onLike(post.id)}
            className="flex items-center gap-2 hover:text-red-400 transition-colors group"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-red-400/10 transition-all">
              <Heart size={16} />
            </div>
            <span className="text-sm font-medium">{post._count?.likes || 0}</span>
          </button>
          <button
            onClick={toggleComments}
            className={`flex items-center gap-2 transition-colors group ${showComments ? 'text-blue-400' : 'hover:text-blue-400'}`}
          >
            <div className="p-1.5 rounded-lg group-hover:bg-blue-400/10 transition-all">
              <MessageCircle size={16} />
            </div>
            <span className="text-sm font-medium">{post._count?.comments || comments.length || 0}</span>
          </button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold shrink-0">
                      {comment.author?.firstName?.[0] || '?'}
                    </div>
                    <div className="flex-1 bg-background rounded-xl px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{comment.author?.firstName} {comment.author?.lastName}</span>
                        {(canModerate || comment.author?.id === myId) && (
                          <button
                            onClick={() => handleRemoveComment(comment.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all ml-2"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mt-0.5">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {/* Add comment */}
                <form onSubmit={handleComment} className="flex gap-2 mt-3">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="p-2 bg-blue-600 rounded-xl disabled:opacity-40 hover:bg-blue-500 transition-colors"
                  >
                    <Send size={14} />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'members'>('posts');

  const myMembership = community?.members?.[0];
  const myRole: string | null = myMembership?.role || null;
  const isMember = !!myMembership;

  const fetchData = useCallback(async () => {
    try {
      const [commRes, postsRes, membersRes] = await Promise.all([
        api.get(`/community/${communityId}`),
        api.get(`/community/${communityId}/posts`),
        api.get(`/community/${communityId}/members`),
      ]);
      setCommunity(commRes.data);
      setPosts(postsRes.data);
      setMembers(membersRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [communityId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleJoinLeave = async () => {
    setJoining(true);
    try {
      if (isMember) {
        await api.delete(`/community/${communityId}/leave`);
      } else {
        await api.post(`/community/${communityId}/join`);
      }
      fetchData();
    } catch (err) { console.error(err); } finally { setJoining(false); }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const res = await api.post(`/community/${communityId}/posts`, { content: newPost });
      setPosts([res.data, ...posts]);
      setNewPost('');
    } catch (err) { console.error(err); } finally { setPosting(false); }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await api.post(`/community/posts/${postId}/like`);
      setPosts(posts.map(p => p.id === postId
        ? { ...p, _count: { ...p._count, likes: p._count.likes + (res.data.liked ? 1 : -1) } }
        : p
      ));
    } catch (err) { console.error(err); }
  };

  const handleRemovePost = async (postId: string) => {
    try {
      await api.delete(`/community/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) { console.error(err); }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await api.patch(`/community/${communityId}/members/${userId}/role`, { role });
      setMembers(members.map(m => m.userId === userId ? { ...m, role } : m));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!community) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-gray-400">
      Community not found.
    </div>
  );

  const gradient = TYPE_GRADIENT[community.type] || 'from-blue-500 to-indigo-600';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Cover Banner */}
      <div className={`relative h-52 bg-gradient-to-br ${gradient} mt-16`}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-4 left-4">
          <Link href="/community">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-black/30 backdrop-blur-sm border border-white/20 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-black/50 transition-all"
            >
              <ArrowLeft size={14} /> Communities
            </motion.button>
          </Link>
        </div>
        <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-black/30 backdrop-blur-sm border border-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                {TYPE_LABEL[community.type]}
              </span>
              {community.isPrivate && <Lock size={14} className="text-white/80" />}
              {myRole && (
                <span className={`text-xs px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${ROLE_BADGE[myRole].cls}`}>
                  {ROLE_BADGE[myRole].icon}{ROLE_BADGE[myRole].label}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-white drop-shadow">{community.name}</h1>
            <p className="text-white/70 text-sm mt-0.5">{community.category}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-white/80 text-sm">
              <div className="font-bold text-xl text-white">{community._count?.members || 0}</div>
              <div className="text-xs">members</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinLeave}
              disabled={joining || myRole === 'ADMIN'}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2 ${
                isMember
                  ? 'bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-red-500/20 hover:border-red-400/50'
                  : 'bg-white text-gray-900 hover:bg-white/90 shadow-lg'
              }`}
            >
              {joining ? '...' : isMember ? (<><LogOut size={14} /> Leave</>) : 'Join Community'}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Description */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <p className="text-gray-300 leading-relaxed">{community.description}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-6 w-fit">
          {(['posts', 'members'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-medium text-sm capitalize transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'posts' ? `Posts (${posts.length})` : `Members (${members.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Posts Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Create Post — only for members */}
              {isMember && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-5"
                >
                  <form onSubmit={handlePost}>
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder={`Share something with ${community.name}...`}
                      rows={3}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none mb-3"
                    />
                    <div className="flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={posting || !newPost.trim()}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 rounded-xl font-bold text-sm disabled:opacity-50 transition-all"
                      >
                        <Send size={14} />
                        {posting ? 'Posting...' : 'Post'}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {!isMember && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 text-center text-blue-400 text-sm">
                  <Users size={24} className="mx-auto mb-2 opacity-50" />
                  Join this community to post and interact with members.
                </div>
              )}

              {posts.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No posts yet. Be the first to share!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      myRole={myRole}
                      myId={user?.id}
                      communityId={communityId}
                      onRemove={handleRemovePost}
                      onLike={handleLike}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Community Info */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-gray-400">About</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Globe size={14} /> <span>{community.isPrivate ? 'Private' : 'Public'} Community</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} /> <span>{community._count?.members || 0} Members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={14} /> <span>{community._count?.posts || 0} Posts</span>
                  </div>
                </div>
              </div>

              {/* Top Members Preview */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-gray-400">Members</h3>
                <div className="space-y-3">
                  {members.slice(0, 5).map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold shrink-0">
                        {m.user?.firstName?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.user?.firstName} {m.user?.lastName}</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-md border flex items-center gap-1 ${ROLE_BADGE[m.role]?.cls}`}>
                        {ROLE_BADGE[m.role]?.icon}
                        {m.role === 'ADMIN' ? 'Admin' : m.role === 'MODERATOR' ? 'Mod' : ''}
                      </span>
                    </div>
                  ))}
                  {members.length > 5 && (
                    <button onClick={() => setActiveTab('members')} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      +{members.length - 5} more members →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m, index) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold shrink-0">
                  {m.user?.firstName?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{m.user?.firstName} {m.user?.lastName}</p>
                  <p className="text-xs text-gray-500">Joined {new Date(m.joinedAt).toLocaleDateString()}</p>
                </div>

                {/* Moderation: role change */}
                {(myRole === 'ADMIN' || myRole === 'MODERATOR') && m.user?.id !== user?.id ? (
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-lg border bg-transparent cursor-pointer ${ROLE_BADGE[m.role]?.cls}`}
                  >
                    <option value="MEMBER">Member</option>
                    <option value="MODERATOR">Moderator</option>
                    {myRole === 'ADMIN' && <option value="ADMIN">Admin</option>}
                  </select>
                ) : (
                  <span className={`text-xs px-2 py-1 rounded-lg border flex items-center gap-1 ${ROLE_BADGE[m.role]?.cls}`}>
                    {ROLE_BADGE[m.role]?.icon} {ROLE_BADGE[m.role]?.label}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
