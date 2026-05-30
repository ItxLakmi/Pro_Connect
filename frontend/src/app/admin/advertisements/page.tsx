"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, ToggleLeft, ToggleRight, Trash2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  active: boolean;
  createdAt: string;
}

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [newAd, setNewAd] = useState({ title: "", imageUrl: "", targetUrl: "" });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await axios.get("http://localhost:3001/admin/advertisements");
      setAds(response.data);
    } catch (error) {
      console.error("Failed to fetch ads", error);
      // Fallback
      setAds([
        {
          id: "ad1",
          title: "Premium Hosting Provider",
          imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
          targetUrl: "https://example.com/host",
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "ad2",
          title: "Startup Acceleration Program",
          imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
          targetUrl: "https://example.com/accel",
          active: false,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    try {
      await axios.patch(`http://localhost:3001/admin/advertisements/${id}/toggle`, { active: !currentStatus });
      setAds((prev) => prev.map((ad) => (ad.id === id ? { ...ad, active: !currentStatus } : ad)));
    } catch (error) {
      console.error("Failed to toggle ad", error);
      setAds((prev) => prev.map((ad) => (ad.id === id ? { ...ad, active: !currentStatus } : ad)));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/admin/advertisements", newAd);
      // Refresh or append
      setAds([response.data, ...ads]);
      setShowModal(false);
      setNewAd({ title: "", imageUrl: "", targetUrl: "" });
    } catch (error) {
      console.error("Failed to create ad", error);
      // Mock creation
      const mockAd = {
        id: `ad-${Date.now()}`,
        ...newAd,
        active: true,
        createdAt: new Date().toISOString()
      };
      setAds([mockAd, ...ads]);
      setShowModal(false);
      setNewAd({ title: "", imageUrl: "", targetUrl: "" });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Advertisements</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage platform sponsorships and ad placements.</p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          Create Ad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : ads.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
            No advertisements created yet.
          </div>
        ) : (
          ads.map((ad, index) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden shadow-sm transition-all flex flex-col ${ad.active ? 'border-blue-100 dark:border-blue-900/50' : 'border-gray-200 dark:border-gray-800 opacity-75 grayscale-[0.2]'}`}
            >
              <div className="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/800x400/374151/FFFFFF?text=Ad+Image+Not+Found';
                }} />
                <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${ad.active ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {ad.active ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{ad.title}</h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 truncate">
                  <LinkIcon className="w-4 h-4 shrink-0" />
                  <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="hover:text-blue-500 hover:underline truncate">
                    {ad.targetUrl}
                  </a>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    {updatingId === ad.id ? (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <button 
                        onClick={() => handleToggle(ad.id, ad.active)}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${ad.active ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                      >
                        {ad.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                        {ad.active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                  <button className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Advertisement</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Trash2 className="w-5 h-5 opacity-0" /> {/* Spacer */}
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Title</label>
                <input 
                  required
                  type="text" 
                  value={newAd.title}
                  onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                  placeholder="e.g. Summer Sale 2026"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required
                    type="url" 
                    value={newAd.imageUrl}
                    onChange={(e) => setNewAd({...newAd, imageUrl: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                    placeholder="https://example.com/image.png"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required
                    type="url" 
                    value={newAd.targetUrl}
                    onChange={(e) => setNewAd({...newAd, targetUrl: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                    placeholder="https://example.com/landing"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20"
                >
                  Create Ad
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
