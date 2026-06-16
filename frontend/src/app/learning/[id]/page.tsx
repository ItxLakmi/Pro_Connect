'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  PlayCircle, CheckCircle, BookOpen, Clock, Lock, ArrowLeft,
  Plus, Trash2, ChevronDown, ChevronUp, Save, X, GraduationCap,
  Film, AlignLeft, Hash, Crown, FileText, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { user } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add module state
  const [showAddModule, setShowAddModule] = useState(false);
  const [addingModule, setAddingModule] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    notesUrl: '',
    order: '',
  });
  const [moduleError, setModuleError] = useState('');
  const [moduleSuccess, setModuleSuccess] = useState('');

  const isInstructor = user && course && course.instructor?.id === user.id;
  const isAdmin = user?.role === 'ADMIN';
  const canManage = isInstructor || isAdmin;

  const handleDeleteCourse = async () => {
    if (!confirm('Are you sure you want to completely delete this course? This action cannot be undone.')) return;
    try {
      await api.delete(`/learning/courses/${courseId}`);
      router.push('/learning');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      await Promise.all([
        fetchCourseDetails(),
        checkEnrollment()
      ]);
    } catch (err: any) {
      console.error('Error loading course page data:', err);
      setError(err.response?.data?.message || 'Failed to load course details. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const res = await api.get(`/learning/courses/${courseId}`);
      if (!res.data) {
        throw new Error('Course not found');
      }
      setCourse(res.data);
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  };

  const checkEnrollment = async () => {
    try {
      const res = await api.get(`/learning/courses/${courseId}/enrollment`);
      if (res.data) {
        setEnrollment(res.data);
        setIsEnrolled(true);
      } else {
        setEnrollment(null);
        setIsEnrolled(false);
      }
    } catch (error) {
      console.error('Error checking enrollment', error);
      throw error;
    }
  };

  const handleEnroll = async (e?: React.MouseEvent) => {
    if (course.price === 0) {
      // Free course enrollment
      try {
        await api.post(`/learning/enroll`, { courseId });
        setIsEnrolled(true);
        checkEnrollment();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to enroll');
      }
    } else {
      // DEV BYPASS: Force success without PayHere if user holds 'Shift' key
      // We will call the webhook directly or an admin override (here we just alert)
      if (e?.shiftKey) {
        if (confirm('DEV BYPASS: This requires a webhook in production. To test, proceed without Shift key.')) {
           // We cannot bypass this easily on frontend because backend webhook creates enrollment.
        }
      }

      try {
        // 1. Get Payment Hash
        const hashRes = await api.post("/monetization/payhere-hash", {
          orderId: `ENROLL_${Date.now()}_${user?.id}`,
          amount: course.price,
          currency: "USD",
        });
        const hash = hashRes.data.hash;

        // @ts-ignore
        if (!window.payhere) {
          throw new Error("PayHere script is not loaded.");
        }

        const payment = {
          sandbox: true,
          merchant_id: "1227091", // Sandbox Merchant ID
          return_url: window.location.href,
          cancel_url: window.location.href,
          notify_url: "https://your-ngrok-url/api/monetization/payhere-webhook",
          order_id: `ENROLL_${Date.now()}_${user?.id}`,
          items: `Enrollment: ${course.title}`,
          amount: course.price,
          currency: "USD",
          hash: hash,
          first_name: user?.firstName || "Test",
          last_name: user?.lastName || "User",
          email: user?.email || "test@example.com",
          phone: "0771234567",
          address: "No.1, Galle Road",
          city: "Colombo",
          country: "Sri Lanka",
          custom_1: "COURSE_ENROLLMENT",
          custom_2: user?.id,
          custom_3: course.id,
        };

        // @ts-ignore
        window.payhere.onCompleted = async function onCompleted() {
          alert("Payment completed successfully! You are now enrolled. Refreshing page...");
          // In real prod, webhook handles it, but we might want to manually poll or refresh
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        };

        // @ts-ignore
        window.payhere.onDismissed = function onDismissed() {
          console.log("Payment dismissed");
        };

        // @ts-ignore
        window.payhere.onError = function onError(errorMsg: string) {
          alert("Payment Error: " + errorMsg);
        };

        // @ts-ignore
        window.payhere.startPayment(payment);

      } catch (error: any) {
        alert(error.response?.data?.message || error.message || 'Failed to initialize payment');
      }
    }
  };

  const markModuleComplete = async () => {
    if (!activeModule || !enrollment) return;
    try {
      const res = await api.post(`/learning/enrollments/${enrollment.id}/modules/${activeModule.id}/complete`);
      setEnrollment(res.data);
    } catch (error) {
      console.error('Failed to mark module as complete:', error);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setModuleError('');
    setModuleSuccess('');
    if (!moduleForm.title.trim()) {
      setModuleError('Module title is required.');
      return;
    }
    setAddingModule(true);
    try {
      const payload: any = {
        title: moduleForm.title.trim(),
        description: moduleForm.description.trim() || undefined,
        videoUrl: moduleForm.videoUrl.trim() || undefined,
        notesUrl: moduleForm.notesUrl.trim() || undefined,
        order: moduleForm.order !== '' ? Number(moduleForm.order) : undefined,
      };
      await api.post(`/learning/courses/${courseId}/modules`, payload);
      setModuleSuccess('Module added successfully!');
      setModuleForm({ title: '', description: '', videoUrl: '', notesUrl: '', order: '' });
      await fetchCourseDetails(); // refresh list
      setTimeout(() => setModuleSuccess(''), 3000);
    } catch (err: any) {
      setModuleError(err.response?.data?.message || 'Failed to add module');
    } finally {
      setAddingModule(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 bg-background flex flex-col items-center justify-center text-center">
        <div className="glass p-8 rounded-3xl border border-red-500/20 max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-400">Failed to Load Course</h2>
          <p className="text-foreground/60 text-sm mb-6">{error}</p>
          <Button onClick={loadData} className="w-full gap-2 font-bold">
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 bg-background flex items-center justify-center">
        <h2 className="text-2xl font-bold">Course not found</h2>
      </div>
    );
  }

  const activeModule = course.modules?.[activeModuleIndex];
  const completedModuleIds = new Set(
    enrollment?.moduleProgress?.filter((mp: any) => mp.completed).map((mp: any) => mp.moduleId) || []
  );
  const isModuleCompleted = activeModule && completedModuleIds.has(activeModule.id);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background selection:bg-accent/30">
      <Script src="https://www.payhere.lk/lib/payhere.js" strategy="afterInteractive" />
      <div className="max-w-7xl mx-auto">

        <Link href="/learning" className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent transition-colors mb-6 text-sm font-bold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>

        {/* Instructor/Admin Badge */}
        {canManage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border rounded-2xl px-5 py-3 ${isAdmin && !isInstructor ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}
          >
            <div className="flex items-center gap-3">
              <Crown className={`w-5 h-5 shrink-0 ${isAdmin && !isInstructor ? 'text-red-400' : 'text-amber-400'}`} />
              <div>
                <p className={`text-sm font-bold ${isAdmin && !isInstructor ? 'text-red-400' : 'text-amber-400'}`}>
                  {isAdmin && !isInstructor ? 'Admin Access: You can manage this course' : 'You are the instructor of this course'}
                </p>
                <p className={`text-xs ${isAdmin && !isInstructor ? 'text-red-400/70' : 'text-amber-400/70'}`}>Use the panel below to manage modules or delete the course.</p>
              </div>
            </div>
            <button 
              onClick={handleDeleteCourse}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors shrink-0"
            >
               <Trash2 className="w-4 h-4" /> Delete Course
            </button>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-[1fr_350px] gap-8">

          {/* Main Content */}
          <div className="space-y-6">
            <div className="glass rounded-3xl overflow-hidden border border-white/10 flex flex-col">
              {/* Video Player */}
              <div className="aspect-video bg-black/50 relative flex items-center justify-center">
                {isEnrolled || isInstructor ? (
                  activeModule ? (
                    activeModule.videoUrl ? (
                      <video src={activeModule.videoUrl} controls className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-foreground/60 p-6">
                        <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No video available for this module.</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center text-foreground/60 p-6">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>This course doesn't have any modules yet.</p>
                    </div>
                  )
                ) : (
                  <div className="text-center p-8 absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center z-10">
                    <Lock className="w-16 h-16 text-accent mb-6" />
                    <h3 className="text-2xl font-bold mb-2">Enroll to Unlock</h3>
                    <p className="text-foreground/60 max-w-sm mb-6">Get full access to all video lessons, resources, and community discussions.</p>
                    <Button onClick={handleEnroll} size="lg" className="rounded-xl px-8 shadow-lg shadow-accent/20">
                      Enroll for {course.price > 0 ? `$${course.price}` : 'Free'}
                    </Button>
                  </div>
                )}
              </div>

                <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="uppercase tracking-wider text-[10px] font-bold px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/20">
                    {course.level}
                  </span>
                  <span className="text-xs text-foreground/40 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {course.modules?.length || 0} Modules
                  </span>
                </div>

                <h1 className="text-3xl font-bold mb-4">{activeModule ? activeModule.title : course.title}</h1>
                <p className="text-foreground/70 text-lg leading-relaxed mb-6">
                  {activeModule ? activeModule.description : course.description}
                </p>

                {/* Notes PDF download */}
                {activeModule?.notesUrl && (
                  <motion.a
                    href={activeModule.notesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2.5 mb-6 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    Download Notes (PDF)
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </motion.a>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-white/5">
                  <Link href={`/profile/${course.instructor?.id || course.instructorId}`}>
                    <div className="flex items-center gap-4 group/instructor cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-accent/15 overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg text-accent border border-accent/20 group-hover/instructor:border-accent/40 transition-all">
                        {course.instructor?.avatar
                          ? <img src={course.instructor.avatar} alt="Instructor" className="w-full h-full object-cover" />
                          : (course.instructor?.firstName?.[0] || '?')
                        }
                      </div>
                      <div>
                        <div className="text-xs text-foreground/40 font-bold uppercase tracking-wider mb-1">Instructor</div>
                        <div className="font-bold text-lg group-hover/instructor:text-accent transition-colors">{course.instructor?.firstName} {course.instructor?.lastName}</div>
                      </div>
                    </div>
                  </Link>

                  {isEnrolled && activeModule && (
                    <Button
                      onClick={markModuleComplete}
                      disabled={isModuleCompleted}
                      variant={isModuleCompleted ? 'outline' : 'primary'}
                      className={`gap-2 rounded-xl ${isModuleCompleted ? 'opacity-50 cursor-not-allowed border-green-500/50 text-green-500 bg-green-500/10 hover:bg-green-500/10 hover:text-green-500' : ''}`}
                    >
                      {isModuleCompleted ? (
                        <><CheckCircle className="w-4 h-4" /> Completed</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Mark as Complete</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Add Module Panel (Instructor/Admin Only) ── */}
            {canManage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl border border-amber-500/25 overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setShowAddModule(!showAddModule)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-amber-400">Add Course Module</p>
                      <p className="text-xs text-foreground/50">Add a new lesson or section to your course</p>
                    </div>
                  </div>
                  {showAddModule
                    ? <ChevronUp className="w-5 h-5 text-foreground/40" />
                    : <ChevronDown className="w-5 h-5 text-foreground/40" />
                  }
                </button>

                {/* Form */}
                <AnimatePresence>
                  {showAddModule && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-white/8"
                    >
                      <form onSubmit={handleAddModule} className="p-6 space-y-5">

                        {/* Title */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">
                            <BookOpen className="w-3.5 h-3.5" /> Module Title *
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. Introduction to Next.js"
                            value={moduleForm.title}
                            onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/60 transition-colors placeholder:text-foreground/30"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">
                            <AlignLeft className="w-3.5 h-3.5" /> Description
                          </label>
                          <textarea
                            placeholder="What will students learn in this module?"
                            value={moduleForm.description}
                            onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })}
                            rows={3}
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/60 transition-colors resize-none placeholder:text-foreground/30"
                          />
                        </div>

                        {/* Video URL + Notes PDF + Order */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">
                              <Film className="w-3.5 h-3.5" /> Video URL
                            </label>
                            <input
                              type="url"
                              placeholder="https://..."
                              value={moduleForm.videoUrl}
                              onChange={e => setModuleForm({ ...moduleForm, videoUrl: e.target.value })}
                              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/60 transition-colors placeholder:text-foreground/30"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">
                              <Hash className="w-3.5 h-3.5" /> Order (optional)
                            </label>
                            <input
                              type="number"
                              min="0"
                              placeholder={`Auto (${course.modules?.length || 0})`}
                              value={moduleForm.order}
                              onChange={e => setModuleForm({ ...moduleForm, order: e.target.value })}
                              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/60 transition-colors placeholder:text-foreground/30"
                            />
                          </div>
                        </div>

                        {/* Notes PDF URL — full width */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2">
                            <FileText className="w-3.5 h-3.5" /> Notes PDF URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://... (link to PDF notes)"
                            value={moduleForm.notesUrl}
                            onChange={e => setModuleForm({ ...moduleForm, notesUrl: e.target.value })}
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/60 transition-colors placeholder:text-foreground/30"
                          />
                          <p className="text-xs text-foreground/30 mt-1.5 ml-1">Paste a direct link to a Google Drive PDF, Dropbox, or any public PDF URL</p>
                        </div>

                        {/* Feedback */}
                        <AnimatePresence>
                          {moduleError && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3"
                            >
                              <X className="w-4 h-4 shrink-0" /> {moduleError}
                            </motion.div>
                          )}
                          {moduleSuccess && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3"
                            >
                              <CheckCircle className="w-4 h-4 shrink-0" /> {moduleSuccess}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => { setShowAddModule(false); setModuleError(''); setModuleSuccess(''); }}
                            className="flex-1 bg-background border border-white/10 rounded-xl py-3 text-sm font-bold hover:border-white/20 transition-colors"
                          >
                            Cancel
                          </button>
                          <motion.button
                            whileHover={{ scale: addingModule ? 1 : 1.02 }}
                            whileTap={{ scale: addingModule ? 1 : 0.98 }}
                            type="submit"
                            disabled={addingModule}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold rounded-xl py-3 text-sm transition-all disabled:opacity-60 shadow-lg shadow-amber-500/20"
                          >
                            {addingModule ? (
                              <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Adding...</>
                            ) : (
                              <><Save className="w-4 h-4" /> Add Module</>
                            )}
                          </motion.button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-3xl sticky top-24 border border-white/10 shadow-xl">

              {isEnrolled && enrollment && (
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold">Course Progress</span>
                    <span className="text-xs font-bold text-accent">{enrollment.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-500 ease-out"
                      style={{ width: `${enrollment.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}

              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" /> Course Content
              </h3>

              <div className="space-y-3">
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((module: any, idx: number) => (
                    <motion.button
                      key={module.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => (isEnrolled || canManage) && setActiveModuleIndex(idx)}
                      disabled={!isEnrolled && !canManage}
                      className={`
                        w-full text-left p-4 rounded-xl flex items-start gap-4 transition-all
                        ${(!isEnrolled && !canManage) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        ${activeModuleIndex === idx
                          ? 'bg-accent/10 border border-accent/20'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'}
                      `}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isEnrolled || canManage ? (
                          completedModuleIds.has(module.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <PlayCircle className={`w-5 h-5 ${activeModuleIndex === idx ? 'text-accent' : 'text-foreground/40'}`} />
                          )
                        ) : (
                          <Lock className="w-5 h-5 text-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold ${activeModuleIndex === idx ? 'text-accent' : ''}`}>
                          {idx + 1}. {module.title}
                        </h4>
                        {module.description && (
                          <p className="text-xs text-foreground/50 mt-1 line-clamp-1">{module.description}</p>
                        )}
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="text-center py-8 text-foreground/40 text-sm">
                    {canManage
                      ? <><GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>No modules yet.</p><p className="mt-1">Use the panel to add your first module.</p></>
                      : 'No modules published yet.'
                    }
                  </div>
                )}
              </div>

              {/* Quick-add shortcut for instructors when sidebar is empty */}
              {canManage && (
                <button
                  onClick={() => setShowAddModule(true)}
                  className="mt-4 w-full flex items-center justify-center gap-2 border border-dashed border-amber-500/30 hover:border-amber-500/60 text-amber-400/70 hover:text-amber-400 rounded-xl py-3 text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Module
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
