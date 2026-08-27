'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  QrCode,
  UserCheck,
  Search,
  Shield,
  RotateCcw,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  Bell,
  Menu,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { UserRole } from '@/types';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export function Navbar({ onToggleMobileSidebar }: NavbarProps) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('admin');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dataService.init();
    setRole(dataService.getCurrentRole());
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    dataService.setCurrentRole(newRole);
    setShowRoleMenu(false);
    // trigger refresh if needed
    window.dispatchEvent(new Event('role_changed'));
  };

  const handleResetData = () => {
    if (confirm('Reset DraperU founder database to initial seed state?')) {
      dataService.resetToDefaults();
      window.location.reload();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const roleLabels: Record<UserRole, { label: string; color: string; desc: string }> = {
    admin: { label: 'Admin (Full Access)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', desc: 'Can edit everything & import data' },
    community_team: { label: 'Founder & Community Team', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', desc: 'Manage founders, calls & follow-ups' },
    event_team: { label: 'Event & Check-in Team', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', desc: 'Manage events, registrations & entrance check-in' },
    viewer: { label: 'Read-Only Viewer', color: 'bg-slate-700/40 text-slate-300 border-slate-600', desc: 'Search & view intelligence only' },
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-700 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <img src="/draperu-logo.svg" alt="DraperU logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight group-hover:text-rose-400 transition">
                  DRAPER<span className="text-rose-500">U</span> INDIA
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  CRM 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Founder Intelligence Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md mx-4 relative"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="AI Search: 'Funded AI founders in Hyderabad' or name, startup..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-rose-500/80 rounded-xl pl-9 pr-20 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-lg bg-rose-600/30 text-rose-300 hover:bg-rose-600 hover:text-white transition"
          >
            Search
          </button>
        </form>

        {/* Right: Quick actions & Role switcher */}
        <div className="flex items-center gap-2.5">
          {/* Entrance Live Kiosk */}
          <Link
            href="/kiosk"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Entrance QR Kiosk</span>
          </Link>

          {/* Fast Check-In Shortcut */}
          <Link
            href="/checkin"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Desk Roster</span>
          </Link>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${roleLabels[role].color}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{roleLabels[role].label.split(' ')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400">
                  Switch Permission Role
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition flex flex-col gap-0.5 ${
                      role === r ? 'bg-rose-500/15 text-rose-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{roleLabels[r].label}</span>
                      {role === r && <span className="text-[10px] text-rose-400">Active</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">{roleLabels[r].desc}</span>
                  </button>
                ))}
                <div className="pt-2 mt-1 border-t border-slate-800">
                  <button
                    onClick={handleResetData}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Demo Database</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
