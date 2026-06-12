export type UserRole =
  | 'PROFESSIONAL'
  | 'RECRUITER'
  | 'FREELANCER'
  | 'STARTUP_FOUNDER'
  | 'INVESTOR'
  | 'ADMIN'
  | 'PARTNER'
  | 'MENTOR';

export const ROLE_LABELS: Record<UserRole, string> = {
  PROFESSIONAL: 'Professional',
  RECRUITER: 'Recruiter',
  FREELANCER: 'Freelancer',
  STARTUP_FOUNDER: 'Startup Founder',
  INVESTOR: 'Investor',
  ADMIN: 'Admin',
  PARTNER: 'Partner',
  MENTOR: 'Mentor',
};

export const SWITCHABLE_ROLES: UserRole[] = [
  'PROFESSIONAL',
  'RECRUITER',
  'FREELANCER',
  'STARTUP_FOUNDER',
  'INVESTOR',
];

export function getDashboardPath(role?: string | null) {
  switch (role) {
    case 'RECRUITER':
      return '/recruiter';
    case 'FREELANCER':
      return '/marketplace';
    case 'STARTUP_FOUNDER':
      return '/investors/create-startup';
    case 'INVESTOR':
      return '/investors';
    case 'ADMIN':
      return '/admin';
    case 'MENTOR':
    case 'PARTNER':
      return '/learning';
    case 'PROFESSIONAL':
    default:
      return '/feed';
  }
}
