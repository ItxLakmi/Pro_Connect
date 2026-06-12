'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardPath, UserRole } from '@/lib/roles';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Allow access if current role OR originalRole is in the allowed list.
  // This lets admin users preview other roles while still accessing /admin.
  const hasAccess = (u: typeof user) => {
    if (!u) return false;
    if (allowedRoles.includes(u.role as UserRole)) return true;
    if (u.originalRole && allowedRoles.includes(u.originalRole as UserRole)) return true;
    return false;
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!hasAccess(user)) {
      router.replace(getDashboardPath(user.role));
    }
  }, [allowedRoles, isLoading, router, user]);

  if (isLoading || !user || !hasAccess(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-foreground/60">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm font-medium">Checking access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
