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
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { ExecutiveMetrics, Founder } from '@/types';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [founders, setFounders] = useState<Founder[]>([]);

  useEffect(() => {
    dataService.init();
    setMetrics(dataService.getExecutiveMetrics());
    setFounders(dataService.getFounders());
  }, []);

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Ecosystem Intelligence
          </span>
          <span className="text-xs text-slate-400">DraperU India Analytics</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Founder Network Intelligence & Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Deep-dive telemetry into geographic clustering, funding distribution, and event engagement.
        </p>
      </div>

      {/* Row 1: Geographic Clustering & Hub Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City Clusters */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              Regional Founder Hubs (India)
            </h3>
            <span className="text-xs text-slate-400">Top Tech Corridors</span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { city: 'Bengaluru (Koramangala, Indiranagar, HSR)', count: '2,240 Founders', pct: 41, color: 'bg-rose-500' },
              { city: 'Hyderabad (HITEC City, Gachibowli)', count: '1,380 Founders', pct: 25, color: 'bg-amber-500' },
              { city: 'Delhi-NCR (Gurugram, Noida)', count: '910 Founders', pct: 17, color: 'bg-indigo-500' },
              { city: 'Mumbai (BKC, Lower Parel)', count: '540 Founders', pct: 10, color: 'bg-emerald-500' },
              { city: 'Pune, Chennai & Tier-2', count: '350 Founders', pct: 7, color: 'bg-purple-500' },
            ].map((hub, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{hub.city}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{hub.count} ({hub.pct}%)</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <div style={{ width: `${hub.pct}%` }} className={`h-full rounded-full ${hub.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Funding Velocity Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Funding Stages & Readiness
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">68% Actively Raising</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Bootstrapped Innovators</span>
              <div className="text-xl font-bold text-white">1,820</div>
              <span className="text-[10px] text-emerald-400">Pre-seed ready candidates</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Seed & Pre-Series A</span>
              <div className="text-xl font-bold text-emerald-400">2,140</div>
              <span className="text-[10px] text-slate-400">Demo day shortlist</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Series A & Beyond</span>
              <div className="text-xl font-bold text-indigo-400">620</div>
              <span className="text-[10px] text-slate-400">Ecosystem mentors</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px]">Draper Cohort Alumni</span>
              <div className="text-xl font-bold text-amber-400">180+</div>
              <span className="text-[10px] text-amber-400/80">Silicon Valley alumni</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Retention & Multi-Event Engagement */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Founder Retention & Multi-Event Engagement
        </h3>
        <p className="text-xs text-slate-400">
          Permanent DraperU Founder IDs ensure repeated attendance and lifecycle progression without re-entering data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400">Repeat Attendance Rate</span>
            <div className="text-2xl font-black text-white">73.4%</div>
            <p className="text-[10px] text-emerald-400">Attended 2+ DraperU events</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400">Check-in Scan Speed</span>
            <div className="text-2xl font-black text-emerald-400">1.8 sec</div>
            <p className="text-[10px] text-slate-400">Average QR entrance verification</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400">Follow-up SLA Completion</span>
            <div className="text-2xl font-black text-indigo-400">92%</div>
            <p className="text-[10px] text-slate-400">Outreach within 72 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
