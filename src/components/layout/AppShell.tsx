'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Check if current route is a public standalone view
  const isPublicRegistration = pathname.includes('/register');
  const isPublicFounderPass = pathname.startsWith('/f/');
  const isCheckinKiosk = pathname.includes('/checkin') && pathname.includes('kiosk=true');

  if (isPublicRegistration || isPublicFounderPass || isCheckinKiosk) {
    return <main className="min-h-screen bg-slate-950 text-slate-100">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col">
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      
      <div className="flex flex-1 pt-0">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        
        <main className="flex-1 lg:pl-64 min-w-0 flex flex-col">
          <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
