'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, ExternalLink, Sparkles, Smartphone, QrCode } from 'lucide-react';

interface FounderQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FounderQRModal({ isOpen, onClose }: FounderQRModalProps) {
  const [copied, setCopied] = useState(false);
  const [regUrl, setRegUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRegUrl(`${window.location.origin}/register`);
    }
  }, []);

  const handleCopy = () => {
    if (!regUrl) return;
    navigator.clipboard.writeText(regUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const svg = document.getElementById('founder-registration-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'draperu-founder-registration-qr.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Founder Self-Registration QR"
      subtitle="Founders scan this QR code on their smartphone to enter their details and receive their DraperU Founder ID."
      maxWidth="md"
    >
      <div className="flex flex-col items-center text-center space-y-4 py-2">
        {/* QR Code Container */}
        <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-lg flex items-center justify-center">
          <QRCodeSVG
            id="founder-registration-qr-svg"
            value={regUrl || 'https://draperu.io/register'}
            size={200}
            level="H"
            bgColor="#ffffff"
            fgColor="#0a1628"
            includeMargin={true}
            imageSettings={{
              src: '/draperu-logo.svg',
              x: undefined,
              y: undefined,
              height: 36,
              width: 36,
              excavate: true,
            }}
          />
        </div>

        {/* Scan instruction badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Point any smartphone camera to register</span>
        </div>

        {/* Link input with copy button */}
        <div className="w-full">
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="flex-1 px-2.5 text-xs text-slate-700 font-mono truncate text-left">
              {regUrl || 'Loading URL...'}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 w-full pt-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Download High-Res QR</span>
          </button>

          <a
            href={regUrl || '/register'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Portal</span>
          </a>
        </div>
      </div>
    </Modal>
  );
}
