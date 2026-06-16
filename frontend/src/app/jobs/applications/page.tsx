'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  MapPin, 
  Briefcase, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications/me');
      setApplications(res.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'SHORTLISTED':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Shortlisted</span>;
      case 'REJECTED':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold border border-red-500/20"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      default:
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold border border-yellow-500/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Job Board
        </Link>
        
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black mb-4 flex items-center gap-4">
            <FileText className="w-8 h-8 text-accent" /> Application Tracking
          </h1>
          <p className="text-foreground/60">Track the status of your sent job applications.</p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 rounded-3xl glass animate-pulse" />
              ))}
            </div>
          ) : applications.length > 0 ? (
            applications.map((app) => (
              <div 
                key={app.id}
                className="glass p-6 rounded-3xl hover:border-accent/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      {app.job?.company?.logo ? (
                        <img src={app.job.company.logo} alt="Logo" className="w-10 h-10 object-contain" />
                      ) : (
                        <Briefcase className="w-6 h-6 text-foreground/40" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-accent transition-colors">{app.job?.title}</h3>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-sm text-foreground/50">
                        <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                          {app.job?.company?.name || 'Stealth Startup'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" /> {app.job?.location}
                        </span>
                        <span className="text-xs">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(app.status)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 glass rounded-3xl">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-foreground/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No applications yet</h3>
              <p className="text-foreground/40">You haven't applied to any jobs.</p>
              <Link href="/jobs" className="mt-6 inline-block">
                <Button variant="outline">Find Jobs</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
