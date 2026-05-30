'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, Play, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import api from '@/lib/api';

export default function LearningPathPage() {
  const params = useParams();
  const pathId = params.id as string;
  
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPathDetails();
  }, [pathId]);

  const fetchPathDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/learning/paths/${pathId}`);
      setPath(res.data);
    } catch (error) {
      console.error('Error fetching learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 bg-background flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Learning Path not found</h2>
        <Link href="/learning">
          <Button variant="outline">Back to Learning Hub</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background selection:bg-accent/30">
      <div className="max-w-4xl mx-auto">
        <Link href="/learning" className="inline-flex items-center gap-2 text-foreground/60 hover:text-accent transition-colors mb-8 text-sm font-bold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back to learning hub
        </Link>

        {/* Path Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="uppercase tracking-wider text-[10px] font-bold px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/20">
              {path.skillTag}
            </span>
            <span className="text-xs text-foreground/40 font-medium flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> {path.courses?.length || 0} Courses
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            {path.title}
          </h1>
          <p className="text-foreground/70 text-lg md:text-xl max-w-3xl leading-relaxed">
            {path.description}
          </p>
        </div>

        {/* Courses Timeline */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {path.courses?.map((pc: any, idx: number) => {
            const course = pc.course;
            return (
              <div key={pc.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline Node */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-accent text-background font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_rgba(255,255,255,0.05)] z-10">
                  {idx + 1}
                </div>

                {/* Course Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass p-6 rounded-3xl border border-white/10 hover:border-accent/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-accent">
                      {course.level}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-sm text-foreground/60 mb-6 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden shrink-0">
                        {course.instructor?.avatar && (
                          <img src={course.instructor.avatar} alt="Instructor" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-foreground/80">
                        {course.instructor?.firstName} {course.instructor?.lastName}
                      </span>
                    </div>
                    <Link href={`/learning/${course.id}`}>
                      <Button size="sm" variant="glass" className="bg-white/5 hover:bg-white/10 gap-2">
                        Start <Play className="w-3 h-3 fill-current" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion CTA */}
        <div className="mt-20 text-center glass p-12 rounded-3xl border border-accent/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 opacity-50" />
          <GraduationCap className="w-16 h-16 text-accent mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" />
          <h2 className="text-3xl font-bold mb-4">Complete the Path</h2>
          <p className="text-foreground/60 max-w-lg mx-auto mb-8">
            Finish all courses in this learning path to master {path.skillTag} and prepare yourself for the certification test.
          </p>
          <Link href="/learning/skill-tests">
            <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-accent/20 gap-2">
              Get Certified <GraduationCap className="w-5 h-5" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
