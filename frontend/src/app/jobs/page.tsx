'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Filter,
  ChevronRight,
  Zap,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [salary, setSalary] = useState('');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs', {
        params: { search, location, type, salary }
      });
      setJobs(res.data);
      
      try {
        const savedRes = await api.get('/jobs/saved');
        setSavedJobs(savedRes.data.map((j: any) => j.id));
      } catch(e) {}
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  useEffect(() => {
    fetchJobs();
  }, [type, salary]);

  const handleSaveJob = async (jobId: string) => {
    try {
      const res = await api.post(`/jobs/${jobId}/save`);
      if (res.data.saved) {
        setSavedJobs(prev => [...prev, jobId]);
      } else {
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await api.post(`/applications/apply/${jobId}`);
      // Refresh jobs or update local state to show applied status
      fetchJobs();
      alert('Application sent successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background selection:bg-accent/30">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Find your next <span className="gradient-text">big move.</span>
          </h1>
          <p className="text-foreground/60 text-lg max-w-2xl">
            Browse through curated opportunities from high-growth startups and established tech leaders across South Asia.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearch} className="glass p-2 rounded-2xl mb-12 flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input 
              type="text"
              placeholder="Job title, keywords, or company"
              className="w-full h-14 bg-transparent pl-12 pr-4 text-sm focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <div className="flex-1 w-full relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input 
              type="text"
              placeholder="City, state, or remote"
              className="w-full h-14 bg-transparent pl-12 pr-4 text-sm focus:outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full md:w-auto h-14 px-8 rounded-xl">
            Search Jobs
          </Button>
        </form>

        <div className="grid lg:grid-cols-[1fr_300px] gap-12">
          {/* Job List */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
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
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-lg font-bold">{job.salaryRange || 'Competitive'}</div>
                        <div className="text-xs text-foreground/40 font-medium mt-1">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleSaveJob(job.id)}
                        className={`mr-2 rounded-xl transition-all ${savedJobs.includes(job.id) ? 'bg-accent/20 text-accent hover:bg-accent/30' : 'text-foreground/40 hover:text-foreground hover:bg-white/10'}`}
                      >
                        <Bookmark className="w-5 h-5" fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="glass" 
                        className="bg-accent/10 hover:bg-accent hover:text-white border-accent/20"
                        onClick={() => handleApply(job.id)}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))

            ) : (
              <div className="text-center py-20 glass rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-foreground/20" />
                </div>
                <h3 className="text-xl font-bold mb-2">No jobs found</h3>
                <p className="text-foreground/40">Try adjusting your search filters</p>
              </div>
            )}
          </div>

          {/* Sidebar / Filters */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-3xl">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-accent" /> Filter By
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 block">Job Type</label>
                  <div className="space-y-2">
                    {['', 'Full-time', 'Contract', 'Remote', 'Freelance'].map((t) => (
                      <label key={t || 'all'} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="jobType"
                          checked={type === t}
                          onChange={() => setType(t)}
                          className="w-4 h-4 rounded-full border-white/10 bg-white/5 text-accent focus:ring-accent" 
                        />
                        <span className="text-sm text-foreground/60 group-hover:text-foreground transition-colors">{t || 'All Types'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 block">Salary Range</label>
                  <input 
                    type="text" 
                    placeholder="e.g. $5000" 
                    className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm focus:outline-none focus:border-accent/50"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-accent/20 to-accent-secondary/20 p-6 rounded-3xl border border-accent/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/30 transition-all" />
              <Zap className="w-8 h-8 text-accent mb-4" fill="currentColor" />
              <h4 className="text-lg font-bold mb-2">Post a Job</h4>
              <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
                Reach over 50,000 top professionals in South Asia's fastest growing tech hub.
              </p>
              <Link href="/jobs/post">
                <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                  Post for $99
                </Button>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
