'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, Clock, Users, Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function MarketplacePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
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
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter size={18} className="text-blue-400" />
                Filters
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Category</label>
                  <select className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50">
                    <option>All Categories</option>
                    <option>Web Development</option>
                    <option>Design</option>
                    <option>Marketing</option>
                  </select>
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
                className="w-full bg-[#111111] border border-white/5 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-blue-500/30 transition-all text-lg"
              />
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
                  className="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{project.title}</h3>
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
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                        {project.postedBy.firstName[0]}
                      </div>
                      <span className="text-sm font-medium">{project.postedBy.firstName} {project.postedBy.lastName}</span>
                    </div>
                    <Link href={`/marketplace/${project.id}`}>
                      <button className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold transition-all">
                        View Details
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-[#111111] rounded-2xl border border-white/5">
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
