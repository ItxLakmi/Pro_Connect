"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Crown, Check, Zap, Shield, X, Trash2, ToggleLeft, ToggleRight, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: unknown[];
  active: boolean;
  createdAt: string;
}

function formatPlanName(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [featureInput, setFeatureInput] = useState("");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    billingCycle: "MONTHLY",
    features: [] as string[],
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/monetization/plans");
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch plans", err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlanId(null);
    setNewPlan({ name: "", price: "", billingCycle: "MONTHLY", features: [] });
    setFeatureInput("");
  };

  const handleEditClick = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setNewPlan({
      name: plan.name,
      price: plan.price.toString(),
      billingCycle: plan.billingCycle,
      features: [...(plan.features as string[])],
    });
    setShowModal(true);
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed || newPlan.features.includes(trimmed)) return;
    setNewPlan((p) => ({ ...p, features: [...p.features, trimmed] }));
    setFeatureInput("");
  };

  const removeFeature = (feat: string) => {
    setNewPlan((p) => ({ ...p, features: p.features.filter((f) => f !== feat) }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price) return;
    setCreateLoading(true);
    try {
      const payload = {
        name: newPlan.name.toUpperCase().replace(/\s+/g, "_"),
        price: parseFloat(newPlan.price),
        billingCycle: newPlan.billingCycle,
        features: newPlan.features,
      };

      if (editingPlanId) {
        const res = await api.patch(`/admin/subscription-plans/${editingPlanId}`, payload);
        setPlans((prev) => prev.map((p) => (p.id === editingPlanId ? res.data : p)));
      } else {
        const res = await api.post("/admin/subscription-plans", payload);
        setPlans((prev) => [res.data, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error(editingPlanId ? "Failed to update plan" : "Failed to create plan", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const getPlanIcon = (name: string) => {
    if (name === "FREE") return <Shield size={20} className="text-gray-500" />;
    if (name.includes("PREMIUM")) return <Crown size={20} className="text-amber-500" />;
    return <Zap size={20} className="text-purple-500" />;
  };

  const getPlanColor = (name: string) => {
    if (name === "FREE") return { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
    if (name.includes("PREMIUM")) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" };
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown size={16} className="text-white fill-current" />
            </div>
            Subscription Plans
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage premium subscription plans for ProConnect users
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={16} />
          Add Plan
        </motion.button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Plans", value: plans.length, color: "text-blue-600" },
          { label: "Active Plans", value: plans.filter((p) => p.active).length, color: "text-green-600" },
          { label: "Inactive Plans", value: plans.filter((p) => !p.active).length, color: "text-gray-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4"
          >
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <Crown size={40} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No plans yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first subscription plan to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Add Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan, i) => {
            const colors = getPlanColor(plan.name);
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`bg-white dark:bg-gray-900 border ${colors.border} dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}
              >
                {/* Plan header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                      {getPlanIcon(plan.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-[15px] leading-tight">
                        {formatPlanName(plan.name)}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} mt-1 inline-block`}
                      >
                        {plan.billingCycle}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(plan)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Edit Plan"
                    >
                      <Edit2 size={16} />
                    </button>
                    <div
                      className={`w-2 h-2 ml-1 rounded-full ${plan.active ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <span className={`text-xs font-medium ${plan.active ? "text-green-600" : "text-gray-400"}`}>
                      {plan.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {plan.price === 0 ? "Free" : `Rs ${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-gray-500 ml-1">/month</span>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-5">
                  {(plan.features as string[]).slice(0, 5).map((feat, fi) => (
                    <div key={fi} className="flex items-start gap-2">
                      <Check size={13} className={`${colors.text} mt-0.5 shrink-0`} strokeWidth={3} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 leading-snug">{feat}</span>
                    </div>
                  ))}
                  {(plan.features as string[]).length > 5 && (
                    <div className="text-xs text-gray-400">
                      +{(plan.features as string[]).length - 5} more features
                    </div>
                  )}
                </div>

                {/* Created date */}
                <div className="text-[11px] text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                  Created {new Date(plan.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Plan Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Crown size={15} className="text-white fill-current" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingPlanId ? "Edit Subscription Plan" : "Add Subscription Plan"}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5">
                {/* Plan Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Premium, Recruiter Pro"
                    required
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">Will be stored as uppercase with underscores</p>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Price (LKR/month) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">Rs</span>
                    <input
                      type="number"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan((p) => ({ ...p, price: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Billing Cycle */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Billing Cycle
                  </label>
                  <select
                    value={newPlan.billingCycle}
                    onChange={(e) => setNewPlan((p) => ({ ...p, billingCycle: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Features
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                      placeholder="Type a feature and press Enter or Add"
                      className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-3 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Add
                    </button>
                  </div>
                  {newPlan.features.length > 0 && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {newPlan.features.map((feat, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 group"
                        >
                          <Check size={12} className="text-green-500 shrink-0" strokeWidth={3} />
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 leading-snug">{feat}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(feat)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {newPlan.features.length === 0 && (
                    <p className="text-xs text-gray-400">No features added yet</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading || !newPlan.name || !newPlan.price}
                    className="flex-2 flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {createLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    {createLoading ? "Saving..." : editingPlanId ? "Save Changes" : "Create Plan"}
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
