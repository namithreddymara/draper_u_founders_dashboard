'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  Flame,
  UserPlus,
  Building,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  PlusCircle,
  Download,
  QrCode,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { Founder, StartupStage, FundingStage, DraperURelationship } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { AddFounderModal } from '@/components/founders/AddFounderModal';
import { FounderQRModal } from '@/components/founders/FounderQRModal';

function FoundersCRMContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [founders, setFounders] = useState<Founder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedRelationship, setSelectedRelationship] = useState<string>('all');
  const [priorityOnly, setPriorityOnly] = useState<boolean>(filterParam === 'priority');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [lastAddedFounder, setLastAddedFounder] = useState<Founder | null>(null);

  const loadData = async () => {
    dataService.init();
    setFounders(await dataService.refreshFounders());
  };

  useEffect(() => {
    loadData();
    if (filterParam === 'priority') {
      setPriorityOnly(true);
    }
    // Auto-refresh when data changes via QR or other tabs
    const unsubscribe = dataService.subscribeToDataUpdates(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [filterParam]);

  const sectors = ['all', 'AI / ML', 'SaaS', 'FinTech', 'HealthTech', 'DeepTech', 'ClimateTech', 'EdTech'];
  const stages = ['all', 'Bootstrapped', 'Pre-Seed', 'Seed', 'Pre-Series A', 'Series A'];
  const relationships = ['all', 'Community member', 'Event attendee', 'Founder program', 'Mentor', 'Investor', 'Alumni'];

  const filteredFounders = founders.filter((f) => {
    if (priorityOnly && !f.isHighPriority) return false;
    if (selectedSector !== 'all' && f.startup.sector !== selectedSector) return false;
    if (selectedStage !== 'all' && f.funding.stage !== selectedStage) return false;
    if (selectedRelationship !== 'all' && f.relationship !== selectedRelationship) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.startup.name.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Founder ID', 'Name', 'Email', 'Phone', 'Startup', 'Sector', 'Stage', 'Funding', 'Location', 'Relationship'];
    const rows = filteredFounders.map((f) => [
      f.id,
      `"${f.name}"`,
      f.email,
      f.phone,
      `"${f.startup.name}"`,
      `"${f.startup.sector}"`,
      f.startup.stage,
      f.funding.stage,
      `"${f.location}"`,
      `"${f.relationship}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `draperu-founders-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Founder Directory & CRM
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {founders.length} verified founders in DraperU India ecosystem.
          </p>
        </div>

        {/* Action Buttons: QR Scan & Manual Add */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Registration QR</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add Founder</span>
          </button>
        </div>
      </div>

      {/* Success Notification if a founder was recently added */}
      {lastAddedFounder && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-900">
                Founder Added Successfully!
              </div>
              <div className="text-[11px] text-emerald-700">
                Issued Permanent ID: <strong>{lastAddedFounder.id}</strong> for <strong>{lastAddedFounder.name}</strong> ({lastAddedFounder.startup.name}).
              </div>
            </div>
          </div>
          <Link
            href={`/f/${lastAddedFounder.id}`}
            target="_blank"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shrink-0"
          >
            View Pass
          </Link>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by founder name, startup, DRU-F-ID, sector, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Sector filter */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Sectors' : s}
                </option>
              ))}
            </select>

            {/* Stage filter */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {stages.map((stg) => (
                <option key={stg} value={stg}>
                  {stg === 'all' ? 'All Stages' : stg}
                </option>
              ))}
            </select>

            {/* Relationship filter */}
            <select
              value={selectedRelationship}
              onChange={(e) => setSelectedRelationship(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {relationships.map((r) => (
                <option key={r} value={r}>
                  {r === 'all' ? 'All Relationships' : r}
                </option>
              ))}
            </select>

            {/* High Priority Toggle */}
            <button
              onClick={() => setPriorityOnly(!priorityOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                priorityOnly
                  ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${priorityOnly ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>VIP Only</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Showing <strong className="text-slate-900">{filteredFounders.length}</strong> matching founders</span>
          {priorityOnly && <span className="text-rose-600 font-semibold">Filtering by VIP / High Priority</span>}
        </div>
      </div>

      {/* Founders Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-600">
                <th className="py-3.5 pl-4">Founder & ID</th>
                <th className="py-3.5 px-3">Startup & Sector</th>
                <th className="py-3.5 px-3">Funding Stage</th>
                <th className="py-3.5 px-3">Location</th>
                <th className="py-3.5 px-3">Relationship</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFounders.map((founder) => (
                <tr key={founder.id} className="hover:bg-slate-50/80 transition group">
                  <td className="py-3.5 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs shrink-0">
                        {founder.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/founders/${founder.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 transition"
                          >
                            {founder.name}
                          </Link>
                          {founder.isHighPriority && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-blue-600 font-semibold">{founder.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{founder.startup.name}</div>
                    <div className="text-[10px] text-slate-500">{founder.startup.sector}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {founder.funding.stage}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {founder.funding.amountRaised || 'Bootstrapped'}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {founder.location.split(',')[0]}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {founder.relationship}
                    </span>
                  </td>

                  <td className="py-3.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/f/${founder.id}`}
                        target="_blank"
                        title="View Dynamic Digital Pass"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/founders/${founder.id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition"
                      >
                        View Profile
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFounders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No founders match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Founder Modal */}
      <AddFounderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onFounderCreated={(newF) => {
          setLastAddedFounder(newF);
          loadData();
        }}
      />

      {/* Self-Registration QR Modal */}
      <FounderQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
}

export default function FoundersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Founders...</div>}>
      <FoundersCRMContent />
    </Suspense>
  );
}
