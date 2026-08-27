'use client';

import React from 'react';
import { AlertTriangle, UserCheck, UserPlus, ArrowRight, Building, MapPin, Mail, Phone } from 'lucide-react';
import { Founder, DuplicateDetectionResult } from '@/types';
import { Modal } from './Modal';
import { Badge } from './Badge';

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DuplicateDetectionResult;
  candidateData: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  onUseExisting: (founder: Founder) => void;
  onCreateNew: () => void;
}

export function DuplicateModal({
  isOpen,
  onClose,
  result,
  candidateData,
  onUseExisting,
  onCreateNew,
}: DuplicateModalProps) {
  if (!result.matchedFounder) return null;
  const founder = result.matchedFounder;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚠️ Possible Existing Founder Detected"
      subtitle={`We found a ${result.matchConfidence}% match in the DraperU database on: ${result.matchedFields.join(', ')}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <strong className="text-amber-300 font-semibold block mb-1">
              Preventing Duplicate Record Pollution
            </strong>
            The registration details you entered match an active profile in the DraperU India database.
            Would you like to register using this permanent Founder ID or create a distinct record?
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Found in Database */}
          <div className="p-4 rounded-xl bg-slate-800/80 border-2 border-emerald-500/40 relative">
            <span className="absolute -top-3 left-4 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-black rounded-full shadow-sm">
              Existing DraperU Profile
            </span>
            
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-rose-400">{founder.id}</span>
              <Badge variant="success" size="sm">{founder.relationship}</Badge>
            </div>

            <div className="mt-3">
              <h4 className="text-base font-bold text-white">{founder.name}</h4>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {founder.startup.name} • {founder.startup.sector}
              </p>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-300 border-t border-slate-700/60 pt-3">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{founder.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{founder.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{founder.location}</span>
              </div>
            </div>

            <button
              onClick={() => onUseExisting(founder)}
              className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-900/30 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Use Existing Profile ({founder.id})</span>
            </button>
          </div>

          {/* New Input Data */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70 relative">
            <span className="absolute -top-3 left-4 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-slate-200 rounded-full">
              Form Just Entered
            </span>

            <div className="mt-2 text-right">
              <span className="text-[10px] text-slate-400">New Entry</span>
            </div>

            <div className="mt-3">
              <h4 className="text-base font-bold text-slate-200">{candidateData.name || 'Anonymous'}</h4>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {candidateData.company || 'Not Specified'}
              </p>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-400 border-t border-slate-700/60 pt-3">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{candidateData.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidateData.phone || '—'}</span>
              </div>
            </div>

            <button
              onClick={onCreateNew}
              className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Separate Profile</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
