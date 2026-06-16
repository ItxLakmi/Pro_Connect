'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  User, MapPin, Link as LinkIcon, Calendar, Plus, Pencil,
  Briefcase, GraduationCap, Wrench, Terminal, Globe, ExternalLink,
  Award, X, Camera, Check, Star, FileText, Image as ImageIcon,
  Video, Trash2, Download, Phone, Mail, ChevronDown, ChevronUp, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { compressImage } from '@/lib/imageUtils';
import Navbar from '@/components/Navbar';

// ── Suggestion Data ────────────────────────────────────────────────────────
const UNIVERSITIES = [
  'SLIIT – Sri Lanka Institute of Information Technology', 'ICBT Campus',
  'University of Colombo', 'University of Peradeniya', 'University of Moratuwa',
  'University of Kelaniya', 'University of Sri Jayewardenepura',
  'Massachusetts Institute of Technology (MIT)', 'Stanford University',
  'Harvard University', 'University of Oxford', 'University of Cambridge',
  'Carnegie Mellon University', 'California Institute of Technology (Caltech)',
  'Imperial College London', 'ETH Zurich', 'National University of Singapore',
  'University of Toronto', 'University of Melbourne', 'Indian Institute of Technology (IIT)',
  'BITS Pilani', 'Nanyang Technological University',
];
const DEGREES = [
  'Bachelor of Science (BSc)', 'Bachelor of Science (Hons) Software Engineering',
  'Bachelor of Arts (BA)', 'Bachelor of Engineering (BEng)', 'Bachelor of Technology (BTech)',
  'Bachelor of Business Administration (BBA)', 'Master of Science (MSc)',
  'Master of Arts (MA)', 'Master of Business Administration (MBA)',
  'Master of Engineering (MEng)', 'Doctor of Philosophy (PhD)',
  'Higher National Diploma (HND)', 'Diploma', 'Professional Certificate',
];
const FIELDS_OF_STUDY = [
  'Computer Science', 'Information Technology', 'Software Engineering',
  'Data Science', 'Artificial Intelligence', 'Cybersecurity',
  'Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Business Administration', 'Finance',
  'Marketing', 'Human Resources', 'Accounting', 'Economics',
  'Psychology', 'Medicine', 'Law', 'Architecture',
  'Design', 'Mathematics', 'Statistics', 'Physics', 'Chemistry',
  'UX/UI Design', 'Media & Communications', 'Graphic Design',
];
const COMPANIES = [
  'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix',
  'Tesla', 'Uber', 'Airbnb', 'Spotify', 'Salesforce', 'Oracle',
  'SAP', 'IBM', 'Accenture', 'Deloitte', 'McKinsey & Company',
  'KPMG', 'PwC', 'Ernst & Young', 'Dialog Axiata', 'Mobitel',
  'Commercial Bank of Ceylon', 'Bank of Ceylon', 'Sampath Bank',
  'IFS', 'WSO2', '99x', 'hSenid', 'Virtusa', 'Pearson Lanka', 'Axiata Digital Labs',
];
const JOB_TITLES = [
  'Software Engineer', 'Senior Software Engineer', 'Lead Software Engineer',
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Mobile Developer (iOS/Android)', 'DevOps Engineer', 'Site Reliability Engineer',
  'Data Scientist', 'Data Analyst', 'Machine Learning Engineer',
  'AI Engineer', 'Cloud Architect', 'Solutions Architect',
  'Product Manager', 'Project Manager', 'Scrum Master',
  'UX Designer', 'UI Designer', 'Graphic Designer', 'QA Engineer',
  'Business Analyst', 'Security Engineer', 'Technical Lead',
  'Engineering Manager', 'CTO', 'VP of Engineering',
  'Marketing Manager', 'HR Manager', 'Recruiter', 'Financial Analyst',
  'Sales Executive', 'Customer Success Manager', 'Intern', 'QA Intern',
];
const LOCATIONS = [
  'Remote', 'Hybrid', 'Colombo, Sri Lanka', 'Kandy, Sri Lanka',
  'Galle, Sri Lanka', 'Jaffna, Sri Lanka',
  'San Francisco, CA, USA', 'New York, NY, USA', 'Seattle, WA, USA',
  'London, UK', 'Toronto, Canada', 'Sydney, Australia', 'Melbourne, Australia',
  'Bangalore, India', 'Mumbai, India', 'Delhi, India',
  'Singapore', 'Dubai, UAE', 'Berlin, Germany', 'Amsterdam, Netherlands',
  'Tokyo, Japan', 'Seoul, South Korea', 'Kuala Lumpur, Malaysia',
];
const HEADLINES = [
  'Software Engineering Undergraduate', 'Software Engineer at ProConnect',
  'Senior Full Stack Developer', 'Frontend Developer | React & TypeScript Specialist',
  'Backend Engineer | Node.js & Python', 'Data Scientist | Machine Learning & AI',
  'DevOps Engineer | Cloud & Infrastructure', 'UX/UI Designer | Figma & User Research',
  'Product Manager | Agile & Roadmap Strategy', 'Mobile Developer | React Native & Flutter',
  'Cybersecurity Analyst | Penetration Testing', 'QA Engineer | Manual & Automation Testing',
  'Machine Learning Engineer | Deep Learning', 'Solutions Architect | AWS & Azure',
  'Business Analyst | Digital Transformation', 'Freelance Developer | Open to Projects',
  'Tech Lead | Building Scalable Systems', 'Student | Computer Science',
  'Recent Graduate | Seeking Opportunities',
];
const SKILLS_LIST = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby',
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Node.js', 'Express.js', 'NestJS',
  'Django', 'FastAPI', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails',
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Prisma', 'GraphQL', 'REST API',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
  'Git', 'GitHub', 'Linux', 'Nginx', 'Figma', 'Adobe XD',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Analysis',
  'Pandas', 'NumPy', 'SQL', 'Power BI', 'Tableau',
  'Agile', 'Scrum', 'Jira', 'Project Management', 'Leadership',
  'Manual Testing', 'Selenium', 'Jest', 'Cypress',
  'Communication', 'Problem Solving', 'Team Collaboration',
  'SEO', 'Digital Marketing', 'Content Writing', 'UX Research',
];

