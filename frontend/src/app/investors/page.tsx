'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Rocket, 
  TrendingUp, 
  DollarSign, 
  Briefcase,
  ChevronRight,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function InvestorsPortalPage() {
  const [activeTab, setActiveTab] = useState<'startups' | 'investors'>('startups');
  const [startups, setStartups] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'startups') {
        const res = await api.get('/investor/startups');
        setStartups(res.data);
      } else {
        const res = await api.get('/investor/investors');
        setInvestors(res.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background selection:bg-accent/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold border border-accent/20 mb-6">
            <TrendingUp className="w-4 h-4" /> ProConnect Investor Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight max-w-3xl mx-auto">
            Where Great <span className="gradient-text">Ideas</span> Meet Capital.
          </h1>
          <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
            Discover vetted startups, connect with leading angel investors, and secure funding for your next big venture.
          </p>
          
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/investors/create-startup">
              <Button className="h-12 px-8 rounded-xl font-bold">List Your Startup</Button>
            </Link>
            <Link href="/investors/create-profile">
              <Button variant="outline" className="h-12 px-8 rounded-xl font-bold">Become an Investor</Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="glass p-1 rounded-2xl flex border border-white/5">
            <button
              onClick={() => setActiveTab('startups')}
              className={`px-8 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-2
                ${activeTab === 'startups' ? 'bg-white/10 text-foreground shadow-lg' : 'text-foreground/40 hover:text-foreground/80'}
              `}
            >
              <Rocket className="w-4 h-4" /> Discover Startups
            </button>
            <button
              onClick={() => setActiveTab('investors')}
              className={`px-8 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-2
                ${activeTab === 'investors' ? 'bg-white/10 text-foreground shadow-lg' : 'text-foreground/40 hover:text-foreground/80'}
              `}
            >
              <Briefcase className="w-4 h-4" /> Browse Investors
            </button>
          </div>
        </div>

        {/* Startups List */}
        {activeTab === 'startups' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 rounded-3xl glass animate-pulse" />
              ))
            ) : startups.length > 0 ? (
              startups.map((startup) => (
                <div key={startup.id} className="glass rounded-3xl p-6 border border-white/5 hover:border-accent/30 transition-all group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                      {startup.user.avatar ? (
                        <img src={startup.user.avatar} alt={startup.name} className="w-full h-full object-cover" />
                      ) : (
                        <Rocket className="w-6 h-6 text-foreground/40" />
                      )}
                    </div>
                    <div className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full border border-accent/20">
                      {startup.fundingStage.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black mb-1 group-hover:text-accent transition-colors">{startup.name}</h3>
                  <p className="text-sm font-medium text-foreground/80 mb-4">{startup.tagline}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-foreground/40" /> {startup.industry}
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3 text-foreground/40" /> ${(startup.amountSeeking / 1000).toFixed(0)}k seeking
                    </div>
                  </div>
                  
                  <Link href={`/investors/${startup.id}`}>
                    <Button variant="glass" className="w-full gap-2 group-hover:bg-white/10">
                      View Details <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 glass rounded-3xl border border-white/5">
                <Rocket className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No startups listed yet</h3>
                <p className="text-foreground/40">Be the first to list your startup and attract investors.</p>
              </div>
            )}
          </div>
        )}

        {/* Investors List */}
        {activeTab === 'investors' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-3xl glass animate-pulse" />
              ))
            ) : investors.length > 0 ? (
              investors.map((inv) => (
                <div key={inv.id} className="glass rounded-3xl p-6 border border-white/5 flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 overflow-hidden border border-white/10">
                      {inv.user.avatar ? (
                        <img src={inv.user.avatar} alt="Investor" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle className="w-full h-full text-foreground/20 p-2" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{inv.user.firstName} {inv.user.lastName}</h3>
                      <p className="text-xs text-foreground/60">Angel Investor</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground/80 mb-6 line-clamp-2 flex-1">{inv.bio}</p>
                  
                  <div className="mb-6">
                    <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider mb-2">Focus Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {inv.investmentFocus.map((focus: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-white/5 rounded-md text-xs border border-white/10">{focus}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 text-sm font-medium flex justify-between text-foreground/60">
                    <span>Ticket Size</span>
                    <span className="text-foreground">
                      ${(inv.minTicket / 1000).toFixed(0)}k - ${(inv.maxTicket / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 glass rounded-3xl border border-white/5">
                <Briefcase className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No investors yet</h3>
                <p className="text-foreground/40">Investor profiles will appear here.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
