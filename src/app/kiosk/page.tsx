'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck,
  Zap,
  ExternalLink,
  Volume2,
  RotateCcw,
} from 'lucide-react';
import { dataService, subscribeToDataUpdates } from '@/lib/dataService';
import { DraperUEvent, EventRegistration, Founder } from '@/types';
import { QRCodeCard } from '@/components/ui/QRCodeCard';
import { Badge } from '@/components/ui/Badge';

export default function EntranceLiveKiosk() {
  const [events, setEvents] = useState<DraperUEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [latestRegistration, setLatestRegistration] = useState<EventRegistration | null>(null);
  const [pulseNew, setPulseNew] = useState(false);

  useEffect(() => {
    dataService.init();
    refreshData();

    // Subscribe to real-time mobile submissions
    const unsubscribe = subscribeToDataUpdates(() => {
      refreshData();
      triggerLiveAlert();
    });

    return () => unsubscribe();
  }, [selectedEventId]);

  const refreshData = () => {
    const allEvents = dataService.getEvents();
    setEvents(allEvents);

    const activeEvtId = selectedEventId || (allEvents.length > 0 ? allEvents[0].id : '');
    if (!selectedEventId && activeEvtId) {
      setSelectedEventId(activeEvtId);
    }

    if (activeEvtId) {
      const regs = dataService.getRegistrations(activeEvtId);
      setRegistrations(regs);
      if (regs.length > 0) {
        setLatestRegistration(regs[0]);
      }
    }
  };

  const triggerLiveAlert = () => {
    setPulseNew(true);
    setTimeout(() => setPulseNew(false), 3500);
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const registrationUrl = typeof window !== 'undefined' && selectedEvent
    ? `${window.location.origin}/events/${selectedEvent.slug}/register`
    : '';

  const checkedInCount = registrations.filter((r) => r.checkedIn).length;
  const newFoundersCount = registrations.filter((r) => r.isNewFounder).length;
  const existingFoundersCount = registrations.length - newFoundersCount;

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto space-y-6 relative z-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-rose-600/30 shrink-0">
              DU
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base sm:text-lg tracking-tight">
                  DRAPER<span className="text-rose-500">U</span> INDIA
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Entrance Kiosk
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Self-Service Founder Registration & Real-Time Ingestion Kiosk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setRegistrations(dataService.getRegistrations(e.target.value));
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:border-rose-500 focus:outline-none"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.city})
                </option>
              ))}
            </select>

            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition shrink-0"
            >
              CRM Dashboard
            </Link>
          </div>
        </div>

        {/* Real-time Toast Banner when mobile submission occurs */}
        {pulseNew && latestRegistration && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-2xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-full">
                  Mobile QR Submission Ingested Live!
                </span>
                <h4 className="text-sm font-black mt-0.5">
                  {latestRegistration.founderName} ({latestRegistration.founderCompany})
                </h4>
                <p className="text-[11px] opacity-90">
                  {latestRegistration.isNewFounder ? '✨ New Founder Profile Created' : '🎉 Welcome Back! Existing Profile Verified'} • {latestRegistration.founderSector}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-black/40 px-3 py-1.5 rounded-xl">
              {latestRegistration.founderId}
            </span>
          </div>
        )}

        {/* Main 2-Column Display: Left (Big QR for Phone Scan) | Right (Live Ingestion Stream) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 6 COLS: BIG SELF-SERVICE ENTRANCE QR */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border-2 border-rose-500/50 shadow-2xl text-center space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                Scan with Smartphone Camera
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {selectedEvent?.title}
              </h2>
              <p className="text-xs text-slate-400">
                {selectedEvent?.venue}, {selectedEvent?.city}
              </p>
            </div>

            {/* Giant Dynamic QR Code */}
            <div className="p-5 bg-white rounded-3xl max-w-[240px] sm:max-w-[280px] mx-auto shadow-2xl ring-8 ring-rose-500/20">
              {typeof window !== 'undefined' && registrationUrl && (
                <QRCodeCard
                  value={registrationUrl}
                  title={selectedEvent?.title || 'Register'}
                  subtitle="Scan with camera"
                  size={240}
                  showActions={false}
                  className="p-0 border-0 bg-transparent shadow-none"
                />
              )}
            </div>

            {/* 3 Step Automated Flow Explanation */}
            <div className="grid grid-cols-3 gap-2 text-left bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-rose-400 block">1. SCAN QR</span>
                <p className="text-[11px] text-slate-300">Opens mobile registration form</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-400 block">2. AUTO-CHECK</span>
                <p className="text-[11px] text-slate-300">Checks if founder exists; 1-click verify</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 block">3. AUTO-INGEST</span>
                <p className="text-[11px] text-slate-300">Instant check-in updates this screen</p>
              </div>
            </div>

            {/* Test Link */}
            <div className="pt-2">
              <Link
                href={registrationUrl}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <span>Open Registration Form in New Tab (Test Simulator)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* RIGHT 6 COLS: LIVE ATTENDANCE & INGESTION ROSTER */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
            <div>
              {/* Real-time counters bar */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Registered
                  </span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    {registrations.length}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                    Checked In
                  </span>
                  <span className="text-2xl font-black text-emerald-300 mt-1 block">
                    {checkedInCount}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    New vs Return
                  </span>
                  <span className="text-sm font-bold text-white mt-2 block">
                    <span className="text-indigo-400">{newFoundersCount} New</span> / {existingFoundersCount}
                  </span>
                </div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Live Ingested Attendees Feed
                </h3>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-syncing
                </span>
              </div>

              {/* Attendee Live Stream List */}
              <div className="space-y-2.5 pt-3 max-h-[360px] overflow-y-auto pr-1">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700 shrink-0">
                        {reg.founderName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{reg.founderName}</span>
                          <span className="font-mono text-[10px] text-rose-400">{reg.founderId}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {reg.founderCompany} • {reg.founderSector}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {reg.checkedIn ? (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Checked In
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-800 text-slate-400">
                          Registered
                        </span>
                      )}
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        {reg.isNewFounder ? 'New ID' : 'Verified'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Founders scan QR on phone → Database updates instantly</span>
              <span className="font-semibold text-rose-400">0 Manual Data Entry Needed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
