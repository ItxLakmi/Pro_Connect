"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Eye, Ban, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface Profile {
  id: string;
  userId: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  headline: string | null;
  location: string | null;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get("http://localhost:3001/admin/profiles");
        setProfiles(response.data);
      } catch (error) {
        console.error("Failed to fetch profiles", error);
        // Fallback for demonstration
        setProfiles([
          {
            id: "p1",
            userId: "1",
            user: { firstName: "Alice", lastName: "Smith", email: "alice@example.com" },
            headline: "Senior Software Engineer",
            location: "San Francisco, CA",
          },
          {
            id: "p2",
            userId: "2",
            user: { firstName: "Bob", lastName: "Jones", email: "bob@example.com" },
            headline: "Product Designer @ Creative Studio",
            location: "New York, NY",
          },
        ]);
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
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
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors">
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
    </div>
  );
}
