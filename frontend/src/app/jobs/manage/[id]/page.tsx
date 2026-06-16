'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Users,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  User as UserIcon,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function JobApplicantsPage() {
  const { id } = useParams();
  const [applications, setApplications] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/applications/job/${id}`)
      ]);
      setJob(jobRes.data);
      setApplications(appsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, status: string) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status } : app));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <Link href="/jobs/manage" className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-4">
            <Users className="w-8 h-8 text-accent" /> Applicants
          </h1>
          <p className="text-foreground/60 text-lg">
            Reviewing candidates for <span className="font-bold text-foreground">{job?.title}</span>
          </p>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-3xl glass animate-pulse" />
              ))}
            </div>
          ) : applications.length > 0 ? (
            applications.map((app) => (
              <div 
                key={app.id}
                className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Candidate Avatar */}
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                    {app.user.avatar ? (
                      <img src={app.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-8 h-8 text-foreground/40" />
                    )}
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/profile/${app.user.id}`}>
                        <h3 className="text-2xl font-bold hover:text-accent transition-colors">
                          {app.user.firstName} {app.user.lastName}
                        </h3>
                      </Link>
                      
                      <div className="flex gap-2">
                        {app.status === 'SHORTLISTED' && (
                          <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Shortlisted
                          </div>
                        )}
                        {app.status === 'REJECTED' && (
                          <div className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold border border-red-500/20 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </div>
                        )}
                        {app.status === 'PENDING' && (
                          <div className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold border border-yellow-500/20 flex items-center gap-1">
                            Pending
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-foreground/70 mb-4">{app.user.profile?.headline || 'Professional on ProConnect'}</p>
                    
                    {/* Skills snippet */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {app.user.profile?.skills?.slice(0, 5).map((s: any) => (
                        <span key={s.id} className="text-xs px-2 py-1 bg-white/5 rounded-md border border-white/10">
                          {s.name}
                        </span>
                      ))}
                      {(app.user.profile?.skills?.length || 0) > 5 && (
                        <span className="text-xs px-2 py-1 text-foreground/50">+{app.user.profile.skills.length - 5} more</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0 md:w-48 pt-4 md:pt-0 md:border-l md:border-white/10 md:pl-6">
                    <Link href={`/messages?user=${app.user.id}`}>
                      <Button variant="outline" className="w-full gap-2 justify-start border-white/10 hover:border-accent/50 hover:bg-accent/10">
                        <MessageSquare className="w-4 h-4" /> Message
                      </Button>
                    </Link>
                    <Link href={`/profile/${app.user.id}`}>
                      <Button variant="outline" className="w-full gap-2 justify-start border-white/10 hover:border-accent/50 hover:bg-accent/10">
                        <FileText className="w-4 h-4" /> Full Profile
                      </Button>
                    </Link>
                    
                    <div className="w-full h-px bg-white/10 my-2" />

                    {app.status !== 'SHORTLISTED' && (
                      <Button 
                        variant="glass" 
                        onClick={() => handleStatusChange(app.id, 'SHORTLISTED')}
                        className="w-full gap-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border-green-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Shortlist
                      </Button>
                    )}
                    {app.status !== 'REJECTED' && (
                      <Button 
                        variant="glass" 
                        onClick={() => handleStatusChange(app.id, 'REJECTED')}
                        className="w-full gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-red-500/20"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 glass rounded-3xl">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-foreground/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No applicants yet</h3>
              <p className="text-foreground/40">Check back later once candidates apply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
