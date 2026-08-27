'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Building,
  MapPin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  QrCode,
  Printer,
  Sparkles,
  Share2,
  Calendar,
  CheckCircle2,
  UserCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { Founder, DraperUEvent, Interaction, EventRegistration } from '@/types';
import { QRCodeCard } from '@/components/ui/QRCodeCard';
import { Badge } from '@/components/ui/Badge';

export default function PublicFounderProfilePass() {
  const params = useParams();
  const id = (params?.id as string) || 'DRU-F-000124';
  const [founder, setFounder] = useState<Founder | null>(null);
  const [events, setEvents] = useState<DraperUEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    dataService.init();
    const found = dataService.getFounderById(id);
    if (found) {
      setFounder(found);
      const allEvents = dataService.getEvents();
      setEvents(allEvents);
      if (allEvents.length > 0) {
        const liveEvt = allEvents.find((e) => e.status === 'live') || allEvents[0];
        setSelectedEventId(liveEvt.id);
        checkRegistrationStatus(found.id, liveEvt.id);
      }
    }
  }, [id]);

  const checkRegistrationStatus = (founderId: string, eventId: string) => {
    const regs = dataService.getRegistrations(eventId);
    const reg = regs.find((r) => r.founderId === founderId);
    if (reg) {
      setIsRegistered(true);
      setIsCheckedIn(reg.checkedIn);
    } else {
      setIsRegistered(false);
      setIsCheckedIn(false);
    }
  };

  const handleEventChange = (newEvtId: string) => {
    setSelectedEventId(newEvtId);
    if (founder) {
      checkRegistrationStatus(founder.id, newEvtId);
    }
    setCheckinMessage(null);
  };

  const handle1TapRegisterAndCheckIn = () => {
    if (!founder || !selectedEventId) return;
    setIsProcessing(true);

    try {
      // 1. Register & Check In
      const regRes = dataService.registerForEvent({
        eventId: selectedEventId,
        founderId: founder.id,
        isNewFounder: false,
        source: 'QR Scan',
        autoCheckIn: true,
      });

      setIsRegistered(true);
      setIsCheckedIn(true);
      setCheckinMessage(`✓ Success! Registered and checked in ${founder.name} to ${regRes.event.title}`);

      // trigger celebration
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#e11d48', '#10b981', '#f59e0b', '#ffffff'],
      });
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!founder) {
    return (
      <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-md w-full">
          <QrCode className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Founder ID Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">
            No active DraperU profile was found matching <code className="text-rose-400">{id}</code>.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
          >
            Go to Platform Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 py-10 px-4 flex flex-col items-center justify-center relative">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl space-y-6 relative z-10">
        {/* Top Navbar Brand */}
        <div className="flex items-center justify-between no-print px-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-white text-sm">
              DU
            </div>
            <span className="font-bold text-white text-sm tracking-tight">
              DRAPER<span className="text-rose-500">U</span> INDIA
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Badge</span>
            </button>
            <Link
              href={`/founders/${founder.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-xs font-semibold transition"
            >
              <span>CRM View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ⚡ PRIMARY ACTION: INSTANT EVENT REGISTRATION & FAST CHECK-IN */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-rose-500/50 shadow-2xl space-y-4 no-print">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center">
                <Zap className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                  Automated Event Entrance Action
                </span>
                <h2 className="text-base font-black text-white">
                  Fast Event Registration & Entrance Check-in
                </h2>
              </div>
            </div>

            {/* Select active event */}
            <select
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.city})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-300">
                You are registered as <strong className="text-white">{founder.name}</strong> ({founder.startup.name} • <span className="font-mono text-rose-400">{founder.id}</span>).
              </p>
              <p className="text-[11px] text-slate-400">
                Target Event: <strong className="text-slate-200">{selectedEvent?.title}</strong> ({selectedEvent?.venue}, {selectedEvent?.city})
              </p>
            </div>

            {/* 1-Tap Action Button */}
            {isCheckedIn ? (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Checked In & Verified ✓</span>
              </div>
            ) : isRegistered ? (
              <button
                disabled={isProcessing}
                onClick={handle1TapRegisterAndCheckIn}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-2 shrink-0 transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isProcessing ? 'Processing...' : 'Confirm Entrance Check-In'}</span>
              </button>
            ) : (
              <button
                disabled={isProcessing}
                onClick={handle1TapRegisterAndCheckIn}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-black shadow-lg shadow-rose-600/40 flex items-center gap-2 shrink-0 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Registering...' : '1-Tap Register & Check In Now'}</span>
              </button>
            )}
          </div>

          {checkinMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-fadeIn">
              {checkinMessage}
            </div>
          )}
        </div>

        {/* Digital Membership / Event Pass Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden print-badge">
          {/* Header Bar with ID */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-600/20">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center overflow-hidden">
                  {founder.avatarUrl ? (
                    <img
                      src={founder.avatarUrl}
                      alt={founder.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-black text-rose-400">
                      {founder.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 font-mono text-xs font-black tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-full">
                    {founder.id}
                  </span>
                  <Badge variant="gold" size="sm">
                    {founder.relationship}
                  </Badge>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight mt-1">
                  {founder.name}
                </h1>
                <p className="text-xs text-slate-400">
                  {founder.designation} at <strong className="text-slate-200">{founder.startup.name}</strong>
                </p>
              </div>
            </div>

            {/* Scannable Dynamic Registration QR Card */}
            <div className="p-2 bg-white rounded-2xl shadow-inner shrink-0 self-center sm:self-auto text-center">
              {typeof window !== 'undefined' && (
                <QRCodeCard
                  value={`${window.location.origin}/events/${selectedEvent?.slug || 'founder-mafia-night-blr'}/register?founder=${founder.id}`}
                  title={founder.name}
                  subtitle={`Scan to Auto-Register • ${founder.id}`}
                  size={120}
                  showActions={false}
                  className="p-0 border-0 bg-transparent shadow-none"
                />
              )}
              <span className="text-[9px] font-bold text-slate-800 uppercase block mt-1">
                Scan to Register
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 text-xs">
            {/* Startup Info */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-rose-400" />
                Startup Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Company:</span>
                  <span className="font-semibold text-white">{founder.startup.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sector / Domain:</span>
                  <span className="font-semibold text-slate-200">{founder.startup.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stage:</span>
                  <Badge variant="primary" size="sm">{founder.startup.stage}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Team Size:</span>
                  <span className="text-slate-200">{founder.startup.teamSize} people</span>
                </div>
                {founder.startup.website && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Website:</span>
                    <a
                      href={founder.startup.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-rose-400 hover:underline flex items-center gap-1"
                    >
                      {founder.startup.website.replace('https://', '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Funding & Location */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Funding & Draper Network
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Funding Status:</span>
                  <span className="font-semibold text-white">
                    {founder.funding.stage} ({founder.funding.amountRaised || 'Bootstrapped'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Currently Raising:</span>
                  <span className={founder.funding.currentlyFundraising ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                    {founder.funding.currentlyFundraising ? `Yes (${founder.funding.targetAmount || 'Seeking round'})` : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    {founder.location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verification:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Official DraperU India Pass
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
            {founder.email && (
              <a
                href={`mailto:${founder.email}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{founder.email}</span>
              </a>
            )}
            {founder.linkedin && (
              <a
                href={founder.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>LinkedIn</span>
              </a>
            )}
            {founder.phone && (
              <a
                href={`tel:${founder.phone}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{founder.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
