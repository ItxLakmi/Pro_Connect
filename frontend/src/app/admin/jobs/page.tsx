"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Search, Clock, MapPin } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  status: string;
  company: { name: string } | null;
  postedBy: { firstName: string | null; lastName: string | null };
}

export default function JobsApprovalPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:3001/admin/jobs");
        setJobs(response.data);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
        // Fallback for demonstration
        setJobs([
          {
            id: "j1",
            title: "Senior Frontend Engineer",
            description: "Looking for an expert React developer...",
            location: "Remote",
            type: "Full-time",
            status: "PENDING",
            company: { name: "TechCorp" },
            postedBy: { firstName: "Jane", lastName: "Doe" },
          },
          {
            id: "j2",
            title: "Marketing Manager",
            description: "Drive our global marketing strategy...",
            location: "New York",
            type: "Contract",
            status: "APPROVED",
            company: { name: "Growth Co" },
            postedBy: { firstName: "Mark", lastName: "Smith" },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    setUpdatingId(jobId);
    try {
      await axios.patch(`http://localhost:3001/admin/jobs/${jobId}/status`, { status: newStatus });
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    } catch (error) {
      console.error("Failed to update status", error);
      // Optimistic update for demo
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Job Approvals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Review and approve job postings before they go live.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="pl-10 pr-4 py-2 w-full md:w-64 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
            No jobs found matching "{searchTerm}"
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:border-blue-200 dark:hover:border-blue-900 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h3>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    job.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    job.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center mr-1">
                       {job.company?.name.charAt(0) || "C"}
                    </div>
                    {job.company?.name || "Independent"}
                  </span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.type}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {job.description}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Posted by: {job.postedBy.firstName} {job.postedBy.lastName}
                </p>
              </div>

              <div className="flex items-center gap-3 md:flex-col md:min-w-[120px]">
                {updatingId === job.id ? (
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  <>
                    {job.status !== 'APPROVED' && (
                      <button 
                        onClick={() => handleStatusChange(job.id, 'APPROVED')}
                        className="flex-1 md:w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                    )}
                    {job.status !== 'REJECTED' && (
                      <button 
                        onClick={() => handleStatusChange(job.id, 'REJECTED')}
                        className="flex-1 md:w-full flex items-center justify-center gap-2 py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:text-rose-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