const SKILL_COLORS = [
  'from-blue-500 to-blue-700', 'from-violet-500 to-violet-700',
  'from-emerald-500 to-emerald-700', 'from-orange-500 to-orange-700',
  'from-pink-500 to-pink-700', 'from-cyan-500 to-cyan-700',
  'from-amber-500 to-amber-700', 'from-red-500 to-red-700',
];

// ── Modal ──────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative glass rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-foreground/60 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Resume Print Layout ────────────────────────────────────────────────────
function ResumeDocument({ user, profile, badges }: { user: any; profile: any; badges: any[] }) {
  return (
    <div id="resume-document" style={{ display: 'none' }}>
      <style>{`
        @media print {
          body > *:not(#resume-print-root) { display: none !important; }
          #resume-print-root { display: block !important; }
          #resume-document { display: none !important; }
          @page { size: A4; margin: 18mm 16mm; }
        }
        #resume-print-root {
          display: none;
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #1a1a1a;
          line-height: 1.5;
        }
        #resume-print-root.printing { display: block !important; }
        .r-header { border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
        .r-name { font-size: 28px; font-weight: 800; color: #1e3a8a; margin: 0 0 4px; }
        .r-headline { font-size: 14px; color: #4b5563; margin: 0 0 8px; }
        .r-contact { font-size: 12px; color: #6b7280; display: flex; gap: 16px; flex-wrap: wrap; }
        .r-section { margin-bottom: 16px; }
        .r-section-title { font-size: 13px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #2563eb; border-bottom: 1px solid #bfdbfe;
          padding-bottom: 4px; margin-bottom: 10px; }
        .r-item { margin-bottom: 10px; }
        .r-item-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .r-item-title { font-size: 14px; font-weight: 700; color: #111827; }
        .r-item-sub { font-size: 13px; color: #2563eb; font-weight: 600; }
        .r-item-meta { font-size: 11px; color: #6b7280; }
        .r-item-desc { font-size: 12px; color: #4b5563; margin-top: 4px; }
        .r-skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .r-skill-pill { font-size: 11px; background: #eff6ff; color: #1d4ed8;
          border: 1px solid #bfdbfe; border-radius: 999px; padding: 2px 10px; font-weight: 600; }
        .r-badge { font-size: 11px; color: #92400e; background: #fef3c7;
          border: 1px solid #fde68a; border-radius: 4px; padding: 2px 8px; font-weight: 600; }
        .r-project { margin-bottom: 8px; }
        .r-project-title { font-size: 13px; font-weight: 700; }
        .r-project-link { font-size: 11px; color: #2563eb; }
      `}</style>
      <div id="resume-print-root">
        <div className="r-header">
          <p className="r-name">{user?.firstName} {user?.lastName}</p>
          <p className="r-headline">{profile?.headline || 'Software Professional'}</p>
          <div className="r-contact">
            {user?.email && <span>✉ {user.email}</span>}
            {profile?.location && <span>📍 {profile.location}</span>}
            {profile?.linkedinUrl && <span>🔗 {profile.linkedinUrl}</span>}
            {profile?.githubUrl && <span>💻 {profile.githubUrl}</span>}
            {profile?.websiteUrl && <span>🌐 {profile.websiteUrl}</span>}
          </div>
        </div>

        {profile?.bio && (
          <div className="r-section">
            <p className="r-section-title">Profile Summary</p>
            <p style={{ fontSize: '12px', color: '#4b5563' }}>{profile.bio}</p>
          </div>
        )}

        {profile?.experience?.length > 0 && (
          <div className="r-section">
            <p className="r-section-title">Work Experience</p>
            {profile.experience.map((exp: any) => (
              <div key={exp.id} className="r-item">
                <div className="r-item-header">
                  <span className="r-item-title">{exp.position}</span>
                  <span className="r-item-meta">
                    {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} –{' '}
                    {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                  </span>
                </div>
                <p className="r-item-sub">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                {exp.description && <p className="r-item-desc">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {profile?.education?.length > 0 && (
          <div className="r-section">
            <p className="r-section-title">Education</p>
            {profile.education.map((edu: any) => (
              <div key={edu.id} className="r-item">
                <div className="r-item-header">
                  <span className="r-item-title">{edu.school}</span>
                  <span className="r-item-meta">
                    {new Date(edu.startDate).getFullYear()} – {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                  </span>
                </div>
                <p className="r-item-sub">{edu.degree}, {edu.field}</p>
              </div>
            ))}
          </div>
        )}

        {(profile?.profileSkills?.length > 0 || profile?.skills?.length > 0) && (
          <div className="r-section">
            <p className="r-section-title">Skills</p>
            <div className="r-skills">
              {(profile?.profileSkills?.length > 0
                ? profile.profileSkills.map((s: any) => s.skillName)
                : profile?.skills?.map((s: any) => s.name) || []
              ).map((name: string) => (
                <span key={name} className="r-skill-pill">{name}</span>
              ))}
            </div>
          </div>
        )}

        {profile?.projects?.length > 0 && (
          <div className="r-section">
            <p className="r-section-title">Portfolio Projects</p>
            {profile.projects.map((proj: any) => (
              <div key={proj.id} className="r-project">
                <p className="r-project-title">{proj.title}</p>
                {proj.description && <p style={{ fontSize: '11px', color: '#4b5563' }}>{proj.description}</p>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
                  {proj.githubUrl && <span className="r-project-link">GitHub: {proj.githubUrl}</span>}
                  {proj.projectUrl && <span className="r-project-link">Live: {proj.projectUrl}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {badges?.length > 0 && (
          <div className="r-section">
            <p className="r-section-title">Verified Skill Badges</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {badges.map((b: any) => (
                <span key={b.id} className="r-badge">✓ {b.skillTest?.skillTag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, login, token } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Photo refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Modal open states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editAboutOpen, setEditAboutOpen] = useState(false);
  const [addExpOpen, setAddExpOpen] = useState(false);
  const [addEduOpen, setAddEduOpen] = useState(false);
  const [manageSkillsOpen, setManageSkillsOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);

  // Forms
  const [profileForm, setProfileForm] = useState({
    headline: '', location: '', linkedinUrl: '', githubUrl: '', websiteUrl: '',
  });
  const [aboutForm, setAboutForm] = useState({ bio: '' });
  const [expForm, setExpForm] = useState({
    company: '', position: '', location: '', startDate: '', endDate: '',
    current: false, description: '',
  });
  const [eduForm, setEduForm] = useState({
    school: '', degree: '', field: '', startDate: '', endDate: '', current: false,
  });
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', githubUrl: '', projectUrl: '', imageUrl: '',
  });
  const [projectCoverPreview, setProjectCoverPreview] = useState<string | null>(null);
  const projectCoverRef = useRef<HTMLInputElement>(null);

  // Profile Skills state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillPct, setNewSkillPct] = useState(70);

  // Legacy skills (existing system)
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const [profileRes, badgesRes, subsRes] = await Promise.all([
        api.get('/profiles/me'),
        api.get('/learning/my-badges').catch(() => ({ data: [] })),
        api.get('/monetization/subscriptions').catch(() => ({ data: [] })),
      ]);
      const p = profileRes.data;
      setProfile(p);
      setBadges(badgesRes.data || []);
      setSubscriptions(subsRes.data || []);
      setProfileForm({
        headline: p.headline || '',
        location: p.location || '',
        linkedinUrl: p.linkedinUrl || '',
        githubUrl: p.githubUrl || '',
        websiteUrl: p.websiteUrl || '',
      });
      setAboutForm({ bio: p.bio || '' });
      setSkills(p.skills?.map((s: any) => s.name) || []);
      if (p.user?.avatar) {
        setAvatarPreview(p.user.avatar);
        if (user && token) login(token, { ...user, avatar: p.user.avatar });
      }
      if (p.coverPhoto) setCoverPreview(p.coverPhoto);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCancelSubscription = async (subId: string) => {
    if (!confirm('Are you sure you want to cancel this plan?')) return;
    try {
      await api.post(`/monetization/subscriptions/${subId}/cancel`);
      showToast('Subscription canceled successfully.');
      fetchProfile(); // Refresh to update status
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel subscription.');
    }
  };

  // ── Photo Handlers ────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 400, 400, 0.82);
      setAvatarPreview(base64);
      await api.put('/profiles/me', { avatar: base64 });
      if (user && token) login(token, { ...user, avatar: base64 });
      showToast('Profile picture updated!');
    } catch { showToast('Failed to upload.'); }
    e.target.value = '';
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 1400, 500, 0.82);
      setCoverPreview(base64);
      await api.put('/profiles/me', { coverPhoto: base64 });
      showToast('Cover photo updated!');
    } catch { showToast('Failed to upload.'); }
    e.target.value = '';
  };

  const handleProjectCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 800, 500, 0.82);
      setProjectCoverPreview(base64);
      setProjectForm(p => ({ ...p, imageUrl: base64 }));
    } catch { showToast('Failed to load image.'); }
    e.target.value = '';
  };

  // ── Save Handlers ─────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/profiles/me', profileForm);
      setProfile((prev: any) => ({ ...prev, ...res.data }));
      setEditProfileOpen(false);
      showToast('Profile updated!');
    } catch { } finally { setIsSaving(false); }
  };

  const handleSaveAbout = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/profiles/me', { bio: aboutForm.bio });
      setProfile((prev: any) => ({ ...prev, bio: res.data.bio }));
      setEditAboutOpen(false);
      showToast('About section updated!');
    } catch { } finally { setIsSaving(false); }
  };

  const handleAddExperience = async () => {
    if (!expForm.company || !expForm.position || !expForm.startDate) return;
    setIsSaving(true);
    try {
      const payload = {
        ...expForm,
        startDate: new Date(expForm.startDate).toISOString(),
        endDate: expForm.current ? null : expForm.endDate ? new Date(expForm.endDate).toISOString() : null,
      };
      const res = await api.post('/profiles/experience', payload);
      setProfile((prev: any) => ({ ...prev, experience: [...(prev?.experience || []), res.data] }));
      setAddExpOpen(false);
      setExpForm({ company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' });
      showToast('Experience added!');
    } catch { } finally { setIsSaving(false); }
  };

  const handleAddEducation = async () => {
    if (!eduForm.school || !eduForm.degree || !eduForm.field || !eduForm.startDate) return;
    setIsSaving(true);
    try {
      const payload = {
        ...eduForm,
        startDate: new Date(eduForm.startDate).toISOString(),
        endDate: eduForm.current ? null : eduForm.endDate ? new Date(eduForm.endDate).toISOString() : null,
      };
      const res = await api.post('/profiles/education', payload);
      setProfile((prev: any) => ({ ...prev, education: [...(prev?.education || []), res.data] }));
      setAddEduOpen(false);
      setEduForm({ school: '', degree: '', field: '', startDate: '', endDate: '', current: false });
      showToast('Education added!');
    } catch { } finally { setIsSaving(false); }
  };

  const handleSaveSkills = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/profiles/me', { skills });
      setProfile((prev: any) => ({ ...prev, skills: res.data.skills }));
      setManageSkillsOpen(false);
      showToast('Skills updated!');
    } catch { } finally { setIsSaving(false); }
  };

  const handleAddProfileSkill = async () => {
    if (!newSkillName.trim()) return;
    setIsSaving(true);
    try {
      const res = await api.post('/profiles/skills', { skillName: newSkillName.trim(), percentage: newSkillPct });
      setProfile((prev: any) => ({ ...prev, profileSkills: [...(prev?.profileSkills || []), res.data] }));
      setNewSkillName('');
      setNewSkillPct(70);
      showToast('Skill added!');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to add skill');
    } finally { setIsSaving(false); }
  };

  const handleRemoveProfileSkill = async (skillId: string) => {
    try {
      await api.delete(`/profiles/skills/${skillId}`);
      setProfile((prev: any) => ({ ...prev, profileSkills: prev.profileSkills.filter((s: any) => s.id !== skillId) }));
      showToast('Skill removed');
    } catch { }
  };

  const handleUpdateSkillPct = async (skillId: string, pct: number) => {
    try {
      const res = await api.put(`/profiles/skills/${skillId}`, { percentage: pct });
      setProfile((prev: any) => ({
        ...prev,
        profileSkills: prev.profileSkills.map((s: any) => s.id === skillId ? res.data : s),
      }));
    } catch { }
  };

  const handleAddProject = async () => {
    if (!projectForm.title.trim()) return;
    setIsSaving(true);
    try {
      const res = await api.post('/profiles/portfolio', projectForm);
      setProfile((prev: any) => ({ ...prev, projects: [...(prev?.projects || []), res.data] }));
      setAddProjectOpen(false);
      setProjectForm({ title: '', description: '', githubUrl: '', projectUrl: '', imageUrl: '' });
      setProjectCoverPreview(null);
      showToast('Project added!');
    } catch { } finally { setIsSaving(false); }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await api.delete(`/profiles/portfolio/${projectId}`);
      setProfile((prev: any) => ({ ...prev, projects: prev.projects.filter((p: any) => p.id !== projectId) }));
      showToast('Project deleted');
    } catch { }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/profiles/me', { ...profileForm, bio: aboutForm.bio, skills });
      setProfile((prev: any) => ({ ...prev, ...res.data }));
      showToast('Profile updated!');
    } catch { } finally { setIsSaving(false); }
  };

  const handleDownloadResume = () => {
    const root = document.getElementById('resume-print-root');
    if (root) {
      root.classList.add('printing');
      window.print();
      setTimeout(() => root.classList.remove('printing'), 1000);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills(prev => [...prev, s]); setSkillInput(''); }
  };

  // ── Completeness ──────────────────────────────────────────────────────────
  const completeness = (() => {
    let score = 0;
    if (user?.avatar || avatarPreview) score += 20;
    if (profile?.headline) score += 15;
    if (profile?.bio) score += 15;
    if (profile?.experience?.length > 0) score += 20;
    if (profile?.education?.length > 0) score += 15;
    if ((profile?.skills?.length || profile?.profileSkills?.length) > 0) score += 15;
    return score;
  })();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-[#1B1B1B]">
      <Navbar />

      {/* Hidden Resume Document */}
      <ResumeDocument user={user} profile={profile} badges={badges} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="fixed top-20 right-6 z-[100] flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold"
          >
            <Check className="w-4 h-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      <input ref={projectCoverRef} type="file" accept="image/*" className="hidden" onChange={handleProjectCoverChange} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-[80px] pb-24">

        {/* ── Profile Header ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="relative h-52 cursor-pointer group" onClick={() => coverInputRef.current?.click()}>
            {coverPreview
              ? <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              : <div className="h-full bg-gradient-to-r from-blue-600/30 via-violet-600/20 to-blue-400/20" />
            }
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 bg-black/70 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                <Camera className="w-4 h-4" /> Change Cover Photo
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="relative -mt-16 flex items-end gap-4 mb-4">
              {/* Avatar */}
              <div
                className="relative w-28 h-28 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 overflow-hidden shadow-xl cursor-pointer group shrink-0"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview || user?.avatar
                  ? <img src={avatarPreview || user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-blue-600 flex items-center justify-center"><User className="w-10 h-10 text-white" /></div>
                }
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-all duration-300 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </div>

              <div className="flex-1 pb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</h1>
                <p className="text-gray-500 font-medium">{profile?.headline || 'Add a headline'}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-400">
                  {profile?.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.location}</span>}
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex gap-2 pb-1 shrink-0">
                <button
                  onClick={handleDownloadResume}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" /> Download Resume
                </button>
                <button
                  onClick={() => { setProfileForm({ headline: profile?.headline || '', location: profile?.location || '', linkedinUrl: profile?.linkedinUrl || '', githubUrl: profile?.githubUrl || '', websiteUrl: profile?.websiteUrl || '' }); setEditProfileOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-white/20 rounded-full text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  <Pencil className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
              {profile?.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"><Globe className="w-4 h-4" /> LinkedIn <ExternalLink className="w-3 h-3" /></a>}
              {profile?.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><Terminal className="w-4 h-4" /> GitHub <ExternalLink className="w-3 h-3" /></a>}
              {profile?.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"><LinkIcon className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" /></a>}
              {!profile?.linkedinUrl && !profile?.githubUrl && !profile?.websiteUrl && (
                <button onClick={() => setEditProfileOpen(true)} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add social links</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><User className="w-5 h-5 text-blue-600" /> About</h2>
                <button className="text-blue-600 hover:underline text-sm font-medium" onClick={() => { setAboutForm({ bio: profile?.bio || '' }); setEditAboutOpen(true); }}>Edit</button>
              </div>
              {profile?.bio
                ? <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{profile.bio}</p>
                : <button onClick={() => setEditAboutOpen(true)} className="text-sm text-blue-500 hover:underline">Tell the world about your professional journey!</button>
              }
            </div>

            {/* Experience */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" /> Experience</h2>
                <button onClick={() => setAddExpOpen(true)} className="flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium"><Plus className="w-4 h-4" /> Add</button>
              </div>
              <div className="space-y-6">
                {profile?.experience?.length > 0 ? profile.experience.map((exp: any) => (
                  <div key={exp.id} className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0"><Briefcase className="w-5 h-5 text-gray-400" /></div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{exp.position}</h3>
                      <p className="text-blue-600 font-medium text-sm">{exp.company}</p>
                      {exp.location && <p className="text-xs text-gray-400">{exp.location}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                      </p>
                      {exp.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{exp.description}</p>}
                    </div>
                  </div>
                )) : <p className="text-gray-400 text-sm italic">No experience added yet.</p>}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-600" /> Education</h2>
                <button onClick={() => setAddEduOpen(true)} className="flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium"><Plus className="w-4 h-4" /> Add</button>
              </div>
              <div className="space-y-6">
                {profile?.education?.length > 0 ? profile.education.map((edu: any) => (
                  <div key={edu.id} className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0"><GraduationCap className="w-5 h-5 text-gray-400" /></div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{edu.school}</h3>
                      <p className="text-blue-600 font-medium text-sm">{edu.degree}, {edu.field}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(edu.startDate).getFullYear()} – {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                      </p>
                    </div>
                  </div>
                )) : <p className="text-gray-400 text-sm italic">No education added yet.</p>}
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Star className="w-5 h-5 text-blue-600" /> Portfolio</h2>
                <button onClick={() => setAddProjectOpen(true)} className="flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium"><Plus className="w-4 h-4" /> Add Project</button>
              </div>
              {profile?.projects?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.projects.map((proj: any) => (
                    <div key={proj.id} className="rounded-xl border border-border overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
                      <div className="h-32 bg-gradient-to-br from-blue-500/20 to-violet-500/20 relative overflow-hidden">
                        {proj.imageUrl
                          ? <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          : <div className="w-full h-full flex items-center justify-center"><Star className="w-10 h-10 text-white/30" /></div>
                        }
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-gray-900 dark:text-white">{proj.title}</h3>
                          <button onClick={() => handleDeleteProject(proj.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors ml-2 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {proj.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{proj.description}</p>}
                        <div className="flex gap-3 mt-2">
                          {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-white font-medium"><Terminal className="w-3.5 h-3.5" /> GitHub</a>}
                          {proj.projectUrl && <a href={proj.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"><ExternalLink className="w-3.5 h-3.5" /> Live</a>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                  <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Showcase your work! Add projects, GitHub links, and media.</p>
                  <button onClick={() => setAddProjectOpen(true)} className="mt-3 text-sm font-semibold text-blue-600 hover:underline">+ Add your first project</button>
                </div>
              )}
            </div>
            
            {/* Billing & Subscriptions */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" /> Billing & Subscriptions
                </h2>
                <Link href="/premium" className="text-sm font-semibold text-blue-600 hover:underline">
                  Manage Plans
                </Link>
              </div>
              
              <div className="space-y-4">
                {subscriptions && subscriptions.length > 0 ? (
                  subscriptions.map((sub: any) => (
                    <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-gray-50/50 dark:bg-black/20 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white capitalize">
                            {sub.plan.name.replace(/_/g, ' ')} Plan
                          </h3>
                          <p className="text-sm text-gray-500">
                            {sub.status === 'ACTIVE' ? 'Active until ' : 'Canceled on '}
                            {new Date(sub.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {sub.status === 'ACTIVE' ? (
                        <Button 
                          variant="outline" 
                          className="border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0"
                          onClick={() => handleCancelSubscription(sub.id)}
                        >
                          Cancel Plan
                        </Button>
                      ) : (
                        <div className="px-3 py-1.5 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-wider shrink-0 text-center">
                          Canceled
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                    <p className="text-gray-400 text-sm mb-2">You don't have any active subscriptions.</p>
                    <a href="/premium" className="text-sm font-semibold text-blue-600 hover:underline">
                      Explore Premium Plans
                    </a>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Profile Completeness */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Profile Strength</h3>
              <div className="h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                <motion.div
                  className={`h-full rounded-full ${completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-blue-600' : 'bg-orange-400'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-gray-400 mb-4">
                {completeness}% complete {completeness < 100 ? '— Add more details to boost visibility!' : '— Your profile is complete! 🎉'}
              </p>
              <button onClick={handleUpdateProfile} disabled={isSaving}
                className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Update Profile'}
              </button>
            </div>

            {/* Verified Badges */}
            {badges?.length > 0 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-5 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" /> Skill Badges</h2>
                <div className="space-y-2">
                  {badges.map((badge: any) => (
                    <div key={badge.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                      <Award className="w-5 h-5 text-yellow-500 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white leading-none">✓ {badge.skillTest?.skillTag}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Verified by ProConnect</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills with % */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2"><Wrench className="w-4 h-4 text-blue-600" /> Skills</h2>
              </div>

              {/* Add new skill with % */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-border">
                <AutocompleteInput
                  placeholder="Add skill (e.g. React, Python…)"
                  value={newSkillName}
                  onChange={v => setNewSkillName(v)}
                  suggestions={SKILLS_LIST.filter(s => !profile?.profileSkills?.some((ps: any) => ps.skillName === s))}
                  showAllOnFocus
                  maxSuggestions={8}
                />
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Proficiency</span><span className="font-bold text-blue-600">{newSkillPct}%</span>
                  </div>
                  <input type="range" min={10} max={100} step={5} value={newSkillPct}
                    onChange={e => setNewSkillPct(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
                <button onClick={handleAddProfileSkill} disabled={!newSkillName.trim() || isSaving}
                  className="mt-2 w-full py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40">
                  + Add Skill
                </button>
              </div>

              {/* Existing profile skills */}
              <div className="space-y-3">
                {profile?.profileSkills?.length > 0 ? profile.profileSkills.map((skill: any) => {
                  const color = SKILL_COLORS[skill.skillName.charCodeAt(0) % SKILL_COLORS.length];
                  return (
                    <div key={skill.id} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{skill.skillName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{skill.percentage}%</span>
                          {skill.endorsements?.length > 0 && (
                            <span className="text-xs text-blue-500 font-semibold">{skill.endorsements.length} endorsement{skill.endorsements.length > 1 ? 's' : ''}</span>
                          )}
                          <button onClick={() => handleRemoveProfileSkill(skill.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden cursor-pointer"
                        title="Click and drag to adjust"
                        onClick={e => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100 / 5) * 5;
                          handleUpdateSkillPct(skill.id, Math.max(5, Math.min(100, pct)));
                        }}>
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.percentage}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-gray-400 italic text-center py-2">Use the form above to add skills with proficiency levels</p>
                )}
              </div>

              {/* Legacy skills toggle */}
              {profile?.skills?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Other skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((s: any) => (
                      <span key={s.id} className="px-2.5 py-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">{s.name}</span>
                    ))}
                  </div>
                  <button onClick={() => { setSkills(profile?.skills?.map((s: any) => s.name) || []); setManageSkillsOpen(true); }}
                    className="mt-2 text-xs text-blue-600 hover:underline">Manage</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════ MODALS ══════════════════════════════ */}

      {/* Edit Profile */}
      <Modal isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)} title="Edit Profile">
        <div className="space-y-4">
          <AutocompleteInput label="Headline" placeholder="e.g. Senior Software Engineer at Google" value={profileForm.headline} onChange={v => setProfileForm(p => ({ ...p, headline: v }))} suggestions={HEADLINES} showAllOnFocus />
          <AutocompleteInput label="Location" placeholder="e.g. Colombo, Sri Lanka" value={profileForm.location} onChange={v => setProfileForm(p => ({ ...p, location: v }))} suggestions={LOCATIONS} showAllOnFocus />
          <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/yourname" value={profileForm.linkedinUrl} onChange={e => setProfileForm(p => ({ ...p, linkedinUrl: e.target.value }))} />
          <Input label="GitHub URL" placeholder="https://github.com/yourname" value={profileForm.githubUrl} onChange={e => setProfileForm(p => ({ ...p, githubUrl: e.target.value }))} />
          <Input label="Website URL" placeholder="https://yourwebsite.com" value={profileForm.websiteUrl} onChange={e => setProfileForm(p => ({ ...p, websiteUrl: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="glass" className="flex-1" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSaveProfile} isLoading={isSaving}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Edit About */}
      <Modal isOpen={editAboutOpen} onClose={() => setEditAboutOpen(false)} title="About You">
        <div className="space-y-4">
          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-foreground/70 ml-1">Bio</label>
            <textarea className="w-full glass px-4 py-3 rounded-xl outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-foreground/30 resize-none" rows={6}
              placeholder="Tell the world about your professional journey, skills, and what you're passionate about..."
              value={aboutForm.bio} onChange={e => setAboutForm({ bio: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="glass" className="flex-1" onClick={() => setEditAboutOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSaveAbout} isLoading={isSaving}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Add Experience */}
      <Modal isOpen={addExpOpen} onClose={() => setAddExpOpen(false)} title="Add Experience">
        <div className="space-y-4">
          <AutocompleteInput label="Company *" placeholder="e.g. Google, Virtusa, ABC Technologies" value={expForm.company} onChange={v => setExpForm(p => ({ ...p, company: v }))} suggestions={COMPANIES} showAllOnFocus />
          <AutocompleteInput label="Position / Title *" placeholder="e.g. QA Intern, Senior Software Engineer" value={expForm.position} onChange={v => setExpForm(p => ({ ...p, position: v }))} suggestions={JOB_TITLES} showAllOnFocus />
          <AutocompleteInput label="Location" placeholder="e.g. Remote, Colombo, Sri Lanka" value={expForm.location} onChange={v => setExpForm(p => ({ ...p, location: v }))} suggestions={LOCATIONS} showAllOnFocus />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date *" type="date" value={expForm.startDate} onChange={e => setExpForm(p => ({ ...p, startDate: e.target.value }))} />
            {!expForm.current && <Input label="End Date" type="date" value={expForm.endDate} onChange={e => setExpForm(p => ({ ...p, endDate: e.target.value }))} />}
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={expForm.current} onChange={e => setExpForm(p => ({ ...p, current: e.target.checked }))} className="w-4 h-4 rounded accent-accent" />
            <span className="text-sm text-foreground/70">I currently work here</span>
          </label>
          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-foreground/70 ml-1">Description</label>
            <textarea className="w-full glass px-4 py-3 rounded-xl outline-none focus:border-accent/50 transition-all placeholder:text-foreground/30 resize-none" rows={3}
              placeholder="Describe your responsibilities and key achievements..."
              value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="glass" className="flex-1" onClick={() => setAddExpOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAddExperience} isLoading={isSaving} disabled={!expForm.company || !expForm.position || !expForm.startDate}>Add Experience</Button>
          </div>
        </div>
      </Modal>

      {/* Add Education */}
      <Modal isOpen={addEduOpen} onClose={() => setAddEduOpen(false)} title="Add Education">
        <div className="space-y-4">
          <AutocompleteInput label="School / University *" placeholder="e.g. ICBT Campus, SLIIT, University of Moratuwa" value={eduForm.school} onChange={v => setEduForm(p => ({ ...p, school: v }))} suggestions={UNIVERSITIES} showAllOnFocus />
          <AutocompleteInput label="Degree *" placeholder="e.g. BSc (Hons) Software Engineering" value={eduForm.degree} onChange={v => setEduForm(p => ({ ...p, degree: v }))} suggestions={DEGREES} showAllOnFocus />
          <AutocompleteInput label="Field of Study *" placeholder="e.g. Software Engineering" value={eduForm.field} onChange={v => setEduForm(p => ({ ...p, field: v }))} suggestions={FIELDS_OF_STUDY} showAllOnFocus />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date *" type="date" value={eduForm.startDate} onChange={e => setEduForm(p => ({ ...p, startDate: e.target.value }))} />
            {!eduForm.current && <Input label="End Date" type="date" value={eduForm.endDate} onChange={e => setEduForm(p => ({ ...p, endDate: e.target.value }))} />}
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={eduForm.current} onChange={e => setEduForm(p => ({ ...p, current: e.target.checked }))} className="w-4 h-4 rounded accent-accent" />
            <span className="text-sm text-foreground/70">I currently study here</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="glass" className="flex-1" onClick={() => setAddEduOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAddEducation} isLoading={isSaving} disabled={!eduForm.school || !eduForm.degree || !eduForm.field || !eduForm.startDate}>Add Education</Button>
          </div>
        </div>
      </Modal>

      {/* Add Portfolio Project */}
      <Modal isOpen={addProjectOpen} onClose={() => setAddProjectOpen(false)} title="Add Portfolio Project">
        <div className="space-y-4">
          {/* Cover Image Upload */}
          <div className="h-36 rounded-xl border-2 border-dashed border-white/20 overflow-hidden cursor-pointer group relative"
            onClick={() => projectCoverRef.current?.click()}>
            {projectCoverPreview
              ? <img src={projectCoverPreview} alt="Cover" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-foreground/40 hover:text-foreground/60 transition-colors">
                  <ImageIcon className="w-8 h-8" /><p className="text-sm">Click to add cover image</p>
                </div>
            }
          </div>

          <Input label="Project Title *" placeholder="e.g. ProConnect Platform, Inventory Management System" value={projectForm.title} onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))} />
          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-foreground/70 ml-1">Description</label>
            <textarea className="w-full glass px-4 py-3 rounded-xl outline-none focus:border-accent/50 transition-all placeholder:text-foreground/30 resize-none" rows={3}
              placeholder="Describe what this project does, technologies used, and your role..."
              value={projectForm.description} onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <Input label="GitHub URL" placeholder="https://github.com/yourname/project" value={projectForm.githubUrl} onChange={e => setProjectForm(p => ({ ...p, githubUrl: e.target.value }))} />
          <Input label="Live Demo / Website URL" placeholder="https://yourproject.com" value={projectForm.projectUrl} onChange={e => setProjectForm(p => ({ ...p, projectUrl: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="glass" className="flex-1" onClick={() => { setAddProjectOpen(false); setProjectCoverPreview(null); setProjectForm({ title: '', description: '', githubUrl: '', projectUrl: '', imageUrl: '' }); }}>Cancel</Button>
            <Button className="flex-1" onClick={handleAddProject} isLoading={isSaving} disabled={!projectForm.title.trim()}>Add Project</Button>
          </div>
        </div>
      </Modal>

      {/* Manage Legacy Skills */}
      <Modal isOpen={manageSkillsOpen} onClose={() => setManageSkillsOpen(false)} title="Manage Skills">
        <div className="space-y-4">
          <div className="flex gap-2">
            <AutocompleteInput placeholder="e.g. React, Python, Figma" value={skillInput} onChange={v => setSkillInput(v)} suggestions={SKILLS_LIST.filter(s => !skills.includes(s))} showAllOnFocus maxSuggestions={10} />
            <button onClick={addSkill} className="shrink-0 w-12 h-12 flex items-center justify-center glass rounded-xl hover:bg-accent/10 text-accent transition-colors border border-accent/20"><Plus className="w-5 h-5" /></button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[90px] p-4 rounded-xl bg-white/5 border border-white/10">
            {skills.length > 0 ? skills.map((skill, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent text-sm font-semibold rounded-full border border-accent/20">
                {skill}
                <button onClick={() => setSkills(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-400 transition-colors ml-0.5"><X className="w-3 h-3" /></button>
              </span>
            )) : <p className="text-foreground/30 text-sm italic m-auto">No skills added yet</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="glass" className="flex-1" onClick={() => setManageSkillsOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSaveSkills} isLoading={isSaving}>Save Skills</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
