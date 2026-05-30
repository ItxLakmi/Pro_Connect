'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';

export default function CreateStartupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    industry: '',
    fundingStage: 'PRE_SEED',
    amountSeeking: '',
    equity: '',
    website: '',
    pitchDeckUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        amountSeeking: Number(formData.amountSeeking),
        equity: Number(formData.equity),
      };
      const res = await api.post('/investor/startup', payload);
      router.push(`/investors/${res.data.id}`);
    } catch (error) {
      console.error('Error creating startup:', error);
      alert('Failed to save startup profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex justify-center">
      <div className="max-w-2xl w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black mb-2">List Your Startup</h1>
          <p className="text-foreground/60">Fill out your details to get discovered by investors.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-6 border border-white/10">
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b border-white/10 pb-2">Basic Details</h3>
            <Input 
              label="Startup Name" 
              name="name" 
              required 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. ProConnect"
            />
            <Input 
              label="Tagline" 
              name="tagline" 
              required 
              value={formData.tagline} 
              onChange={handleChange} 
              placeholder="e.g. Next-gen professional networking"
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Description</label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="Describe your vision and traction..."
              />
            </div>
            <Input 
              label="Industry" 
              name="industry" 
              required 
              value={formData.industry} 
              onChange={handleChange} 
              placeholder="e.g. EdTech"
            />
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-lg border-b border-white/10 pb-2">Funding Ask</h3>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Funding Stage</label>
              <select
                name="fundingStage"
                value={formData.fundingStage}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
              >
                <option value="IDEA">Idea</option>
                <option value="PRE_SEED">Pre-Seed</option>
                <option value="SEED">Seed</option>
                <option value="SERIES_A">Series A</option>
                <option value="SERIES_B">Series B+</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Amount Seeking (USD)" 
                name="amountSeeking" 
                type="number" 
                required 
                value={formData.amountSeeking} 
                onChange={handleChange} 
              />
              <Input 
                label="Equity Offered (%)" 
                name="equity" 
                type="number" 
                step="0.1"
                required 
                value={formData.equity} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-lg border-b border-white/10 pb-2">Links (Optional)</h3>
            <Input 
              label="Website" 
              name="website" 
              type="url" 
              value={formData.website} 
              onChange={handleChange} 
            />
            <Input 
              label="Pitch Deck URL" 
              name="pitchDeckUrl" 
              type="url" 
              value={formData.pitchDeckUrl} 
              onChange={handleChange} 
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? 'Saving...' : 'List Startup'}
          </Button>
        </form>
      </div>
    </div>
  );
}
