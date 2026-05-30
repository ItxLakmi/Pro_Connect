'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, DollarSign, Layers, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    level: 'BEGINNER',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/learning/courses', {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        level: formData.level,
      });
      alert('Course created successfully!');
      router.push('/learning');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background selection:bg-accent/30">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Create a <span className="gradient-text">Course.</span>
          </h1>
          <p className="text-foreground/60 text-lg max-w-xl mx-auto">
            Share your expertise with thousands of professionals. Structure your knowledge, set a price, and start teaching.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 md:p-12 rounded-[2rem] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 block">Course Title</label>
              <input 
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Advanced React Patterns 2026"
                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all text-lg"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 block">Description</label>
              <textarea 
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="What will students learn in this course?"
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all resize-none text-base"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 block">Price ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <input 
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00 for free"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              {/* Level */}
              <div>
                <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 block">Difficulty Level</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 pointer-events-none" />
                  <select 
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-white/5">
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <CheckCircle className="w-5 h-5 text-accent" />
                Your course will be published immediately
              </div>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto h-14 px-8 rounded-xl font-bold text-lg">
                {loading ? 'Publishing...' : 'Publish Course'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
