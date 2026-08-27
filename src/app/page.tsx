'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Rocket,
  CalendarDays,
  CalendarCheck,
  Flame,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  PieChart,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  FileSpreadsheet,
  QrCode,
  Sparkles,
  PhoneCall,
  Search,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { ExecutiveMetrics, DraperUEvent, FollowUp, Founder } from '@/types';
import { Badge } from '@/components/ui/Badge';

export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [events, setEvents] = useState<DraperUEvent[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [recentFounders, setRecentFounders] = useState<Founder[]>([]);

  useEffect(() => {
    dataService.init();
    setMetrics(dataService.getExecutiveMetrics());
    setEvents(dataService.getEvents());
    setFollowUps(dataService.getFollowUps().slice(0, 5));
    setRecentFounders(dataService.getFounders().slice(0, 5));
  }, []);

  if (!metrics) return null;

  const liveEvent = events.find((e) => e.status === 'live') || events[0];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Brand Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 shrink-0 rounded-2xl overflow-hidden bg-slate-700 border border-cyan-400/30 shadow-lg shadow-cyan-500/20">
            <img
              src="/draperu-logo.svg"
              alt="DraperU India logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
              DraperU India Ecosystem
            </span>
            <span className="text-xs text-slate-400">Founder Intelligence & CRM Control Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
            Founder Intelligence Dashboard
          </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/search"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Founder Search</span>
          </Link>
          <Link
            href="/import"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
            <span>Import Google Sheet</span>
          </Link>
          <Link
            href="/checkin"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Event Fast Scanner</span>
          </Link>
        </div>
      </div>

      {/* Row 1: Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Founders */}
        <Link
          href="/founders"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Founders</span>
            <Users className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {metrics.totalFounders.toLocaleString()}+
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>+124 this month</span>
          </div>
        </Link>

        {/* Startups */}
        <Link
          href="/startups"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Startups</span>
            <Rocket className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {metrics.totalStartups.toLocaleString()}+
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Across 9 sectors
          </div>
        </Link>

        {/* Events */}
        <Link
          href="/events"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Events</span>
            <CalendarDays className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {metrics.totalEvents}+
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">
            1 Live right now
          </div>
        </Link>

        {/* Follow-ups */}
        <Link
          href="/follow-ups"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Follow-ups</span>
            <CalendarCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-2">
            {metrics.followUpsCount.totalActive}
          </div>
          <div className="text-[10px] text-rose-400 mt-1 font-semibold">
            {metrics.followUpsCount.overdue} Overdue
          </div>
        </Link>

        {/* High Priority */}
        <Link
          href="/founders?filter=priority"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">High Priority</span>
            <Flame className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-2">
            {metrics.highPriorityFounders}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Fundraising / VIP
          </div>
        </Link>

        {/* New This Month */}
        <Link
          href="/founders?filter=new"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">New This Month</span>
            <UserPlus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-2">
            {metrics.newFoundersThisMonth}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">
            QR Auto-registered
          </div>
        </Link>
      </div>

      {/* Row 2: Charts & Sector Intelligence Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Velocity Simulation */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              Founder Growth Velocity
            </h3>
            <span className="text-[11px] text-emerald-400 font-semibold">+38% YoY</span>
          </div>

          <p className="text-xs text-slate-400">
            Monthly cumulative registered founders via automated event QR check-ins.
          </p>

          {/* Stylized CSS Bar Trend */}
          <div className="pt-4 flex items-end justify-between gap-2 h-36 border-b border-slate-800 pb-2">
            {[
              { month: 'Mar', count: '1.8K', h: '35%' },
              { month: 'Apr', count: '2.4K', h: '45%' },
              { month: 'May', count: '3.1K', h: '60%' },
              { month: 'Jun', count: '3.9K', h: '72%' },
              { month: 'Jul', count: '4.6K', h: '85%' },
              { month: 'Aug', count: '5.4K', h: '100%' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[9px] font-mono text-slate-400 group-hover:text-rose-400">{bar.count}</span>
                <div className="w-full bg-slate-950 rounded-t-lg h-24 flex items-end overflow-hidden">
                  <div
                    style={{ height: bar.h }}
                    className="w-full bg-gradient-to-t from-rose-600 to-amber-500 rounded-t-md group-hover:brightness-125 transition-all"
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-400">{bar.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Primary Channels: Event QR (72%)</span>
            <span className="text-rose-400 font-semibold">5,420 Active Founders</span>
          </div>
        </div>

        {/* Startup Sectors Distribution */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              Startup Sectors Breakdown
            </h3>
            <Link href="/startups" className="text-xs text-rose-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-2.5 pt-1">
            {[
              { name: 'AI / ML', pct: 34, color: 'bg-rose-500', count: '1,840' },
              { name: 'SaaS & Enterprise', pct: 26, color: 'bg-indigo-500', count: '1,410' },
              { name: 'FinTech & Cross-border', pct: 16, color: 'bg-amber-500', count: '860' },
              { name: 'HealthTech & Bio', pct: 12, color: 'bg-emerald-500', count: '650' },
              { name: 'DeepTech & Hardware', pct: 8, color: 'bg-cyan-500', count: '430' },
              { name: 'ClimateTech & Others', pct: 4, color: 'bg-purple-500', count: '230' },
            ].map((sec, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-200">{sec.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{sec.count} ({sec.pct}%)</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${sec.pct}%` }}
                    className={`h-full rounded-full ${sec.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Live Event Spotlight */}
        {liveEvent && (
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Live Event Spotlight
                </span>
                <span className="text-xs text-slate-400">{liveEvent.city}</span>
              </div>

              <h4 className="text-base font-black text-white mt-2.5">
                {liveEvent.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {liveEvent.tagline}
              </p>

              {/* Progress Meter */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Attendance:</span>
                  <span className="font-bold text-emerald-400">
                    {liveEvent.checkedInCount} / {liveEvent.registeredCount} Checked In
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    style={{
                      width: `${liveEvent.registeredCount > 0 ? (liveEvent.checkedInCount / liveEvent.registeredCount) * 100 : 0}%`,
                    }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>{liveEvent.newFoundersCount} New Founders</span>
                  <span>{liveEvent.existingFoundersCount} Existing</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Link
                href={`/events/${liveEvent.slug}/register`}
                target="_blank"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition flex items-center justify-center gap-1"
              >
                <span>Event QR Link</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/checkin"
                className="flex-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold text-center shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-1"
              >
                <span>Check-in Desk</span>
                <QrCode className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: High Priority Follow-ups & Recent Founders Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming High-Signal Follow-ups */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-400" />
                Upcoming Priority Follow-ups
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated tasks generated from recent DraperU events and founder calls.
              </p>
            </div>
            <Link
              href="/follow-ups"
              className="text-xs font-semibold text-rose-400 hover:underline"
            >
              View all ({metrics.followUpsCount.totalActive})
            </Link>
          </div>

          <div className="space-y-2.5">
            {followUps.map((f) => (
              <div
                key={f.id}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{f.founderName}</span>
                    <span className="text-[11px] text-slate-400">({f.founderCompany})</span>
                    {f.status === 'overdue' && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1">{f.title}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      Due: {f.dueDate}
                    </span>
                    <span>Assigned: <strong className="text-slate-300">{f.assignedTo}</strong></span>
                  </div>
                </div>

                <Link
                  href={`/founders/${f.founderId}`}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium shrink-0 transition"
                >
                  Action
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Registered / Verified Founders */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500" />
                Recent Founder Ingestions
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Founders active in the ecosystem across India.
              </p>
            </div>
            <Link
              href="/founders"
              className="text-xs font-semibold text-rose-400 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentFounders.map((founder) => (
              <Link
                key={founder.id}
                href={`/founders/${founder.id}`}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-rose-500/40 transition flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700 group-hover:border-rose-500/40">
                    {founder.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs group-hover:text-rose-400 transition">
                        {founder.name}
                      </span>
                      <span className="font-mono text-[10px] text-rose-400 bg-rose-500/10 px-1.5 rounded">
                        {founder.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {founder.designation} at <strong className="text-slate-300">{founder.startup.name}</strong> • {founder.startup.sector}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <Badge variant={founder.funding.type === 'Funded' ? 'success' : 'neutral'} size="sm">
                    {founder.funding.stage}
                  </Badge>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{founder.location.split(',')[0]}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
