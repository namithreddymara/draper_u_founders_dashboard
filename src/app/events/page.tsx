'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  PlusCircle,
  QrCode,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  ExternalLink,
  Printer,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { DraperUEvent } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { QRCodeCard } from '@/components/ui/QRCodeCard';
import { Suspense } from 'react';

function EventsManagementContent() {
  const searchParams = useSearchParams();
  const shouldCreate = searchParams.get('create') === 'true';

  const [events, setEvents] = useState<DraperUEvent[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(shouldCreate);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'live' | 'past'>('all');
  const [selectedQRPosterEvent, setSelectedQRPosterEvent] = useState<DraperUEvent | null>(null);

  // New Event Form
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    slug: '',
    tagline: '',
    description: '',
    date: '2026-09-04T18:00',
    venue: 'Draper Startup House, Koramangala',
    city: 'Bengaluru',
    category: 'Founder Mafia Night' as DraperUEvent['category'],
    status: 'upcoming' as DraperUEvent['status'],
    capacity: 150,
  });

  useEffect(() => {
    dataService.init();
    setEvents(dataService.getEvents());
  }, []);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventForm.title.trim()) return;

    const slug = newEventForm.slug.trim() || newEventForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created = dataService.createEvent({
      title: newEventForm.title,
      slug,
      tagline: newEventForm.tagline,
      description: newEventForm.description,
      date: newEventForm.date,
      venue: newEventForm.venue,
      city: newEventForm.city,
      category: newEventForm.category,
      status: newEventForm.status,
      capacity: Number(newEventForm.capacity) || 100,
      allowWalkins: true,
    });

    setEvents(dataService.getEvents());
    setIsCreateModalOpen(false);
  };

  const filteredEvents = events.filter((e) => {
    if (activeTab === 'all') return true;
    return e.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
              Event Management
            </span>
            <span className="text-xs text-slate-400">Automated QR Registration System</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            DraperU India Events
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/checkin"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Fast Check-in Kiosk</span>
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['all', 'live', 'upcoming', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              activeTab === tab
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab === 'all' ? 'All Events' : tab}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl transition flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              {/* Event Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-slate-300">
                      {evt.category}
                    </span>
                    {evt.status === 'live' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        Live Now
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight mt-1.5">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {evt.tagline}
                  </p>
                </div>
              </div>

              {/* Date & Location */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  <CalendarDays className="w-3.5 h-3.5 text-rose-400" />
                  {new Date(evt.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {evt.venue}, {evt.city}
                </span>
              </div>

              {/* Registration & Check-in Progress Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Entrance Registrations</span>
                  <span className="font-bold text-white">
                    {evt.registeredCount} Registered / {evt.capacity} Cap
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${Math.min((evt.registeredCount / evt.capacity) * 100, 100)}%` }}
                    className="h-full rounded-full bg-rose-500"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    {evt.checkedInCount} Checked In
                  </span>
                  <span>
                    {evt.newFoundersCount} New • {evt.existingFoundersCount} Existing
                  </span>
                </div>
              </div>
            </div>

            {/* Event Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedQRPosterEvent(evt)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <QrCode className="w-3.5 h-3.5 text-rose-400" />
                <span>Entrance QR Poster</span>
              </button>

              <Link
                href={`/events/${evt.slug}/register`}
                target="_blank"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1"
              >
                <span>Live Form</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>

              <Link
                href={`/checkin`}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center gap-1"
              >
                <span>Check-in Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Event QR Poster Modal */}
      {selectedQRPosterEvent && (
        <Modal
          isOpen={!!selectedQRPosterEvent}
          onClose={() => setSelectedQRPosterEvent(null)}
          title={`Printable Entrance Poster — ${selectedQRPosterEvent.title}`}
          subtitle="Place this dynamic QR at the entrance table or project on event displays."
          maxWidth="lg"
        >
          <div className="space-y-6 text-center">
            {/* High-res printable poster preview */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-rose-500/50 shadow-2xl space-y-4 print-badge">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-white text-sm">
                  DU
                </div>
                <span className="font-black text-white text-sm tracking-tight">
                  DRAPER<span className="text-rose-500">U</span> INDIA
                </span>
              </div>

              <h2 className="text-xl font-black text-white tracking-tight">
                {selectedQRPosterEvent.title}
              </h2>
              <p className="text-xs text-rose-400 font-semibold">
                SCAN TO REGISTER & CHECK IN
              </p>

              <div className="p-4 bg-white rounded-2xl max-w-[200px] mx-auto shadow-xl">
                {typeof window !== 'undefined' && (
                  <QRCodeCard
                    value={`${window.location.origin}/events/${selectedQRPosterEvent.slug}/register`}
                    title={selectedQRPosterEvent.title}
                    size={170}
                    showActions={false}
                    className="p-0 border-0 bg-transparent shadow-none"
                  />
                )}
              </div>

              <div className="text-xs text-slate-300 pt-1">
                <p className="font-semibold">{selectedQRPosterEvent.venue}, {selectedQRPosterEvent.city}</p>
                <p className="text-slate-400 text-[11px]">Instant permanent Founder ID generation & attendee verification</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Poster</span>
              </button>
              <Link
                href={`/events/${selectedQRPosterEvent.slug}/register`}
                target="_blank"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                <span>Test Live QR URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create DraperU Event"
        subtitle="Generates dynamic entrance QR, roster, and automated post-event follow-up pipelines."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Founder Mafia Night — Mumbai"
              value={newEventForm.title}
              onChange={(e) =>
                setNewEventForm({
                  ...newEventForm,
                  title: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={newEventForm.category}
                onChange={(e) =>
                  setNewEventForm({
                    ...newEventForm,
                    category: e.target.value as DraperUEvent['category'],
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="Founder Mafia Night">Founder Mafia Night</option>
                <option value="Founder Friday">Founder Friday</option>
                <option value="Demo Day">Demo Day</option>
                <option value="Mixer">Mixer / Roundtable</option>
                <option value="Flagship Summit">Flagship Summit</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={newEventForm.city}
                onChange={(e) => setNewEventForm({ ...newEventForm, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Venue Address
            </label>
            <input
              type="text"
              required
              value={newEventForm.venue}
              onChange={(e) => setNewEventForm({ ...newEventForm, venue: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              placeholder="High-signal networking for top 1% tech founders"
              value={newEventForm.tagline}
              onChange={(e) => setNewEventForm({ ...newEventForm, tagline: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
            >
              Create & Generate QR
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function EventsManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading DraperU Events...</div>}>
      <EventsManagementContent />
    </Suspense>
  );
}
