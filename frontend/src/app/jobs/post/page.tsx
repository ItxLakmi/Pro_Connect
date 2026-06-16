'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  FileText, 
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LocationCombobox } from '@/components/ui/LocationCombobox';
import api from '@/lib/api';

const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide a more detailed description'),
  location: z.string().min(2, 'Location is required'),
  salaryRange: z.string().optional(),
  type: z.string().min(1, 'Job type is required'),
});

type JobForm = z.infer<typeof jobSchema>;

export default function PostJobPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      type: 'Full-time',
    },
  });

  const onSubmit = async (data: JobForm) => {
    try {
      await api.post('/jobs', data);
      setSuccess(true);
      setTimeout(() => router.push('/jobs'), 2000);
    } catch (error: any) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-3xl font-bold">Job Posted Successfully!</h1>
          <p className="text-foreground/60">Redirecting you to the job board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">Hire your next <span className="gradient-text">rockstar.</span></h1>
          <p className="text-foreground/60">Fill in the details below to reach thousands of top-tier professionals.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-visible">
          <Card className="p-8 space-y-6">
            <div className="grid gap-6">
              <Input
                label="Job Title"
                placeholder="Senior Full Stack Developer"
                {...register('title')}
                error={errors.title?.message}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/70 ml-1">Job Type</label>
                  <select 
                    {...register('type')}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-accent/50 transition-all appearance-none cursor-pointer relative z-10"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                  {errors.type?.message && <p className="text-xs text-red-400 mt-1">{errors.type.message}</p>}
                </div>

                <LocationCombobox
                  label="Location"
                  placeholder="Select or type a location..."
                  {...register('location')}
                  error={errors.location?.message}
                />
              </div>

              <Input
                label="Salary Range (Optional)"
                placeholder="$4,000 - $6,000 / month"
                {...register('salaryRange')}
                error={errors.salaryRange?.message}
              />

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/70 ml-1">Job Description</label>
                <textarea 
                  {...register('description')}
                  placeholder="Describe the role, requirements, and benefits..."
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-accent/50 transition-all resize-none"
                />
                {errors.description?.message && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
              <div className="text-sm text-foreground/40">
                Post will be live for 30 days.
              </div>
              <Button type="submit" isLoading={isSubmitting} className="px-10">
                Post Job Now
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
