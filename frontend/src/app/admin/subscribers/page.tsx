"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { CreditCard, Edit2, Trash2, X, Search, Crown, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserSubscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  plan: {
    name: string;
  };
}

export default function AdminSubscribersPage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSub, setEditingSub] = useState<UserSubscription | null>(null);
  const [editForm, setEditForm] = useState({
    status: "",
    endDate: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get("/admin/user-subscriptions");
      setSubscriptions(res.data);
    } catch (err) {
      console.error("Failed to fetch user subscriptions", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (sub: UserSubscription) => {
    setEditingSub(sub);
    setEditForm({
      status: sub.status,
      endDate: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : "",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingSub(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    setSaving(true);
    try {
      const payload = {
        status: editForm.status,
        endDate: editForm.endDate ? new Date(editForm.endDate).toISOString() : undefined,
      };
      const res = await api.patch(`/admin/user-subscriptions/${editingSub.id}`, payload);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === editingSub.id ? res.data : s))
      );
      closeEditModal();
    } catch (err) {
      console.error("Failed to update subscription", err);
      alert("Error updating subscription");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (!confirm(`Are you sure you want to completely delete the subscription for ${userName}? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/admin/user-subscriptions/${id}`);
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete subscription", err);
      alert("Error deleting subscription");
    }
  };

  const filteredSubs = subscriptions.filter((s) =>
    `${s.user.firstName} ${s.user.lastName} ${s.user.email} ${s.plan.name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    if (status === "ACTIVE") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (status === "CANCELED") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (status === "EXPIRED") return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  };

  const getPlanIcon = (name: string) => {
    if (name === "FREE") return <Shield size={16} className="text-gray-500" />;
    if (name.includes("PREMIUM")) return <Crown size={16} className="text-amber-500" />;
    return <Zap size={16} className="text-purple-500" />;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <CreditCard size={16} className="text-white" />
            </div>
            Subscribers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage user subscriptions, cancellations, and billing statuses
          </p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user or plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{subscriptions.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Subscriptions</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">{subscriptions.filter((s) => s.status === "ACTIVE").length}</div>
          <div className="text-xs text-gray-500 mt-1">Active Subscribers</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-600">{subscriptions.filter((s) => s.status === "CANCELED").length}</div>
          <div className="text-xs text-gray-500 mt-1">Canceled Plans</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-400">{subscriptions.filter((s) => s.status === "EXPIRED").length}</div>
          <div className="text-xs text-gray-500 mt-1">Expired Plans</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">End Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {sub.user.firstName} {sub.user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{sub.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-200">
                        {getPlanIcon(sub.plan.name)}
                        {sub.plan.name.replace(/_/g, " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(sub.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                          title="Edit Subscription"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id, sub.user.firstName)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete Subscription"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeEditModal();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Subscription</h2>
                <button
                  onClick={closeEditModal}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="CANCELED">CANCELED</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
