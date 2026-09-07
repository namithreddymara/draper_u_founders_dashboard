'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Database,
  Sparkles,
  RefreshCw,
  Layers,
  FileText,
  UserCheck,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { Founder, DuplicateDetectionResult, BusinessModel, FundingStage, StartupStage, DraperURelationship } from '@/types';
import { Badge } from '@/components/ui/Badge';

const SAMPLE_SHEET_DATA = `Name,Email,Phone,Company,Sector,Designation,City,LinkedIn
"Karan Malhotra","karan@hypercloud.io","+91 98333 44556","HyperCloud Scale","SaaS","Co-Founder & CEO","Bengaluru","https://linkedin.com/in/karan-hyper"
"Divya Varma","divya@pulsehealth.in","+91 97222 33445","Pulse Health","HealthTech","Founder","Hyderabad","https://linkedin.com/in/divya-pulse"
"Rahul Sharma","rahul@xyz.com","+91 98765 43210","XYZ Technologies","AI / ML","Founder & CEO","Hyderabad","https://linkedin.com/in/rahulsharma-xyz"
"Sameer Sen","sameer@voltenergy.tech","+91 98111 22334","VoltEnergy Systems","ClimateTech","Founder & CTO","Pune","https://linkedin.com/in/sameersen"
"Rohan Das","rohan@finbridge.money","+91 99444 55667","FinBridge Global","FinTech","Co-Founder","Mumbai","https://linkedin.com/in/rohandas-fin"`;

const IMPORT_FIELDS = [
  { field: 'id', label: 'Founder ID', aliases: ['Founder ID', 'ID'] },
  { field: 'name', label: 'Founder Full Name', req: true, aliases: ['Name', 'Founder Name'] },
  { field: 'email', label: 'Email Address', req: true, aliases: ['Email', 'Email Address'] },
  { field: 'phone', label: 'Phone Number', req: true, aliases: ['Phone', 'Phone Number'] },
  { field: 'whatsapp', label: 'WhatsApp', aliases: ['WhatsApp'] },
  { field: 'linkedin', label: 'LinkedIn Profile', aliases: ['LinkedIn', 'LinkedIn Profile'] },
  { field: 'twitter', label: 'Twitter', aliases: ['Twitter'] },
  { field: 'location', label: 'Location', aliases: ['Location', 'City'] },
  { field: 'designation', label: 'Designation', aliases: ['Designation'] },
  { field: 'avatarUrl', label: 'Avatar URL', aliases: ['Avatar URL'] },
  { field: 'bio', label: 'Bio', aliases: ['Bio'] },
  { field: 'startupName', label: 'Startup Name', req: true, aliases: ['Startup Name', 'Company', 'Startup / Company Name'] },
  { field: 'startupWebsite', label: 'Startup Website', aliases: ['Startup Website'] },
  { field: 'startupSector', label: 'Startup Sector', aliases: ['Startup Sector', 'Sector', 'Sector / Domain'] },
  { field: 'startupSubSector', label: 'Startup Sub-Sector', aliases: ['Startup Sub-Sector'] },
  { field: 'startupFoundedYear', label: 'Startup Founded Year', aliases: ['Startup Founded Year'] },
  { field: 'startupStage', label: 'Startup Stage', aliases: ['Startup Stage', 'Stage'] },
  { field: 'startupTeamSize', label: 'Startup Team Size', aliases: ['Startup Team Size'] },
  { field: 'startupBusinessModel', label: 'Startup Business Model', aliases: ['Startup Business Model'] },
  { field: 'startupProblem', label: 'Startup Problem', aliases: ['Startup Problem'] },
  { field: 'startupSolution', label: 'Startup Solution', aliases: ['Startup Solution'] },
  { field: 'startupPitchDeckUrl', label: 'Startup Pitch Deck URL', aliases: ['Startup Pitch Deck URL'] },
  { field: 'fundingType', label: 'Funding Type', aliases: ['Funding Type'] },
  { field: 'fundingStage', label: 'Funding Stage', aliases: ['Funding Stage', 'Funding'] },
  { field: 'amountRaised', label: 'Amount Raised', aliases: ['Amount Raised'] },
  { field: 'currency', label: 'Currency', aliases: ['Currency'] },
  { field: 'investors', label: 'Investors', aliases: ['Investors'] },
  { field: 'currentlyFundraising', label: 'Currently Fundraising', aliases: ['Currently Fundraising'] },
  { field: 'targetAmount', label: 'Target Amount', aliases: ['Target Amount'] },
  { field: 'lastRoundDate', label: 'Last Round Date', aliases: ['Last Round Date'] },
  { field: 'relationship', label: 'Relationship', aliases: ['Relationship'] },
  { field: 'isHighPriority', label: 'High Priority', aliases: ['High Priority'] },
  { field: 'tags', label: 'Tags', aliases: ['Tags'] },
  { field: 'notesCount', label: 'Notes Count', aliases: ['Notes Count'] },
  { field: 'createdAt', label: 'Created At', aliases: ['Created At'] },
  { field: 'updatedAt', label: 'Updated At', aliases: ['Updated At'] },
] as const;

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    if (char === '"' && quoted && csv[index + 1] === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(value.trim()); value = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && csv[index + 1] === '\n') index += 1;
      row.push(value.trim()); rows.push(row); row = []; value = '';
    } else value += char;
  }
  if (value || row.length) { row.push(value.trim()); rows.push(row); }
  return rows;
}

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s_-]+/g, ' ');
}

