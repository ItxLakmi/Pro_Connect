'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Clock, Star, CheckCircle, XCircle, MessageSquare, Eye, Loader2, Briefcase } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:     { label: 'Pending',     color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: Clock },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',    icon: Star },
  INTERVIEW:   { label: 'Interview',   color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', icon: CheckCircle },
  REJECTED:    { label: 'Rejected',    color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',       icon: XCircle },
};

export default function AllApplicantsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const jobsRes = await api.get('/jobs/me');
      const myJobs = jobsRes.data;
      setJobs(myJobs);

      // Fetch all applicants for all jobs in parallel
      const results = await Promise.all(
        myJobs.map((j: any) => api.get(`/applications/job/${j.id}`).then(r => r.data.map((a: any) => ({ ...a, job: j }))).catch(() => []))
      );
      setApplicants(results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const startConversation = async (candidateId: string) => {
    try {
      const res = await api.post('/chat/conversations', { participantId: candidateId });
      router.push(`/messages?conversation=${res.data.id}`);
    } catch (e) { console.error(e); }
  };

  const counts = {
    ALL: applicants.length,
    PENDING: applicants.filter(a => a.status === 'PENDING').length,
    SHORTLISTED: applicants.filter(a => a.status === 'SHORTLISTED').length,
    INTERVIEW: applicants.filter(a => a.status === 'INTERVIEW').length,
    REJECTED: applicants.filter(a => a.status === 'REJECTED').length,
  };

  const filtered = filterStatus === 'ALL' ? applicants : applicants.filter(a => a.status === filterStatus);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Applicants</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Everyone who applied to your job postings</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'ALL' : status)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                filterStatus === status
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts[status as keyof typeof counts] ?? 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1"><Icon size={11} /> {cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(['ALL', 'PENDING', 'SHORTLISTED', 'INTERVIEW', 'REJECTED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterStatus === s
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {s === 'ALL' ? `All (${counts.ALL})` : s.charAt(0) + s.slice(1).toLowerCase() + ` (${counts[s as keyof typeof counts] ?? 0})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-16 text-center">
          <Users size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No applicants yet</p>
          {jobs.length === 0 && (
            <Link href="/jobs/post" className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
              Post a Job to Get Applicants
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = cfg.icon;
            const profile = app.user?.profile;
            return (
              <div key={app.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                    {app.user.avatar ? <img src={app.user.avatar} className="w-full h-full object-cover" /> : app.user.firstName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">{app.user.firstName} {app.user.lastName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${cfg.color}`}>
                        <StatusIcon size={10} /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.headline || 'ProConnect Member'}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Briefcase size={11} /> {app.job?.title}</span>
                      <span className="text-xs text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                    {profile?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {profile.skills.slice(0, 4).map((s: any) => (
                          <span key={s.id} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full">{s.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <button onClick={() => startConversation(app.user.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                      <MessageSquare size={12} /> Message
                    </button>
                    <Link href={`/recruiter/jobs/${app.job?.id}/applicants`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all">
                      <Eye size={12} /> Review
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
