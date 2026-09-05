'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/context/AuthContext';

const PUBLIC_ROUTES = ['/login', '/register', '/f/'];
const KIOSK_PARAM = 'kiosk=true';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isPublicEventRegistration = /^\/events\/[^/]+\/register\/?$/.test(pathname);
  const isPublic =
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) ||
    isPublicEventRegistration ||
    (pathname.includes('/checkin') && typeof window !== 'undefined' && window.location.search.includes(KIOSK_PARAM));

  // Route protection
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublic) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, isPublic, pathname, router]);

  if (isPublic) {
    return <main className="min-h-screen">{children}</main>;
  }

  // Loading state while verifying auth session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading DraperU Platform...</p>
      </div>
    );
  }

  // If not authenticated and waiting for redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-gray-900">
      {/* Sticky top navbar */}
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      <div className="flex flex-1 min-h-0">
        {/* Fixed left sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main content */}
        <main
          className="flex-1 min-w-0 overflow-y-auto lg:pl-60 transition-all duration-200"
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
