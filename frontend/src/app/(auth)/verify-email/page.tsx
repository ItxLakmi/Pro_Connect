'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
          <Card className="p-8 md:p-10 flex flex-col items-center text-center max-w-md w-full">
            <Loader2 className="w-16 h-16 text-accent animate-spin mb-4" />
            <h1 className="text-2xl font-bold">Verifying...</h1>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.data.message || 'Your email has been successfully verified.');
      } catch (error) {
        const err = error as any;
        console.error('Verification error:', err);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to verify email. The link may have expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] animate-glow" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 md:p-10 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-secondary rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ProConnect</span>
          </Link>

          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <Loader2 className="w-16 h-16 text-accent animate-spin mb-4" />
              <h1 className="text-2xl font-bold">Verifying...</h1>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
              <p className="text-foreground/70 mb-8">{message}</p>
              <Link href="/jobs" className="w-full">
                <Button className="w-full">Continue to Dashboard</Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
              <p className="text-foreground/70 mb-8">{message}</p>
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">Go to Login</Button>
              </Link>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
