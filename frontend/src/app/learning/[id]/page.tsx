'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PlayCircle, CheckCircle, BookOpen, Clock, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import api from '@/lib/api';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    checkEnrollment();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/learning/courses/${courseId}`);
      setCourse(res.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const res = await api.get('/learning/my-enrollments');
      const enroll = res.data.find((e: any) => e.courseId === courseId);
      if (enroll) {
        setEnrollment(enroll);
        setIsEnrolled(true);
      }
    } catch (error) {
      console.error('Error checking enrollment', error);
    }
  };

  const handleEnroll = async () => {
    try {
      await api.post(`/learning/enroll`, { courseId });
      setIsEnrolled(true);
      alert('Successfully enrolled!');
      checkEnrollment();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to enroll');
    }
  };

  const markModuleComplete = async () => {
    if (!activeModule || !enrollment) return;
    try {
      const res = await api.post(`/learning/enrollments/${enrollment.id}/modules/${activeModule.id}/complete`);
      setEnrollment(res.data);
      alert('Module marked as completed!');
    } catch (error) {
      console.error('Failed to mark module as complete:', error);
      alert('Failed to mark module as complete');
    }
  };

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
  const completedModuleIds = new Set(enrollment?.moduleProgress?.filter((mp: any) => mp.completed).map((mp: any) => mp.moduleId) || []);

  const isModuleCompleted = activeModule && completedModuleIds.has(activeModule.id);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background selection:bg-accent/30">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/learning" className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent transition-colors mb-6 text-sm font-bold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>

        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          
          {/* Main Content (Video Player & Details) */}
          <div className="space-y-8">
            <div className="glass rounded-3xl overflow-hidden border border-white/10 flex flex-col">
              {/* Video Player Area */}
              <div className="aspect-video bg-black/50 relative flex items-center justify-center">
                {isEnrolled ? (
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

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden shrink-0">
                      {course.instructor?.avatar && (
                        <img src={course.instructor.avatar} alt="Instructor" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-foreground/40 font-bold uppercase tracking-wider mb-1">Instructor</div>
                      <div className="font-bold text-lg">
                        {course.instructor?.firstName} {course.instructor?.lastName}
                      </div>
                    </div>
                  </div>
                  
                  {isEnrolled && activeModule && (
                    <Button 
                      onClick={markModuleComplete} 
                      disabled={isModuleCompleted}
                      variant={isModuleCompleted ? "outline" : "primary"}
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
          </div>

          {/* Course Modules Sidebar */}
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
                    <button 
                      key={module.id}
                      onClick={() => isEnrolled && setActiveModuleIndex(idx)}
                      disabled={!isEnrolled}
                      className={`
                        w-full text-left p-4 rounded-xl flex items-start gap-4 transition-all
                        ${!isEnrolled ? 'opacity-60 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}
                        ${activeModuleIndex === idx ? 'bg-accent/10 border border-accent/20' : 'bg-white/5 hover:bg-white/10 border border-transparent'}
                      `}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isEnrolled ? (
                          completedModuleIds.has(module.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <PlayCircle className={`w-5 h-5 ${activeModuleIndex === idx ? 'text-accent' : 'text-foreground/40'}`} />
                          )
                        ) : (
                          <Lock className="w-5 h-5 text-foreground/40" />
                        )}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${activeModuleIndex === idx ? 'text-accent' : ''}`}>
                          {idx + 1}. {module.title}
                        </h4>
                        {module.description && (
                          <p className="text-xs text-foreground/50 mt-1 line-clamp-1">{module.description}</p>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-foreground/40 text-sm">
                    No modules published yet.
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
