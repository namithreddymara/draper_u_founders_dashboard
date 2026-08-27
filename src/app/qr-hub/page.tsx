'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Printer,
  Download,
  Users,
  CalendarDays,
  Sparkles,
  Layers,
  ExternalLink,
  ShieldCheck,
  PlusCircle,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { Founder, DraperUEvent } from '@/types';
import { QRCodeCard } from '@/components/ui/QRCodeCard';
import { Modal } from '@/components/ui/Modal';

export default function QRRegistrationHubPage() {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [events, setEvents] = useState<DraperUEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'event_posters' | 'founder_fast_reg' | 'custom_builder'>('event_posters');
  const [selectedPosterEvent, setSelectedPosterEvent] = useState<DraperUEvent | null>(null);

  // Custom QR Builder state
  const [customEventId, setCustomEventId] = useState('');
  const [customTag, setCustomTag] = useState('Entrance Gate Banner');
  const [customFounderId, setCustomFounderId] = useState('');

  useEffect(() => {
    dataService.init();
    const fList = dataService.getFounders();
    const eList = dataService.getEvents();
    setFounders(fList);
    setEvents(eList);
    if (eList.length > 0) setCustomEventId(eList[0].id);
  }, []);

  const handlePrintAll = () => {
    window.print();
  };

  const selectedCustomEvent = events.find((e) => e.id === customEventId) || events[0];

  const generatedCustomUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/events/${selectedCustomEvent?.slug || 'founder-mafia-night-blr'}/register?source=${encodeURIComponent(customTag)}${customFounderId ? `&founder=${customFounderId}` : ''}`
    : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
              Registration Entrypoints
            </span>
            <span className="text-xs text-slate-400">Dynamic Registration QR Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Founder Registration QR Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate and print official "Scan to Register" entrance posters, table stands, and founder fast-registration QRs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrintAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Current Page</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 no-print">
        <button
          onClick={() => setActiveTab('event_posters')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'event_posters'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>1. Event Entrance "Scan to Register" Posters ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('founder_fast_reg')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'founder_fast_reg'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>2. Founder Fast-Registration QR Passes ({founders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('custom_builder')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'custom_builder'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>3. Custom Registration QR Generator</span>
        </button>
      </div>

      {/* --- TAB 1: EVENT ENTRANCE REGISTRATION POSTERS --- */}
      {activeTab === 'event_posters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-8 rounded-3xl bg-slate-900 border-2 border-slate-800 hover:border-rose-500/50 shadow-2xl text-center space-y-4 print-badge transition group"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-white text-sm">
                  DU
                </div>
                <span className="font-black text-white text-sm">DRAPER<span className="text-rose-500">U</span> INDIA</span>
              </div>

              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  Entrance Registration QR
                </span>
                <h3 className="text-xl font-black text-white mt-1.5">{evt.title}</h3>
                <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mt-0.5">
                  SCAN TO REGISTER & RECORD ENTRANCE ATTENDANCE
                </p>
              </div>

              {/* Dynamic Registration QR */}
              <div className="p-4 bg-white rounded-2xl max-w-[200px] mx-auto shadow-2xl">
                {typeof window !== 'undefined' && (
                  <QRCodeCard
                    value={`${window.location.origin}/events/${evt.slug}/register`}
                    title={evt.title}
                    subtitle="Scan to Register"
                    size={170}
                    showActions={false}
                    className="p-0 border-0 bg-transparent shadow-none"
                  />
                )}
              </div>

              <div className="text-xs text-slate-300">
                <p className="font-semibold">{evt.venue}, {evt.city}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Point smartphone camera to open registration • Duplicate check + instant pass
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 no-print">
                <Link
                  href={`/events/${evt.slug}/register`}
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition"
                >
                  <span>Open Registration Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setSelectedPosterEvent(evt)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Poster</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- TAB 2: FOUNDER FAST-REGISTRATION QR PASSES --- */}
      {activeTab === 'founder_fast_reg' && (
        <div className="print-badge-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {founders.map((founder) => {
            const liveEvent = events[0];
            const registrationUrl = typeof window !== 'undefined'
              ? `${window.location.origin}/events/${liveEvent?.slug || 'founder-mafia-night-blr'}/register?founder=${founder.id}`
              : '';

            return (
              <div
                key={founder.id}
                className="print-badge p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center font-black text-white text-xs">
                        DU
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block">DRAPERU INDIA</span>
                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                          FAST-REGISTRATION QR
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-black text-rose-400">
                      {founder.id}
                    </span>
                  </div>

                  {/* Founder Info */}
                  <div className="text-center py-3 space-y-0.5">
                    <h3 className="text-base font-black text-white">{founder.name}</h3>
                    <p className="text-xs font-bold text-rose-400">{founder.startup.name}</p>
                    <p className="text-[10px] text-slate-400">{founder.designation} • {founder.startup.sector}</p>
                  </div>

                  {/* Dynamic Fast-Registration QR */}
                  <div className="p-3 bg-white rounded-2xl max-w-[150px] mx-auto shadow-inner text-center">
                    {typeof window !== 'undefined' && (
                      <QRCodeCard
                        value={registrationUrl}
                        title={founder.name}
                        subtitle={founder.id}
                        size={120}
                        showActions={false}
                        className="p-0 border-0 bg-transparent shadow-none"
                      />
                    )}
                    <span className="text-[8px] font-bold text-slate-900 uppercase block mt-1">
                      Scan to Auto-Register
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>1-Tap Event Check-In</span>
                  <Link
                    href={registrationUrl}
                    target="_blank"
                    className="text-rose-400 hover:underline font-semibold no-print"
                  >
                    Test QR Link →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- TAB 3: CUSTOM REGISTRATION QR GENERATOR --- */}
      {activeTab === 'custom_builder' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Config Controls */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Registration QR Customizer
            </h3>
            <p className="text-xs text-slate-400">
              Generate a custom registration QR code for banners, entrance stands, or marketing campaigns.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Target DraperU Event
                </label>
                <select
                  value={customEventId}
                  onChange={(e) => setCustomEventId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Entrance Point / Marketing Tag
                </label>
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="e.g. Entrance Gate Stand, VIP Table, WhatsApp Blast"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Optional: Pre-bind to Specific Founder (Fast-Pass QR)
                </label>
                <select
                  value={customFounderId}
                  onChange={(e) => setCustomFounderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                >
                  <option value="">-- General Walk-in / Entrance QR (Anyone) --</option>
                  {founders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.startup.name}) — {f.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Generated QR Preview */}
          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-rose-500/40 shadow-2xl text-center space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Live Generated Registration QR
              </span>
              <h3 className="text-base font-black text-white mt-1">
                {selectedCustomEvent?.title}
              </h3>
              <p className="text-xs text-rose-400 font-semibold">
                Tag: {customTag}
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl max-w-[180px] mx-auto shadow-2xl">
              {typeof window !== 'undefined' && generatedCustomUrl && (
                <QRCodeCard
                  value={generatedCustomUrl}
                  title={selectedCustomEvent?.title || 'Registration'}
                  size={150}
                  showActions={false}
                  className="p-0 border-0 bg-transparent shadow-none"
                />
              )}
            </div>

            <div className="space-y-2 pt-2">
              <input
                type="text"
                readOnly
                value={generatedCustomUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-400 text-center select-all"
              />
              <div className="flex items-center justify-center gap-2">
                <Link
                  href={generatedCustomUrl}
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center gap-1.5"
                >
                  <span>Test Registration Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Poster Modal */}
      {selectedPosterEvent && (
        <Modal
          isOpen={!!selectedPosterEvent}
          onClose={() => setSelectedPosterEvent(null)}
          title={`Print Entrance Registration Poster — ${selectedPosterEvent.title}`}
        >
          <div className="space-y-4 text-center">
            <div className="p-8 rounded-3xl bg-slate-950 border-2 border-rose-500 shadow-2xl space-y-4 print-badge">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-white text-sm">
                  DU
                </div>
                <span className="font-bold text-white text-sm">DRAPERU INDIA</span>
              </div>
              <h2 className="text-xl font-black text-white">{selectedPosterEvent.title}</h2>
              <p className="text-xs text-rose-400 font-bold uppercase">SCAN TO REGISTER & CHECK IN</p>
              <div className="p-4 bg-white rounded-2xl max-w-[200px] mx-auto">
                <QRCodeCard
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/events/${selectedPosterEvent.slug}/register`}
                  title={selectedPosterEvent.title}
                  size={170}
                  showActions={false}
                  className="p-0 border-0 bg-transparent shadow-none"
                />
              </div>
              <p className="text-xs text-slate-300 font-semibold">{selectedPosterEvent.venue}, {selectedPosterEvent.city}</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
            >
              Print Poster Now
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
