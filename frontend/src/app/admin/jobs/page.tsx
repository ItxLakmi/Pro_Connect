"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { CheckCircle, XCircle, Search, Clock, MapPin, X, Briefcase, Eye, Plus } from "lucide-react";
import { motion } from "framer-motion";

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

interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE", "FREELANCE"];

export default function JobsApprovalPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Add Job modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: "",
    type: "FULL_TIME",
    postedById: "",
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("/admin/jobs");
        setJobs(response.data);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const openAddModal = async () => {
    setShowAddModal(true);
    if (users.length === 0) {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data);
        if (res.data.length > 0) {
          setNewJob((prev) => ({ ...prev, postedById: res.data[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await api.post("/admin/jobs", newJob);
      setJobs((prev) => [res.data, ...prev]);
      setShowAddModal(false);
      setNewJob({ title: "", description: "", location: "", type: "FULL_TIME", postedById: users[0]?.id ?? "" });
    } catch (error) {
      console.error("Failed to create job", error);
    } finally {
      setAddLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    setUpdatingId(jobId);
    try {
      await api.patch(`/admin/jobs/${jobId}/status`, { status: newStatus });
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    } catch (error) {
      console.error("Failed to update status", error);
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

        <div className="flex items-center gap-3">
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
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Job
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
            No jobs found{searchTerm ? ` matching "${searchTerm}"` : " yet."}
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
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="flex-1 md:w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" /> Add New Job
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setNewJob({ title: "", description: "", location: "", type: "FULL_TIME", postedById: users[0]?.id ?? "" }); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddJob} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior React Developer"
                  value={newJob.title}
                  onChange={(e) => setNewJob((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Job responsibilities, requirements..."
                  value={newJob.description}
                  onChange={(e) => setNewJob((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Colombo, Sri Lanka"
                    value={newJob.location}
                    onChange={(e) => setNewJob((p) => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type</label>
                  <select
                    value={newJob.type}
                    onChange={(e) => setNewJob((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Posted By (User)</label>
                <select
                  required
                  value={newJob.postedById}
                  onChange={(e) => setNewJob((p) => ({ ...p, postedById: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setNewJob({ title: "", description: "", location: "", type: "FULL_TIME", postedById: users[0]?.id ?? "" }); }}
                  className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20"
                >
                  {addLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {addLoading ? "Creating..." : "Create Job"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Job Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" /> Job Details
              </h2>
              <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedJob.title}</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    selectedJob.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    selectedJob.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {selectedJob.status}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    <MapPin className="w-4 h-4" /> {selectedJob.location}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    <Clock className="w-4 h-4" /> {selectedJob.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Company</p>
                  <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                    {selectedJob.company?.name || "Independent/Not specified"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Posted By</p>
                  <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                    {selectedJob.postedBy.firstName} {selectedJob.postedBy.lastName}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Description</p>
                <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  {selectedJob.description || "No description provided."}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Job ID</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-mono text-xs">
                  {selectedJob.id}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
