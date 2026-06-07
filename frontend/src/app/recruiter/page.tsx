'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase, Users, TrendingUp, Plus, Eye, Clock,
  CheckCircle, XCircle, ArrowRight, Loader2
} from 'lucide-react';
import api from '@/lib/api';

export default function RecruiterOverviewPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/me');
      setJobs(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const activeJobs = jobs.filter(j => j.status !== 'CLOSED');
  const closedJobs = jobs.filter(j => j.status === 'CLOSED');
  const totalApplicants = jobs.reduce((acc, j) => acc + (j._count?.applications || 0), 0);

  const stats = [
    { label: 'Active Jobs', value: activeJobs.length, icon: Briefcase, color: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
    { label: 'Total Applicants', value: totalApplicants, icon: Users, color: 'bg-green-500', light: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
    { label: 'Closed Jobs', value: closedJobs.length, icon: XCircle, color: 'bg-gray-500', light: 'bg-gray-50 dark:bg-gray-800 text-gray-600' },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruiter Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your jobs and applicants</p>
        </div>
        <Link
          href="/jobs/post"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/30"
        >
          <Plus size={18} /> Post a Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, light }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${light} flex items-center justify-center`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '—' : value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Job Postings</h2>
          <Link href="/recruiter/jobs" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No jobs posted yet.</p>
            <Link href="/jobs/post" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all">
              <Plus size={16} /> Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.slice(0, 5).map(job => (
              <div key={job.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{job.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{job.location} · {job.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center hidden sm:block">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{job._count?.applications || 0}</p>
                    <p className="text-xs text-gray-500">Applicants</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'CLOSED'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  }`}>
                    {job.status === 'CLOSED' ? 'Closed' : 'Active'}
                  </span>
                  <Link
                    href={`/recruiter/jobs/${job.id}/applicants`}
                    className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <Eye size={14} /> View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
