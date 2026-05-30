'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Send, Image, Hash,
  MoreHorizontal, Trash2, X,
} from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; avatar?: string };
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; avatar?: string };
  _count: { likes: number; comments: number };
}

function PostCard({ post, currentUserId, onLike }: { post: Post; currentUserId?: string; onLike: (id: string) => void }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [localCount, setLocalCount] = useState(post._count);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);

  const loadComments = async () => {
    if (commentsLoaded) return;
    try {
      const res = await api.get(`/networking/posts/${post.id}/comments`);
      setComments(res.data);
      setCommentsLoaded(true);
    } catch (err) { console.error(err); }
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/networking/posts/${post.id}/like`);
      const nowLiked = res.data.liked;
      setLiked(nowLiked);
      setLocalCount(c => ({ ...c, likes: c.likes + (nowLiked ? 1 : -1) }));
    } catch (err) { console.error(err); }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/networking/posts/${post.id}/comments`, { content: newComment });
      setComments(prev => [...prev, res.data]);
      setLocalCount(c => ({ ...c, comments: c.comments + 1 }));
      setNewComment('');
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/networking/posts/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setLocalCount(c => ({ ...c, comments: Math.max(0, c.comments - 1) }));
    } catch (err) { console.error(err); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all shadow-sm"
    >
      <div className="p-6">
        {/* Author */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold shrink-0">
              {post.author.firstName[0]}
            </div>
            <div>
              <h4 className="font-bold">{post.author.firstName} {post.author.lastName}</h4>
              <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <button className="text-gray-600 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>

        <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>

        {/* Action bar */}
        <div className="flex items-center gap-8 text-gray-500 border-t border-white/5 pt-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors group ${liked ? 'text-red-400' : 'hover:text-red-400'}`}
          >
            <div className="p-2 rounded-lg group-hover:bg-red-400/10 transition-all">
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
            </div>
            <span className="text-sm font-medium">{localCount.likes}</span>
          </button>

          <button
            onClick={toggleComments}
            className={`flex items-center gap-2 transition-colors group ${showComments ? 'text-blue-400' : 'hover:text-blue-400'}`}
          >
            <div className="p-2 rounded-lg group-hover:bg-blue-400/10 transition-all">
              <MessageCircle size={20} />
            </div>
            <span className="text-sm font-medium">{localCount.comments}</span>
          </button>

          <button className="flex items-center gap-2 hover:text-green-400 transition-colors group ml-auto">
            <div className="p-2 rounded-lg group-hover:bg-green-400/10 transition-all">
              <Share2 size={20} />
            </div>
          </button>
        </div>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="px-6 py-4 space-y-3 bg-background/40">
              {comments.length === 0 && (
                <p className="text-center text-gray-600 text-sm py-2">No comments yet. Be the first!</p>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">
                    {comment.author.firstName[0]}
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-2xl px-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      {comment.author.id === currentUserId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all ml-2"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}

              {/* Add comment */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-card border border-border rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="p-2 bg-blue-600 rounded-xl disabled:opacity-40 hover:bg-blue-500 transition-colors"
                >
                  <Send size={16} />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFeed(); }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.get('/networking/feed');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    try {
      const response = await api.post('/networking/posts', { content: newPostContent });
      setPosts([response.data, ...posts]);
      setNewPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-24 space-y-8">
        {/* Create Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl p-6 shadow-sm"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-lg shrink-0">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your professional updates, thoughts, or achievements..."
                className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder-gray-600 resize-none min-h-[100px]"
              />
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="flex gap-4 text-gray-500">
                  <button className="hover:text-blue-400 transition-colors"><Image size={20} /></button>
                  <button className="hover:text-blue-400 transition-colors"><Hash size={20} /></button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePostSubmit}
                  disabled={!newPostContent.trim()}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl font-bold disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  Post <Send size={16} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feed List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No posts yet. Follow people to see their updates!</p>
            </div>
          ) : (
            <AnimatePresence>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onLike={(id) => {}}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
