'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  PieChart,
  Users,
  Award,
  Calendar,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { ExecutiveMetrics, Founder, EventRegistration } from '@/types';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  useEffect(() => {
    dataService.init();
    setMetrics(dataService.getExecutiveMetrics());
    setFounders(dataService.getFounders());
    setRegistrations(dataService.getRegistrations());
  }, []);

  if (!metrics) return null;

  const totalFounders = founders.length;
  const repeatFounders = new Set(
    registrations.reduce<string[]>((ids, registration) => {
      if (ids.includes(registration.founderId)) return ids;
      ids.push(registration.founderId);
      return ids;
    }, [])
  ).size;
  const repeatAttendanceRate = totalFounders ? Math.round((repeatFounders / totalFounders) * 100) : 0;
  const completedFollowUps = metrics.followUpsCount.totalActive === 0 ? 0 : metrics.followUpsCount.totalActive;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            Ecosystem Intelligence
          </span>
          <span className="text-xs text-slate-500">DraperU India Analytics</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Founder Network Intelligence & Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Deep-dive telemetry into geographic clustering, funding distribution, and event engagement.
        </p>
      </div>

      {/* Row 1: Geographic Clustering & Hub Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City Clusters */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Regional Founder Hubs (India)
            </h3>
            <span className="text-xs text-slate-500">Top Tech Corridors</span>
          </div>

          <div className="space-y-3 pt-1">
            {metrics.cityBreakdown.map((hub, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{hub.city}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{hub.count} Founders</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div style={{ width: `${totalFounders ? (hub.count / totalFounders) * 100 : 0}%` }} className={`h-full rounded-full ${['bg-blue-600', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500', 'bg-purple-500'][idx % 5]}`} />
                </div>
              </div>
            ))}
            {metrics.cityBreakdown.length === 0 && <p className="text-xs text-slate-400">No founder location data yet.</p>}
          </div>
        </div>

        {/* Funding Velocity Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Funding Stages & Readiness
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">{founders.filter((founder) => founder.funding.currentlyFundraising).length} actively raising</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            {metrics.stageBreakdown.map((stage, index) => (
              <div key={stage.stage} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[11px]">{stage.stage}</span>
                <div className={`text-xl font-bold ${['text-slate-900', 'text-emerald-400', 'text-blue-600', 'text-amber-400'][index % 4]}`}>{stage.count}</div>
                <span className="text-[10px] text-slate-400">Founders</span>
              </div>
            ))}
            {metrics.stageBreakdown.length === 0 && <p className="col-span-2 text-xs text-slate-400">No funding stage data yet.</p>}
          </div>
        </div>
      </div>

      {/* Row 2: Retention & Multi-Event Engagement */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Founder Retention & Multi-Event Engagement
        </h3>
        <p className="text-xs text-slate-500">
          Permanent DraperU Founder IDs ensure repeated attendance and lifecycle progression without re-entering data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-400">Repeat Attendance Rate</span>
            <div className="text-2xl font-black text-slate-900">{repeatAttendanceRate}%</div>
            <p className="text-[10px] text-emerald-400">Attended 2+ DraperU events</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-400">Check-in Scan Speed</span>
            <div className="text-2xl font-black text-emerald-400">{registrations.length ? 'Tracked' : '—'}</div>
            <p className="text-[10px] text-slate-400">QR entrance verification</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-400">Follow-up SLA Completion</span>
            <div className="text-2xl font-black text-blue-600">{completedFollowUps}</div>
            <p className="text-[10px] text-slate-400">Active follow-ups</p>
          </div>
        </div>
      </div>
    </div>
  );
}
