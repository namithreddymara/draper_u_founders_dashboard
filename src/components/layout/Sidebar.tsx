'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Rocket,
  CalendarDays,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/founders', icon: Users, label: 'Founders' },
  { href: '/startups', icon: Rocket, label: 'Startups' },
  { href: '/events', icon: CalendarDays, label: 'Events' },
  { href: '/register', icon: ClipboardList, label: 'Registrations' },
  { href: '/follow-ups', icon: CalendarCheck, label: 'Follow-ups' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/import', icon: FileSpreadsheet, label: 'Import / Export' },
];

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/dashboard';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-60 bg-white border-r border-slate-200/80 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 font-black text-sm">
            D
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm tracking-tight leading-tight">
              DRAPER<span className="text-blue-600">U</span>
            </div>
            <div className="text-[10px] font-semibold tracking-wider text-slate-400">INDIA</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Simple Clean Footer */}
        <div className="p-4 border-t border-slate-100 text-center">
          <p className="text-[11px] font-medium text-slate-400">
            DraperU India Platform
          </p>
        </div>
      </aside>
    </>
  );
}
