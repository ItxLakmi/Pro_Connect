"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Briefcase,
  GraduationCap,
  DollarSign,
  TrendingUp,
  CheckCircle,
  BookOpen,
  CreditCard,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Variants } from "framer-motion";

interface AnalyticsData {
  kpis: {
    totalUsers: number;
    totalJobs: number;
    totalProjects: number;
    totalCourses: number;
    totalEnrollments: number;
    totalApplications: number;
    activeSubscriptions: number;
    totalRevenue: number;
    skillPassRate: number;
  };
  userGrowth: { date: string; users: number }[];
  roleDistribution: { role: string; count: number }[];
  jobBreakdown: { status: string; count: number }[];
  applicationBreakdown: { status: string; count: number }[];
  courseLevelBreakdown: { level: string; count: number }[];
}

const ROLE_COLORS: Record<string, string> = {
  PROFESSIONAL: "#3b82f6",
  RECRUITER: "#8b5cf6",
  FREELANCER: "#10b981",
  STARTUP_FOUNDER: "#f59e0b",
  INVESTOR: "#ef4444",
  ADMIN: "#6b7280",
  PARTNER: "#06b6d4",
  MENTOR: "#ec4899",
};

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#10b981",
  PENDING: "#f59e0b",
  REJECTED: "#ef4444",
  SHORTLISTED: "#3b82f6",
  OPEN: "#3b82f6",
  IN_PROGRESS: "#f59e0b",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "#10b981",
  INTERMEDIATE: "#3b82f6",
  ADVANCED: "#8b5cf6",
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" as const },
  }),
};

const kpiConfig = [
  { key: "totalUsers",         label: "Total Users",       icon: Users,         color: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-900/20",     href: "/admin/users" },
  { key: "totalJobs",          label: "Total Jobs",        icon: Briefcase,     color: "#8b5cf6", bg: "bg-purple-50 dark:bg-purple-900/20", href: "/admin/jobs" },
  { key: "totalProjects",      label: "Freelance Projects",icon: TrendingUp,    color: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-900/20", href: "/admin/users" },
  { key: "totalCourses",       label: "Courses",           icon: GraduationCap, color: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-900/20",   href: "/admin/courses" },
  { key: "totalEnrollments",   label: "Enrollments",       icon: BookOpen,      color: "#06b6d4", bg: "bg-cyan-50 dark:bg-cyan-900/20",     href: "/admin/courses" },
  { key: "totalApplications",  label: "Applications",      icon: CheckCircle,   color: "#ec4899", bg: "bg-pink-50 dark:bg-pink-900/20",    href: "/admin/jobs" },
  { key: "activeSubscriptions",label: "Subscriptions",     icon: CreditCard,    color: "#6366f1", bg: "bg-indigo-50 dark:bg-indigo-900/20", href: "/admin/users" },
  { key: "totalRevenue",       label: "Revenue ($)",       icon: DollarSign,    color: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-900/20", href: "/admin/users", prefix: "$" },
];

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to fetch analytics", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, userGrowth, roleDistribution, jobBreakdown, applicationBreakdown, courseLevelBreakdown } = data;

  return (
    <div className="p-6 lg:p-8 space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Real-time platform-wide performance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiConfig.map((cfg, i) => {
          const Icon = cfg.icon;
          const raw = kpis[cfg.key as keyof typeof kpis] as number;
          const value = cfg.prefix
            ? `${cfg.prefix}${raw.toLocaleString()}`
            : raw.toLocaleString();
          return (
            <Link href={cfg.href} key={cfg.key}>
              <motion.div
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">View →</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cfg.label}</p>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Skill Pass Rate Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <p className="text-blue-100 text-sm font-medium">Skill Verification Pass Rate</p>
          <p className="text-4xl font-bold mt-1">{kpis.skillPassRate}%</p>
          <p className="text-blue-200 text-xs mt-1">Of all skill test attempts platform-wide</p>
        </div>
        <div className="w-full sm:w-64 bg-blue-500/40 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${kpis.skillPassRate}%` }}
          />
        </div>
      </motion.div>

      {/* Charts Row 1: User Growth + Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart: User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">User Growth</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">New registrations — last 30 days</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickFormatter={(v) => v.substring(5)}
                interval={4}
              />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "none",
                  borderRadius: "12px",
                  color: "#f9fafb",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart: Role Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">User Roles</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Distribution across roles</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={roleDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="count"
              >
                {roleDistribution.map((entry) => (
                  <Cell
                    key={entry.role}
                    fill={ROLE_COLORS[entry.role] ?? "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "none",
                  borderRadius: "12px",
                  color: "#f9fafb",
                  fontSize: "12px",
                }}
                formatter={(v, _, p) => [v, p.payload.role]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {roleDistribution.slice(0, 4).map((r) => (
              <div key={r.role} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: ROLE_COLORS[r.role] ?? "#94a3b8" }}
                  />
                  <span className="text-gray-600 dark:text-gray-400 truncate">{r.role}</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-gray-200">{r.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2: Job Breakdown + Applications + Courses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bar Chart: Job Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Job Pipeline</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Jobs by approval status</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={jobBreakdown} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 9, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "none",
                  borderRadius: "12px",
                  color: "#f9fafb",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {jobBreakdown.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart: Application Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Applications</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Application status breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={applicationBreakdown} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 9, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "none",
                  borderRadius: "12px",
                  color: "#f9fafb",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {applicationBreakdown.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart: Courses by Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Courses by Level</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Learning hub distribution</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={courseLevelBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={60}
                paddingAngle={4}
                dataKey="count"
              >
                {courseLevelBreakdown.map((entry) => (
                  <Cell key={entry.level} fill={LEVEL_COLORS[entry.level] ?? "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "none",
                  borderRadius: "12px",
                  color: "#f9fafb",
                  fontSize: "12px",
                }}
                formatter={(v, _, p) => [v, p.payload.level]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {courseLevelBreakdown.map((c) => (
              <div key={c.level} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: LEVEL_COLORS[c.level] ?? "#94a3b8" }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">{c.level}</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-gray-200">{c.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
