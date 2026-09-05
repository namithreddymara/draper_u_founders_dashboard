'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Download,
  Share2,
  ExternalLink,
  Layers,
  Search,
  Check,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { Founder, StartupStage, FundingStage, BusinessModel, DraperURelationship } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { Suspense } from 'react';

function FounderRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get('source') || 'QR Scan';

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdFounder, setCreatedFounder] = useState<Founder | null>(null);
  const [copiedPassUrl, setCopiedPassUrl] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    linkedin: '',
    location: 'Bengaluru, Karnataka',
    designation: 'Founder & CEO',
    // Startup
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
    // Funding
    fundingType: 'Funded' as 'Funded' | 'Bootstrapped',
    fundingStage: 'Seed' as FundingStage,
    amountRaised: '$250K',
    currency: 'USD' as 'USD' | 'INR',
    currentlyFundraising: true,
    targetAmount: '$1.0M',
    // Draper
    relationship: 'Community member' as DraperURelationship,
  });

  const [existingMatch, setExistingMatch] = useState<Founder | null>(null);

  useEffect(() => {
    dataService.init();
  }, []);

  // Quick check if email is already registered
  const handleEmailBlur = () => {
    if (formData.email && formData.email.includes('@')) {
      const match = dataService.getFounderByEmailOrPhone(formData.email.trim());
      if (match) {
        setExistingMatch(match);
      } else {
        setExistingMatch(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.startupName.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // If already registered, update existing record, otherwise create new
      let founderRecord: Founder;
      if (existingMatch) {
        const updated = dataService.updateFounder(existingMatch.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim() || existingMatch.phone,
          location: formData.location.trim() || existingMatch.location,
          designation: formData.designation.trim() || existingMatch.designation,
          linkedin: formData.linkedin.trim() || existingMatch.linkedin,
          startup: {
            ...existingMatch.startup,
            name: formData.startupName.trim(),
            website: formData.website.trim() || existingMatch.startup.website,
            sector: formData.sector,
            stage: formData.stage,
          },
          funding: {
            ...existingMatch.funding,
            type: formData.fundingType,
            stage: formData.fundingStage,
            targetAmount: formData.targetAmount.trim(),
            currentlyFundraising: formData.currentlyFundraising,
          },
        });
        founderRecord = updated || existingMatch;
      } else {
        founderRecord = dataService.createFounder({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || '+91 98765 43210',
          whatsapp: formData.whatsapp.trim() || undefined,
          linkedin: formData.linkedin.trim() || undefined,
          location: formData.location.trim() || 'Bengaluru, Karnataka',
          designation: formData.designation.trim() || 'Founder & CEO',
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
          },
          funding: {
            type: formData.fundingType,
            stage: formData.fundingStage,
            amountRaised: formData.amountRaised.trim() || undefined,
            currency: formData.currency,
            investors: [],
            currentlyFundraising: formData.currentlyFundraising,
            targetAmount: formData.targetAmount.trim() || undefined,
          },
          relationship: formData.relationship,
          isHighPriority: false,
          tags: ['QR Self-Registered', formData.sector, sourceParam],
        });
      }

      await dataService.syncFounder(founderRecord);

      setCreatedFounder(founderRecord);
      setIsSubmitting(false);
      setStep('success');

      // Trigger Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#3b82f6', '#10b981', '#f59e0b'],
        });
      } catch (err) {
        // ignore
      }
    } catch (err: any) {
      alert(err?.message || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  const handleCopyPassLink = () => {
    if (!createdFounder) return;
    const url = `${window.location.origin}/f/${createdFounder.id}`;
    navigator.clipboard.writeText(url);
    setCopiedPassUrl(true);
    setTimeout(() => setCopiedPassUrl(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Brand Top Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg bg-[#404040] flex items-center justify-center mb-3">
            <img src="/draperu-logo.jpg" alt="Draper University Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-1.5 font-black text-slate-900 text-lg tracking-tight">
            DRAPER<span className="text-blue-600">U</span> INDIA
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Official Founder Registration Portal
          </p>
        </div>

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'form' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 animate-fadeIn">
            <div className="mb-6 pb-5 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Join the DraperU Founder Network
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your details to generate your unique DraperU Founder ID and access the ecosystem.
              </p>
            </div>

            {/* Existing Founder notice */}
            {existingMatch && (
              <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-900">
                    Existing Founder Recognized ({existingMatch.id})
                  </h4>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Welcome back, <strong>{existingMatch.name}</strong>! Submitting this form will update your existing ecosystem profile.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Founder Info */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Founder Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                      onBlur={handleEmailBlur}
                      placeholder="e.g. rahul@xyz.com"
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone / WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="Founder & CEO"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Bengaluru, Karnataka"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Startup Details */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Startup Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Startup Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.startupName}
                      onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                      placeholder="e.g. ApexAI Labs"
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://apexai.io"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Sector</label>
                    <select
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="AI / ML">AI / ML</option>
                      <option value="SaaS">SaaS & Enterprise</option>
                      <option value="FinTech">FinTech & Payments</option>
                      <option value="HealthTech">HealthTech & Bio</option>
                      <option value="DeepTech">DeepTech & Hardware</option>
                      <option value="ClimateTech">ClimateTech & CleanTech</option>
                      <option value="EdTech">EdTech</option>
                      <option value="Web3">Web3 & Crypto</option>
                      <option value="Consumer">Consumer & D2C</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Stage</label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value as StartupStage })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Idea">Idea / Concept</option>
                      <option value="MVP">MVP in Progress</option>
                      <option value="Early Traction">Early Traction (Launched)</option>
                      <option value="Growth">Growth ($10k+ MRR)</option>
                      <option value="Scaling">Scaling (Series A+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Funding Status</label>
                    <select
                      value={formData.fundingType}
                      onChange={(e) => setFormData({ ...formData, fundingType: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Funded">Funded (Angel / VC Backed)</option>
                      <option value="Bootstrapped">Bootstrapped</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fundraising Target</label>
                    <input
                      type="text"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      placeholder="e.g. $1.0M / ₹8 Cr"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    What is your startup building? (1-2 sentences)
                  </label>
                  <textarea
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    rows={2}
                    placeholder="Describe your core product value proposition..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition disabled:opacity-60 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : 'Complete Registration & Get Founder ID'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: REGISTRATION SUCCESS CARD & FOUNDER PASS */}
        {step === 'success' && createdFounder && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-6 animate-fadeIn">
            {/* Header Badge */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-white shadow-md flex items-center justify-center text-emerald-600 mb-3">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Registration Successful!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Welcome to Draper University India. Your official Founder ID has been issued.
              </p>
            </div>

            {/* Founder Digital Pass Card */}
            <div className="bg-gradient-to-br from-[#0a1628] via-[#0d2050] to-[#0a1f45] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-blue-900/50 max-w-md mx-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#3f3f3f] flex items-center justify-center shrink-0">
                    <img src="/draperu-logo.jpg" alt="DraperU Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-xs tracking-wider">DRAPERU INDIA</div>
                    <div className="text-[9px] text-blue-300">FOUNDER PASS</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {createdFounder.id}
                  </span>
                </div>
              </div>

              {/* Founder Profile Details */}
              <div className="flex items-start gap-4 text-left my-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md">
                  {createdFounder.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-white truncate">{createdFounder.name}</h3>
                  <p className="text-xs text-blue-200 truncate">{createdFounder.designation}</p>
                  <p className="text-xs font-semibold text-white mt-1 flex items-center gap-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{createdFounder.startup.name}</span>
                    <span className="text-[10px] text-blue-300">({createdFounder.startup.sector})</span>
                  </p>
                </div>
              </div>

              {/* QR Code in Badge */}
              <div className="bg-white p-3 rounded-2xl inline-block shadow-inner">
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${createdFounder.id}`}
                  size={110}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#0a1628"
                />
              </div>

              <div className="text-[10px] text-blue-300 mt-3 font-mono">
                {createdFounder.location} • {createdFounder.funding.stage}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleCopyPassLink}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {copiedPassUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedPassUrl ? 'Pass Link Copied!' : 'Share Pass Link'}</span>
              </button>

              <Link
                href={`/f/${createdFounder.id}`}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition"
              >
                <span>View Full Digital Badge</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GenericRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <FounderRegistrationContent />
    </Suspense>
  );
}
