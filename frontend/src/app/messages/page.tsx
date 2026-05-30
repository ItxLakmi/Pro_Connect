'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/chat/conversations');
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (user && !socket) {
      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
        auth: { token: localStorage.getItem('token') }
      });

      newSocket.on('newMessage', (message) => {
        if (activeConversation && message.conversationId === activeConversation.id) {
          setMessages((prev) => [...prev, message]);
        }
        // Update conversation list last message
        setConversations((prev) => 
          prev.map(c => c.id === message.conversationId ? { ...c, messages: [message] } : c)
        );
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, activeConversation, socket]);

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
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !socket) return;

    const receiver = activeConversation.participants.find((p: any) => p.id !== user?.id);
    
    socket.emit('sendMessage', {
      content: newMessage,
      conversationId: activeConversation.id,
      receiverId: receiver.id
    });

    setNewMessage('');
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 overflow-hidden flex max-w-7xl mx-auto w-full border-x border-border bg-card/30">
        {/* Sidebar */}
        <div className="w-80 md:w-96 border-r border-border flex flex-col">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search chats..."
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500/30 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 pb-6">
            {conversations.map((conv) => {
              const otherUser = conv.participants.find((p: any) => p.id !== user?.id);
              const lastMessage = conv.messages?.[0];
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all mb-1 ${
                    activeConversation?.id === conv.id ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-lg">
                      {otherUser?.firstName[0]}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full"></div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-semibold truncate">{otherUser?.firstName} {otherUser?.lastName}</span>
                      <span className="text-[10px] text-gray-500 uppercase">12:45 PM</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {lastMessage?.content || 'Start a conversation...'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-background">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-card/50 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold">
                  {activeConversation.participants.find((p: any) => p.id !== user?.id)?.firstName[0]}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {activeConversation.participants.find((p: any) => p.id !== user?.id)?.firstName} {activeConversation.participants.find((p: any) => p.id !== user?.id)?.lastName}
                  </h3>
                  <span className="text-xs text-green-500">Online</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <button className="hover:text-blue-400 transition-colors"><Phone size={20} /></button>
                <button className="hover:text-blue-400 transition-colors"><Video size={20} /></button>
                <button className="hover:text-white transition-colors"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('/grid.svg')] bg-repeat">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-4 rounded-2xl ${
                      msg.senderId === user?.id 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-card border border-border text-foreground/80 rounded-bl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <span className="text-[10px] opacity-50 block mt-2 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-card/50 backdrop-blur-xl border-t border-border">
              <form onSubmit={sendMessage} className="flex items-center gap-4">
                <button type="button" className="text-gray-400 hover:text-white transition-colors"><Paperclip size={20} /></button>
                <div className="flex-1 relative">
                  <input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
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
