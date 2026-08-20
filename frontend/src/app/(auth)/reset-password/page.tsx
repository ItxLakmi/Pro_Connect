'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
          <Card className="p-8 md:p-10 text-center max-w-md w-full">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </Card>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      alert('Invalid or missing reset token.');
      return;
    }
    
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password
      });
      setIsSuccess(true);
    } catch (error) {
      const err = error as any;
      console.error('Error:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    }
  };

  if (!token) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        <Card className="p-8 md:p-10 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Invalid Link</h1>
          <p className="text-foreground/70 mb-6">The password reset link is missing or invalid.</p>
          <Link href="/login"><Button className="w-full">Go to Login</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] animate-glow" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-secondary rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">ProConnect</span>
            </Link>
            <h1 className="text-2xl font-bold">Create New Password</h1>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Reset Password
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center space-y-6">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <h2 className="text-xl font-bold">Password Reset Successfully</h2>
              <p className="text-foreground/70">You can now use your new password to log in.</p>
              <Link href="/login" className="w-full">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
