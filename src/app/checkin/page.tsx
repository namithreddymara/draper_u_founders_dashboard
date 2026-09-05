'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Search,
  CheckCircle2,
  Users,
  Clock,
  Building,
  UserCheck,
  AlertCircle,
  Camera,
  RotateCcw,
  Sparkles,
  ArrowRight,
  UserPlus,
  Volume2,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { DraperUEvent, Founder, EventRegistration } from '@/types';
import { Badge } from '@/components/ui/Badge';

export default function EntranceCheckInKiosk() {
  const [events, setEvents] = useState<DraperUEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentCheckin, setRecentCheckin] = useState<{
    founderName: string;
    company: string;
    founderId: string;
    time: string;
  } | null>(null);
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'warn' | 'error' } | null>(null);

  const scanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dataService.init();
    Promise.all([dataService.refreshEvents(), dataService.refreshRegistrations()]).then(([allEvents]) => {
      setEvents(allEvents);
      if (allEvents.length > 0) {
        setSelectedEventId(allEvents[0].id);
        setRegistrations(dataService.getRegistrations(allEvents[0].id));
      }
    });
  }, []);

  const loadRegistrations = (eventId: string) => {
    const regs = dataService.getRegistrations(eventId);
    setRegistrations(regs);
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    loadRegistrations(eventId);
    setFeedbackMsg(null);
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const handlePerformCheckin = (founderId: string) => {
    if (!selectedEvent) return;

    const res = dataService.checkInFounder(selectedEvent.id, founderId);
    if (res.success && res.registration) {
      setFeedbackMsg({ text: res.message, type: 'success' });
      setRecentCheckin({
        founderName: res.registration.founderName,
        company: res.registration.founderCompany,
        founderId: res.registration.founderId,
        time: new Date().toLocaleTimeString(),
      });
      loadRegistrations(selectedEvent.id);
      setEvents(dataService.getEvents()); // refresh counts
    } else {
      setFeedbackMsg({ text: res.message, type: 'error' });
    }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    let targetFounderId = scanInput.trim();
    // if URL was scanned, extract DRU-F-XXXXXX
    const match = targetFounderId.match(/DRU-F-\d+/i);
    if (match) {
      targetFounderId = match[0].toUpperCase();
    }

    const founder = dataService.getFounderById(targetFounderId) || 
      dataService.getFounders().find(f => f.email.toLowerCase() === scanInput.trim().toLowerCase() || f.phone.includes(scanInput.trim()));

    if (founder) {
      handlePerformCheckin(founder.id);
      setScanInput('');
    } else {
      setFeedbackMsg({
        text: `No founder found for scan code: "${scanInput}". Try registering them as a walk-in.`,
        type: 'error',
      });
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.founderName.toLowerCase().includes(q) ||
      r.founderCompany.toLowerCase().includes(q) ||
      r.founderId.toLowerCase().includes(q) ||
      r.founderEmail.toLowerCase().includes(q) ||
      r.founderPhone.includes(q)
    );
  });

  const checkedInCount = registrations.filter((r) => r.checkedIn).length;
  const pendingCount = registrations.length - checkedInCount;
  const newCount = registrations.filter((r) => r.isNewFounder).length;
  const existingCount = registrations.length - newCount;

  return (
    <div className="space-y-6">
      {/* Top Banner / Event Selector Header */}
      <div className="event-registration-theme p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Entrance Desk
            </span>
            <span className="text-xs text-slate-400">DraperU Fast Scanner Kiosk</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            {selectedEvent?.title || 'Founder Mafia Night'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedEvent?.venue}, {selectedEvent?.city} • Real-time entrance attendance & QR verification.
          </p>
        </div>

        {/* Event Switcher */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedEventId}
            onChange={(e) => handleSelectEvent(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:border-rose-500 focus:outline-none"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.city})
              </option>
            ))}
          </select>

          <Link
            href={`/events/${selectedEvent?.slug}/register`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Walk-in Reg</span>
          </Link>
        </div>
      </div>

      {/* Real-time Entrance KPIs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="event-registration-theme p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Registered
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {registrations.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Capacity: {selectedEvent?.capacity || 150}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            Checked In
          </span>
          <div className="text-2xl font-black text-emerald-300 mt-1">
            {checkedInCount}
          </div>
          <div className="text-[10px] text-emerald-400/70 mt-0.5">
            {registrations.length > 0 ? Math.round((checkedInCount / registrations.length) * 100) : 0}% turn-up rate
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending Arrival
          </span>
          <div className="text-2xl font-black text-amber-300 mt-1">
            {pendingCount}
          </div>
          <div className="text-[10px] text-amber-400/70 mt-0.5">
            Awaiting entrance scan
          </div>
        </div>

        <div className="event-registration-theme p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            New vs Existing
          </span>
          <div className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
            <span className="text-indigo-400">{newCount} New</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">{existingCount} Existing</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {newCount} first-time Draper IDs
          </div>
        </div>
      </div>

      {/* Instant Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-white text-xs underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Check-In Controls (Scanner & Fast Search Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1/3: Barcode / QR Scanner Input Box */}
        <div className="event-registration-theme p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-rose-500" />
              Badge / QR Fast Scan
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-950 rounded border border-slate-800">
              Auto-detect
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Scan the founder's badge QR, phone screen pass, or type their permanent ID (`DRU-F-000124`).
          </p>

          <form onSubmit={handleScanSubmit} className="space-y-3">
            <div className="relative">
              <input
                ref={scanInputRef}
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan QR or enter DRU-F-XXXXXX..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Verify & Check In</span>
            </button>
          </form>

          {/* Quick Sample Scan Shortcuts */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 block">
              1-Click Test Scanners:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setScanInput('DRU-F-000124');
                  handlePerformCheckin('DRU-F-000124');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono transition"
              >
                Scan Rahul (DRU-F-000124)
              </button>
              <button
                type="button"
                onClick={() => {
                  setScanInput('DRU-F-000130');
                  handlePerformCheckin('DRU-F-000130');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono transition"
              >
                Scan Tanmay (DRU-F-000130)
              </button>
            </div>
          </div>

          {/* Recent Checkin Highlight */}
          {recentCheckin && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs animate-fadeIn">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Latest Checked In
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">{recentCheckin.founderName}</h4>
              <p className="text-xs text-slate-400">{recentCheckin.company} • <span className="font-mono text-emerald-400">{recentCheckin.founderId}</span></p>
              <span className="text-[10px] text-slate-400 block mt-1">Checked in at {recentCheckin.time}</span>
            </div>
          )}
        </div>

        {/* Right 2/3: Live Attendee Search & Tap-to-Checkin List */}
        <div className="event-registration-theme lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Event Registration Roster ({filteredRegistrations.length})
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, startup, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                  <th className="pb-3 pl-2">Founder & ID</th>
                  <th className="pb-3">Startup & Sector</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 pl-2">
                      <div className="font-bold text-white">{reg.founderName}</div>
                      <div className="font-mono text-[10px] text-rose-400">{reg.founderId}</div>
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-slate-200">{reg.founderCompany}</div>
                      <div className="text-[10px] text-slate-400">{reg.founderSector}</div>
                    </td>
                    <td className="py-3">
                      {reg.isNewFounder ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                          New
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-800 text-slate-300">
                          Existing
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {reg.checkedIn ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-2">
                      {reg.checkedIn ? (
                        <Link
                          href={`/f/${reg.founderId}`}
                          target="_blank"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
                        >
                          View Pass
                        </Link>
                      ) : (
                        <button
                          onClick={() => handlePerformCheckin(reg.founderId)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 flex items-center gap-1 ml-auto transition"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Check In</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRegistrations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      No matching registered founders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
