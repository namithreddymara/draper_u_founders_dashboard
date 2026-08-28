import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
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
    <html lang="en">
      <body className="bg-[#f8fafc] text-gray-900 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
