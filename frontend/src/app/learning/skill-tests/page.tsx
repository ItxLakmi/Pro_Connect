'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Clock, 
  Award,
  ChevronRight,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function SkillTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/learning/skill-tests');
      if (search) {
        setTests(res.data.filter((t: any) => t.title.toLowerCase().includes(search.toLowerCase()) || t.skillTag.toLowerCase().includes(search.toLowerCase())));
      } else {
        setTests(res.data);
      }
    } catch (error) {
      console.error('Error fetching skill tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTests();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background selection:bg-accent/30">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold border border-accent/20 mb-6">
            <ShieldCheck className="w-4 h-4" /> ProConnect Verification
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Prove Your <span className="gradient-text">Expertise.</span>
          </h1>
          <p className="text-foreground/60 text-lg max-w-2xl">
            Take timed skill tests to earn verified badges. Stand out to top recruiters and clients by showcasing your proven abilities.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="glass p-2 rounded-2xl mb-12 flex flex-col md:flex-row items-center gap-2 max-w-3xl">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input 
              type="text"
              placeholder="Search for skills (e.g., React, Python, UI Design)"
              className="w-full h-14 bg-transparent pl-12 pr-4 text-sm focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full md:w-auto h-14 px-8 rounded-xl">
            Search
          </Button>
        </form>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-3xl glass animate-pulse" />
            ))
          ) : tests.length > 0 ? (
            tests.map((test) => (
              <div 
                key={test.id}
                className="glass rounded-3xl p-6 border border-white/5 hover:border-accent/30 transition-all group flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/10 transition-all" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-accent/30 transition-all duration-300">
                    <BrainCircuit className="w-6 h-6 text-foreground/80 group-hover:text-accent transition-colors" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-foreground/80">
                    {test.skillTag}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 relative z-10">{test.title}</h3>
                <p className="text-sm text-foreground/60 mb-6 flex-1 relative z-10">
                  {test.description || `Test your knowledge in ${test.skillTag} and earn a verified badge for your profile.`}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-foreground/60 mb-6 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {test.timeLimitMin} min
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Pass: {test.passingScore}%
                  </div>
                </div>
                
                <Link href={`/learning/skill-tests/${test.id}`} className="relative z-10">
                  <Button className="w-full gap-2 group-hover:bg-accent group-hover:text-white transition-all">
                    Start Test <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 glass rounded-3xl border border-white/5">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-foreground/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No skill tests found</h3>
              <p className="text-foreground/40">Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
