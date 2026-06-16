'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Users, Loader2, Mail, Briefcase, GraduationCap,
  CheckCircle, XCircle, Clock, Star, MessageSquare, Eye,
  Download, Filter
} from 'lucide-react';
import api from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:     { label: 'Pending',     color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: Clock },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',    icon: Star },
  INTERVIEW:   { label: 'Interview',   color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', icon: CheckCircle },
  REJECTED:    { label: 'Rejected',    color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',       icon: XCircle },
};

const ACTIONS = [
  { status: 'SHORTLISTED', label: 'Shortlist',  cls: 'bg-blue-600 hover:bg-blue-700 text-white', icon: Star },
  { status: 'INTERVIEW',   label: 'Interview',  cls: 'bg-purple-600 hover:bg-purple-700 text-white', icon: CheckCircle },
  { status: 'REJECTED',    label: 'Reject',     cls: 'bg-red-500 hover:bg-red-600 text-white', icon: XCircle },
  { status: 'PENDING',     label: 'Reset',      cls: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200', icon: Clock },
];

export default function ApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  useEffect(() => { if (jobId) fetchData(); }, [jobId]);

  const fetchData = async () => {
    try {
      const [jobRes, appRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/applications/job/${jobId}`),
      ]);
      setJob(jobRes.data);
      setApplicants(appRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (appId: string, status: string) => {
    setUpdating(appId);
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      if (selectedApplicant?.id === appId) setSelectedApplicant((prev: any) => ({ ...prev, status }));
    } catch (e) { console.error(e); }
    finally { setUpdating(null); }
  };

  const startConversation = async (candidateId: string) => {
    try {
      const res = await api.post('/chat/conversations', { participantId: candidateId });
      router.push(`/messages?conversation=${res.data.id}`);
    } catch (e) { console.error(e); }
  };

  const filtered = filterStatus === 'ALL' ? applicants : applicants.filter(a => a.status === filterStatus);

  const counts = {
    ALL: applicants.length,
    PENDING: applicants.filter(a => a.status === 'PENDING').length,
    SHORTLISTED: applicants.filter(a => a.status === 'SHORTLISTED').length,
    INTERVIEW: applicants.filter(a => a.status === 'INTERVIEW').length,
    REJECTED: applicants.filter(a => a.status === 'REJECTED').length,
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Jobs
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job?.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{job?.location} · {job?.type?.replace('_', ' ')} · {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
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
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
            }`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Applicant List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
              <Users size={36} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No applicants in this category yet</p>
            </div>
          ) : filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = cfg.icon;
            const profile = app.user?.profile;
            const isSelected = selectedApplicant?.id === app.id;

            return (
              <div
                key={app.id}
                onClick={() => setSelectedApplicant(isSelected ? null : app)}
                className={`bg-white dark:bg-gray-900 rounded-2xl border transition-all cursor-pointer p-5 ${
                  isSelected
                    ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
                    {app.user.avatar ? <img src={app.user.avatar} className="w-full h-full object-cover" /> : app.user.firstName?.[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">{app.user.firstName} {app.user.lastName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${cfg.color}`}>
                        <StatusIcon size={10} /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{profile?.headline || 'ProConnect Member'}</p>

                    {/* Skills */}
                    {profile?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {profile.skills.slice(0, 4).map((s: any) => (
                          <span key={s.id} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full">{s.name}</span>
                        ))}
                        {profile.skills.length > 4 && <span className="text-xs text-gray-400">+{profile.skills.length - 4} more</span>}
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2">Applied {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => startConversation(app.user.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all"
                    >
                      <MessageSquare size={12} /> Message
                    </button>
                    <Link
                      href={`/profile/${app.user.id}`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all"
                    >
                      <Eye size={12} /> Profile
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedApplicant && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 h-fit sticky top-6">
            {(() => {
              const app = selectedApplicant;
              const profile = app.user?.profile;
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
              return (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                      {app.user.avatar ? <img src={app.user.avatar} className="w-full h-full object-cover" /> : app.user.firstName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{app.user.firstName} {app.user.lastName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{app.user.email}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color} mt-1 inline-block`}>{cfg.label}</span>
                    </div>
                  </div>

                  {profile?.headline && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 font-medium">{profile.headline}</p>
                  )}

                  {/* Experience */}
                  {profile?.experience?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Briefcase size={12} /> Experience
                      </h4>
                      <div className="space-y-2">
                        {profile.experience.slice(0, 3).map((exp: any) => (
                          <div key={exp.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{exp.title}</p>
                            <p className="text-xs text-gray-500">{exp.company}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {profile?.education?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <GraduationCap size={12} /> Education
                      </h4>
                      <div className="space-y-2">
                        {profile.education.slice(0, 2).map((edu: any) => (
                          <div key={edu.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{edu.degree}</p>
                            <p className="text-xs text-gray-500">{edu.institution}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {profile?.skills?.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((s: any) => (
                          <span key={s.id} className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full">{s.name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Update Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ACTIONS.map(({ status, label, cls, icon: Icon }) => (
                        <button
                          key={status}
                          disabled={updating === app.id || app.status === status}
                          onClick={() => updateStatus(app.id, status)}
                          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${cls}`}
                        >
                          {updating === app.id ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => startConversation(app.user.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all mt-2"
                    >
                      <MessageSquare size={15} /> Message Candidate
                    </button>
                    <Link
                      href={`/profile/${app.user.id}`}
                      target="_blank"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      <Eye size={15} /> View Full Profile
                    </Link>
                    {profile?.resumeUrl && (
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all"
                      >
                        <Download size={15} /> Download Resume
                      </a>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
