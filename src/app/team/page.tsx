'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Key,
  CheckCircle2,
  Lock,
  UserPlus,
  Shield,
  Sparkles,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { UserRole } from '@/types';
import { Badge } from '@/components/ui/Badge';

export default function TeamAccessPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');

  useEffect(() => {
    dataService.init();
    setCurrentRole(dataService.getCurrentRole());
    const handleRoleChanged = () => setCurrentRole(dataService.getCurrentRole());
    window.addEventListener('role_changed', handleRoleChanged);
    return () => window.removeEventListener('role_changed', handleRoleChanged);
  }, []);

  const handleSwitchRole = (role: UserRole) => {
    dataService.setCurrentRole(role);
    setCurrentRole(role);
    window.dispatchEvent(new Event('role_changed'));
  };

  const teamMembers = [
    { name: 'Anshi', role: 'community_team' as UserRole, title: 'Lead, Founder Community & Programs', email: 'anshi@draperu.in' },
    { name: 'Rahul', role: 'admin' as UserRole, title: 'Director, DraperU India', email: 'rahul.director@draperu.in' },
    { name: 'Event Desk (Koramangala)', role: 'event_team' as UserRole, title: 'Entrance Scanner & Registration Team', email: 'events.blr@draperu.in' },
    { name: 'Investor Partner Desk', role: 'viewer' as UserRole, title: 'Syndicate & Dealflow Reviewer', email: 'partner@draperassociates.com' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Security & Governance
          </span>
          <span className="text-xs text-slate-400">Role-Based Access Control</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Team Permissions & Role Manager
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Safeguard your founder database with tiered access for community managers, entrance volunteers, and reviewers.
        </p>
      </div>

      {/* Role Simulator Selector */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            Live Role Permission Simulator
          </h3>
          <span className="text-xs font-semibold text-rose-400">Active: {currentRole}</span>
        </div>

        <p className="text-xs text-slate-400">
          Switch your active role below to preview how different team members experience the platform:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {[
            {
              role: 'admin' as UserRole,
              label: '1. Admin (Full Control)',
              desc: 'Unrestricted access to all founder data, CSV importer, system settings, and exports.',
            },
            {
              role: 'community_team' as UserRole,
              label: '2. Founder / Community Team',
              desc: 'Add/edit founders, log interaction calls/emails, manage follow-up tasks.',
            },
            {
              role: 'event_team' as UserRole,
              label: '3. Event & Check-In Team',
              desc: 'Fast QR scanner kiosk, entrance roster, walk-in registration, and pass lookup.',
            },
            {
              role: 'viewer' as UserRole,
              label: '4. Read-Only Viewer',
              desc: 'Search, filter, and view intelligence without modifying records.',
            },
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => handleSwitchRole(item.role)}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                currentRole === item.role
                  ? 'bg-rose-500/20 border-rose-500/60 ring-2 ring-rose-500/30'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="font-bold text-white text-xs block">{item.label}</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
              {currentRole === item.role ? (
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Active Role
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium">Click to switch</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Access Permissions Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                <th className="pb-3 pl-2">Feature / Module</th>
                <th className="pb-3 text-center">Admin</th>
                <th className="pb-3 text-center">Community Team</th>
                <th className="pb-3 text-center">Event Team</th>
                <th className="pb-3 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[
                { feature: 'Entrance Fast QR Scanner & Check-in Desk', admin: true, comm: true, event: true, viewer: false },
                { feature: 'View Founder CRM & Timeline Profiles', admin: true, comm: true, event: true, viewer: true },
                { feature: 'Add / Edit Founders & Startup Details', admin: true, comm: true, event: false, viewer: false },
                { feature: 'Log Calls, Emails & Investor Intros', admin: true, comm: true, event: false, viewer: false },
                { feature: 'Generate Post-Event Follow-Up Tasks', admin: true, comm: true, event: false, viewer: false },
                { feature: 'Create New Events & Dynamic QR Posters', admin: true, comm: false, event: true, viewer: false },
                { feature: 'Import Google Sheet / CSV Rosters', admin: true, comm: false, event: false, viewer: false },
                { feature: 'Export CRM Database to CSV', admin: true, comm: true, event: false, viewer: false },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 pl-2 font-medium text-slate-200">{row.feature}</td>
                  <td className="py-3 text-center">{row.admin ? '✅' : '—'}</td>
                  <td className="py-3 text-center">{row.comm ? '✅' : '—'}</td>
                  <td className="py-3 text-center">{row.event ? '✅' : '—'}</td>
                  <td className="py-3 text-center">{row.viewer ? '✅' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Roster */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-rose-500" />
          DraperU India Operations Team
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <h4 className="font-bold text-white text-xs">{member.name}</h4>
                <p className="text-[11px] text-slate-400">{member.title}</p>
                <span className="text-[10px] text-slate-500">{member.email}</span>
              </div>
              <Badge variant="gold" size="sm">
                {member.role.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
