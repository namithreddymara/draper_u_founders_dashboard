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
  ChevronDown,
  CheckCircle2,
  Clock,
  Circle,
  ArrowUpRight,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { ExecutiveMetrics, DraperUEvent, FollowUp, Founder } from '@/types';

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

// Simple SVG line chart
function FounderGrowthChart() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const values = [1200, 1800, 2400, 3100, 3700, 4200, 4700, 5124];
  const max = 6000;
  const W = 340;
  const H = 120;
  const pad = { l: 28, r: 12, t: 10, b: 28 };

  const pts = values.map((v, i) => ({
    x: pad.l + (i / (values.length - 1)) * (W - pad.l - pad.r),
    y: pad.t + (1 - v / max) * (H - pad.t - pad.b),
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${pts[0].x},${H - pad.b} ${polyline} ${pts[pts.length - 1].x},${H - pad.b}`;

  return (
    <div className="relative w-full" style={{ height: H + 20 }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <polygon points={area} fill="url(#lineGrad)" />
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Last point dot */}
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="4" fill="#2563eb" stroke="white" strokeWidth="2" />
        {/* Last value label */}
        <text x={pts[pts.length - 1].x} y={pts[pts.length - 1].y - 8} textAnchor="middle" fill="#2563eb" fontSize="9" fontWeight="700">
          5,124
        </text>
        {/* Y-axis gridlines */}
        {[0, 2000, 4000, 6000].map((v) => {
          const y = pad.t + (1 - v / max) * (H - pad.t - pad.b);
          return (
            <g key={v}>
              <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="#f0f4f8" strokeWidth="1" />
              <text x={pad.l - 4} y={y + 3} textAnchor="end" fill="#9ca3af" fontSize="7">
                {v === 0 ? '0' : `${v / 1000}K`}
              </text>
            </g>
          );
        })}
        {/* X-axis labels */}
        {months.map((m, i) => {
          const x = pad.l + (i / (months.length - 1)) * (W - pad.l - pad.r);
          return (
            <text key={m} x={x} y={H - pad.b + 12} textAnchor="middle" fill="#9ca3af" fontSize="7">
              {m}
            </text>
          );
        })}
      </svg>
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

  let offset = -0.25 * circumference; // start from top
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
        {/* inner white hole */}
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

  useEffect(() => {
    dataService.init();
    setMetrics(dataService.getExecutiveMetrics());
    setFollowUps(dataService.getFollowUps().slice(0, 4));
    setRecentFounders(dataService.getFounders().slice(0, 5));
  }, []);

  if (!metrics) return null;

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const statCards = [
    {
      label: 'Total Founders',
      value: 5124,
      icon: Users,
      iconBg: '#2563eb',
      change: '↑ 12.4%',
      changeUp: true,
    },
    {
      label: 'Startups',
      value: 3208,
      icon: Rocket,
      iconBg: '#7c3aed',
      change: '↑ 8.7%',
      changeUp: true,
    },
    {
      label: 'Events',
      value: 512,
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
      value: 43,
      icon: CalendarCheck,
      iconBg: '#6366f1',
      change: '↓ 5.1%',
      changeUp: false,
    },
    {
      label: 'Hot Leads',
      value: 87,
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

  const recentRegistrations = [
    { name: 'Karthik Iyer', company: 'Nova AI', sector: 'AI / ML', time: '2m ago' },
    { name: 'Sneha Patel', company: 'HealEase', sector: 'HealthTech', time: '5m ago' },
    { name: 'Vikram Singh', company: 'FinFlow', sector: 'FinTech', time: '12m ago' },
    { name: 'Meera Joshi', company: 'EduNova', sector: 'EdTech', time: '18m ago' },
    { name: 'Rohit Mehta', company: 'GreenGrid', sector: 'CleanTech', time: '22m ago' },
  ];

  const topCities = [
    { city: 'Bengaluru', count: 1248, max: 1248 },
    { city: 'Hyderabad', count: 892, max: 1248 },
    { city: 'Mumbai', count: 768, max: 1248 },
    { city: 'Delhi', count: 512, max: 1248 },
    { city: 'Pune', count: 420, max: 1248 },
  ];

  const eventRegSlices = [
    { color: '#2563eb', pct: 57, label: 'Checked In', count: '86 (57%)' },
    { color: '#10b981', pct: 100, label: 'Registered', count: '127 (100%)' },
    { color: '#f59e0b', pct: 33, label: 'Pending', count: '41 (33%)' },
  ];

  const websiteFlowSteps = [
    { n: 1, title: 'Scan QR Code', desc: 'Founder scans the DraperU registration QR', icon: '📱' },
    { n: 2, title: 'Enter Contact', desc: 'Enter email or phone to continue', icon: '📧' },
    { n: 3, title: 'Check Existing', desc: 'We check our records for existing founder', icon: '🔍' },
    { n: 4, title: 'New Founder', desc: 'New founder? Fill the registration form', icon: '👤' },
    { n: 5, title: 'Create Profile', desc: 'Profile created with unique Founder ID', icon: '✅' },
    { n: 6, title: 'Registration Success', desc: 'Successfully registered! Welcome to DraperU', icon: '🎉' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">
            Welcome back, Anshi! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Here&apos;s what&apos;s happening in DraperU India today.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 font-medium shadow-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>21 Aug, 2026</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Row 2: Chart | Sectors | Follow-ups ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Founder Growth */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-gray-900">Founder Growth</h3>
            <button className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1">
              This Year <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <FounderGrowthChart />
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>12.4% Growth this year</span>
          </div>
        </div>

        {/* Startup Sectors */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Startup Sectors</h3>
            <button className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1">
              This Year <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <DonutChart
              slices={sectorSlices.map((s) => ({ color: s.color, pct: s.pct }))}
              total={3208}
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
            {recentRegistrations.map((r) => (
              <div key={r.name} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: '#2563eb' }}
                >
                  {r.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900">{r.name}</div>
                  <div className="text-[10px] text-gray-500">{r.company} · {r.sector}</div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400">{r.time}</span>
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

      {/* ── Website Flow Section ── */}
      <div
        className="rounded-2xl p-5 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2050 100%)' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <h3 className="text-sm font-bold text-white">WEBSITE FLOW</h3>
          <span className="text-[11px] text-blue-300">(Single QR for New Founder Registration)</span>
        </div>

        <div className="flex items-start gap-2 overflow-x-auto pb-2">
          {websiteFlowSteps.map((step, i) => (
            <React.Fragment key={step.n}>
              {/* Step card */}
              <div className="shrink-0 flex flex-col items-center text-center" style={{ width: 128 }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white border-2 border-blue-400 mb-2" style={{ background: '#1e40af' }}>
                  {step.n}
                </div>
                <div className="w-full bg-white/10 rounded-xl p-3 border border-white/10">
                  <div className="text-xl mb-2">{step.icon}</div>
                  <div className="text-[11px] font-bold text-white mb-1">{step.title}</div>
                  <div className="text-[9px] text-blue-200 leading-snug">{step.desc}</div>
                  {step.n === 2 && (
                    <div className="mt-2">
                      <div className="text-[9px] text-blue-300 mb-1">Email or Phone</div>
                      <div className="bg-blue-600 text-white text-[9px] font-bold rounded-md px-2 py-1">Continue</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow */}
              {i < websiteFlowSteps.length - 1 && (
                <div className="shrink-0 flex items-center pt-10">
                  <ArrowUpRight className="w-4 h-4 text-blue-400 rotate-90 opacity-60" />
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Founder ID Card */}
          <div className="shrink-0 ml-2" style={{ width: 140 }}>
            <div className="bg-white rounded-xl p-3 shadow-lg">
              <div className="text-[9px] font-bold text-gray-500 mb-1">Your Founder ID</div>
              <div className="text-sm font-black" style={{ color: '#2563eb' }}>DRU-F-00124</div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700">RS</div>
                <div>
                  <div className="text-[9px] font-bold text-gray-900">Rahul Sharma</div>
                  <div className="text-[8px] text-gray-500">Founder & CEO</div>
                  <div className="text-[8px] text-gray-500">XYZ Technologies</div>
                </div>
              </div>
              <button
                className="mt-2 w-full text-[9px] font-bold text-white rounded-md py-1"
                style={{ background: '#2563eb' }}
              >
                View My Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
