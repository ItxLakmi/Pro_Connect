'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThumbsUp, MessageSquare, Repeat, Send, Image as ImageIcon,
  MoreHorizontal, Plus, Calendar, FileText, Globe,
  Video, Bookmark, Crown, Users, Hash, Briefcase
} from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; avatar?: string };
}

interface Post {
  id: string;
  feedType?: string;
  content?: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; avatar?: string; profile?: { headline?: string } };
  _count?: { likes: number; comments: number };
  likes?: { id: string }[];
  title?: string;
  description?: string;
  location?: string;
  type?: string;
  company?: { name: string; logo?: string };
  community?: { id: string; name: string; coverImage?: string };
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 604800)}w`;
  return `${Math.floor(diffInSeconds / 31536000)}y`;
}

function PostCard({ post, currentUserId, onLike }: { post: Post; currentUserId?: string; onLike: (id: string) => void }) {
  if (post.feedType === 'JOB_POST') {
    return (
      <div className="bg-card border border-border sm:rounded-lg mb-2 shadow-sm p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-3">
             <div className="w-12 h-12 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 overflow-hidden shrink-0 border border-border">
               {post.company?.logo ? <img src={post.company.logo} className="w-full h-full object-cover" /> : <Briefcase size={24} />}
             </div>
             <div>
               <Link href={`/jobs/${post.id}`}>
                 <h4 className="font-semibold text-foreground hover:text-blue-600 hover:underline cursor-pointer">{post.title}</h4>
               </Link>
               <div className="text-[12px] text-gray-500">{post.company?.name || 'ProConnect Partner'}</div>
               <div className="text-[12px] text-gray-500 flex items-center gap-2 mt-0.5">
                 <span>{post.location}</span>
                 <span>•</span>
                 <span>{post.type}</span>
               </div>
             </div>
          </div>
          <Link href={`/jobs/${post.id}`}>
            <button className="text-blue-600 font-semibold text-[14px] px-4 py-1.5 rounded-full border border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">View Job</button>
          </Link>
        </div>
        <p className="text-[14px] text-gray-700 dark:text-gray-300 line-clamp-2 mt-3">{post.description}</p>
        <div className="text-[11px] text-gray-400 mt-3 flex items-center gap-1"><Globe size={12}/> {formatTime(post.createdAt)}</div>
      </div>
    );
  }

  const isGroup = post.feedType === 'GROUP_POST';
  const isConnection = post.feedType === 'CONNECTION_POST';
  const isFollowing = post.feedType === 'FOLLOWING_POST';

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [localCount, setLocalCount] = useState(post._count || { likes: 0, comments: 0 });
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(() => (post.likes?.length ?? 0) > 0);

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

  return (
    <div className="bg-card border border-border sm:rounded-lg mb-2 shadow-sm relative">
      <div className="absolute right-4 top-4 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 p-1.5 rounded-full cursor-pointer transition-colors">
        <MoreHorizontal size={20} />
      </div>

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-start gap-3">
        <Link href={`/profile/${post.author.id}`}>
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 cursor-pointer hover:opacity-90 mt-0.5 overflow-hidden border border-white/10">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              post.author.firstName[0]
            )}
          </div>
        </Link>
        <div className="flex-1 pr-8">
          <div className="flex flex-col">
            {isGroup && post.community && (
              <div className="text-[12px] font-semibold text-gray-600 mb-0.5 flex items-center gap-1">
                 <Users size={12} className="text-gray-500"/> 
                 <span>Posted in </span>
                 <span className="hover:underline cursor-pointer text-gray-800 dark:text-gray-200">{post.community.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1 leading-none mb-1">
              <Link href={`/profile/${post.author.id}`}>
                <h4 className="font-semibold text-foreground text-[14px] cursor-pointer hover:text-blue-600 hover:underline">
                  {post.author.firstName} {post.author.lastName}
                </h4>
              </Link>
              <span className="text-gray-500 text-[14px] px-1">•</span>
              <span className="text-gray-500 text-[14px]">{isConnection ? '1st' : isFollowing ? 'Following' : '2nd'}</span>
            </div>
            <p className="text-gray-500 text-[12px] truncate max-w-[400px] leading-tight mb-0.5">
              {post.author?.profile?.headline || 'ProConnect Member'}
            </p>
            <div className="flex items-center text-gray-500 text-[12px] gap-1 leading-tight">
              <span>{formatTime(post.createdAt)}</span>
              <span>•</span>
              <Globe size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        <p className="text-foreground text-[14px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-[12px] text-gray-500 mt-2">
        <div className="flex items-center gap-1.5">
          {localCount.likes >= 0 && (
            <>
              <div className="flex -space-x-1">
                <div className="bg-blue-600 rounded-full p-[3px] flex items-center justify-center border-2 border-card z-20">
                  <ThumbsUp size={8} className="text-white fill-current scale-x-[-1]" />
                </div>
                <div className="bg-red-500 rounded-full p-[3px] flex items-center justify-center border-2 border-card z-10">
                  <svg viewBox="0 0 24 24" fill="white" className="w-2 h-2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
              </div>
              <span className="hover:text-blue-500 hover:underline cursor-pointer ml-1">{localCount.likes || 0}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="hover:text-blue-500 hover:underline cursor-pointer" onClick={toggleComments}>
            {localCount.comments} comments
          </span>
          <span>•</span>
          <span className="hover:text-blue-500 hover:underline cursor-pointer">
            0 shares
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-4 border-t border-border mt-1">
        <div className="flex items-center justify-between py-1">
          <button
            onClick={handleLike}
            className={`flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-md transition-colors font-semibold text-[14px] hover:bg-black/5 dark:hover:bg-white/5 ${
              liked ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <ThumbsUp size={20} className={liked ? 'fill-current scale-x-[-1]' : 'scale-x-[-1]'} strokeWidth={1.5} />
            <span className="hidden sm:inline">Like</span>
          </button>
          <button
            onClick={toggleComments}
            className="flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-md text-gray-500 font-semibold text-[14px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <MessageSquare size={20} strokeWidth={1.5} />
            <span className="hidden sm:inline">Comment</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-md text-gray-500 font-semibold text-[14px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Repeat size={20} strokeWidth={1.5} />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-md text-gray-500 font-semibold text-[14px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <Bookmark size={20} strokeWidth={1.5} />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
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
            <div className="px-4 pt-1 pb-4 space-y-4 border-t border-border">
              {/* Add comment */}
              <div className="flex gap-2 pt-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {currentUserId ? 'U' : '?'}
                </div>
                <form onSubmit={handleAddComment} className="flex-1 flex flex-col gap-2">
                  <div className="border border-gray-400 dark:border-gray-600 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 rounded-full px-4 py-2 bg-transparent transition-all">
                    <input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-transparent border-none focus:outline-none text-[14px] placeholder-gray-500"
                    />
                  </div>
                  {newComment.trim() && (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="self-start bg-blue-600 text-white font-semibold py-1.5 px-4 rounded-full text-[14px] hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Post
                    </button>
                  )}
                </form>
              </div>

              {/* Comments list */}
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 group mt-4">
                  <Link href={`/profile/${comment.author.id}`}>
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                      {comment.author.firstName[0]}
                    </div>
                  </Link>
                  <div className="flex flex-col flex-1">
                    <div className="bg-[#F2F2F2] dark:bg-white/10 rounded-r-lg rounded-bl-lg px-4 py-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <Link href={`/profile/${comment.author.id}`}>
                            <span className="font-semibold text-[14px] hover:text-blue-600 hover:underline cursor-pointer block leading-tight text-gray-900 dark:text-gray-100">
                              {comment.author.firstName} {comment.author.lastName}
                            </span>
                          </Link>
                          <span className="text-[12px] text-gray-500 mb-1">Software Engineer</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-[12px]">
                          <span>{formatTime(comment.createdAt)}</span>
                          <button className="hover:bg-black/5 dark:hover:bg-white/10 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </div>
                      <span className="text-[14px] leading-snug mt-1 block text-gray-800 dark:text-gray-200">{comment.content}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 ml-2 text-[12px] font-semibold text-gray-500">
                      <button className="hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded transition-colors">Like</button>
                      <button className="hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded transition-colors">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type FilterType = 'All' | 'Following' | 'Connections' | 'Groups' | 'Jobs';
type SortType = 'Latest' | 'Top';
type ComposeType = 'post' | 'photo' | 'video' | 'article' | 'event';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [sortOrder, setSortOrder] = useState<SortType>('Latest');
  const [composeType, setComposeType] = useState<ComposeType>('post');
  const [showCompose, setShowCompose] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [peopleYouMayKnow, setPeopleYouMayKnow] = useState<any[]>([]);
  const [networkStats, setNetworkStats] = useState({ connectionsCount: 0, followingCount: 0, followersCount: 0 });
  const [myGroups, setMyGroups] = useState<any[]>([]);

  useEffect(() => { 
    fetchFeed(); 
    fetchJobs();
    fetchPeople();
    fetchStats();
    fetchGroups();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/networking/network-stats');
      setNetworkStats(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/community/my-groups');
      setMyGroups(res.data.slice(0, 3));
    } catch (error) { console.error(error); }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs?take=3');
      setRecommendedJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchPeople = async () => {
    try {
      const response = await api.get('/networking/people-you-may-know');
      setPeopleYouMayKnow(response.data);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  const handleConnect = async (targetId: string) => {
    try {
      await api.post(`/networking/connections/request/${targetId}`);
      setPeopleYouMayKnow(prev => prev.filter(p => p.id !== targetId));
    } catch(err) {
      console.error(err);
    }
  };

  const fetchFeed = async () => {
    try {
      const response = await api.get('/networking/feed');
      setAllPosts(response.data);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (filter: FilterType, sort: SortType, source: Post[]) => {
    let filtered = [...source];
    if (filter === 'Following') {
      filtered = filtered.filter(p => p.feedType === 'FOLLOWING_POST');
    } else if (filter === 'Connections') {
      filtered = filtered.filter(p => p.feedType === 'CONNECTION_POST' || p.feedType === 'USER_POST');
    } else if (filter === 'Groups') {
      filtered = filtered.filter(p => p.feedType === 'GROUP_POST');
    } else if (filter === 'Jobs') {
      filtered = filtered.filter(p => p.feedType === 'JOB_POST');
    }
    // Sort
    if (sort === 'Top') {
      filtered = filtered.sort((a, b) => (b._count?.likes ?? 0) - (a._count?.likes ?? 0));
    } else {
      filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return filtered;
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setPosts(applyFilter(filter, sortOrder, allPosts));
  };

  const handleSortToggle = () => {
    const next: SortType = sortOrder === 'Latest' ? 'Top' : 'Latest';
    setSortOrder(next);
    setPosts(applyFilter(activeFilter, next, allPosts));
  };

  const handleComposeClick = (type: ComposeType) => {
    setComposeType(type);
    setShowCompose(true);
    setTimeout(() => document.getElementById('post-input')?.focus(), 50);
  };

  const composeConfig: Record<ComposeType, { placeholder: string; label: string }> = {
    post: { placeholder: 'Start a post', label: '' },
    photo: { placeholder: 'Say something about your photo...', label: '📷 Add a photo post' },
    video: { placeholder: 'Say something about your video...', label: '🎥 Add a video post' },
    article: { placeholder: 'Write your article here...', label: '📝 Write an article' },
    event: { placeholder: 'Describe your event...', label: '📅 Create an event' },
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    try {
      const response = await api.post('/networking/posts', { content: newPostContent });
      const newPost = response.data;
      setAllPosts(prev => [newPost, ...prev]);
      setPosts(prev => [newPost, ...prev]);
      setNewPostContent('');
      setShowCompose(false);
      setComposeType('post');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-black/90 text-foreground pb-20 font-sans">
      <Navbar />

      <main className="max-w-[1128px] mx-auto pt-[80px] px-0 sm:px-4 grid grid-cols-1 md:grid-cols-[225px_minmax(0,555px)_300px] justify-center gap-6">
        
        {/* Left Sidebar */}
        <div className="hidden md:flex flex-col gap-2">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <Link href="/profile" className="block hover:underline transition-colors pb-4 group">
              <div className="h-[60px] bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"></div>
              <div className="px-4 flex flex-col items-center relative -mt-[38px] text-center">
                <div className="w-[72px] h-[72px] rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-card mb-2 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.firstName?.[0] || 'U'
                  )}
                </div>
                <h3 className="font-semibold text-[16px] text-gray-900 dark:text-gray-100 group-hover:underline">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-[12px] text-gray-500 mt-0.5 max-w-[180px] leading-tight">
                  Software Engineer
                </p>
                <p className="text-[12px] text-gray-500 mt-1">
                  Colombo, Sri Lanka
                </p>
              </div>
            </Link>
            
            <div className="border-t border-border py-3 px-4 text-[12px] font-semibold text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex justify-between group">
              <span className="group-hover:text-gray-800 dark:group-hover:text-gray-200">Profile views</span>
              <span className="text-blue-600">1,245</span>
            </div>
            <Link href="/network" className="border-t border-border py-3 px-4 text-[12px] font-semibold text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex justify-between group">
              <span className="group-hover:text-gray-800 dark:group-hover:text-gray-200">Connections</span>
              <span className="text-blue-600">{networkStats.connectionsCount}</span>
            </Link>
            
            <div className="border-t border-border py-3 px-4 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
              <div className="flex gap-2 text-gray-800 dark:text-gray-200">
                <Crown size={14} className="text-[#F8C77E] fill-current mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[12px] text-gray-500">Try Premium</span>
                  <span className="text-[12px] font-semibold hover:text-blue-600 hover:underline">Unlock exclusive tools & insights</span>
                </div>
              </div>
            </div>
          </div>

          {/* My Network */}
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm pt-3 pb-2">
            <h3 className="px-4 text-[14px] font-semibold text-gray-900 dark:text-gray-100 mb-2">My Network</h3>
            <div className="flex flex-col">
              <Link href="/network" className="px-4 py-2 text-[12px] font-semibold text-gray-500 flex justify-between hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                <span>Connections</span>
                <span className="text-blue-600">{networkStats.connectionsCount}</span>
              </Link>
              <Link href="/network" className="px-4 py-2 text-[12px] font-semibold text-gray-500 flex justify-between hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                <span>Following</span>
                <span className="text-blue-600">{networkStats.followingCount}</span>
              </Link>
              <Link href="/network" className="px-4 py-2 text-[12px] font-semibold text-gray-500 flex justify-between hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                <span>Followers</span>
                <span className="text-blue-600">{networkStats.followersCount}</span>
              </Link>
            </div>
          </div>

          {/* Groups */}
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm pt-3 pb-2">
            <h3 className="px-4 text-[14px] font-semibold text-gray-900 dark:text-gray-100 mb-2">Groups</h3>
            <div className="flex flex-col gap-1">
              {myGroups.map(group => (
                <Link href={`/community/${group.id}`} key={group.id} className="px-4 py-1.5 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group">
                  <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 overflow-hidden shrink-0">
                    {group.coverImage ? <img src={group.coverImage} className="w-full h-full object-cover" /> : <Users size={16} />}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 truncate group-hover:text-blue-600">{group.name}</span>
                    <span className="text-[10px] text-gray-500">{group._count?.members || 0} members</span>
                  </div>
                </Link>
              ))}
              {myGroups.length === 0 && (
                <div className="px-4 py-2 text-[12px] text-gray-500">You haven't joined any groups yet.</div>
              )}
            </div>
            <Link href="/community" className="px-4 pt-3 pb-1 text-[13px] font-semibold text-blue-600 hover:underline cursor-pointer block">
              See all groups
            </Link>
          </div>
        </div>

        {/* Main Feed */}
        <div className="w-full">
          {/* Create Post */}
          <div className="bg-card border border-border sm:rounded-lg shadow-sm p-3 mb-2">
            <div className="flex gap-2 mb-2">
              <Link href="/profile" className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                  user?.firstName?.[0] || 'U'
                )}
              </Link>
              <div 
                className="flex-1 border border-gray-400 dark:border-gray-600 hover:bg-black/5 dark:hover:bg-white/10 rounded-full px-5 py-3 flex items-center cursor-pointer transition-colors"
                onClick={() => handleComposeClick('post')}
              >
                <span className="text-[14px] font-semibold text-gray-500">
                  {showCompose ? newPostContent || composeConfig[composeType].placeholder : 'Start a post'}
                </span>
              </div>
            </div>

            {/* Expanded compose area */}
            <AnimatePresence>
              {showCompose && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pb-1">
                    {composeConfig[composeType].label && (
                      <div className="text-[12px] font-semibold text-gray-500 mb-2 px-1">{composeConfig[composeType].label}</div>
                    )}
                    <textarea
                      id="post-input"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={composeConfig[composeType].placeholder}
                      rows={composeType === 'article' ? 5 : 3}
                      className="w-full bg-transparent border-none focus:outline-none text-[15px] text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none px-1"
                    />
                    <div className="flex justify-between items-center border-t border-border pt-2 mt-1">
                      <div className="flex gap-2">
                        <button onClick={() => setComposeType('photo')} className={`p-1.5 rounded-md transition-colors ${composeType==='photo' ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}><ImageIcon size={18} className="text-[#378FE9]" /></button>
                        <button onClick={() => setComposeType('video')} className={`p-1.5 rounded-md transition-colors ${composeType==='video' ? 'bg-green-50 dark:bg-green-900/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}><Video size={18} className="text-[#5F9B41]" /></button>
                        <button onClick={() => setComposeType('article')} className={`p-1.5 rounded-md transition-colors ${composeType==='article' ? 'bg-red-50 dark:bg-red-900/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}><FileText size={18} className="text-[#E16745]" /></button>
                        <button onClick={() => setComposeType('event')} className={`p-1.5 rounded-md transition-colors ${composeType==='event' ? 'bg-orange-50 dark:bg-orange-900/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}><Calendar size={18} className="text-[#BC8A4E]" /></button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setShowCompose(false); setNewPostContent(''); setComposeType('post'); }} className="px-4 py-1.5 rounded-full text-gray-600 font-semibold text-[14px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancel</button>
                        <button
                          onClick={handlePostSubmit}
                          disabled={!newPostContent.trim()}
                          className="px-5 py-1.5 rounded-full bg-blue-600 text-white font-semibold text-[14px] hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >Post</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className={`flex justify-between items-center px-1 sm:px-4 ${showCompose ? 'border-t border-border pt-2 mt-1' : ''}`}>
              <button 
                onClick={() => handleComposeClick('photo')}
                className={`flex items-center gap-2 py-2.5 px-2 rounded-md font-semibold text-[14px] transition-colors ${composeType === 'photo' && showCompose ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <ImageIcon size={22} className="text-[#378FE9]" />
                <span className="hidden sm:inline text-gray-600 dark:text-gray-400">Photo</span>
              </button>
              <button 
                onClick={() => handleComposeClick('video')}
                className={`flex items-center gap-2 py-2.5 px-2 rounded-md font-semibold text-[14px] transition-colors ${composeType === 'video' && showCompose ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <Video size={22} className="text-[#5F9B41]" />
                <span className="hidden sm:inline text-gray-600 dark:text-gray-400">Video</span>
              </button>
              <button 
                onClick={() => handleComposeClick('article')}
                className={`flex items-center gap-2 py-2.5 px-2 rounded-md font-semibold text-[14px] transition-colors ${composeType === 'article' && showCompose ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <FileText size={22} className="text-[#E16745]" />
                <span className="hidden sm:inline text-gray-600 dark:text-gray-400">Article</span>
              </button>
              <button 
                onClick={() => handleComposeClick('event')}
                className={`flex items-center gap-2 py-2.5 px-2 rounded-md font-semibold text-[14px] transition-colors ${composeType === 'event' && showCompose ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <Calendar size={22} className="text-[#BC8A4E]" />
                <span className="hidden sm:inline text-gray-600 dark:text-gray-400">Event</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between py-2 mb-2">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {(['All', 'Following', 'Connections', 'Groups', 'Jobs'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`whitespace-nowrap px-4 py-1 rounded-full font-semibold text-[14px] transition-colors ${
                    activeFilter === f
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >{f}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[12px] text-gray-500 shrink-0 ml-4">
              <span>Sort by:</span>
              <button
                onClick={handleSortToggle}
                className="font-semibold text-gray-900 dark:text-gray-100 flex items-center hover:text-blue-600 transition-colors"
              >
                {sortOrder}
                <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
            </div>
          </div>

          {/* Feed List */}
          <div>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-gray-500 bg-card rounded-lg border border-border shadow-sm">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No posts yet. Start connecting to see updates!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onLike={(id) => {}}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:flex flex-col gap-2">
          {/* Jobs for you */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100">Jobs for you</h3>
              <Link href="/jobs" className="text-[13px] font-semibold text-blue-600 hover:underline cursor-pointer">See all</Link>
            </div>
            
            <ul className="space-y-4">
              {recommendedJobs.length > 0 ? recommendedJobs.map((job, idx) => (
                <Link href={`/jobs/${job.id}`} key={job.id} className="flex gap-3 cursor-pointer group">
                  <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${idx % 3 === 0 ? 'bg-[#EAF3FD] text-[#378FE9]' : idx % 3 === 1 ? 'bg-[#FCECE8] text-orange-500' : 'bg-indigo-600 text-white'}`}>
                    {job.company?.logo ? (
                       <img src={job.company.logo} alt="Company" className="w-full h-full object-cover rounded" />
                    ) : (
                       <Briefcase size={20} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[14px] group-hover:text-blue-600 group-hover:underline text-gray-900 dark:text-gray-100 leading-tight">{job.title}</span>
                    <span className="text-[12px] text-gray-700 dark:text-gray-300 mt-1">{job.company?.name || 'ProConnect Company'}</span>
                    <span className="text-[12px] text-gray-500">{job.location}</span>
                    <span className="text-[11px] text-gray-500 mt-0.5">{job.type}</span>
                  </div>
                </Link>
              )) : (
                <div className="text-sm text-gray-500 py-2">No jobs available right now.</div>
              )}
            </ul>
          </div>

          {/* People you may know */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100">People you may know</h3>
              <Link href="/network" className="text-[13px] font-semibold text-blue-600 hover:underline cursor-pointer">See all</Link>
            </div>

            <ul className="space-y-4">
              {peopleYouMayKnow.length > 0 ? peopleYouMayKnow.map(person => (
                <li key={person.id} className="flex gap-3 cursor-pointer group">
                  <Link href={`/profile/${person.id}`} className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                    {person.avatar ? <img src={person.avatar} className="w-full h-full object-cover" /> : person.firstName[0]}
                  </Link>
                  <div className="flex flex-col w-full">
                    <Link href={`/profile/${person.id}`}>
                      <span className="font-semibold text-[14px] group-hover:text-blue-600 group-hover:underline text-gray-900 dark:text-gray-100 leading-tight">{person.firstName} {person.lastName}</span>
                    </Link>
                    <span className="text-[12px] text-gray-500 mt-0.5 leading-tight">{person.profile?.headline || 'ProConnect Member'}</span>
                    <span className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                      <Users size={10} /> 1 mutual connection
                    </span>
                    <button 
                      onClick={() => handleConnect(person.id)}
                      className="mt-2 w-[100px] py-1 rounded-full border border-gray-500 text-gray-600 dark:text-gray-300 font-semibold text-[14px] hover:bg-black/5 dark:hover:bg-white/5 hover:border-gray-700 dark:hover:border-gray-200 transition-all"
                    >
                      Connect
                    </button>
                  </div>
                </li>
              )) : (
                <div className="text-sm text-gray-500">No suggestions right now.</div>
              )}
            </ul>
          </div>
        </div>

      </main>
    </div>
  );
}
