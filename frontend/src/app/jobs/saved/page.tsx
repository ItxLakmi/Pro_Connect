'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bookmark, 
  MapPin, 
  Briefcase, 
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/saved');
      setJobs(res.data);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId: string) => {
    try {
      await api.post(`/jobs/${jobId}/save`);
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Job Board
        </Link>
        
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black mb-4 flex items-center gap-4">
            <Bookmark className="w-8 h-8 text-accent" /> Saved Jobs
          </h1>
          <p className="text-foreground/60">Jobs you've bookmarked for later.</p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 rounded-3xl glass animate-pulse" />
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
                      {job.company?.logo ? (
                        <img src={job.company.logo} alt="Logo" className="w-10 h-10 object-contain" />
                      ) : (
                        <Briefcase className="w-6 h-6 text-foreground/40" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-accent transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-sm text-foreground/50">
                        <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                          {job.company?.name || 'Stealth Startup'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                          {job.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleUnsave(job.id)}
                      className="text-accent hover:bg-accent/10"
                    >
                      <Bookmark className="w-5 h-5" fill="currentColor" />
                    </Button>
                    <Link href="/jobs">
                      <Button 
                        size="sm" 
                        variant="glass" 
                        className="bg-accent/10 hover:bg-accent hover:text-white border-accent/20"
                      >
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 glass rounded-3xl">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-foreground/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No saved jobs</h3>
              <p className="text-foreground/40">You haven't bookmarked any jobs yet.</p>
              <Link href="/jobs" className="mt-6 inline-block">
                <Button variant="outline">Browse Jobs</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
