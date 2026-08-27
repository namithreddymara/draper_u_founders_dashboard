'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Rocket,
  CalendarDays,
  PhoneCall,
  CalendarCheck,
  BarChart3,
  QrCode,
  ShieldCheck,
  FileSpreadsheet,
  PlusCircle,
  Flame,
  UserPlus,
  UserCheck,
  ChevronDown,
  Sparkles,
  Search,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { UserRole } from '@/types';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>('admin');
  const [foundersOpen, setFoundersOpen] = useState(true);
  const [eventsOpen, setEventsOpen] = useState(true);

  useEffect(() => {
    setRole(dataService.getCurrentRole());
    const handleRoleChanged = () => setRole(dataService.getCurrentRole());
    window.addEventListener('role_changed', handleRoleChanged);
    return () => window.removeEventListener('role_changed', handleRoleChanged);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/dashboard';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
      active
        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-semibold'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/90'
    }`;

  const subNavItemClass = (active: boolean) =>
    `flex items-center gap-2 pl-9 pr-3 py-1.5 rounded-lg text-xs transition-colors ${
      active
        ? 'text-rose-400 font-semibold bg-rose-500/10'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-950/95 border-r border-slate-800/80 p-4 overflow-y-auto flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Main Navigation Group */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Core CRM & Operations
            </div>

            {/* Dashboard */}
            <Link
              href="/"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/dashboard') || pathname === '/')}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </Link>

            {/* AI Search Shortcut */}
            <Link
              href="/search"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/search'))}
            >
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
              <div className="flex items-center justify-between flex-1">
                <span>AI Founder Search</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-amber-500/20 text-amber-400">
                  Smart
                </span>
              </div>
            </Link>

            {/* Founders Accordion */}
            <div>
              <button
                onClick={() => setFoundersOpen(!foundersOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/90 transition"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Founders</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    foundersOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {foundersOpen && (
                <div className="mt-1 space-y-0.5 animate-fadeIn">
                  <Link
                    href="/founders"
                    onClick={onCloseMobile}
                    className={subNavItemClass(pathname === '/founders')}
                  >
                    <span>All Founders</span>
                  </Link>
                  <Link
                    href="/founders?filter=new"
                    onClick={onCloseMobile}
                    className={subNavItemClass(pathname === '/founders' && typeof window !== 'undefined' && window.location.search.includes('new'))}
                  >
                    <UserPlus className="w-3 h-3 text-emerald-400" />
                    <span>New Founders</span>
                  </Link>
                  <Link
                    href="/founders?filter=priority"
                    onClick={onCloseMobile}
                    className={subNavItemClass(pathname === '/founders' && typeof window !== 'undefined' && window.location.search.includes('priority'))}
                  >
                    <Flame className="w-3 h-3 text-rose-400" />
                    <span>High Priority (VIP)</span>
                  </Link>
                  {role !== 'viewer' && (
                    <Link
                      href="/import"
                      onClick={onCloseMobile}
                      className={subNavItemClass(pathname === '/import')}
                    >
                      <FileSpreadsheet className="w-3 h-3 text-indigo-400" />
                      <span>Import Google Sheet</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Startups Directory */}
            <Link
              href="/startups"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/startups'))}
            >
              <Rocket className="w-4 h-4 shrink-0" />
              <span>Startups</span>
            </Link>

            {/* Events Accordion */}
            <div>
              <button
                onClick={() => setEventsOpen(!eventsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/90 transition"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  <span>Events</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    eventsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {eventsOpen && (
                <div className="mt-1 space-y-0.5 animate-fadeIn">
                  <Link
                    href="/events"
                    onClick={onCloseMobile}
                    className={subNavItemClass(pathname === '/events')}
                  >
                    <span>All Events</span>
                  </Link>
                  {role !== 'viewer' && (
                    <Link
                      href="/events?create=true"
                      onClick={onCloseMobile}
                      className={subNavItemClass(false)}
                    >
                      <PlusCircle className="w-3 h-3 text-rose-400" />
                      <span>Create Event</span>
                    </Link>
                  )}
                  <Link
                    href="/kiosk"
                    onClick={onCloseMobile}
                    className={subNavItemClass(pathname === '/kiosk')}
                  >
                    <QrCode className="w-3 h-3 text-rose-400" />
                    <span>Entrance Live Kiosk</span>
                  </Link>
                  <Link
                    href="/checkin"
                    onClick={onCloseMobile}
                    className={subNavItemClass(pathname === '/checkin')}
                  >
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <span>Entrance Desk Roster</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Interactions & Timeline */}
            <Link
              href="/interactions"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/interactions'))}
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>Interactions & Timeline</span>
            </Link>

            {/* Follow-ups */}
            <Link
              href="/follow-ups"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/follow-ups'))}
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <div className="flex items-center justify-between flex-1">
                <span>Follow-ups</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-rose-500/20 text-rose-400">
                  43
                </span>
              </div>
            </Link>

            {/* Analytics */}
            <Link
              href="/analytics"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/analytics'))}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Analytics & Intelligence</span>
            </Link>

            {/* Dynamic QR & Badge Hub */}
            <Link
              href="/qr-hub"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/qr-hub'))}
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span>QR & Badge Print Hub</span>
            </Link>
          </div>

          {/* System & Team Group */}
          <div className="space-y-1 pt-4 border-t border-slate-800/80">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Settings & Team
            </div>

            <Link
              href="/team"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/team'))}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Team & Permissions</span>
            </Link>
          </div>
        </div>

        {/* DraperU Silicon Valley / India Footer Badge */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center mt-6">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-400 mb-1">
            <span>Draper University</span>
          </div>
          <p className="text-[10px] text-slate-400">
            India Founder Network • Silicon Valley Pipeline
          </p>
        </div>
      </aside>
    </>
  );
}
