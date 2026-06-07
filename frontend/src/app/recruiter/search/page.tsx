'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Users, MapPin, Briefcase, GraduationCap,
  MessageSquare, Eye, Loader2, Filter, X
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CandidateSearchPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/profiles/search?q=${encodeURIComponent(query)}`);
      setCandidates(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const startConversation = async (candidateId: string) => {
    try {
      const res = await api.post('/chat/conversations', { participantId: candidateId });
      router.push(`/messages?conversation=${res.data.id}`);
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search Candidates</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Find talent by name, skill, title or location</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, skill (e.g. React), job title, or location..."
              className="w-full pl-11 pr-4 py-3.5 border border-gray-300 dark:border-gray-700 rounded-2xl text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white shadow-sm"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setCandidates([]); setSearched(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <Search size={16} /> Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : !searched ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Search size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Find Your Next Hire</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
            Search by skills (e.g. "React", "QA"), job title (e.g. "Software Engineer"), or candidate name
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['React Developer', 'UI/UX Designer', 'QA Engineer', 'Data Scientist', 'DevOps'].map(tag => (
              <button key={tag} onClick={() => { setQuery(tag); setTimeout(handleSearch, 0); }}
                className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all">
                {tag}
              </button>
            ))}
          </div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Users size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No candidates found for <span className="font-semibold">"{query}"</span></p>
          <p className="text-xs text-gray-400 mt-1">Try different keywords or skills</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found for "{query}"</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {candidates.map(candidate => (
              <div key={candidate.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all group">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                    {candidate.avatar ? <img src={candidate.avatar} className="w-full h-full object-cover" /> : candidate.firstName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{candidate.firstName} {candidate.lastName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{candidate.profile?.headline || 'ProConnect Member'}</p>
                    {candidate.profile?.location && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {candidate.profile.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {candidate.profile?.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {candidate.profile.skills.slice(0, 4).map((s: any) => (
                      <span key={s.id} className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full">{s.name}</span>
                    ))}
                    {candidate.profile.skills.length > 4 && (
                      <span className="text-xs text-gray-400">+{candidate.profile.skills.length - 4}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <Link
                    href={`/profile/${candidate.id}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    <Eye size={13} /> View Profile
                  </Link>
                  <button
                    onClick={() => startConversation(candidate.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all"
                  >
                    <MessageSquare size={13} /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
