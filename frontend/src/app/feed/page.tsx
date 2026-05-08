'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Send, Image, Hash, MoreHorizontal } from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import useAuth from '@/hooks/useAuth';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

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

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/networking/posts/${postId}/like`);
      // Optimistic update or refetch
      setPosts(posts.map(p => p.id === postId ? { ...p, _count: { ...p._count, likes: p._count.likes + 1 } } : p));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 py-24 space-y-8">
        {/* Create Post */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 shadow-xl"
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
                  className="bg-blue-600 px-6 py-2 rounded-xl font-bold disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  Post
                  <Send size={16} />
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
          ) : (
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                        {post.author.firstName[0]}
                      </div>
                      <div>
                        <h4 className="font-bold">{post.author.firstName} {post.author.lastName}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-600 hover:text-white"><MoreHorizontal size={20} /></button>
                  </div>

                  <p className="text-gray-300 leading-relaxed mb-6">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-8 text-gray-500 border-t border-white/5 pt-4">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 hover:text-red-400 transition-colors group"
                    >
                      <div className="p-2 rounded-lg group-hover:bg-red-400/10 transition-all">
                        <Heart size={20} />
                      </div>
                      <span className="text-sm font-medium">{post._count?.likes || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                      <div className="p-2 rounded-lg group-hover:bg-blue-400/10 transition-all">
                        <MessageCircle size={20} />
                      </div>
                      <span className="text-sm font-medium">{post._count?.comments || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-400 transition-colors group ml-auto">
                      <div className="p-2 rounded-lg group-hover:bg-green-400/10 transition-all">
                        <Share2 size={20} />
                      </div>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
