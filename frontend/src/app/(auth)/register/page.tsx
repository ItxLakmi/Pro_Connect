'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  User, 
  Briefcase, 
  Code, 
  Rocket, 
  CircleDollarSign,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardPath } from '@/lib/roles';

const roles = [
  { id: 'PROFESSIONAL', title: 'Professional', icon: <User className="w-5 h-5" />, desc: 'Looking for a job or networking.' },
  { id: 'RECRUITER', title: 'Recruiter', icon: <Briefcase className="w-5 h-5" />, desc: 'Hiring talent for a company.' },
  { id: 'FREELANCER', title: 'Freelancer', icon: <Code className="w-5 h-5" />, desc: 'Working on project-based tasks.' },
  { id: 'STARTUP_FOUNDER', title: 'Startup Founder', icon: <Rocket className="w-5 h-5" />, desc: 'Seeking talent or investment.' },
  { id: 'INVESTOR', title: 'Investor', icon: <CircleDollarSign className="w-5 h-5" />, desc: 'Looking to fund startups.' },
];

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('PROFESSIONAL');

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'PROFESSIONAL',
    },
  });

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await api.post('/auth/register', data);
      const { access_token, user } = response.data;

      // Store token and user info using the auth hook
      login(access_token, user);

      // Show alert about email verification
      alert('Registration successful! Please check your email to verify your account.');

      router.push(getDashboardPath(user.role || data.role));
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      
      if (message === 'Email already exists') {
        setError('email', { type: 'manual', message: 'This email is already registered.' });
      } else {
        alert(message || 'Failed to register. Please try again.');
      }
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setValue('role', roleId);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] animate-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-secondary/20 rounded-full blur-[120px] animate-glow" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-secondary rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">ProConnect</span>
            </Link>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-1.5 w-8 rounded-full transition-all ${step === 1 ? 'bg-accent' : 'bg-white/10'}`} />
              <div className={`h-1.5 w-8 rounded-full transition-all ${step === 2 ? 'bg-accent' : 'bg-white/10'}`} />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <p className="text-center text-foreground/50 text-sm mb-4">Choose your role on ProConnect</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`
                          cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-4
                          ${selectedRole === role.id 
                            ? 'bg-accent/10 border-accent' 
                            : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'}
                        `}
                      >
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center
                          ${selectedRole === role.id ? 'bg-accent text-white' : 'bg-white/10 text-foreground/70'}
                        `}>
                          {role.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm">{role.title}</h3>
                          <p className="text-xs text-foreground/50">{role.desc}</p>
                        </div>
                        {selectedRole === role.id && (
                          <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button type="button" onClick={nextStep} className="w-full gap-2">
                    Next Step <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First name"
                      placeholder="John"
                      {...register('firstName')}
                      error={errors.firstName?.message}
                    />
                    <Input
                      label="Last name"
                      placeholder="Doe"
                      {...register('lastName')}
                      error={errors.lastName?.message}
                    />
                  </div>
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    error={errors.password?.message}
                  />
                  
                  <div className="flex gap-4">
                    <Button variant="glass" type="button" onClick={prevStep} className="flex-1 gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button type="submit" className="flex-[2]" isLoading={isSubmitting}>
                      Complete Registration
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="mt-8 text-center text-sm text-foreground/50">
            Already have an account?{' '}
            <Link href="/login" className="text-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
