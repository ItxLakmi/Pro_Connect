'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Link as LinkIcon, Calendar, Plus, Pencil,
  Briefcase, GraduationCap, Wrench, Terminal, Globe, ExternalLink,
  Award, ArrowLeft, UserPlus, UserCheck, UserX, Users, Bell,
  BellOff, Star, ChevronRight, X, Play, FileText, Image as ImageIcon,
  Loader2, Check, ThumbsUp, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

type ConnectionStatus = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED' | 'loading';

const SKILL_COLORS = [
  'from-blue-500 to-blue-700',
  'from-violet-500 to-violet-700',
  'from-emerald-500 to-emerald-700',
  'from-orange-500 to-orange-700',
  'from-pink-500 to-pink-700',
  'from-cyan-500 to-cyan-700',
  'from-amber-500 to-amber-700',
  'from-red-500 to-red-700',
];

function SkillBar({ skill, onEndorse, currentUserId, isOwn }: {
  skill: any;
  onEndorse: (skillId: string) => void;
  currentUserId?: string;
  isOwn: boolean;
}) {
  const hasEndorsed = skill.endorsements?.some((e: any) => e.userId === currentUserId);
  const count = skill.endorsements?.length ?? 0;
  const color = SKILL_COLORS[skill.skillName.charCodeAt(0) % SKILL_COLORS.length];

  return (
    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-border hover:border-blue-200 dark:hover:border-blue-800 transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-[14px] text-gray-900 dark:text-white">{skill.skillName}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">{skill.percentage}%</span>
          {!isOwn && currentUserId && (
            <button
              onClick={() => onEndorse(skill.id)}
              title={hasEndorsed ? 'Remove endorsement' : 'Endorse this skill'}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all font-semibold ${
                hasEndorsed
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              {count > 0 && <span>{count}</span>}
            </button>
          )}
          {isOwn && count > 0 && (
            <span className="text-xs text-blue-600 font-semibold">{count} endorsement{count !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${skill.percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {/* Endorser avatars */}
      {skill.endorsements?.length > 0 && (
        <div className="flex items-center gap-1 mt-2">
          <div className="flex -space-x-1">
            {skill.endorsements.slice(0, 4).map((e: any) => (
              <div key={e.id} className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 overflow-hidden flex items-center justify-center text-white text-[9px] font-bold">
                {e.user?.avatar ? <img src={e.user.avatar} className="w-full h-full object-cover" alt="" /> : e.user?.firstName?.[0]}
              </div>
            ))}
          </div>
          {skill.endorsements.length > 4 && (
            <span className="text-[10px] text-gray-500 ml-1">+{skill.endorsements.length - 4} more</span>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onOpen }: { project: any; onOpen: (p: any) => void }) {
  return (
    <div
      className="rounded-2xl border border-border bg-white dark:bg-white/5 overflow-hidden cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all group"
      onClick={() => onOpen(project)}
    >
      {/* Cover */}
      <div className="h-36 bg-gradient-to-br from-blue-500/20 to-violet-500/20 relative overflow-hidden">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Briefcase className="w-12 h-12 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white truncate">{project.title}</h3>
        {project.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
        )}
        <div className="flex items-center gap-3 mt-3">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium">
              <Terminal className="w-3.5 h-3.5" /> GitHub
            </a>
          )}
          {project.projectUrl && (
            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors font-medium">
              <Globe className="w-3.5 h-3.5" /> Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('loading');
  const [isFollowing, setIsFollowing] = useState(false);
  const [connectionRequestId, setConnectionRequestId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [openProject, setOpenProject] = useState<any>(null);

  const isOwnProfile = user && userId === user.id;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchProfile = useCallback(async () => {
    try {
      const [profileRes, badgesRes] = await Promise.all([
        api.get(`/profiles/${userId}`),
        api.get(`/learning/badges/${userId}`).catch(() => ({ data: [] })),
      ]);
      setProfile(profileRes.data);
      setBadges(badgesRes.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchConnectionStatus = useCallback(async () => {
    if (!user || isOwnProfile) return;
    try {
      const [connRes, followRes] = await Promise.all([
        api.get(`/networking/connections/status/${userId}`),
        api.get(`/networking/follow-status/${userId}`),
      ]);
      setConnectionStatus(connRes.data.status);
      setConnectionRequestId(connRes.data.requestId || null);
      setIsFollowing(followRes.data.following);
    } catch {
      setConnectionStatus('NONE');
    }
  }, [userId, user, isOwnProfile]);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchConnectionStatus();
    }
  }, [userId, fetchProfile, fetchConnectionStatus]);

  const handleConnect = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      if (connectionStatus === 'CONNECTED') {
        await api.delete(`/networking/connections/${userId}`);
        setConnectionStatus('NONE');
        showToast('Connection removed');
      } else if (connectionStatus === 'NONE') {
        const res = await api.post(`/networking/connections/request/${userId}`);
        setConnectionStatus('PENDING_SENT');
        setConnectionRequestId(res.data.id);
        showToast('Connection request sent!');
      } else if (connectionStatus === 'PENDING_RECEIVED' && connectionRequestId) {
        await api.post(`/networking/connections/accept/${connectionRequestId}`);
        setConnectionStatus('CONNECTED');
        showToast('Connection accepted!');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/networking/unfollow/${userId}`);
        setIsFollowing(false);
        showToast('Unfollowed');
      } else {
        await api.post(`/networking/follow/${userId}`);
        setIsFollowing(true);
        showToast('Following!');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndorse = async (skillId: string) => {
    if (!user) return;
    try {
      const skill = profile?.profileSkills?.find((s: any) => s.id === skillId);
      const hasEndorsed = skill?.endorsements?.some((e: any) => e.userId === user.id);

      if (hasEndorsed) {
        await api.delete(`/profiles/skills/${skillId}/endorse`);
      } else {
        await api.post(`/profiles/skills/${skillId}/endorse`);
      }
      await fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessage = async () => {
    if (!user || isOwnProfile) return;
    setActionLoading(true);
    try {
      const res = await api.post('/chat/start', { participantId: userId });
      router.push(`/messages?conversation=${res.data.id}`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to start conversation');
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  const profileUser = profile?.user || (isOwnProfile ? user : null);
  const fullName = profileUser ? `${profileUser.firstName} ${profileUser.lastName}` : 'User Profile';

  const connectButtonConfig = () => {
    if (connectionStatus === 'loading' || actionLoading) return { label: '...', icon: <Loader2 className="w-4 h-4 animate-spin" />, cls: 'opacity-70 cursor-not-allowed', variant: 'glass' as const };
    if (connectionStatus === 'CONNECTED') return { label: 'Connected', icon: <UserCheck className="w-4 h-4" />, cls: 'bg-green-600 text-white hover:bg-red-600 hover:shadow-red-500/20', variant: 'glass' as const };
    if (connectionStatus === 'PENDING_SENT') return { label: 'Pending', icon: <Loader2 className="w-4 h-4" />, cls: 'text-yellow-600 border-yellow-500', variant: 'glass' as const };
    if (connectionStatus === 'PENDING_RECEIVED') return { label: 'Accept', icon: <Check className="w-4 h-4" />, cls: 'bg-green-600 text-white', variant: 'glass' as const };
    return { label: 'Connect', icon: <UserPlus className="w-4 h-4" />, cls: 'bg-blue-600 text-white hover:bg-blue-700', variant: 'glass' as const };
  };

  const btnCfg = connectButtonConfig();

  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-[#1B1B1B] text-foreground font-sans">
      <Navbar />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[100] flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold"
          >
            <Check className="w-4 h-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Modal */}
      <AnimatePresence>
        {openProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpenProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1E1E1E] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {openProject.imageUrl && (
                <img src={openProject.imageUrl} alt={openProject.title} className="w-full h-64 object-cover rounded-t-3xl" />
              )}
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{openProject.title}</h2>
                  <button onClick={() => setOpenProject(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {openProject.description && <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{openProject.description}</p>}
                <div className="flex gap-3 flex-wrap mb-6">
                  {openProject.githubUrl && (
                    <a href={openProject.githubUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors">
                      <Terminal className="w-4 h-4" /> View on GitHub
                    </a>
                  )}
                  {openProject.projectUrl && (
                    <a href={openProject.projectUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
                      <Globe className="w-4 h-4" /> Live Demo
                    </a>
                  )}
                </div>
                {openProject.media?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Media</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {openProject.media.map((m: any) => (
                        <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 border border-border rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm text-gray-600 dark:text-gray-400">
                          {m.type === 'IMAGE' && <ImageIcon className="w-4 h-4 text-blue-500" />}
                          {m.type === 'VIDEO' && <Play className="w-4 h-4 text-red-500" />}
                          {m.type === 'DOCUMENT' && <FileText className="w-4 h-4 text-orange-500" />}
                          {m.type}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto pt-[80px] pb-20 px-4 sm:px-6">
        <Link href="/feed" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-6 mt-4 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Profile Header */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-44 relative overflow-hidden">
            {profile?.coverPhoto
              ? <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              : <div className="h-full bg-gradient-to-r from-blue-600/30 via-violet-600/20 to-blue-400/20" />
            }
          </div>

          <div className="px-6 pb-6">
            <div className="relative -mt-16 flex items-end gap-4 mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 overflow-hidden shadow-xl shrink-0">
                {profileUser?.avatar
                  ? <img src={profileUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">{profileUser?.firstName?.[0] || 'U'}</div>
                }
              </div>

              {!isOwnProfile && user && (
                <div className="flex gap-2 pb-1 ml-auto">
                  <button
                    onClick={handleMessage}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={actionLoading || connectionStatus === 'PENDING_SENT' || connectionStatus === 'loading'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${btnCfg.cls}`}
                  >
                    {btnCfg.icon} {btnCfg.label}
                  </button>
                  <button
                    onClick={handleFollow}
                    disabled={actionLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                      isFollowing
                        ? 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10'
                        : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    {isFollowing ? <><BellOff className="w-4 h-4" /> Unfollow</> : <><Bell className="w-4 h-4" /> Follow</>}
                  </button>
                </div>
              )}

              {isOwnProfile && (
                <Link href="/profile" className="ml-auto pb-1">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                    <Pencil className="w-4 h-4" /> Edit Profile
                  </button>
                </Link>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
            <p className="text-gray-500 font-medium mt-0.5">{profile?.headline || 'ProConnect Member'}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
              {profile?.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.location}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(profileUser?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>

            {/* Social links */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
              {profile?.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"><Globe className="w-4 h-4" /> LinkedIn <ExternalLink className="w-3 h-3" /></a>}
              {profile?.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><Terminal className="w-4 h-4" /> GitHub <ExternalLink className="w-3 h-3" /></a>}
              {profile?.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"><LinkIcon className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" /></a>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {profile?.bio && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><User className="w-5 h-5 text-blue-600" /> About</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Experience */}
            {profile?.experience?.length > 0 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" /> Experience</h2>
                <div className="space-y-6">
                  {profile.experience.map((exp: any) => (
                    <div key={exp.id} className="flex gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                      </div>
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
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile?.education?.length > 0 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-600" /> Education</h2>
                <div className="space-y-6">
                  {profile.education.map((edu: any) => (
                    <div key={edu.id} className="flex gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{edu.school}</h3>
                        <p className="text-blue-600 font-medium text-sm">{edu.degree}, {edu.field}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(edu.startDate).getFullYear()} – {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {profile?.projects?.length > 0 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-blue-600" /> Portfolio</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.projects.map((proj: any) => (
                    <ProjectCard key={proj.id} project={proj} onOpen={setOpenProject} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Skill Badges */}
            {badges?.length > 0 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-5 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" /> Verified Badges</h2>
                <div className="space-y-2">
                  {badges.map((badge: any) => (
                    <div key={badge.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                      <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center border border-yellow-400/30 shrink-0">
                        <Award className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white leading-none">{badge.skillTest?.skillTag}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Verified by ProConnect</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills with percentages */}
            {profile?.profileSkills?.length > 0 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-5 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Wrench className="w-4 h-4 text-blue-600" /> Skills</h2>
                <div className="space-y-3">
                  {profile.profileSkills.map((skill: any) => (
                    <SkillBar
                      key={skill.id}
                      skill={skill}
                      onEndorse={handleEndorse}
                      currentUserId={user?.id}
                      isOwn={!!isOwnProfile}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Legacy skills (pills) */}
            {profile?.skills?.length > 0 && profile?.profileSkills?.length === 0 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-border p-5 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Wrench className="w-4 h-4 text-blue-600" /> Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: any) => (
                    <span key={skill.id} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full border border-blue-200 dark:border-blue-800">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
