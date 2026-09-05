'use client';

import React from 'react';
import Image from 'next/image';

interface DraperLogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
  textColor?: string;
}

export function DraperLogo({
  size = 36,
  className = '',
  showText = false,
  textColor = 'text-slate-900',
}: DraperLogoProps) {
  const numSize = typeof size === 'number' ? size : parseInt(size, 10) || 36;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Exact DraperU Shield Image Asset */}
      <div
        className="relative shrink-0 overflow-hidden rounded-xl bg-[#404040] shadow-sm flex items-center justify-center"
        style={{ width: numSize, height: numSize }}
      >
        <img
          src="/draperu-logo.jpg"
          alt="Draper University India"
          className="w-full h-full object-cover"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black text-sm tracking-tight leading-none ${textColor}`}>
            DRAPER<span className="text-blue-600">U</span>
          </span>
          <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 mt-0.5">
            INDIA
          </span>
        </div>
      )}
    </div>
  );
}