export default function GoogleSheetImportPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [rawCsv, setRawCsv] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  
  // Mapping state
  const [mapping, setMapping] = useState<Record<string, string>>({
    name: 'Name', email: 'Email', phone: 'Phone', startupName: 'Company',
    startupSector: 'Sector', designation: 'Designation', location: 'City', linkedin: 'LinkedIn',
  });

  const [scanResults, setScanResults] = useState<{
    row: Record<string, string>;
    dupResult: DuplicateDetectionResult;
    action: 'create_new' | 'skip_existing' | 'update_existing';
  }[]>([]);

  const [importSummary, setImportSummary] = useState<{
    total: number;
    created: number;
    skipped: number;
  } | null>(null);

  useEffect(() => {
    dataService.init();
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file.');
      event.target.value = '';
      return;
    }
    setSelectedFileName(file.name);
    setRawCsv(await file.text());
  };

  const handleParseCSV = () => {
    if (!rawCsv.trim()) {
      alert('Please select a CSV file or paste CSV data before continuing.');
      return;
    }

    const csvRows = parseCsv(rawCsv.trim());
    if (csvRows.length < 2) {
      alert('Please enter at least 1 header row and 1 data row.');
      return;
    }

    const hdrs = csvRows[0].map((header, index) => index === 0 ? header.replace(/^\uFEFF/, '').trim() : header.trim());
    setHeaders(hdrs);

    const rows: Record<string, string>[] = [];
    for (let i = 1; i < csvRows.length; i++) {
      const values = csvRows[i];
      const rowObj: Record<string, string> = {};
      hdrs.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });
      rows.push(rowObj);
    }

    const detectedMapping: Record<string, string> = {};
    IMPORT_FIELDS.forEach((definition) => {
      detectedMapping[definition.field] = hdrs.find((header) => definition.aliases.some((alias) => normalizeHeader(alias) === normalizeHeader(header))) || '';
    });
    setMapping((current) => ({ ...current, ...detectedMapping }));
    setParsedRows(rows);
    setStep(2);
  };

  const handleRunDuplicateScan = () => {
    const results = parsedRows.map((row) => {
      const email = row[mapping.email];
      const phone = row[mapping.phone];
      const linkedin = row[mapping.linkedin];
      const name = row[mapping.name];
      const company = row[mapping.startupName];

      const dupCheck = dataService.checkDuplicates({
        email,
        phone,
        linkedin,
        name,
        company,
      });

      return {
        row,
        dupResult: dupCheck,
        action: (dupCheck.hasDuplicate ? 'update_existing' : 'create_new') as 'create_new' | 'skip_existing' | 'update_existing',
      };
    });

    setScanResults(results);
    setStep(3);
  };

  const handleExecuteImport = () => {
    let createdCount = 0;
    let skippedCount = 0;

    scanResults.forEach((item) => {
      if (item.action === 'create_new' || item.action === 'update_existing') {
        const value = (field: string) => item.row[mapping[field]]?.trim() || '';
        const name = value('name') || 'Anonymous';
        const email = item.row[mapping.email] || `founder-${Date.now()}@draperu.in`;
        const phone = item.row[mapping.phone] || '+91 90000 00000';
        const company = value('startupName') || 'Stealth Startup';
        const sector = value('startupSector') || 'Tech';
        const designation = item.row[mapping.designation] || 'Founder';
        const location = value('location') || 'Bengaluru, India';
        const parseBoolean = (field: string) => ['true', 'yes', '1'].includes(value(field).toLowerCase());
        const parseList = (field: string) => value(field).split(';').map((entry) => entry.trim()).filter(Boolean);
        const founder: Founder = {
          id: item.action === 'update_existing'
            ? item.dupResult.matchedFounder?.id || value('id') || dataService.generateFounderId()
            : value('id') || dataService.generateFounderId(),
          name,
          email,
          phone,
          whatsapp: value('whatsapp') || undefined,
          linkedin: value('linkedin') || undefined,
          twitter: value('twitter') || undefined,
          location,
          designation: designation || 'Founder',
          avatarUrl: value('avatarUrl') || undefined,
          bio: value('bio') || undefined,
          startup: {
            name: company,
            website: value('startupWebsite') || undefined,
            sector,
            subSector: value('startupSubSector') || undefined,
            foundedYear: Number(value('startupFoundedYear')) || undefined,
            stage: (value('startupStage') || 'Early Traction') as StartupStage,
            teamSize: value('startupTeamSize') || '1-5',
            businessModel: (value('startupBusinessModel') || 'B2B') as BusinessModel,
            problem: value('startupProblem') || undefined,
            solution: value('startupSolution') || undefined,
            pitchDeckUrl: value('startupPitchDeckUrl') || undefined,
          },
          funding: {
            type: (value('fundingType') || 'Funded') as 'Bootstrapped' | 'Funded',
            stage: (value('fundingStage') || 'Pre-Seed') as FundingStage,
            amountRaised: value('amountRaised') || undefined,
            currency: (value('currency') || undefined) as 'USD' | 'INR' | undefined,
            investors: parseList('investors'),
            currentlyFundraising: parseBoolean('currentlyFundraising'),
            targetAmount: value('targetAmount') || undefined,
            lastRoundDate: value('lastRoundDate') || undefined,
          },
          relationship: (value('relationship') || 'Event attendee') as DraperURelationship,
          isHighPriority: parseBoolean('isHighPriority'),
          tags: parseList('tags').length ? parseList('tags') : ['Google Sheet Ingest', sector],
          notesCount: Number(value('notesCount')) || 0,
          createdAt: value('createdAt') || new Date().toISOString(),
          updatedAt: value('updatedAt') || new Date().toISOString(),
        };
        dataService.importFounder(founder);
        if (item.action === 'update_existing') {
          skippedCount++;
        } else {
          createdCount++;
        }
      } else {
        skippedCount++;
      }
    });

    setImportSummary({
      total: scanResults.length,
      created: createdCount,
      skipped: skippedCount,
    });
    setStep(4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            Data Migration & Sync
          </span>
          <span className="text-xs text-slate-500">Google Sheets → DraperU CRM</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Google Sheet & CSV Importer
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Import past Founder Mafia Night registrations, Google Forms, or Excel spreadsheets with column mapping and automated duplicate prevention.
        </p>
      </div>

      {/* Stepper Wizard Bar */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
        {[
          { num: 1, label: '1. Paste Sheet Data' },
          { num: 2, label: '2. Column Mapping' },
          { num: 3, label: '3. Duplicate Pre-Scan' },
          { num: 4, label: '4. Ingestion Complete' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-2xl border transition ${
              step === s.num
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : step > s.num
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* STEP 1: PASTE CSV / SHEET */}
      {step === 1 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Spreadsheet CSV Content
            </h3>
            <button
              onClick={() => setRawCsv(SAMPLE_SHEET_DATA)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Founder Sheet</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Select a CSV file exported from the Founder CRM, or paste rows copied directly from Google Sheets.
          </p>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/60 px-4 py-5 text-xs font-bold text-blue-700 hover:bg-blue-50">
            <Upload className="h-4 w-4" />
            <span>{selectedFileName || 'Select CSV file'}</span>
            <input type="file" accept=".csv,text/csv" onChange={handleFileSelect} className="sr-only" />
          </label>

          <textarea
            rows={10}
            value={rawCsv}
            onChange={(e) => setRawCsv(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
          />

          <div className="flex justify-end pt-2">
            <button
              onClick={handleParseCSV}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 flex items-center gap-2 transition"
            >
              <span>Next: Map Columns</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 2 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Map Spreadsheet Columns to CRM Fields</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm which Google Sheet column corresponds to each DraperU founder attribute.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {IMPORT_FIELDS.map((f) => (
              <div key={f.field} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                    <span className="text-xs font-bold text-slate-800 block">{f.label} {'req' in f && f.req && <span className="text-blue-600">*</span>}</span>
                  <span className="text-[10px] text-slate-500">CRM Field: {f.field}</span>
                </div>
                <select
                  value={mapping[f.field] || ''}
                  onChange={(e) => setMapping({ ...mapping, [f.field]: e.target.value })}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="">-- Do not map --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleRunDuplicateScan}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 flex items-center gap-2"
            >
              <span>Scan for Duplicates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DUPLICATE PRE-SCAN PREVIEW */}
      {step === 3 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Duplicate Pre-Scan Results
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review records before writing to database. Existing profiles can be skipped to prevent duplicate IDs.
            </p>
          </div>

          <div className="space-y-3">
            {scanResults.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  item.dupResult.hasDuplicate
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{item.row[mapping.name]}</span>
                    <span className="text-xs text-slate-400">({item.row[mapping.startupName]})</span>
                    {item.dupResult.hasDuplicate ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Existing Profile Found ({item.dupResult.matchedFounder?.id})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ✓ Ready to Generate New ID
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex gap-3">
                    <span>{item.row[mapping.email]}</span>
                    <span>{item.row[mapping.phone]}</span>
                    <span>{item.row[mapping.startupSector]}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={item.action}
                    onChange={(e) => {
                      const updated = [...scanResults];
                      updated[idx].action = e.target.value as any;
                      setScanResults(updated);
                    }}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="create_new">Create New DRU-F-ID</option>
                    <option value="update_existing">Update Existing Profile</option>
                    <option value="skip_existing">Skip (Keep Existing)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleExecuteImport}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Perform Batch Ingestion</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: INGESTION COMPLETE */}
      {step === 4 && importSummary && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-6 animate-fadeIn">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Spreadsheet Ingestion Complete!
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Successfully processed and updated your DraperU Founder Database.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Rows</span>
              <span className="text-xl font-bold text-slate-900">{importSummary.total}</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">New Founders</span>
              <span className="text-xl font-bold text-emerald-300">+{importSummary.created}</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block">Duplicates Skipped</span>
              <span className="text-xl font-bold text-amber-300">{importSummary.skipped}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200"
            >
              Import Another Sheet
            </button>
            <Link
              href="/founders"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 flex items-center gap-2"
            >
              <span>View Founder CRM</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
