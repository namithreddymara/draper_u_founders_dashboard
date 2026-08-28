'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Copy,
  UserPlus,
  CalendarPlus,
  UploadCloud,
  BarChart2,
  CalendarCheck,
} from 'lucide-react';

const REGISTRATION_URL = 'https://draperin.register';

const QUICK_ACTIONS = [
  { icon: UserPlus, label: 'Add Founder', href: '/founders?add=true', color: '#2563eb' },
  { icon: CalendarPlus, label: 'Create Event', href: '/events?create=true', color: '#2563eb' },
  { icon: UploadCloud, label: 'Import CSV', href: '/import', color: '#2563eb' },
  { icon: BarChart2, label: 'View Reports', href: '/analytics', color: '#2563eb' },
  { icon: CalendarCheck, label: 'Manage Follow-ups', href: '/follow-ups', color: '#2563eb' },
];

export function FounderRegistrationPanel() {
  const handleDownloadQR = () => {
    const svg = document.querySelector('#founder-qr-svg svg');
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'draperu-registration-qr.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(REGISTRATION_URL).catch(() => {});
  };

  return (
    <div className="flex flex-col h-full">
      {/* QR Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
              FOUNDER REGISTRATION
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">One QR for New Founder Registration</p>
          </div>
        </div>

        {/* QR Code */}
        <div
          id="founder-qr-svg"
          className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 mb-3"
        >
          <QRCodeSVG
            value={REGISTRATION_URL}
            size={140}
            bgColor="#ffffff"
            fgColor="#0a1628"
            level="H"
            imageSettings={{
              src: '/draperu-logo.svg',
              x: undefined,
              y: undefined,
              height: 28,
              width: 28,
              excavate: true,
            }}
          />
        </div>

        <p className="text-center text-[11px] text-gray-500 mb-3">
          Scan to register as a DraperU founder
        </p>

        {/* Download button */}
        <button
          onClick={handleDownloadQR}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-xs font-bold transition hover:opacity-90"
          style={{ background: '#2563eb' }}
        >
          <Download className="w-3.5 h-3.5" />
          Download QR
        </button>

        {/* Registration Link */}
        <div className="mt-3">
          <p className="text-[10px] font-semibold text-gray-500 mb-1.5">Registration Link</p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
            <span className="flex-1 text-xs font-semibold truncate" style={{ color: '#2563eb' }}>
              {REGISTRATION_URL}
            </span>
            <button onClick={handleCopyLink} className="shrink-0 text-gray-400 hover:text-gray-600">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 flex-1">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3">
          QUICK ACTIONS
        </h3>
        <div className="space-y-1.5">
          {QUICK_ACTIONS.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition group"
            >
              <action.icon className="w-4 h-4 shrink-0" style={{ color: action.color }} />
              <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
