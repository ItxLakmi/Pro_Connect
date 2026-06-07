'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2, Upload, Globe, MapPin, Users, Briefcase,
  Save, Loader2, CheckCircle, Edit2
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing',
  'Engineering', 'Design', 'Legal', 'Retail', 'Manufacturing',
  'Media & Entertainment', 'Real Estate', 'Logistics', 'Other'
];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    industry: '',
    website: '',
    size: '',
    location: '',
    logo: '',
  });

  useEffect(() => { fetchCompany(); }, []);

  const fetchCompany = async () => {
    try {
      const res = await api.get('/profiles/me');
      const c = res.data?.user?.company;
      if (c) {
        setCompany(c);
        setForm({
          name: c.name || '',
          description: c.description || '',
          industry: c.industry || '',
          website: c.website || '',
          size: c.size || '',
          location: c.location || '',
          logo: c.logo || '',
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/profiles/company', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">This information will appear on your job postings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" /> Company Logo & Name
          </h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden shrink-0">
              {form.logo ? (
                <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 size={28} className="text-gray-300 dark:text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
              <input
                name="logo"
                value={form.logo}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-400 mt-1">Paste a direct image URL for your company logo</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Edit2 size={18} className="text-blue-600" /> Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. TechCorp (Pvt) Ltd"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About the Company</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe what your company does, your mission, culture..."
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"><Briefcase size={13} /> Industry</label>
              <select
                name="industry"
                value={form.industry}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="">Select industry...</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"><Users size={13} /> Company Size</label>
              <select
                name="size"
                value={form.size}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="">Select size...</option>
                {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"><Globe size={13} /> Website</label>
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5"><MapPin size={13} /> Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Colombo, Sri Lanka"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Company Profile'}
        </button>
      </form>
    </div>
  );
}
