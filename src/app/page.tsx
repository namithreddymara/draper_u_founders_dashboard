'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Rocket,
  CalendarDays,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  QrCode,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { ExecutiveMetrics, DraperUEvent, Founder } from '@/types';
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

// ──────────────────────────────────────────────────
// Main Dashboard
// ──────────────────────────────────────────────────

export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [recentFounders, setRecentFounders] = useState<Founder[]>([]);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const refreshData = () => {
    dataService.init();
    setMetrics(dataService.getExecutiveMetrics());
    const founders = dataService.getFounders();
    const registrations = dataService.getRegistrations();
    setRecentFounders(founders.slice(0, 5));
    setRegistrationCount(registrations.length);
    setCheckedInCount(registrations.filter((registration) => registration.checkedIn).length);
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
      value: metrics.totalFounders,
      icon: Users,
      iconBg: '#2563eb',
      change: metrics.totalFounders ? 'Live data' : 'No data yet',
      changeUp: true,
    },
    {
      label: 'Startups',
      value: metrics.totalStartups,
      icon: Rocket,
      iconBg: '#7c3aed',
      change: metrics.totalStartups ? 'Live data' : 'No data yet',
      changeUp: true,
    },
    {
      label: 'Events',
      value: metrics.totalEvents,
      icon: CalendarDays,
      iconBg: '#0ea5e9',
      change: metrics.totalEvents ? 'Live data' : 'No data yet',
      changeUp: true,
    },
    {
      label: 'Registrations',
      value: registrationCount,
      icon: ClipboardList,
      iconBg: '#10b981',
      change: registrationCount ? 'Live data' : 'No data yet',
      changeUp: true,
    },
  ];

  const sectorColors = ['#2563eb', '#7c3aed', '#f59e0b', '#10b981', '#ef4444', '#9ca3af'];
  const sectorSlices = metrics.sectorBreakdown.map((sector, index) => ({
    color: sectorColors[index % sectorColors.length],
    pct: sector.percentage,
    name: sector.sector,
  }));
  const registrationPct = registrationCount ? Math.round((checkedInCount / registrationCount) * 100) : 0;
  const pendingCount = registrationCount - checkedInCount;

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Row 2: Sectors | Event Registrations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Startup Sectors */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Startup Sectors</h3>
          </div>
          <div className="flex items-center gap-4">
            <DonutChart
              slices={sectorSlices.map((s) => ({ color: s.color, pct: s.pct }))}
              total={metrics.totalStartups}
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
              slices={[{ color: '#2563eb', pct: registrationPct }, { color: '#f59e0b', pct: 100 - registrationPct }]}
              total={registrationCount}
              label="Total"
            />
            <div className="flex-1 space-y-2.5">
              {[
                { dot: '#2563eb', label: 'Checked In', val: `${checkedInCount} (${registrationPct}%)` },
                { dot: '#10b981', label: 'Registered', val: `${registrationCount} (100%)` },
                { dot: '#f59e0b', label: 'Pending', val: `${pendingCount} (${100 - registrationPct}%)` },
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
      </div>

      {/* ── Row 3: Recent Registrations ── */}
      <div className="grid grid-cols-1 gap-4">
        {/* Recent Registrations */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Recent Registrations</h3>
            <Link href="/founders" className="text-xs font-semibold" style={{ color: '#2563eb' }}>
              View all
            </Link>
          </div>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-y border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2 font-semibold">Founder</th>
                  <th className="px-3 py-2 font-semibold">Sector / Category</th>
                  <th className="px-3 py-2 font-semibold">Organization</th>
                  <th className="px-3 py-2 font-semibold">Registered On</th>
                  <th className="px-3 py-2 font-semibold">ID</th>
                  <th className="px-5 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentFounders.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                    <td className="px-5 py-2.5">
                      <Link href={`/founders/${r.id}`} className="flex items-center gap-2.5 text-xs font-bold text-slate-800 hover:text-blue-600 whitespace-nowrap">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 bg-blue-600">
                          {r.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-slate-600 whitespace-nowrap">{r.startup.sector}</td>
                    <td className="px-3 py-2.5 text-[11px] text-slate-600 whitespace-nowrap">{r.startup.name}</td>
                    <td className="px-3 py-2.5 text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-1 rounded">{r.id}</span>
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Registered
                      </span>
                    </td>
                  </tr>
                ))}
                {recentFounders.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-400">No founder registrations yet.</td></tr>
                )}
              </tbody>
            </table>
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
