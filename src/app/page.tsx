'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Rocket,
  CalendarDays,
  ClipboardList,
  CalendarCheck,
  Flame,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Clock,
  Circle,
  PlusCircle,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { ExecutiveMetrics, DraperUEvent, FollowUp, Founder } from '@/types';
import { AddFounderModal } from '@/components/founders/AddFounderModal';
import { FounderQRModal } from '@/components/founders/FounderQRModal';

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  change,
  changeUp,
  suffix = '',
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  change: string;
  changeUp: boolean;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">{label}</span>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: iconBg }}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="text-2xl font-black text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      <div className={`flex items-center gap-1 text-[11px] font-semibold ${changeUp ? 'text-emerald-600' : 'text-red-500'}`}>
        {changeUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{change}</span>
        <span className="text-gray-400 font-normal">vs last month</span>
      </div>
    </div>
  );
}

// Donut chart (SVG)
function DonutChart({
  slices,
  total,
  label,
}: {
  slices: { color: string; pct: number }[];
  total: number;
  label: string;
}) {
  const R = 52;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * R;

  let offset = -0.25 * circumference;
  const arcs = slices.map((s) => {
    const len = (s.pct / 100) * circumference;
    const arc = { color: s.color, offset, len };
    offset += len;
    return arc;
  });

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg viewBox="0 0 140 140" className="absolute inset-0 w-full h-full">
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={arc.color}
            strokeWidth="22"
            strokeDasharray={`${arc.len} ${circumference - arc.len}`}
            strokeDashoffset={-arc.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
        <circle cx={cx} cy={cy} r="38" fill="white" />
      </svg>
      <div className="relative z-10 text-center">
        <div className="text-xl font-black text-gray-900">{total.toLocaleString()}</div>
        <div className="text-[9px] text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#6b7280',
};

const PRIORITY_BG: Record<string, string> = {
  High: '#fee2e2',
  Medium: '#fef3c7',
  Low: '#f3f4f6',
};

// ──────────────────────────────────────────────────
// Main Dashboard
// ──────────────────────────────────────────────────

export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [recentFounders, setRecentFounders] = useState<Founder[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const refreshData = () => {
    dataService.init();
    setMetrics(dataService.getExecutiveMetrics());
    setFollowUps(dataService.getFollowUps().slice(0, 4));
    setRecentFounders(dataService.getFounders().slice(0, 5));
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = dataService.subscribeToDataUpdates(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  if (!metrics) return null;

  const statCards = [
    {
      label: 'Total Founders',
      value: metrics.totalFounders || 5124,
      icon: Users,
      iconBg: '#2563eb',
      change: '↑ 12.4%',
      changeUp: true,
    },
    {
      label: 'Startups',
      value: metrics.totalStartups || 3208,
      icon: Rocket,
      iconBg: '#7c3aed',
      change: '↑ 8.7%',
      changeUp: true,
    },
    {
      label: 'Events',
      value: metrics.totalEvents || 512,
      icon: CalendarDays,
      iconBg: '#0ea5e9',
      change: '↑ 16.2%',
      changeUp: true,
    },
    {
      label: 'Registrations',
      value: 1248,
      icon: ClipboardList,
      iconBg: '#10b981',
      change: '↑ 10.3%',
      changeUp: true,
    },
    {
      label: 'Follow-ups',
      value: metrics.followUpsCount.totalActive || 43,
      icon: CalendarCheck,
      iconBg: '#6366f1',
      change: '↓ 5.1%',
      changeUp: false,
    },
    {
      label: 'Hot Leads',
      value: metrics.highPriorityFounders || 87,
      icon: Flame,
      iconBg: '#ef4444',
      change: '↑ 13.6%',
      changeUp: true,
    },
  ];

  const sectorSlices = [
    { color: '#2563eb', pct: 28, name: 'AI / ML' },
    { color: '#7c3aed', pct: 24, name: 'SaaS' },
    { color: '#f59e0b', pct: 16, name: 'FinTech' },
    { color: '#10b981', pct: 12, name: 'HealthTech' },
    { color: '#ef4444', pct: 8, name: 'DeepTech' },
    { color: '#9ca3af', pct: 12, name: 'Others' },
  ];

  const upcomingFollowUps = [
    { name: 'Rahul Sharma', topic: 'Investor Introduction', date: 'Tomorrow', priority: 'High', avatar: 'RS' },
    { name: 'Priya Reddy', topic: 'Funding Discussion', date: '25 Aug, 2026', priority: 'Medium', avatar: 'PR' },
    { name: 'Arjun Kumar', topic: 'Event Invitation', date: '27 Aug, 2026', priority: 'Medium', avatar: 'AK' },
    { name: 'Neha Verma', topic: 'Mentorship Follow-up', date: '28 Aug, 2026', priority: 'Low', avatar: 'NV' },
  ];

  const topCities = [
    { city: 'Bengaluru', count: 1248, max: 1248 },
    { city: 'Hyderabad', count: 892, max: 1248 },
    { city: 'Mumbai', count: 768, max: 1248 },
    { city: 'Delhi', count: 512, max: 1248 },
    { city: 'Pune', count: 420, max: 1248 },
  ];

  return (
    <div className="space-y-6">
      {/* ── Quick Ingestion Action Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">Founder Ingestion Hub</span>
          <span className="text-[11px] text-slate-400">| Manual entry & Self-Registration QR</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Registration QR</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Founder</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Row 2: Sectors | Follow-ups ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Startup Sectors */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Startup Sectors</h3>
          </div>
          <div className="flex items-center gap-4">
            <DonutChart
              slices={sectorSlices.map((s) => ({ color: s.color, pct: s.pct }))}
              total={metrics.totalStartups || 3208}
              label="Startups"
            />
            <div className="flex-1 space-y-1.5">
              {sectorSlices.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-[11px] text-gray-600 flex-1">{s.name}</span>
                  <span className="text-[11px] font-bold text-gray-900">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Upcoming Follow-ups</h3>
            <Link href="/follow-ups" className="text-xs font-semibold" style={{ color: '#2563eb' }}>
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingFollowUps.map((f) => (
              <div key={f.name} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: '#2563eb' }}
                >
                  {f.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">{f.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{f.topic}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[10px] text-gray-500">{f.date}</div>
                  <span
                    className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5"
                    style={{ color: PRIORITY_COLORS[f.priority], background: PRIORITY_BG[f.priority] }}
                  >
                    {f.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Recent Regs | Event Registrations | Top Cities ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Registrations */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Recent Registrations</h3>
            <Link href="/founders" className="text-xs font-semibold" style={{ color: '#2563eb' }}>
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentFounders.map((r) => (
              <div key={r.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: '#2563eb' }}
                >
                  {r.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/founders/${r.id}`} className="text-xs font-bold text-gray-900 hover:text-blue-600 truncate block">
                    {r.name}
                  </Link>
                  <div className="text-[10px] text-gray-500 truncate">{r.startup.name} · {r.startup.sector}</div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{r.id}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Registrations Today */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Event Registrations (Today)</h3>
            <Link href="/events" className="text-xs font-semibold" style={{ color: '#2563eb' }}>
              View all
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <DonutChart
              slices={[
                { color: '#2563eb', pct: 68 },
                { color: '#f59e0b', pct: 32 },
              ]}
              total={127}
              label="Total"
            />
            <div className="flex-1 space-y-2.5">
              {[
                { dot: '#2563eb', label: 'Checked In', val: '86 (57%)' },
                { dot: '#10b981', label: 'Registered', val: '127 (100%)' },
                { dot: '#f59e0b', label: 'Pending', val: '41 (33%)' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.dot }} />
                  <span className="text-[11px] text-gray-600 flex-1">{item.label}</span>
                  <span className="text-[11px] font-bold text-gray-900">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Top Cities</h3>
            <Link href="/analytics" className="text-xs font-semibold" style={{ color: '#2563eb' }}>
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {topCities.map((c) => (
              <div key={c.city}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">{c.city}</span>
                  <span className="text-xs font-bold text-gray-900">{c.count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(c.count / c.max) * 100}%`,
                      background: '#2563eb',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddFounderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onFounderCreated={() => refreshData()}
      />

      <FounderQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
}
