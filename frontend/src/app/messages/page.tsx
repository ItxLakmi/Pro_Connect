'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Loader2, MessageSquarePlus, Check, CheckCheck } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const activeConversationRef = useRef<any>(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<any[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  
  // Typing state
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/chat/conversations');
        setConversations(response.data);
        
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const convId = params.get('conversation');
          if (convId) {
            const target = response.data.find((c: any) => c.id === convId);
            if (target) setActiveConversation(target);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
      auth: { token: localStorage.getItem('token') }
    });

    newSocket.on('newMessage', (message) => {
      const currentActive = activeConversationRef.current;
      if (currentActive && message.conversationId === currentActive.id) {
        setMessages((prev) => [...prev, message]);
        setIsTyping(false);
      }
      // Update conversation list last message
      setConversations((prev) => {
        const updated = prev.map(c => c.id === message.conversationId ? { ...c, messages: [message] } : c);
        return updated;
      });
    });

    newSocket.on('typing', (data) => {
      const currentActive = activeConversationRef.current;
      if (currentActive && data.conversationId === currentActive.id) {
        setIsTyping(true);
      }
    });

    newSocket.on('stopTyping', (data) => {
      const currentActive = activeConversationRef.current;
      if (currentActive && data.conversationId === currentActive.id) {
        setIsTyping(false);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    if (activeConversation) {
      const fetchMessages = async () => {
        try {
          const response = await api.get(`/chat/messages/${activeConversation.id}`);
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
      socket?.emit('joinConversation', { conversationId: activeConversation.id });
    }
  }, [activeConversation, socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Global search effect
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timer = setTimeout(async () => {
        setIsSearchingGlobal(true);
        try {
          const res = await api.get(`/profiles/search?q=${encodeURIComponent(searchQuery.trim())}`);
          setGlobalResults(res.data);
        } catch (err) {
          console.error('Error searching users:', err);
        } finally {
          setIsSearchingGlobal(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setGlobalResults([]);
    }
  }, [searchQuery]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !socket) return;

    const receiver = activeConversation.participants.find((p: any) => p.id !== user?.id);
    
    socket.emit('sendMessage', {
      content: newMessage,
      conversationId: activeConversation.id,
      receiverId: receiver?.id
    });

    socket.emit('stopTyping', {
      conversationId: activeConversation.id,
      receiverId: receiver?.id
    });

    setNewMessage('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!socket || !activeConversation) return;
    
    const receiver = activeConversation.participants.find((p: any) => p.id !== user?.id);
    
    socket.emit('typing', {
      conversationId: activeConversation.id,
      receiverId: receiver?.id
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        conversationId: activeConversation.id,
        receiverId: receiver?.id
      });
    }, 2000);
  };

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    messages.forEach(msg => {
      const date = new Date(msg.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      
      if (date.toDateString() === today.toDateString()) {
        dateString = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateString = 'Yesterday';
      }
      
      if (!groups[dateString]) groups[dateString] = [];
      groups[dateString].push(msg);
    });
    return groups;
  };

  const startNewConversation = async (participantId: string) => {
    try {
      // Create or get conversation
      const res = await api.post('/chat/start', { participantId });
      
      // If it's a new conversation not in our list, add it
      setConversations(prev => {
        if (!prev.find(c => c.id === res.data.id)) {
          return [res.data, ...prev];
        }
        return prev;
      });
      
      setActiveConversation(res.data);
      setSearchQuery('');
      setGlobalResults([]);
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const otherUser = conv.participants.find((p: any) => p.id !== user?.id);
    if (!otherUser) return false;
    const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 overflow-hidden flex max-w-7xl mx-auto w-full border-x border-border bg-card/30">
        {/* Sidebar */}
        <div className="w-80 md:w-96 border-r border-border flex flex-col">
          <div className="p-6 pb-4">
            <h2 className="text-2xl font-bold mb-6">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats or people..."
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500/30 transition-all text-sm"
              />
              {isSearchingGlobal && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 pb-6">
            {/* Existing Conversations */}
            {filteredConversations.length > 0 && (
              <div className="mb-6">
                {searchQuery.trim() && (
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">Recent Chats</h3>
                )}
                {filteredConversations.map((conv) => {
                  const otherUser = conv.participants.find((p: any) => p.id !== user?.id);
                  const lastMessage = conv.messages?.[0];
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all mb-1 ${
                        activeConversation?.id === conv.id ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-lg text-white overflow-hidden border border-white/10">
                          {otherUser?.avatar ? (
                            <img src={otherUser.avatar} alt="User" className="w-full h-full object-cover" />
                          ) : (
                            otherUser?.firstName?.[0]
                          )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold text-sm truncate">{otherUser?.firstName} {otherUser?.lastName}</span>
                          {lastMessage && (
                            <span className="text-[10px] text-gray-500 uppercase shrink-0 ml-2">
                              {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {lastMessage?.content || ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Global Search Results */}
            {searchQuery.trim().length > 1 && globalResults.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">Global Search</h3>
                {globalResults.map(candidate => {
                  // Don't show users we already have an active filtered conversation with
                  if (filteredConversations.some(c => c.participants.some((p: any) => p.id === candidate.id))) {
                    return null;
                  }
                  
                  // Don't show current user
                  if (candidate.id === user?.id) return null;

                  return (
                    <button
                      key={candidate.id}
                      onClick={() => startNewConversation(candidate.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all mb-1 hover:bg-white/5 border border-transparent group"
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white overflow-hidden">
                          {candidate.avatar ? (
                            <img src={candidate.avatar} alt="User" className="w-full h-full object-cover" />
                          ) : (
                            candidate.firstName?.[0]
                          )}
                        </div>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <span className="font-bold text-sm truncate block">{candidate.firstName} {candidate.lastName}</span>
                        <span className="text-[10px] text-gray-500 block truncate">{candidate.profile?.headline || candidate.role}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600/20 text-blue-400 p-1.5 rounded-full shrink-0">
                        <MessageSquarePlus size={14} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {searchQuery.trim() && filteredConversations.length === 0 && globalResults.length === 0 && !isSearchingGlobal && (
              <div className="text-center py-8 px-4">
                <Search className="w-8 h-8 text-gray-600 mx-auto mb-3 opacity-50" />
                <p className="text-sm text-gray-500">No people found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-background">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-card/50 backdrop-blur-xl shrink-0 z-10 relative">
              {(() => {
                const otherUser = activeConversation.participants.find((p: any) => p.id !== user?.id);
                return (
                  <Link href={`/profile/${otherUser?.id || ''}`} className="flex items-center gap-3 hover:opacity-90 group/header transition-all">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm border border-white/10 overflow-hidden">
                      {otherUser?.avatar ? (
                        <img src={otherUser.avatar} alt="User" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        otherUser?.firstName?.[0] || '?'
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover/header:text-blue-500 dark:group-hover/header:text-blue-400 transition-colors">
                        {otherUser?.firstName} {otherUser?.lastName}
                      </h3>
                      <span className="text-xs text-green-500 font-medium">Online</span>
                    </div>
                  </Link>
                );
              })()}
              <div className="flex items-center gap-4 text-gray-400">
                <button className="hover:text-blue-400 transition-colors"><Phone size={20} /></button>
                <button className="hover:text-blue-400 transition-colors"><Video size={20} /></button>
                <button className="hover:text-white transition-colors"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa] dark:bg-[url('/grid.svg')] dark:bg-repeat dark:bg-background relative">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                  <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-xl">
                    {(() => {
                      const otherUser = activeConversation.participants.find((p: any) => p.id !== user?.id);
                      return otherUser?.avatar ? (
                        <img src={otherUser.avatar} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{otherUser?.firstName?.[0] || '?'}</span>
                      );
                    })()}
                  </div>
                  <h3 className="text-xl font-bold mb-2">Say Hi! 👋</h3>
                  <p className="text-sm text-gray-500 max-w-[250px]">
                    This is the beginning of your direct message history with {activeConversation.participants.find((p: any) => p.id !== user?.id)?.firstName}.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupMessagesByDate(messages)).map(([date, dateMsgs]) => (
                    <div key={date} className="space-y-4">
                      {/* Date Separator */}
                      <div className="flex justify-center">
                        <span className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {date}
                        </span>
                      </div>
                      
                      <AnimatePresence initial={false}>
                        {dateMsgs.map((msg, index) => {
                          const isMine = msg.senderId === user?.id;
                          const showTail = index === dateMsgs.length - 1 || dateMsgs[index + 1]?.senderId !== msg.senderId;
                          
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`relative max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm group ${
                                isMine 
                                  ? `bg-blue-600 text-white ${showTail ? 'rounded-br-sm' : ''}` 
                                  : `bg-white dark:bg-card border border-gray-100 dark:border-border text-gray-900 dark:text-foreground/90 ${showTail ? 'rounded-bl-sm' : ''}`
                              }`}>
                                <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                                <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                                  <span className="text-[10px] font-medium">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {isMine && (
                                    <CheckCheck size={14} className="text-blue-200" />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5 w-16">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              <div ref={scrollRef} className="h-1" />
            </div>

            {/* Input */}
            <div className="p-6 bg-card/50 backdrop-blur-xl border-t border-border">
              <form onSubmit={sendMessage} className="flex items-center gap-4">
                <button type="button" className="text-gray-400 hover:text-white transition-colors"><Paperclip size={20} /></button>
                <div className="flex-1 relative">
                  <input 
                    value={newMessage}
                    onChange={handleTyping}
                    type="text" 
                    placeholder="Type a message..."
                    className="w-full bg-card border border-border rounded-2xl px-6 py-3 focus:outline-none focus:border-blue-500/30 transition-all pr-12"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><Smile size={20} /></button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all hover:bg-blue-700"
                >
                  <Send size={20} />
                </motion.button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send size={40} className="text-blue-500 -rotate-12" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
              <p className="text-gray-500">Select a conversation to start chatting.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
