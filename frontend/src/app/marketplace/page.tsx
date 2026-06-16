'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, Clock, Users, Search, Filter, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';

export default function MarketplacePage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>('all');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [activeTab]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      if (activeTab === 'recommended') {
        const response = await api.get('/ai/recommend-projects');
        setProjects(response.data);
      } else {
        const response = await api.get('/projects');
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300"
            >
              Freelance Marketplace
            </motion.h1>
            <p className="text-gray-400 mt-2">Find high-quality projects and expert freelancers.</p>
          </div>
          
          <Link href="/marketplace/post">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus size={20} />
              Post a Project
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-card/50 border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter size={18} className="text-blue-400" />
                Filters
              </h3>
              <div className="space-y-4">
                <div>
                  <AutocompleteInput 
                    label="Category" 
                    placeholder="e.g. Design, Web Development..."
                    value={category} 
                    onChange={setCategory} 
                    suggestions={['Web Development', 'Design', 'Marketing']} 
                    showAllOnFocus 
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Budget Range</label>
                  <input type="range" className="w-full accent-blue-500" />
                </div>
              </div>
            </div>
          </aside>

          {/* Projects List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search projects by title, skills, or keywords..."
                className="w-full bg-card/50 border border-border rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-blue-500/30 transition-all text-lg"
              />
            </div>

            {/* AI Recommendation Tabs */}
            <div className="flex gap-4 p-1 bg-card/50 border border-border rounded-xl w-fit">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-foreground'
                }`}
              >
                All Projects
              </button>
              <button 
                onClick={() => setActiveTab('recommended')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'recommended' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md' : 'text-gray-500 hover:text-foreground'
                }`}
              >
                <Sparkles size={16} />
                Recommended for You
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : projects.length > 0 ? (
              projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card/50 border border-border rounded-2xl p-6 hover:border-blue-500/30 transition-all group shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{project.title}</h3>
                        {project.matchScore && (
                          <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full border border-purple-500/30 flex items-center gap-1">
                            <Sparkles size={12} />
                            {project.matchScore}% Match
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} />
                          {project.budget ? `$${project.budget}` : 'Negotiable'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {project._count?.bids || 0} Bids
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 line-clamp-2 mb-6">
                    {project.description}
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <Link href={`/profile/${project.postedById || project.postedBy?.id}`}>
                      <div className="flex items-center gap-3 cursor-pointer group/poster">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold hover:opacity-90 transition-opacity">
                          {project.postedBy.avatar ? (
                            <img src={project.postedBy.avatar} alt="Poster" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            project.postedBy.firstName[0]
                          )}
                        </div>
                        <span className="text-sm font-medium group-hover/poster:text-blue-400 transition-colors">{project.postedBy.firstName} {project.postedBy.lastName}</span>
                      </div>
                    </Link>
                    <Link href={`/marketplace/${project.id}`}>
                      <button className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold transition-all">
                        View Details
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-card/50 rounded-2xl border border-border shadow-sm">
                <Briefcase size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">No projects found. Be the first to post one!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
