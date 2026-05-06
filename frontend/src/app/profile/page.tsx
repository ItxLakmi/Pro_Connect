'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Plus, 
  Pencil,
  Briefcase,
  GraduationCap,
  Wrench,
  Terminal,
  Globe,
  ExternalLink
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profiles/me');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Profile Header */}
      <Card className="relative overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-r from-accent/20 to-accent-secondary/20" />
        <div className="px-8 pb-8">
          <div className="relative -mt-16 flex items-end gap-6 mb-6">
            <div className="w-32 h-32 rounded-2xl border-4 border-background bg-background overflow-hidden shadow-xl">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                  <User className="w-16 h-16 text-accent" />
                </div>
              )}
            </div>
            <div className="flex-1 mb-2">
              <h1 className="text-3xl font-bold">{user?.firstName} {user?.lastName}</h1>
              <p className="text-foreground/70 text-lg font-medium">{profile?.headline || 'Professional at ProConnect'}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-foreground/50">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile?.location || 'Remote'}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
            <Button variant="glass" className="mb-2 gap-2">
              <Pencil className="w-4 h-4" /> Edit Profile
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
            {profile?.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" className="flex items-center gap-2 text-sm text-foreground/60 hover:text-accent transition-colors">
                <Globe className="w-4 h-4" /> LinkedIn <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {profile?.githubUrl && (
              <a href={profile.githubUrl} target="_blank" className="flex items-center gap-2 text-sm text-foreground/60 hover:text-accent transition-colors">
                <Terminal className="w-4 h-4" /> GitHub <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {profile?.websiteUrl && (
              <a href={profile.websiteUrl} target="_blank" className="flex items-center gap-2 text-sm text-foreground/60 hover:text-accent transition-colors">
                <LinkIcon className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Experience & Education */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><User className="w-5 h-5 text-accent" /> About</h2>
              <button className="text-accent hover:underline text-sm font-medium">Edit</button>
            </div>
            <p className="text-foreground/70 leading-relaxed">
              {profile?.bio || "No bio added yet. Tell the world about your professional journey!"}
            </p>
          </Card>

          {/* Experience */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Briefcase className="w-5 h-5 text-accent" /> Experience</h2>
              <Button variant="glass" size="sm" className="gap-1 h-8">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
            <div className="space-y-8">
              {profile?.experience?.length > 0 ? (
                profile.experience.map((exp: any) => (
                  <div key={exp.id} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6 text-foreground/30" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{exp.position}</h3>
                      <p className="text-accent font-medium">{exp.company}</p>
                      <p className="text-xs text-foreground/40 mt-1">
                        {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-foreground/60 mt-2">{exp.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-foreground/40 text-sm italic">No experience added yet.</p>
              )}
            </div>
          </Card>

          {/* Education */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5 text-accent" /> Education</h2>
              <Button variant="glass" size="sm" className="gap-1 h-8">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
            <div className="space-y-8">
              {profile?.education?.length > 0 ? (
                profile.education.map((edu: any) => (
                  <div key={edu.id} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6 text-foreground/30" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{edu.school}</h3>
                      <p className="text-accent font-medium">{edu.degree}, {edu.field}</p>
                      <p className="text-xs text-foreground/40 mt-1">
                        {new Date(edu.startDate).getFullYear()} - {edu.current ? 'Present' : new Date(edu.endDate).getFullYear()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-foreground/40 text-sm italic">No education added yet.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Skills & Stats */}
        <div className="space-y-8">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Wrench className="w-5 h-5 text-accent" /> Skills</h2>
              <button className="text-accent hover:underline text-sm font-medium">Manage</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.length > 0 ? (
                profile.skills.map((skill: any) => (
                  <span key={skill.id} className="px-3 py-1 bg-accent/10 text-accent text-sm font-semibold rounded-full border border-accent/20">
                    {skill.name}
                  </span>
                ))
              ) : (
                <p className="text-foreground/40 text-sm italic">No skills listed yet.</p>
              )}
            </div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
            <h3 className="font-bold mb-4">Profile Completeness</h3>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-accent w-[35%] rounded-full" />
            </div>
            <p className="text-xs text-foreground/50">35% complete. Add your experience to boost visibility!</p>
            <Button className="w-full mt-6 h-10 text-sm">Update Profile</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
