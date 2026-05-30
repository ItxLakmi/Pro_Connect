'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Award,
  Play,
  CheckCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  BarChart2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'badges'>('courses');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [enrollRes, badgeRes, attemptRes] = await Promise.all([
        api.get('/learning/my-enrollments'),
        api.get('/learning/my-badges'),
        api.get('/learning/my-attempts'),
      ]);
      setEnrollments(enrollRes.data);
      setBadges(badgeRes.data);
      setAttempts(attemptRes.data);
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const inProgressCount = enrollments.filter((e) => e.status === 'IN_PROGRESS').length;

  const statusColor = (status: string) => {
    if (status === 'COMPLETED') return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (status === 'IN_PROGRESS') return 'text-accent bg-accent/10 border-accent/20';
    return 'text-foreground/60 bg-white/5 border-white/10';
  };

  const statusLabel = (status: string) => {
    if (status === 'COMPLETED') return 'Completed';
    if (status === 'IN_PROGRESS') return 'In Progress';
    return 'Enrolled';
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background selection:bg-accent/30">
      <div className="max-w-6xl mx-auto">

        {/* Back link */}
        <Link
          href="/learning"
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent transition-colors mb-8 text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Learning Hub
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
            My <span className="gradient-text">Learning.</span>
          </h1>
          <p className="text-foreground/60 text-lg">
            Track your progress, review earned badges, and continue where you left off.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Enrolled', value: enrollments.length, icon: <BookOpen className="w-5 h-5" />, color: 'text-foreground' },
            { label: 'In Progress', value: inProgressCount, icon: <Play className="w-5 h-5" />, color: 'text-accent' },
            { label: 'Completed', value: completedCount, icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-400' },
            { label: 'Badges Earned', value: badges.length, icon: <Award className="w-5 h-5" />, color: 'text-yellow-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-xs text-foreground/50 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2
              ${activeTab === 'courses' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'glass text-foreground/60 hover:text-foreground border border-white/5'}`}
          >
            <BookOpen className="w-4 h-4" /> My Courses
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2
              ${activeTab === 'badges' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'glass text-foreground/60 hover:text-foreground border border-white/5'}`}
          >
            <ShieldCheck className="w-4 h-4" /> Skill Badges
            {badges.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-[10px] font-black">
                {badges.length}
              </span>
            )}
          </button>
        </div>

        {/* ── COURSES TAB ── */}
        {activeTab === 'courses' && (
          <>
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-52 rounded-3xl glass animate-pulse" />
                ))}
              </div>
            ) : enrollments.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {enrollments.map((enrollment) => {
                  const course = enrollment.course;
                  return (
                    <div
                      key={enrollment.id}
                      className="glass rounded-3xl p-6 border border-white/5 hover:border-accent/20 transition-all group flex flex-col relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-accent/10 transition-all" />

                      {/* Course Header */}
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <GraduationCap className="w-6 h-6 text-accent" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${statusColor(enrollment.status)}`}>
                          {statusLabel(enrollment.status)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold mb-1 group-hover:text-accent transition-colors relative z-10 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-foreground/50 mb-1 relative z-10">
                        by {course.instructor?.firstName} {course.instructor?.lastName}
                      </p>

                      {/* Progress Bar */}
                      <div className="my-4 relative z-10">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-foreground/50 flex items-center gap-1">
                            <BarChart2 className="w-3 h-3" /> Progress
                          </span>
                          <span className="text-xs font-black text-accent">{enrollment.progress || 0}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                          <Clock className="w-3 h-3" />
                          {new Date(enrollment.createdAt).toLocaleDateString()}
                        </div>
                        <Link href={`/learning/${course.id}`}>
                          <Button size="sm" variant="glass" className="gap-1.5 hover:bg-accent hover:text-white transition-all">
                            {enrollment.status === 'COMPLETED' ? 'Review' : 'Continue'}
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 glass rounded-3xl border border-white/5">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-foreground/20" />
                </div>
                <h3 className="text-xl font-bold mb-2">No courses yet</h3>
                <p className="text-foreground/40 mb-8">Browse the learning hub and enroll in your first course.</p>
                <Link href="/learning">
                  <Button className="gap-2 px-8">
                    Explore Courses <Zap className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}

        {/* ── BADGES TAB ── */}
        {activeTab === 'badges' && (
          <>
            {loading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 rounded-3xl glass animate-pulse" />
                ))}
              </div>
            ) : badges.length > 0 ? (
              <>
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="glass rounded-3xl p-6 border border-yellow-400/10 hover:border-yellow-400/30 transition-all group text-center relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10">
                        <ShieldCheck className="w-8 h-8 text-yellow-400" />
                      </div>
                      <h3 className="font-bold text-lg mb-1 relative z-10">{badge.skillTest.title}</h3>
                      <span className="inline-block px-3 py-1 bg-yellow-400/10 text-yellow-400 text-xs font-bold rounded-full border border-yellow-400/20 mb-3 relative z-10">
                        {badge.skillTest.skillTag}
                      </span>
                      <p className="text-xs text-foreground/40 relative z-10">
                        Earned {new Date(badge.awardedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recent Attempts */}
                {attempts.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-accent" /> Recent Test Attempts
                    </h2>
                    <div className="space-y-3">
                      {attempts.slice(0, 5).map((attempt) => (
                        <div
                          key={attempt.id}
                          className="glass rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${attempt.passed ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                              {attempt.passed
                                ? <CheckCircle className="w-5 h-5" />
                                : <ShieldCheck className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{attempt.skillTest.title}</p>
                              <p className="text-xs text-foreground/50">{attempt.skillTest.skillTag}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xl font-black ${attempt.passed ? 'text-green-400' : 'text-red-400'}`}>
                              {attempt.score}%
                            </p>
                            <p className="text-[10px] text-foreground/40">
                              {attempt.passed ? 'PASSED' : 'FAILED'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 glass rounded-3xl border border-white/5">
                <div className="w-20 h-20 bg-yellow-400/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-10 h-10 text-yellow-400/30" />
                </div>
                <h3 className="text-xl font-bold mb-2">No badges yet</h3>
                <p className="text-foreground/40 mb-8">Take skill tests and pass them to earn verified badges for your profile.</p>
                <Link href="/learning/skill-tests">
                  <Button className="gap-2 px-8">
                    Browse Skill Tests <ShieldCheck className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
