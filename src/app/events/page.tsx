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
  Trash2,
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
    dataService.refreshEvents().then(setEvents);
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

  const handleDeleteEvent = async (event: DraperUEvent) => {
    if (!window.confirm(`Delete ${event.title}? This will also remove its registrations.`)) return;
    try {
      const deleted = await dataService.deleteEvent(event.id);
      if (deleted) {
        setEvents((current) => current.filter((candidate) => candidate.id !== event.id));
        if (selectedQRPosterEvent?.id === event.id) setSelectedQRPosterEvent(null);
      } else {
        alert('The event could not be deleted from the shared database. Run the latest Supabase schema policy, then try again.');
      }
    } catch (err) {
      alert('The event could not be deleted from the shared database. Run the latest Supabase schema policy, then try again.');
    }
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
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              Event Management
            </span>
            <span className="text-xs text-slate-500">Automated QR Registration System</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            DraperU India Events
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/checkin"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Fast Check-in Kiosk</span>
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['all', 'live', 'upcoming', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
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
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm transition flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              {/* Event Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-600">
                      {evt.category}
                    </span>
                    {evt.status === 'live' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Live Now
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1.5">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {evt.tagline}
                  </p>
                </div>
              </div>

              {/* Date & Location */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                  {new Date(evt.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {evt.venue}, {evt.city}
                </span>
              </div>

              {/* Registration & Check-in Progress Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Entrance Registrations</span>
                  <span className="font-bold text-slate-900">
                    {evt.registeredCount} Registered / {evt.capacity} Cap
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${Math.min((evt.registeredCount / evt.capacity) * 100, 100)}%` }}
                    className="h-full rounded-full bg-blue-600"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
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
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedQRPosterEvent(evt)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span>Entrance QR Poster</span>
              </button>

              <Link
                href={`/events/${evt.slug}/register`}
                target="_blank"
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium transition flex items-center gap-1"
              >
                <span>Live Form</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </Link>

              <Link
                href={`/checkin`}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition flex items-center gap-1"
              >
                <span>Check-in Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => handleDeleteEvent(evt)}
                aria-label={`Delete ${evt.title}`}
                title="Delete event"
                className="p-2 rounded-xl border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
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
            <div className="p-8 rounded-3xl bg-white border-2 border-blue-200 shadow-xl space-y-4 print-badge">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm">
                  DU
                </div>
                <span className="font-black text-slate-900 text-sm tracking-tight">
                  DRAPER<span className="text-blue-600">U</span> INDIA
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {selectedQRPosterEvent.title}
              </h2>
              <p className="text-xs text-blue-600 font-semibold">
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
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Poster</span>
              </button>
              <Link
                href={`/events/${selectedQRPosterEvent.slug}/register`}
                target="_blank"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition flex items-center gap-1.5"
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
              Event Title <span className="text-blue-600">*</span>
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition"
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
