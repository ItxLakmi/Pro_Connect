'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase, Plus, Eye, Edit2, Trash2, Lock, Unlock,
  Loader2, MapPin, Clock, Users, MoreHorizontal, X, Save
} from 'lucide-react';
import api from '@/lib/api';

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'];
const statusColors: Record<string, string> = {
  APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  CLOSED: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
};

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');
  const [editJob, setEditJob] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/me');
      setJobs(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openEdit = (job: any) => {
    setEditJob(job);
    setEditForm({
      title: job.title,
      description: job.description,
      location: job.location,
      type: job.type,
      salaryRange: job.salaryRange || '',
    });
    setMenuOpen(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/jobs/${editJob.id}`, editForm);
      setJobs(prev => prev.map(j => j.id === editJob.id ? { ...j, ...res.data } : j));
      setEditJob(null);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (e) { console.error(e); }
    setMenuOpen(null);
  };

  const handleClose = async (id: string) => {
    try {
      const res = await api.patch(`/jobs/${id}/close`);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'CLOSED' } : j));
    } catch (e) { console.error(e); }
    setMenuOpen(null);
  };

  const handleReopen = async (id: string) => {
    try {
      await api.patch(`/jobs/${id}/reopen`);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'APPROVED' } : j));
    } catch (e) { console.error(e); }
    setMenuOpen(null);
  };

  const filtered = jobs.filter(j => {
    if (filter === 'ACTIVE') return j.status !== 'CLOSED';
    if (filter === 'CLOSED') return j.status === 'CLOSED';
    return true;
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Job Postings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{jobs.length} total jobs posted</p>
        </div>
        <Link
          href="/jobs/post"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/30"
        >
          <Plus size={18} /> Post New Job
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['ALL', 'ACTIVE', 'CLOSED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
            }`}
          >
            {f === 'ALL' ? `All (${jobs.length})` : f === 'ACTIVE' ? `Active (${jobs.filter(j=>j.status!=='CLOSED').length})` : `Closed (${jobs.filter(j=>j.status==='CLOSED').length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-16 text-center">
          <Briefcase size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No jobs found</p>
          <Link href="/jobs/post" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700">
            <Plus size={16} /> Post a Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => (
            <div key={job.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0 overflow-hidden">
                    {job.company?.logo ? <img src={job.company.logo} className="w-full h-full object-cover" /> : <Briefcase size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">{job.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[job.status] || statusColors['PENDING']}`}>
                        {job.status === 'APPROVED' ? 'Active' : job.status === 'CLOSED' ? 'Closed' : job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {job.type?.replace('_', ' ')}</span>
                      {job.salaryRange && <span>💰 {job.salaryRange}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{job.description}</p>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 ml-4">
                  <Link
                    href={`/recruiter/jobs/${job.id}/applicants`}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                  >
                    <Users size={15} /> {job._count?.applications || 0} Applicants
                  </Link>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === job.id ? null : job.id)}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {menuOpen === job.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 min-w-[160px] py-1">
                        <Link
                          href={`/recruiter/jobs/${job.id}/applicants`}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setMenuOpen(null)}
                        >
                          <Eye size={14} /> View Applicants
                        </Link>
                        <button
                          onClick={() => openEdit(job)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Edit2 size={14} /> Edit Job
                        </button>
                        {job.status !== 'CLOSED' ? (
                          <button
                            onClick={() => handleClose(job.id)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          >
                            <Lock size={14} /> Close Job
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReopen(job.id)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Unlock size={14} /> Reopen Job
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={14} /> Delete Job
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white">Edit Job</h2>
              <button onClick={() => setEditJob(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                <input name="title" value={editForm.title} onChange={handleEditChange}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} rows={4}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input name="location" value={editForm.location} onChange={handleEditChange}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select name="type" value={editForm.type} onChange={handleEditChange}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white">
                    {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary Range</label>
                <input name="salaryRange" value={editForm.salaryRange} onChange={handleEditChange} placeholder="e.g. LKR 100,000 - 150,000"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <button onClick={() => setEditJob(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
