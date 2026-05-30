'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Rocket, 
  Briefcase, 
  DollarSign, 
  Globe, 
  FileText,
  Mail,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import Link from 'next/link';

export default function StartupDetailPage() {
  const { id } = useParams();
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState('');
  const [showConnectForm, setShowConnectForm] = useState(false);

  useEffect(() => {
    fetchStartup();
  }, [id]);

  const fetchStartup = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/investor/startups/${id}`);
      setStartup(res.data);
    } catch (error) {
      console.error('Error fetching startup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setConnecting(true);
      await api.post('/investor/connect', {
        startupId: startup.id,
        toUserId: startup.user.id,
        message,
      });
      alert('Connection request sent to founder!');
      setShowConnectForm(false);
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request. You might already have a pending request.');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Startup Not Found</h2>
          <Link href="/investors">
            <Button variant="glass">Back to Investors Portal</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/investors" className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent mb-8 transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Back to Discover
        </Link>

        {/* Hero Section */}
        <div className="glass rounded-3xl p-8 mb-8 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
              {startup.user.avatar ? (
                <img src={startup.user.avatar} alt={startup.name} className="w-full h-full object-cover" />
              ) : (
                <Rocket className="w-10 h-10 text-foreground/40" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-black">{startup.name}</h1>
                <div className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full border border-accent/20">
                  {startup.fundingStage.replace('_', ' ')}
                </div>
              </div>
              <p className="text-xl text-foreground/80 font-medium mb-6">{startup.tagline}</p>
              
              <div className="flex flex-wrap gap-6 text-sm font-medium">
                <div className="flex items-center gap-2 text-foreground/60">
                  <Briefcase className="w-4 h-4 text-accent" /> {startup.industry}
                </div>
                {startup.website && (
                  <a href={startup.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-accent hover:underline">
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
                {startup.pitchDeckUrl && (
                  <a href={startup.pitchDeckUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-accent hover:underline">
                    <FileText className="w-4 h-4" /> Pitch Deck
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="glass rounded-3xl p-8 border border-white/10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                <FileText className="w-5 h-5 text-accent" /> About {startup.name}
              </h2>
              <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {startup.description}
              </div>
            </div>
            
            <div className="glass rounded-3xl p-8 border border-white/10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                <Rocket className="w-5 h-5 text-accent" /> Founding Team
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                  {startup.user.avatar && <img src={startup.user.avatar} alt="Founder" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <p className="font-bold">{startup.user.firstName} {startup.user.lastName}</p>
                  <p className="text-sm text-foreground/60">Founder / CEO</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Funding Ask */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-accent/10 to-transparent p-6 rounded-3xl border border-accent/20">
              <h3 className="font-bold mb-6 text-lg">Funding Overview</h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-xs text-foreground/60 font-medium uppercase tracking-wider mb-1">Seeking</p>
                  <p className="text-2xl font-black text-foreground flex items-center gap-1">
                    <DollarSign className="w-6 h-6 text-accent" />
                    {(startup.amountSeeking).toLocaleString()}
                  </p>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <div>
                  <p className="text-xs text-foreground/60 font-medium uppercase tracking-wider mb-1">Equity Offered</p>
                  <p className="text-xl font-bold text-foreground">
                    {startup.equity}%
                  </p>
                </div>
              </div>

              {!showConnectForm ? (
                <Button className="w-full gap-2 font-bold" onClick={() => setShowConnectForm(true)}>
                  <Mail className="w-4 h-4" /> Request Meeting
                </Button>
              ) : (
                <form onSubmit={handleConnect} className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Briefly explain your interest and investment thesis..."
                    className="w-full h-24 bg-background/50 border border-white/20 rounded-xl p-3 text-sm focus:outline-none focus:border-accent resize-none"
                  />
                  <div className="flex gap-2">
                    <Button type="button" variant="glass" className="flex-1" onClick={() => setShowConnectForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={connecting}>
                      {connecting ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
