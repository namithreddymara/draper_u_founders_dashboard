'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Rocket,
  Search,
  Building,
  Globe,
  ExternalLink,
  Users,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { Founder } from '@/types';
import { Badge } from '@/components/ui/Badge';

export default function StartupsDirectoryPage() {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');

  useEffect(() => {
    dataService.init();
    setFounders(dataService.getFounders());
  }, []);

  const sectors = ['all', 'AI / ML', 'SaaS', 'FinTech', 'HealthTech', 'DeepTech', 'ClimateTech'];
  const models = ['all', 'B2B', 'B2C', 'B2B2C', 'SaaS', 'Marketplace'];

  const filteredStartups = founders.filter((f) => {
    if (selectedSector !== 'all' && f.startup.sector !== selectedSector) return false;
    if (selectedModel !== 'all' && f.startup.businessModel !== selectedModel) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.startup.name.toLowerCase().includes(q) ||
        f.startup.sector.toLowerCase().includes(q) ||
        (f.startup.problem && f.startup.problem.toLowerCase().includes(q)) ||
        (f.startup.solution && f.startup.solution.toLowerCase().includes(q)) ||
        f.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              Venture Directory
            </span>
            <span className="text-xs text-slate-500">DraperU Portfolio & Community</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Startups & Venture Directory
          </h1>
        </div>

        <div className="text-xs text-slate-500">
          Tracking <strong className="text-slate-900">3,140+</strong> tech companies across India
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search startup name, problem statement, founder name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
          >
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Sectors' : s}
              </option>
            ))}
          </select>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m === 'all' ? 'All Business Models' : m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Startups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStartups.map((f) => (
          <div
            key={f.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm transition flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">
                    {f.startup.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {f.startup.sector} • <span className="font-semibold text-slate-700">{f.startup.businessModel}</span>
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  {f.startup.stage}
                </Badge>
              </div>

              {/* Problem / Solution */}
              {f.startup.problem && (
                <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                    Problem
                  </span>
                  <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                    {f.startup.problem}
                  </p>
                </div>
              )}

              {/* Funding & Team Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Funding Track</span>
                  <span className="font-bold text-emerald-600">{f.funding.amountRaised || f.funding.stage}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Team Size</span>
                  <span className="font-bold text-slate-800">{f.startup.teamSize} members</span>
                </div>
              </div>
            </div>

            {/* Founder Info & Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-[10px]">
                  {f.name.charAt(0)}
                </div>
                <Link
                  href={`/founders/${f.id}`}
                  className="font-medium text-slate-700 hover:text-blue-600 transition"
                >
                  {f.name}
                </Link>
              </div>

              <Link
                href={`/founders/${f.id}`}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>360° Profile</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
