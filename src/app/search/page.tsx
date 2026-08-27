'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Users,
  Building,
  MapPin,
  Flame,
  Filter,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Bot,
  Zap,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { Founder } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Suspense } from 'react';

function AISearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Founder[]>([]);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);

  useEffect(() => {
    dataService.init();
    executeSearch(initialQuery);
  }, [initialQuery]);

  const executeSearch = (q: string) => {
    if (!q.trim()) {
      setResults(dataService.getFounders());
      setAiInterpretation(null);
      return;
    }

    const matched = dataService.searchFoundersAI(q);
    setResults(matched);

    // Generate simulated AI semantic explanation
    const lower = q.toLowerCase();
    const parsedFilters: string[] = [];
    if (lower.includes('ai')) parsedFilters.push('Sector: AI / ML');
    if (lower.includes('saas')) parsedFilters.push('Sector: SaaS');
    if (lower.includes('fund')) parsedFilters.push('Funding Status: Actively Raising / Funded');
    if (lower.includes('hyderabad')) parsedFilters.push('Location: Hyderabad, Telangana');
    if (lower.includes('bengaluru')) parsedFilters.push('Location: Bengaluru, Karnataka');
    if (lower.includes('mumbai')) parsedFilters.push('Location: Mumbai');
    if (lower.includes('delhi')) parsedFilters.push('Location: Delhi-NCR');

    if (parsedFilters.length > 0) {
      setAiInterpretation(
        `Parsed ${parsedFilters.length} criteria: [${parsedFilters.join(' • ')}] → Identified ${matched.length} high-confidence matching founder profiles.`
      );
    } else {
      setAiInterpretation(`Full-text search for "${q}" returned ${matched.length} founders.`);
    }
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const sampleQueries = [
    'Show funded AI founders in Hyderabad',
    'Find founders who are currently fundraising',
    'DeepTech and Robotics founders in Bengaluru',
    'HealthTech founders with clinical traction',
    'Pre-seed SaaS builders looking for angel intros',
    'Draper cohort alumni and mentors',
  ];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Founder Intelligence AI
          </span>
          <span className="text-xs text-slate-400">Natural Language Query Engine</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Semantic Founder & Startup Search
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl">
          Search across 5,400+ Indian startup founders using plain conversational English. Filter by sector, funding velocity, event attendance, or city.
        </p>

        {/* Big Search Box */}
        <form onSubmit={handleQuerySubmit} className="relative pt-2">
          <Bot className="w-5 h-5 text-rose-500 absolute left-4 top-1/2 -translate-y-1/2 mt-1" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'Show me all funded AI founders in Hyderabad' or 'Series A SaaS in Bengaluru'..."
            className="w-full bg-slate-950 border-2 border-slate-800 focus:border-rose-500 rounded-2xl pl-12 pr-28 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none shadow-2xl transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 mt-1 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Query Pills */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Suggested Intelligent Prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(sq);
                  executeSearch(sq);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs transition flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{sq}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Interpretation Banner */}
      {aiInterpretation && (
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center gap-3 text-xs text-indigo-300 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-medium">{aiInterpretation}</span>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Found <strong className="text-white">{results.length}</strong> matching founders</span>
        <span>Sorted by relevance & DraperU engagement</span>
      </div>

      {/* Results Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((founder) => (
          <Link
            key={founder.id}
            href={`/founders/${founder.id}`}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 shadow-xl transition flex flex-col justify-between space-y-4 group"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-sm border border-slate-700 group-hover:border-rose-500/40">
                    {founder.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-rose-400 transition">
                      {founder.name}
                    </h3>
                    <span className="font-mono text-[10px] text-rose-400">
                      {founder.id}
                    </span>
                  </div>
                </div>

                <Badge variant={founder.funding.type === 'Funded' ? 'success' : 'neutral'} size="sm">
                  {founder.funding.stage}
                </Badge>
              </div>

              {/* Startup & Location */}
              <div className="mt-3.5 space-y-1.5 text-xs">
                <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  {founder.startup.name} • <span className="text-slate-400 font-normal">{founder.startup.sector}</span>
                </p>
                <p className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {founder.location}
                </p>
              </div>

              {/* Problem/Solution snippet */}
              {founder.startup.solution && (
                <p className="mt-3 text-[11px] text-slate-400 line-clamp-2 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  {founder.startup.solution}
                </p>
              )}
            </div>

            {/* Tags & Relationship Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-amber-400 font-medium">
                {founder.funding.currentlyFundraising ? '⚡ Raising Target Round' : 'Bootstrapped'}
              </span>
              <span className="text-slate-400 text-[10px] group-hover:text-white transition">
                View 360° Profile →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {results.length === 0 && (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No matching founders found</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your query or resetting filters.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AISearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading AI Founder Search...</div>}>
      <AISearchContent />
    </Suspense>
  );
}
