import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'DraperU India — Founder Intelligence & Registration Platform',
  description: 'Automated QR Event Registration, Founder ID Generation, CRM, Check-in & Intelligence Hub for Draper University India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070a11] text-slate-100 min-h-screen antialiased selection:bg-rose-500 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
