'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  Search,
  Filter,
  Users,
  Clock,
  ExternalLink,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { Interaction, InteractionType, Founder } from '@/types';
import { Badge } from '@/components/ui/Badge';

export default function InteractionsFeedPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [foundersMap, setFoundersMap] = useState<Record<string, Founder>>({});
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dataService.init();
    const allInt = dataService.getInteractions();
    setInteractions(allInt);

    const fMap: Record<string, Founder> = {};
    dataService.getFounders().forEach((f) => {
      fMap[f.id] = f;
    });
    setFoundersMap(fMap);
  }, []);

  const getInteractionIcon = (type: InteractionType) => {
    switch (type) {
      case 'event_attendance':
        return <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base">🤝</div>;
      case 'event_registration':
        return <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-base">🟢</div>;
      case 'call':
        return <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-base">📞</div>;
      case 'email':
        return <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-base">📧</div>;
      case 'investor_intro':
        return <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-base">🚀</div>;
      case 'program_application':
        return <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-base">📝</div>;
      default:
        return <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center text-base">💬</div>;
    }
  };

  const filteredInteractions = interactions.filter((int) => {
    if (selectedType !== 'all' && int.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const founder = foundersMap[int.founderId];
      return (
        int.title.toLowerCase().includes(q) ||
        int.description.toLowerCase().includes(q) ||
        (founder && founder.name.toLowerCase().includes(q)) ||
        (founder && founder.startup.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Relationship Log
            </span>
            <span className="text-xs text-slate-400">Chronological Touchpoints</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Founder Interactions & Activity Feed
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search interaction title, founder, startup..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Interaction Types</option>
            <option value="call">Calls</option>
            <option value="email">Emails</option>
            <option value="meeting">Meetings</option>
            <option value="investor_intro">Investor Introductions</option>
            <option value="event_attendance">Event Attendances</option>
            <option value="event_registration">Event Registrations</option>
          </select>
        </div>
      </div>

      {/* Interactions Feed Stream */}
      <div className="space-y-3">
        {filteredInteractions.map((int) => {
          const founder = foundersMap[int.founderId];
          return (
            <div
              key={int.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl transition flex items-start gap-4"
            >
              <div className="shrink-0 mt-0.5">{getInteractionIcon(int.type)}</div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{int.title}</h3>
                    {founder && (
                      <Link
                        href={`/founders/${founder.id}`}
                        className="text-xs text-rose-400 hover:underline font-semibold"
                      >
                        • {founder.name} ({founder.startup.name})
                      </Link>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(int.date).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {int.description}
                </p>

                <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                  <span>Logged by: <strong className="text-slate-300">{int.createdBy}</strong></span>
                  {founder && (
                    <span className="font-mono text-rose-400/80">{founder.id}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
