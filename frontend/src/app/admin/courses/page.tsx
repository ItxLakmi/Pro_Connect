"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Search, PlayCircle, BarChart, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number | null;
  level: string;
  status: string;
  instructor: { firstName: string | null; lastName: string | null };
}

export default function CoursesApprovalPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:3001/admin/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
        // Fallback for demonstration
        setCourses([
          {
            id: "c1",
            title: "Advanced React Patterns",
            description: "Master modern React with hooks, context, and performance optimization techniques.",
            price: 49.99,
            level: "ADVANCED",
            status: "PENDING",
            instructor: { firstName: "Sarah", lastName: "Connor" },
          },
          {
            id: "c2",
            title: "Introduction to UI/UX Design",
            description: "Learn the fundamentals of user interface and experience design.",
            price: 0,
            level: "BEGINNER",
            status: "APPROVED",
            instructor: { firstName: "John", lastName: "Design" },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    setUpdatingId(courseId);
    try {
      await axios.patch(`http://localhost:3001/admin/courses/${courseId}/status`, { status: newStatus });
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, status: newStatus } : c)));
    } catch (error) {
      console.error("Failed to update status", error);
      // Optimistic update for demo
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, status: newStatus } : c)));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Course Approvals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Ensure high-quality educational content by reviewing courses.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            className="pl-10 pr-4 py-2 w-full md:w-64 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No courses found matching "{searchTerm}"
          </div>
        ) : (
          filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              {/* Course Header/Thumbnail Mock */}
              <div className="h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-900/40 dark:to-purple-900/40 relative flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
                <PlayCircle className="w-12 h-12 text-blue-500/50 dark:text-blue-400/50" />
                <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full ${
                    course.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' :
                    course.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                  }`}>
                  {course.status}
                </span>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex flex-wrap gap-3 mb-4 mt-auto">
                  <span className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    <BarChart className="w-3 h-3 mr-1" /> {course.level}
                  </span>
                  <span className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                    <DollarSign className="w-3 h-3 mr-0.5" /> {course.price === 0 || !course.price ? 'Free' : course.price}
                  </span>
                </div>
                
                <p className="text-xs text-gray-400 pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
                  Instructor: <span className="font-medium text-gray-700 dark:text-gray-300">{course.instructor.firstName} {course.instructor.lastName}</span>
                </p>
                
                <div className="flex items-center gap-2 mt-auto">
                  {updatingId === course.id ? (
                    <div className="w-full flex justify-center py-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      {course.status !== 'APPROVED' && (
                        <button 
                          onClick={() => handleStatusChange(course.id, 'APPROVED')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                      )}
                      {course.status !== 'REJECTED' && (
                        <button 
                          onClick={() => handleStatusChange(course.id, 'REJECTED')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:text-rose-400 rounded-lg text-sm font-medium transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
