'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Play, 
  BookOpen, 
  Clock, 
  DollarSign, 
  Star,
  ChevronRight,
  GraduationCap,
  Map
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function LearningPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [res, pathsRes] = await Promise.all([
        api.get('/learning/courses'),
        api.get('/learning/paths').catch(() => ({ data: [] }))
      ]);
      setLearningPaths(pathsRes.data);
      // For MVP, if search is typed, we just filter client side
      if (search) {
        setCourses(res.data.filter((c: any) => c.title.toLowerCase().includes(search.toLowerCase())));
      } else {
        setCourses(res.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await api.post(`/learning/enroll`, { courseId });
      alert('Successfully enrolled!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to enroll');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background selection:bg-accent/30">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Upskill for the <span className="gradient-text">Future.</span>
          </h1>
          <p className="text-foreground/60 text-lg max-w-2xl">
            Learn from top industry experts. Gain new skills, verify your knowledge, and boost your professional profile.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="glass p-2 rounded-2xl mb-12 flex flex-col md:flex-row items-center gap-2 max-w-3xl">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input 
              type="text"
              placeholder="Search for courses, skills, or topics"
              className="w-full h-14 bg-transparent pl-12 pr-4 text-sm focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full md:w-auto h-14 px-8 rounded-xl">
            Search
          </Button>
        </form>

        <div className="grid lg:grid-cols-[1fr_300px] gap-12">
          {/* Course List & Learning Paths */}
          <div className="space-y-12">
            
            {/* Learning Paths Section */}
            {!loading && learningPaths.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                  <Map className="w-6 h-6 text-accent" /> Skill-based Learning Paths
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {learningPaths.map((path) => (
                    <Link key={path.id} href={`/learning/paths/${path.id}`} className="block">
                      <div className="glass p-6 rounded-3xl border border-white/10 hover:border-accent/30 transition-all group h-full flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                            <Map className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full text-foreground/60">
                            {path.courses?.length || 0} Courses
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{path.title}</h3>
                        <p className="text-sm text-foreground/60 mb-4 line-clamp-2">{path.description}</p>
                        <div className="mt-auto flex items-center gap-2 text-accent text-sm font-bold">
                          View Path <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <GraduationCap className="w-6 h-6 text-accent" /> Recommended Courses
              </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 rounded-3xl glass animate-pulse" />
                ))
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <div 
                    key={course.id}
                    className="glass rounded-3xl overflow-hidden hover:border-accent/30 transition-all group flex flex-col"
                  >
                    <div className="h-32 bg-white/5 relative overflow-hidden flex items-center justify-center">
                       <BookOpen className="w-12 h-12 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                       <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                         {course.level}
                       </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/learning/${course.id}`}>
                          <h3 className="text-xl font-bold group-hover:text-accent transition-colors line-clamp-2">
                            {course.title}
                          </h3>
                        </Link>
                      </div>
                      <p className="text-sm text-foreground/60 line-clamp-2 mb-4">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden shrink-0">
                           {course.instructor?.avatar && (
                             <img src={course.instructor.avatar} alt="Instructor" className="w-full h-full object-cover" />
                           )}
                        </div>
                        <span className="text-xs font-medium text-foreground/80">
                          {course.instructor?.firstName} {course.instructor?.lastName}
                        </span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="font-bold text-lg">
                          {course.price > 0 ? `$${course.price}` : 'Free'}
                        </div>
                        <Button 
                          size="sm" 
                          variant="glass" 
                          className="bg-accent/10 hover:bg-accent hover:text-white border-accent/20 gap-2"
                          onClick={() => handleEnroll(course.id)}
                        >
                          Enroll <Play className="w-3 h-3 fill-current" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-20 glass rounded-3xl">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-foreground/20" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No courses found</h3>
                  <p className="text-foreground/40">Check back later for new content.</p>
                </div>
              )}
            </div>
          </div>
            </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* My Learning CTA */}
            <Link href="/learning/my-courses" className="block">
              <div className="bg-gradient-to-br from-accent/20 to-accent-secondary/20 p-6 rounded-3xl border border-accent/20 relative overflow-hidden group cursor-pointer hover:border-accent/40 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/30 transition-all" />
                <GraduationCap className="w-8 h-8 text-accent mb-4" />
                <h4 className="text-lg font-bold mb-2">My Learning</h4>
                <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
                  Track your enrolled courses, view progress, and see all earned skill badges.
                </p>
                <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 transition-all gap-2">
                  View Dashboard <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Link>

            {/* Teach CTA */}
            <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all" />
              <Star className="w-8 h-8 text-accent mb-4" fill="currentColor" />
              <h4 className="text-lg font-bold mb-2">Teach on ProConnect</h4>
              <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
                Share your expertise with our global network of professionals and start earning today.
              </p>
              <Link href="/learning/create">
                <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                  Become an Instructor
                </Button>
              </Link>
            </div>

            {/* Skill Verification CTA */}
            <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all" />
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6 text-foreground" />
              </div>
              <h4 className="text-lg font-bold mb-2">Skill Verification</h4>
              <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
                Take skill tests to earn verified badges and stand out to top recruiters and clients.
              </p>
              <Link href="/learning/skill-tests">
                <Button variant="glass" className="w-full gap-2 group-hover:bg-white/10 transition-all">
                  Take a Test <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
