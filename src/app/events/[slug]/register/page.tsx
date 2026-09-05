'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
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
  Calendar,
  Layers,
  FileText,
  Share2,
  Download,
  ExternalLink,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import {
  DraperUEvent,
  Founder,
  DuplicateDetectionResult,
  StartupStage,
  FundingStage,
  BusinessModel,
  DraperURelationship,
} from '@/types';
import { QRCodeCard } from '@/components/ui/QRCodeCard';
import { DuplicateModal } from '@/components/ui/DuplicateModal';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function EventRegistrationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = (params?.slug as string) || 'founder-mafia-night-blr';
  const queryFounderId = searchParams?.get('founder') || searchParams?.get('id');

  const [event, setEvent] = useState<DraperUEvent | null>(null);
  const [step, setStep] = useState<'identify' | 'existing_confirm' | 'new_form' | 'success'>('identify');
  
  // Identifier state
  const [identifierInput, setIdentifierInput] = useState('');
  const [existingFounder, setExistingFounder] = useState<Founder | null>(null);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateDetectionResult | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // New Founder Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    designation: '',
    // Startup
    startupName: '',
    website: '',
    sector: '',
    subSector: '',
    foundedYear: '' as unknown as number,
    stage: '' as StartupStage,
    teamSize: '',
    businessModel: '' as BusinessModel,
    problem: '',
    solution: '',
    // Funding
    fundingType: '' as 'Funded' | 'Bootstrapped',
    fundingStage: '' as FundingStage,
    amountRaised: '',
    investors: '',
    currentlyFundraising: undefined as boolean | undefined,
    targetAmount: '',
    // Draper
    relationship: 'Event attendee' as DraperURelationship,
    notes: '',
  });

  const [registeredFounder, setRegisteredFounder] = useState<Founder | null>(null);
  const [registeredEvent, setRegisteredEvent] = useState<DraperUEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoCheckIn, setAutoCheckIn] = useState(false);

  useEffect(() => {
    dataService.init();
    Promise.all([dataService.refreshEvents(), dataService.refreshFounders()]).then(([events]) => {
      const foundEvent = events.find((candidate) => candidate.id === slug || candidate.slug === slug);
      if (foundEvent) setEvent(foundEvent);
      else if (events.length > 0) setEvent(events[0]);

      // Auto-detect founder if passed in QR link
      if (queryFounderId) {
        const foundFounder = dataService.getFounderById(queryFounderId.toUpperCase());
        if (foundFounder) {
          setExistingFounder(foundFounder);
          setStep('existing_confirm');
        }
      }
    });
  }, [slug, queryFounderId]);

  // Step 1: Identifier check
  const handleCheckIdentifier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierInput.trim()) return;

    const dupCheck = dataService.checkDuplicates({
      email: identifierInput.includes('@') ? identifierInput.trim() : undefined,
      phone: !identifierInput.includes('@') ? identifierInput.trim() : undefined,
    });

    if (dupCheck.hasDuplicate && dupCheck.matchedFounder) {
      setExistingFounder(dupCheck.matchedFounder);
      setStep('existing_confirm');
    } else {
      // Prep new form with entered identifier
      if (identifierInput.includes('@')) {
        setFormData((prev) => ({ ...prev, email: identifierInput.trim() }));
      } else {
        setFormData((prev) => ({ ...prev, phone: identifierInput.trim() }));
      }
      setStep('new_form');
    }
  };

  // Step 2: Confirm Existing Founder Registration
  const handleConfirmExistingRegistration = () => {
    if (!existingFounder || !event) return;
    setIsSubmitting(true);

    try {
      const res = dataService.registerForEvent({
        eventId: event.id,
        founderId: existingFounder.id,
        isNewFounder: false,
        source: 'QR Scan',
        autoCheckIn: autoCheckIn,
      });

      setRegisteredFounder(existingFounder);
      setRegisteredEvent(res.event);
      setStep('success');
      triggerConfetti();
    } catch (err) {
      alert('Error registering: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Submit New Founder Registration
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlurDuplicateCheck = () => {
    if (formData.email || formData.phone || formData.linkedin) {
      const dupCheck = dataService.checkDuplicates({
        email: formData.email,
        phone: formData.phone,
        linkedin: formData.linkedin,
        name: formData.name,
        company: formData.startupName,
      });

      if (dupCheck.hasDuplicate && dupCheck.matchedFounder) {
        setDuplicateResult(dupCheck);
        setShowDuplicateModal(true);
      }
    }
  };

  const handleCreateNewFounderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    if (!formData.name || !formData.email || !formData.phone || !formData.startupName) {
      alert('Please fill out required fields: Name, Email, Phone, and Startup Name.');
      return;
    }

    // Final duplicate check before creation
    const dupCheck = dataService.checkDuplicates({
      email: formData.email,
      phone: formData.phone,
      linkedin: formData.linkedin,
    });

    if (dupCheck.hasDuplicate && dupCheck.matchedFounder) {
      setDuplicateResult(dupCheck);
      setShowDuplicateModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const newFounder = dataService.createFounder({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        linkedin: formData.linkedin.trim() || undefined,
        location: formData.location.trim() || 'Not provided',
        designation: formData.designation.trim() || 'Founder',
        startup: {
          name: formData.startupName.trim(),
          website: formData.website.trim() || undefined,
          sector: formData.sector || 'Other',
          subSector: formData.subSector.trim() || undefined,
          foundedYear: Number(formData.foundedYear) || undefined,
          stage: formData.stage || 'Idea',
          teamSize: formData.teamSize || 'Not provided',
          businessModel: formData.businessModel || undefined,
          problem: formData.problem.trim() || undefined,
          solution: formData.solution.trim() || undefined,
        },
        funding: {
          type: formData.fundingType || 'Bootstrapped',
          stage: formData.fundingStage || 'Bootstrapped',
          amountRaised: formData.amountRaised.trim() || undefined,
          investors: formData.investors ? formData.investors.split(',').map((s) => s.trim()) : [],
          currentlyFundraising: !!formData.currentlyFundraising,
          targetAmount: formData.targetAmount.trim() || undefined,
        },
        relationship: formData.relationship,
        isHighPriority: formData.currentlyFundraising || formData.fundingType === 'Funded',
        tags: ['New Event Registration', formData.sector, 'Entrance QR'],
      });

      const res = dataService.registerForEvent({
        eventId: event.id,
        founderId: newFounder.id,
        isNewFounder: true,
        source: 'QR Scan',
        notes: formData.notes,
        autoCheckIn: autoCheckIn,
      });

      setRegisteredFounder(newFounder);
      setRegisteredEvent(res.event);
      setStep('success');
      triggerConfetti();
    } catch (err) {
      alert('Registration error: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f59e0b', '#10b981', '#ffffff'],
      });
    } catch (e) {
      // fallback
    }
  };

  return (
    <div className="event-registration-theme min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fadeIn">
        {/* Header with Event Banner & Draper Branding */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-700 shadow-lg shadow-cyan-500/20">
                <img src="/draperu-logo.svg" alt="DraperU logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-black text-white text-sm tracking-tight">DRAPER<span className="text-rose-500">U</span> INDIA</span>
                <span className="block text-[10px] text-slate-400 font-medium">Entrance Fast Registration</span>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Live Event
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {event?.title || 'DraperU Founder Mafia Night'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            {event?.tagline || 'High-signal networking for top 1% tech founders & investors.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-300">
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {event?.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable'}
            </span>
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {event?.venue || 'Location unavailable'}{event?.city ? `, ${event.city}` : ''}
            </span>
          </div>
        </div>

        {/* --- STEP 1: IDENTIFY (EMAIL OR PHONE) --- */}
        {step === 'identify' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Quick Entrance Check-in
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your email or mobile number. If you have attended any DraperU India event before, your permanent Founder Profile will automatically load.
              </p>
            </div>

            <form onSubmit={handleCheckIdentifier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">

            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-[10px] uppercase tracking-wider text-slate-500">New to DraperU?</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <button
              type="button"
              onClick={() => setStep('new_form')}
              className="w-full px-4 py-3 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition"
            >
              Register as a New Attendee
            </button>
                  Email Address or Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. rahul@xyz.com or +91 98765 43210"
                    value={identifierInput}
                    onChange={(e) => setIdentifierInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition shadow-inner"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sample Test Accounts Hint */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">💡 Try sample pre-loaded founders:</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifierInput('rahul@xyz.com');
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition"
                  >
                    rahul@xyz.com (Rahul Sharma)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifierInput('priya@zenocare.health');
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition"
                  >
                    priya@zenocare.health (Priya Reddy)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifierInput('newfounder@nexus.ai');
                    }}
                    className="px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] border border-rose-500/20 transition"
                  >
                    newfounder@nexus.ai (New Founder)
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* --- STEP 2: EXISTING FOUNDER CONFIRMATION --- */}
        {step === 'existing_confirm' && existingFounder && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Welcome back, {existingFounder.name}! 🎉
                  </h3>
                  <p className="text-xs text-emerald-300/80">
                    We found your permanent DraperU Founder profile ({existingFounder.id}).
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-rose-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                {existingFounder.id}
              </span>
            </div>

            {/* Profile Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Startup Name:</span>
                <p className="font-semibold text-white text-sm">{existingFounder.startup.name}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Sector & Stage:</span>
                <p className="font-semibold text-slate-200">{existingFounder.startup.sector} • {existingFounder.startup.stage}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Funding Status:</span>
                <p className="font-semibold text-slate-200">{existingFounder.funding.stage} ({existingFounder.funding.amountRaised || 'Bootstrapped'})</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Contact & Location:</span>
                <p className="font-semibold text-slate-200">{existingFounder.location} • {existingFounder.phone}</p>
              </div>
            </div>

            {/* Auto Check-in Toggle */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCheckIn}
                onChange={(e) => setAutoCheckIn(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
              />
              <span className="text-xs text-slate-300">
                Check me in to the event immediately upon registration (At Entrance)
              </span>
            </label>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('identify')}
                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition order-2 sm:order-1"
              >
                Not you? Search another
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmExistingRegistration}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition order-1 sm:order-2"
              >
                {isSubmitting ? 'Registering...' : `Confirm Registration for ${existingFounder.name}`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: NEW FOUNDER STREAMLINED REGISTRATION --- */}
        {step === 'new_form' && (
          <form onSubmit={handleCreateNewFounderSubmit} className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                New Founder Onboarding
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight mt-1.5">
                Tell us about you & your startup
              </h2>
              <p className="text-xs text-slate-400">
                A permanent DraperU Founder ID (`DRU-F-XXXXXX`) and dynamic QR badge will be generated for you.
              </p>
            </div>

            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                1. Founder Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="designation"
                    value={formData.designation}
                    onChange={handleFormChange}
                    placeholder="e.g. Founder & CEO"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    onBlur={handleBlurDuplicateCheck}
                    placeholder="e.g. rahul@startup.ai"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    onBlur={handleBlurDuplicateCheck}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleFormChange}
                    onBlur={handleBlurDuplicateCheck}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    City & State
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Startup Details */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <Building className="w-3.5 h-3.5" />
                2. Startup Profile
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Startup Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="startupName"
                    value={formData.startupName}
                    onChange={handleFormChange}
                    placeholder="e.g. Nexus AI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleFormChange}
                    placeholder="https://nexusai.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Sector <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleFormChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="" disabled>Select a sector</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="SaaS">SaaS</option>
                    <option value="FinTech">FinTech</option>
                    <option value="HealthTech">HealthTech</option>
                    <option value="DeepTech">DeepTech</option>
                    <option value="ClimateTech">ClimateTech</option>
                    <option value="EdTech">EdTech</option>
                    <option value="Consumer & D2C">Consumer & D2C</option>
                    <option value="Web3 & Crypto">Web3 & Crypto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Startup Stage
                  </label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleFormChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="" disabled>Select startup stage</option>
                    <option value="Idea">Idea Stage</option>
                    <option value="MVP">MVP / Prototype</option>
                    <option value="Early Traction">Early Traction / Revenue</option>
                    <option value="Growth">Growth / Scaling</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  One-line Problem & Solution Pitch
                </label>
                <textarea
                  rows={2}
                  name="solution"
                  value={formData.solution}
                  onChange={handleFormChange}
                  placeholder="What is your startup building and for whom?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Funding Details */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" />
                3. Funding & DraperU Connect
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Funding Stage
                  </label>
                  <select
                    name="fundingStage"
                    value={formData.fundingStage}
                    onChange={handleFormChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="" disabled>Select funding stage</option>
                    <option value="Bootstrapped">Bootstrapped</option>
                    <option value="Pre-Seed">Pre-Seed</option>
                    <option value="Seed">Seed Round</option>
                    <option value="Pre-Series A">Pre-Series A</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B+">Series B+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Currently Fundraising?
                  </label>
                  <select
                    name="currentlyFundraising"
                    value={formData.currentlyFundraising === undefined ? '' : formData.currentlyFundraising ? 'yes' : 'no'}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currentlyFundraising: e.target.value === 'yes',
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="" disabled>Choose an option</option>
                    <option value="yes">Yes (Looking for Angels / VCs)</option>
                    <option value="no">No (Not actively raising)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Entrance Check-in Checkbox */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCheckIn}
                onChange={(e) => setAutoCheckIn(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
              />
              <span className="text-xs text-slate-300">
                Check me in to the event immediately upon completion
              </span>
            </label>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('identify')}
                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition"
              >
                {isSubmitting ? 'Generating Founder Profile...' : 'Complete Registration & Get Founder ID'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* --- STEP 4: REGISTRATION SUCCESS & DIGITAL BADGE PASS --- */}
        {step === 'success' && registeredFounder && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-1 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Registration Confirmed! 🚀
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Welcome to <strong className="text-rose-400">{registeredEvent?.title || 'DraperU India'}</strong>. Your permanent Founder ID has been issued.
              </p>
            </div>

            {/* Founder Digital Pass Card */}
            <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-500/40 shadow-2xl relative text-left">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-black text-rose-400 tracking-wider">
                    {registeredFounder.id}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {registeredFounder.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {registeredFounder.designation} • <strong className="text-slate-200">{registeredFounder.startup.name}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {registeredFounder.startup.sector} • {registeredFounder.location}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center font-black text-white text-sm shadow-md">
                  DU
                </div>
              </div>

              {/* Dynamic QR Code */}
              <div className="mt-5 flex justify-center p-3 bg-white rounded-2xl shadow-inner">
                {typeof window !== 'undefined' && (
                  <QRCodeCard
                    value={`${window.location.origin}/f/${registeredFounder.id}`}
                    title={registeredFounder.name}
                    subtitle={`Permanent Pass • ${registeredFounder.id}`}
                    idBadge={registeredFounder.id}
                    size={160}
                    showActions={false}
                    className="p-0 border-0 bg-transparent shadow-none"
                  />
                )}
              </div>

              {/* Verified Ribbon */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Checked In & Verified
                </span>
                <span className="text-slate-400">
                  {registeredEvent?.venue || 'Koramangala, BLR'}
                </span>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/f/${registeredFounder.id}`}
                target="_blank"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <span>View Full Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition"
              >
                <span>Open DraperU CRM Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Duplicate Resolution Modal */}
      {duplicateResult && (
        <DuplicateModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          result={duplicateResult}
          candidateData={{
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.startupName,
          }}
          onUseExisting={(founder) => {
            setShowDuplicateModal(false);
            setExistingFounder(founder);
            setStep('existing_confirm');
          }}
          onCreateNew={() => {
            setShowDuplicateModal(false);
          }}
        />
      )}
    </div>
  );
}

export default function EventRegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070a11] text-slate-400 flex items-center justify-center text-xs">Loading DraperU Event Registration...</div>}>
      <EventRegistrationContent />
    </Suspense>
  );
}
