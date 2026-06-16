"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { CheckCircle, XCircle, Search, PlayCircle, BarChart, DollarSign, Eye, X, GraduationCap, Plus } from "lucide-react";
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

interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const COURSE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export default function CoursesApprovalPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Add Course modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    price: 0,
    level: "BEGINNER",
    instructorId: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/admin/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const openAddModal = async () => {
    setShowAddModal(true);
    if (users.length === 0) {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data);
        if (res.data.length > 0) {
          setNewCourse((prev) => ({ ...prev, instructorId: res.data[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const payload = { ...newCourse, price: Number(newCourse.price) };
      const res = await api.post("/admin/courses", payload);
      setCourses((prev) => [res.data, ...prev]);
      setShowAddModal(false);
      setNewCourse({ title: "", description: "", price: 0, level: "BEGINNER", instructorId: users[0]?.id ?? "" });
    } catch (error) {
      console.error("Failed to create course", error);
    } finally {
      setAddLoading(false);
    }
  };

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    setUpdatingId(courseId);
    try {
      await api.patch(`/admin/courses/${courseId}/status`, { status: newStatus });
      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, status: newStatus } : c)));
    } catch (error) {
      console.error("Failed to update status", error);
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

        <div className="flex items-center gap-3">
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
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No courses found{searchTerm ? ` matching "${searchTerm}"` : " yet."}
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
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors w-full"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" /> Add New Course
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setNewCourse({ title: "", description: "", price: 0, level: "BEGINNER", instructorId: users[0]?.id ?? "" }); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack Web Development"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="What will students learn..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0 for free"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse((p) => ({ ...p, level: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                  >
                    {COURSE_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor</label>
                <select
                  required
                  value={newCourse.instructorId}
                  onChange={(e) => setNewCourse((p) => ({ ...p, instructorId: e.target.value }))}
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
                  onClick={() => { setShowAddModal(false); setNewCourse({ title: "", description: "", price: 0, level: "BEGINNER", instructorId: users[0]?.id ?? "" }); }}
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
                  {addLoading ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Course Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" /> Course Details
              </h2>
              <button onClick={() => setSelectedCourse(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedCourse.title}</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    selectedCourse.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    selectedCourse.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {selectedCourse.status}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    <BarChart className="w-4 h-4" /> {selectedCourse.level}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded font-semibold">
                    <DollarSign className="w-4 h-4" /> {selectedCourse.price === 0 || !selectedCourse.price ? 'Free' : selectedCourse.price}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Instructor</p>
                  <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                    {selectedCourse.instructor.firstName} {selectedCourse.instructor.lastName}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                   <p className="text-sm text-gray-500 italic">No additional media uploaded.</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Description</p>
                <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  {selectedCourse.description || "No description provided."}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Course ID</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-mono text-xs">
                  {selectedCourse.id}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
              <button
                onClick={() => setSelectedCourse(null)}
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
