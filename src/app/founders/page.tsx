'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
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
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { Founder, StartupStage, FundingStage, DraperURelationship } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Suspense } from 'react';

function FoundersCRMContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [founders, setFounders] = useState<Founder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedRelationship, setSelectedRelationship] = useState<string>('all');
  const [priorityOnly, setPriorityOnly] = useState<boolean>(filterParam === 'priority');
  
  // Add Founder Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFounderForm, setNewFounderForm] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    location: 'Bengaluru, Karnataka',
    designation: 'Founder & CEO',
    startupName: '',
    sector: 'AI / ML',
    stage: 'Early Traction' as StartupStage,
    fundingStage: 'Seed' as FundingStage,
    fundingType: 'Funded' as 'Funded' | 'Bootstrapped',
    relationship: 'Community member' as DraperURelationship,
  });

  useEffect(() => {
    dataService.init();
    setFounders(dataService.getFounders());
    if (filterParam === 'priority') {
      setPriorityOnly(true);
    }
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

  const handleAddFounderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFounderForm.name || !newFounderForm.email || !newFounderForm.startupName) {
      alert('Please fill out required fields.');
      return;
    }

    const created = dataService.createFounder({
      name: newFounderForm.name,
      email: newFounderForm.email,
      phone: newFounderForm.phone || '+91 90000 00000',
      linkedin: newFounderForm.linkedin || undefined,
      location: newFounderForm.location,
      designation: newFounderForm.designation,
      startup: {
        name: newFounderForm.startupName,
        sector: newFounderForm.sector,
        stage: newFounderForm.stage,
        teamSize: '1-5',
        businessModel: 'B2B',
      },
      funding: {
        type: newFounderForm.fundingType,
        stage: newFounderForm.fundingStage,
        investors: [],
        currentlyFundraising: true,
      },
      relationship: newFounderForm.relationship,
      isHighPriority: false,
      tags: ['Admin Ingestion', newFounderForm.sector],
    });

    setFounders(dataService.getFounders());
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
              Founder Database
            </span>
            <span className="text-xs text-slate-400">All India Directory</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Founder CRM & Directory
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Founder</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by founder name, startup, DRU-F-ID, sector, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Sector filter */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
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
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
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
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                priorityOnly
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>High Priority Only</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing <strong className="text-white">{filteredFounders.length}</strong> matching founders</span>
          {priorityOnly && <span className="text-rose-400 font-medium">Filtering by High Priority</span>}
        </div>
      </div>

      {/* Founders Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                <th className="pb-3 pl-2">Founder & ID</th>
                <th className="pb-3">Startup & Sector</th>
                <th className="pb-3">Funding Stage</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">DraperU Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFounders.map((founder) => (
                <tr key={founder.id} className="hover:bg-slate-800/40 transition group">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700">
                        {founder.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/founders/${founder.id}`}
                            className="font-bold text-white hover:text-rose-400 transition"
                          >
                            {founder.name}
                          </Link>
                          {founder.isHighPriority && (
                            <Flame className="w-3 h-3 text-rose-500" />
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-rose-400">{founder.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5">
                    <div className="font-semibold text-slate-200">{founder.startup.name}</div>
                    <div className="text-[10px] text-slate-400">{founder.startup.sector}</div>
                  </td>

                  <td className="py-3.5">
                    <Badge variant={founder.funding.type === 'Funded' ? 'success' : 'neutral'} size="sm">
                      {founder.funding.stage}
                    </Badge>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {founder.funding.amountRaised || 'Bootstrapped'}
                    </div>
                  </td>

                  <td className="py-3.5 text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {founder.location.split(',')[0]}
                    </span>
                  </td>

                  <td className="py-3.5">
                    <Badge variant="gold" size="sm">
                      {founder.relationship}
                    </Badge>
                  </td>

                  <td className="py-3.5 text-right pr-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/f/${founder.id}`}
                        target="_blank"
                        title="View Dynamic QR Pass"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/founders/${founder.id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-200 text-xs font-semibold transition"
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

      {/* Add Founder Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Founder to CRM"
        subtitle="Manually create a permanent DraperU Founder record with automatic DRU-F-ID."
      >
        <form onSubmit={handleAddFounderSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Founder Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={newFounderForm.name}
                onChange={(e) => setNewFounderForm({ ...newFounderForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={newFounderForm.designation}
                onChange={(e) => setNewFounderForm({ ...newFounderForm, designation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="rahul@company.ai"
                value={newFounderForm.email}
                onChange={(e) => setNewFounderForm({ ...newFounderForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={newFounderForm.phone}
                onChange={(e) => setNewFounderForm({ ...newFounderForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Startup Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. XYZ Technologies"
                value={newFounderForm.startupName}
                onChange={(e) => setNewFounderForm({ ...newFounderForm, startupName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Sector
              </label>
              <select
                value={newFounderForm.sector}
                onChange={(e) => setNewFounderForm({ ...newFounderForm, sector: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="AI / ML">AI / ML</option>
                <option value="SaaS">SaaS</option>
                <option value="FinTech">FinTech</option>
                <option value="HealthTech">HealthTech</option>
                <option value="DeepTech">DeepTech</option>
                <option value="ClimateTech">ClimateTech</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
            >
              Save Founder
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function FoundersCRMPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Founder CRM...</div>}>
      <FoundersCRMContent />
    </Suspense>
  );
}
