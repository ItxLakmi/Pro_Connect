"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Search, Eye, Ban, MoreHorizontal, X, UserSquare } from "lucide-react";
import { motion } from "framer-motion";

interface Profile {
  id: string;
  userId: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatar: string | null;
  };
  headline: string | null;
  location: string | null;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await api.get("/admin/profiles");
        setProfiles(response.data);
      } catch (error) {
        console.error("Failed to fetch profiles", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(
    (p) =>
      p.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.headline?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Profile Moderation</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Review and moderate user profiles to ensure community standards.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search profiles..."
            className="pl-10 pr-4 py-2 w-full md:w-64 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No profiles found matching "{searchTerm}"
          </div>
        ) : (
          filteredProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {profile.user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.user.avatar}
                      alt={`${profile.user.firstName} ${profile.user.lastName}`}
                      className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-gray-800"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm ${profile.user.avatar ? 'hidden' : ''}`}>
                    {(profile.user.firstName?.[0] || "") + (profile.user.lastName?.[0] || "") || profile.user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {profile.user.firstName} {profile.user.lastName}
                    </h3>
                    <p className="text-xs text-gray-500">{profile.user.email}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2 mb-6">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Headline</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                    {profile.headline || "No headline provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {profile.location || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                  onClick={() => setSelectedProfile(profile)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" /> View Full
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:text-rose-400 rounded-lg text-sm font-medium transition-colors">
                  <Ban className="w-4 h-4" /> Suspend
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* View Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserSquare className="w-5 h-5 text-blue-500" /> Profile Details
              </h2>
              <button onClick={() => setSelectedProfile(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                {selectedProfile.user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedProfile.user.avatar}
                    alt={`${selectedProfile.user.firstName} ${selectedProfile.user.lastName}`}
                    className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-gray-200 dark:ring-gray-700"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                  />
                ) : null}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-sm ${selectedProfile.user.avatar ? 'hidden' : ''}`}>
                  {(selectedProfile.user.firstName?.[0] || "") + (selectedProfile.user.lastName?.[0] || "") || selectedProfile.user.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedProfile.user.firstName} {selectedProfile.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedProfile.user.email}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Headline</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {selectedProfile.headline || "No headline provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {selectedProfile.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Profile ID</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-mono text-xs">
                    {selectedProfile.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">User ID</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-mono text-xs">
                    {selectedProfile.userId}
                  </p>
                </div>
              </div>

              <div className="pt-6 flex">
                <button 
                  onClick={() => setSelectedProfile(null)}
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
