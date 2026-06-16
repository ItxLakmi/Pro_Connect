'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

export default function CreateInvestorProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    investmentFocus: '', // We'll split this by comma
    minTicket: '',
    maxTicket: '',
    portfolioUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        investmentFocus: formData.investmentFocus.split(',').map(s => s.trim()).filter(Boolean),
        minTicket: Number(formData.minTicket),
        maxTicket: Number(formData.maxTicket),
      };
      await api.post('/investor/profile', payload);
      router.push('/investors');
    } catch (error) {
      console.error('Error creating investor profile:', error);
      alert('Failed to save investor profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex justify-center">
      <div className="max-w-2xl w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black mb-2">Investor Profile</h1>
          <p className="text-foreground/60">Set up your focus areas to discover the best startups.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-6 border border-white/10">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Investor Bio (Optional)</label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="A bit about your background and what you look for in founders..."
              />
            </div>
            
            <Input 
              label="Investment Focus Areas (comma-separated)" 
              name="investmentFocus" 
              required 
              value={formData.investmentFocus} 
              onChange={handleChange} 
              placeholder="e.g. AI, FinTech, SaaS, Healthcare"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Min Ticket Size (USD)" 
                name="minTicket" 
                type="number" 
                required 
                value={formData.minTicket} 
                onChange={handleChange} 
                placeholder="e.g. 10000"
              />
              <Input 
                label="Max Ticket Size (USD)" 
                name="maxTicket" 
                type="number" 
                required 
                value={formData.maxTicket} 
                onChange={handleChange} 
                placeholder="e.g. 500000"
              />
            </div>

            <Input 
              label="Portfolio URL (Optional)" 
              name="portfolioUrl" 
              type="url" 
              value={formData.portfolioUrl} 
              onChange={handleChange} 
              placeholder="e.g. your firm's website or AngelList"
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? 'Saving...' : 'Create Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
