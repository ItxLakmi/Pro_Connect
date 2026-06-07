'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { UserX, MapPin } from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F3F2EF] dark:bg-[#1B1B1B] text-foreground font-sans">
          <Navbar />
          <main className="max-w-4xl mx-auto pt-[80px] pb-20 px-4 sm:px-6">
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-border shadow-sm overflow-hidden p-6">
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          </main>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!q) {
        setUsers([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/profiles/search?q=${encodeURIComponent(q)}`);
        setUsers(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [q]);

  const colors = ['bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-orange-500', 'bg-pink-600'];

  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-[#1B1B1B] text-foreground font-sans">
      <Navbar />
      
      <main className="max-w-4xl mx-auto pt-[80px] pb-20 px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Search Results for "{q}"
          </h1>
          <p className="text-gray-500 mt-1">Showing people matching your search.</p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl border border-border shadow-sm overflow-hidden p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <UserX className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-600 dark:text-gray-300">No people found</p>
              <p className="text-sm mt-1">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {users.map(user => {
                const color = colors[user.firstName.charCodeAt(0) % colors.length];
                return (
                  <Link href={`/profile/${user.id}`} key={user.id}>
                    <div className="flex flex-col h-full p-4 rounded-xl border border-border bg-gray-50 dark:bg-white/5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center text-white font-bold text-xl shrink-0 overflow-hidden`}>
                          {user.avatar
                            ? <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                            : user.firstName[0]
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-0.5 font-medium">
                            {user.profile?.headline || 'ProConnect Member'}
                          </p>
                        </div>
                      </div>
                      
                      {user.profile?.location && (
                        <div className="mt-auto pt-3 border-t border-border flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          {user.profile.location}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
