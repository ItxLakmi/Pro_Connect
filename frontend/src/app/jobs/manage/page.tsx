'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  MapPin, 
  Users,
  Settings,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/me');
      setJobs(res.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-4">
              <Settings className="w-8 h-8 text-accent" /> Manage Listings
            </h1>
            <p className="text-foreground/60">Manage your active job postings and view applicants.</p>
          </div>
          <Link href="/jobs/post">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Post New Job
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-3xl glass animate-pulse" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <div 
                key={job.id}
                className="glass p-6 rounded-3xl hover:border-accent/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6 text-foreground/40" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-accent transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-sm text-foreground/50">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" /> {job.location}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-wider">
                          {job.type}
                        </span>
                        <span className="text-xs">
                          Posted on {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-black text-accent">{job.applications?.length || 0}</div>
                      <div className="text-xs text-foreground/50 font-bold uppercase tracking-wider">Applicants</div>
                    </div>
                    <Link href={`/jobs/manage/${job.id}`}>
                      <Button variant="outline" className="border-white/10 hover:border-accent/50 hover:bg-accent/10">
                        View Applicants
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 glass rounded-3xl">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-foreground/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No active listings</h3>
              <p className="text-foreground/40 mb-6">You haven't posted any jobs yet.</p>
              <Link href="/jobs/post">
                <Button variant="outline">Post a Job</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
