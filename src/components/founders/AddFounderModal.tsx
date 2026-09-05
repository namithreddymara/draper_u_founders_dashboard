'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/lib/dataService';
import { Founder, StartupStage, FundingStage, DraperURelationship, BusinessModel } from '@/types';
import { CheckCircle2, Sparkles, Building, User, Mail, Phone, MapPin, DollarSign, Globe, Layers, AlertCircle } from 'lucide-react';

interface AddFounderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFounderCreated: (founder: Founder) => void;
}

export function AddFounderModal({ isOpen, onClose, onFounderCreated }: AddFounderModalProps) {
  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    linkedin: '',
    twitter: '',
    location: 'Bengaluru, Karnataka',
    designation: 'Founder & CEO',
    bio: '',
    
    // Startup Details
    startupName: '',
    website: '',
    sector: 'AI / ML',
    subSector: '',
    foundedYear: 2024,
    stage: 'Early Traction' as StartupStage,
    teamSize: '1-5',
    businessModel: 'B2B' as BusinessModel,
    problem: '',
    solution: '',
    pitchDeckUrl: '',

    // Funding Details
    fundingType: 'Funded' as 'Funded' | 'Bootstrapped',
    fundingStage: 'Seed' as FundingStage,
    amountRaised: '$500K',
    currency: 'USD' as 'USD' | 'INR',
    investors: '',
    currentlyFundraising: true,
    targetAmount: '$1.0M',

    // Draper Relationship & Flags
    relationship: 'Community member' as DraperURelationship,
    isHighPriority: false,
    tags: 'AI Mafia, Demo Day 2026',
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'startup' | 'funding'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Please enter the founder full name.');
      setActiveTab('profile');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      setActiveTab('profile');
      return;
    }
    if (!formData.startupName.trim()) {
      setError('Please enter the startup name.');
      setActiveTab('startup');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = dataService.createFounder({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || '+91 98765 43210',
        whatsapp: formData.whatsapp.trim() || undefined,
        linkedin: formData.linkedin.trim() || undefined,
        twitter: formData.twitter.trim() || undefined,
        location: formData.location.trim() || 'Bengaluru, Karnataka',
        designation: formData.designation.trim() || 'Founder & CEO',
        bio: formData.bio.trim() || undefined,
        startup: {
          name: formData.startupName.trim(),
          website: formData.website.trim() || undefined,
          sector: formData.sector,
          subSector: formData.subSector.trim() || undefined,
          foundedYear: Number(formData.foundedYear) || 2024,
          stage: formData.stage,
          teamSize: formData.teamSize,
          businessModel: formData.businessModel,
          problem: formData.problem.trim() || undefined,
          solution: formData.solution.trim() || undefined,
          pitchDeckUrl: formData.pitchDeckUrl.trim() || undefined,
        },
        funding: {
          type: formData.fundingType,
          stage: formData.fundingStage,
          amountRaised: formData.amountRaised.trim() || undefined,
          currency: formData.currency,
          investors: formData.investors ? formData.investors.split(',').map((s) => s.trim()).filter(Boolean) : [],
          currentlyFundraising: formData.currentlyFundraising,
          targetAmount: formData.targetAmount.trim() || undefined,
        },
        relationship: formData.relationship,
        isHighPriority: formData.isHighPriority,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : ['Admin Ingestion'],
      });

      onFounderCreated(created);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create founder');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Founder Manually"
      subtitle="Enter founder and startup details to issue a DraperU Founder ID and sync database."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step Navigation Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Founder Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('startup')}
            className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'startup'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>2. Startup Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('funding')}
            className={`pb-2.5 px-4 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'funding'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Funding & Ecosystem</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: FOUNDER PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikram Malhotra"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. vikram@startup.io"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Founder & CEO"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / State</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Bengaluru, Karnataka"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Founder Short Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={2}
                placeholder="Background, serial entrepreneur experience, tech pedigree..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: STARTUP DETAILS */}
        {activeTab === 'startup' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Startup Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.startupName}
                  onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                  placeholder="e.g. HyperFlow AI"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Startup Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://hyperflow.ai"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="AI / ML">AI / ML</option>
                  <option value="SaaS">SaaS & Enterprise</option>
                  <option value="FinTech">FinTech & Payments</option>
                  <option value="HealthTech">HealthTech & Bio</option>
                  <option value="DeepTech">DeepTech & Robotics</option>
                  <option value="ClimateTech">ClimateTech & Sustainability</option>
                  <option value="EdTech">EdTech</option>
                  <option value="Web3">Web3 & Crypto</option>
                  <option value="Consumer">Consumer Tech / D2C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Startup Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as StartupStage })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Idea">Idea (Concept)</option>
                  <option value="MVP">MVP (Built)</option>
                  <option value="Early Traction">Early Traction (Paying Users)</option>
                  <option value="Growth">Growth ($10k+ MRR)</option>
                  <option value="Scaling">Scaling (Series A+)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Model</label>
                <select
                  value={formData.businessModel}
                  onChange={(e) => setFormData({ ...formData, businessModel: e.target.value as BusinessModel })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="B2B">B2B</option>
                  <option value="B2C">B2C</option>
                  <option value="B2B2C">B2B2C</option>
                  <option value="SaaS">SaaS Subscription</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="Enterprise">Enterprise License</option>
                  <option value="D2C">D2C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Team Size</label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="1-5">1-5 Members</option>
                  <option value="6-15">6-15 Members</option>
                  <option value="16-50">16-50 Members</option>
                  <option value="50+">50+ Members</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Problem & Solution Summary</label>
              <textarea
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                rows={2}
                placeholder="What pain point does the startup solve and what is the proprietary advantage?"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 3: FUNDING & DRAPERU ECOSYSTEM */}
        {activeTab === 'funding' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Funding Status</label>
                <select
                  value={formData.fundingType}
                  onChange={(e) => setFormData({ ...formData, fundingType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Funded">Funded (VC / Angel backed)</option>
                  <option value="Bootstrapped">Bootstrapped (Self-funded)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Funding Round Stage</label>
                <select
                  value={formData.fundingStage}
                  onChange={(e) => setFormData({ ...formData, fundingStage: e.target.value as FundingStage })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Bootstrapped">Bootstrapped</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Pre-Series A">Pre-Series A</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B+">Series B+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Raised So Far</label>
                <input
                  type="text"
                  value={formData.amountRaised}
                  onChange={(e) => setFormData({ ...formData, amountRaised: e.target.value })}
                  placeholder="$500K / ₹4 Cr"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Target Raising</label>
                <input
                  type="text"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="$1.5M"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">DraperU Relationship</label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value as DraperURelationship })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Community member">Community Member</option>
                  <option value="Founder program">Founder Program Cohort</option>
                  <option value="Event attendee">Event Attendee</option>
                  <option value="Mentor">Mentor / Advisor</option>
                  <option value="Investor">Investor / Partner</option>
                  <option value="Alumni">Draper University Alumni</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ecosystem Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="AI Mafia, VIP Founder, Demo Day"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* High priority checkbox */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
              <input
                type="checkbox"
                id="isHighPriority"
                checked={formData.isHighPriority}
                onChange={(e) => setFormData({ ...formData, isHighPriority: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isHighPriority" className="text-xs text-amber-900 font-semibold cursor-pointer">
                Mark as High-Priority / Hot Lead (VIP Founder Fast-Track)
              </label>
            </div>
          </div>
        )}

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {activeTab !== 'profile' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'funding' ? 'startup' : 'profile')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Back
              </button>
            )}
            {activeTab !== 'funding' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'profile' ? 'startup' : 'funding')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
              >
                Next Step →
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition disabled:opacity-60 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Issuing Founder ID...' : 'Save & Issue ID'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
