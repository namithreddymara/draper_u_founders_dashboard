'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface QRCodeCardProps {
  value: string;
  title: string;
  subtitle?: string;
  idBadge?: string;
  size?: number;
  showActions?: boolean;
  className?: string;
}

export function QRCodeCard({
  value,
  title,
  subtitle,
  idBadge,
  size = 180,
  showActions = true,
  className = '',
}: QRCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-xl ${className}`}
    >
      {idBadge && (
        <span className="inline-block px-3 py-1 mb-3 text-xs font-mono font-bold tracking-wider uppercase rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
          {idBadge}
        </span>
      )}

      <div className="p-3 bg-white rounded-xl shadow-inner mb-3">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin={false}
        />
      </div>

      <h4 className="text-sm font-semibold text-white mt-1">{title}</h4>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5 max-w-[220px]">{subtitle}</p>}

      {showActions && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 w-full justify-center">
          <button
            onClick={handleCopyLink}
            title="Copy URL"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownloadSVG}
            title="Download QR Image"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            title="Open Target"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 transition border border-rose-500/30"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open</span>
          </a>
        </div>
      )}
    </div>
  );
}
