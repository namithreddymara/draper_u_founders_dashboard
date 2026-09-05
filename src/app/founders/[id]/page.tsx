'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Building,
  DollarSign,
  ShieldCheck,
  Calendar,
  PhoneCall,
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
  Flame,
  PlusCircle,
  Clock,
  CheckCircle2,
  Share2,
  Printer,
  QrCode,
  CalendarCheck,
  FileText,
  Users,
  Edit,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { Founder, Interaction, FollowUp, InteractionType, PriorityLevel } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { QRCodeCard } from '@/components/ui/QRCodeCard';

export default function FounderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || 'DRU-F-000124';

  const [founder, setFounder] = useState<Founder | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  // Interaction Form
  const [interactionForm, setInteractionForm] = useState<{
    type: InteractionType;
    title: string;
    description: string;
    createdBy: string;
  }>({
    type: 'call',
    title: '',
    description: '',
    createdBy: 'Anshi (Community Team)',
  });

  // Follow-up Form
  const [followUpForm, setFollowUpForm] = useState<{
    title: string;
    description: string;
    dueDate: string;
    assignedTo: string;
    priority: PriorityLevel;
  }>({
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    assignedTo: 'Anshi',
    priority: 'high',
  });

  useEffect(() => {
    dataService.init();
    loadFounderData();
  }, [id]);

  const loadFounderData = () => {
    const found = dataService.getFounderById(id);
    if (found) {
      setFounder(found);
      setInteractions(dataService.getInteractions(found.id));
      setFollowUps(dataService.getFollowUps(found.id));
    }
  };

  if (!founder) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Founder not found ({id})</h2>
        <Link href="/founders" className="text-xs text-blue-600 hover:underline">
          Return to Founders Directory
        </Link>
      </div>
    );
  }

  const toggleHighPriority = () => {
    const updated = dataService.updateFounder(founder.id, {
      isHighPriority: !founder.isHighPriority,
    });
    if (updated) setFounder(updated);
  };

  const handleDeleteFounder = async () => {
    if (!window.confirm(`Delete ${founder.name}? This action cannot be undone.`)) return;
    try {
      if (await dataService.deleteFounderAndSync(founder.id)) router.push('/founders');
    } catch (err) {
      alert('Unable to delete founder. Please try again.');
    }
  };

  const handleLogInteractionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactionForm.title.trim()) return;

    dataService.addInteraction({
      founderId: founder.id,
      type: interactionForm.type,
      title: interactionForm.title.trim(),
      description: interactionForm.description.trim(),
      date: new Date().toISOString(),
      createdBy: interactionForm.createdBy,
    });

    setIsLogModalOpen(false);
    setInteractionForm({
      type: 'call',
      title: '',
      description: '',
      createdBy: 'Anshi (Community Team)',
    });
    loadFounderData();
  };

  const handleCreateFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpForm.title.trim()) return;

    dataService.createFollowUp({
      founderId: founder.id,
      founderName: founder.name,
      founderCompany: founder.startup.name,
      founderEmail: founder.email,
      founderPhone: founder.phone,
      title: followUpForm.title.trim(),
      description: followUpForm.description.trim(),
      dueDate: followUpForm.dueDate,
      assignedTo: followUpForm.assignedTo,
      status: 'upcoming',
      priority: followUpForm.priority,
    });

    setIsFollowUpModalOpen(false);
    setFollowUpForm({
      title: '',
      description: '',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      assignedTo: 'Anshi',
      priority: 'high',
    });
    loadFounderData();
  };

  const getInteractionIcon = (type: InteractionType) => {
    switch (type) {
      case 'event_attendance':
        return <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">🤝</div>;
      case 'event_registration':
        return <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">🟢</div>;
      case 'call':
        return <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">📞</div>;
      case 'email':
        return <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">📧</div>;
      case 'investor_intro':
        return <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">🚀</div>;
      case 'program_application':
        return <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">📝</div>;
      default:
        return <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">💬</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/founders"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Founders</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/f/${founder.id}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Public Pass</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 p-0.5 shadow-md shadow-blue-600/20 shrink-0">
              <div className="w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center overflow-hidden font-black text-2xl text-blue-700">
                {founder.avatarUrl ? (
                  <img src={founder.avatarUrl} alt={founder.name} className="w-full h-full object-cover" />
                ) : (
                  founder.name.charAt(0)
                )}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{founder.name}</h1>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {founder.id}
                </span>
                <button
                  onClick={toggleHighPriority}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition ${
                    founder.isHighPriority
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${founder.isHighPriority ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>{founder.isHighPriority ? 'VIP High Priority' : 'Mark VIP'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-1">
                {founder.designation} at <strong className="text-slate-800">{founder.startup.name}</strong> • {founder.startup.sector}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {founder.location}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {founder.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {founder.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              <span>Log Interaction</span>
            </button>
            <button
              onClick={() => setIsFollowUpModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Add Follow-up</span>
            </button>
            <button
              onClick={handleDeleteFounder}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Founder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Columns (4 Structured Profile Cards) + Right Column (Timeline & QR) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 4 Structured Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Personal Details */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
              <User className="w-4 h-4" />
              1. Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Full Name:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{founder.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Designation:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{founder.designation}</p>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>
                <p className="font-semibold text-slate-700 mt-0.5">{founder.email}</p>
              </div>
              <div>
                <span className="text-slate-400">Phone / WhatsApp:</span>
                <p className="font-semibold text-slate-700 mt-0.5">{founder.phone}</p>
              </div>
              <div>
                <span className="text-slate-400">LinkedIn:</span>
                <p className="mt-0.5">
                  {founder.linkedin ? (
                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      {founder.linkedin.replace('https://', '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    'Not added'
                  )}
                </p>
              </div>
              <div>
                <span className="text-slate-400">City & Location:</span>
                <p className="font-semibold text-slate-700 mt-0.5">{founder.location}</p>
              </div>
            </div>

            {founder.bio && (
              <div className="pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-400">Bio:</span>
                <p className="text-slate-600 mt-1 leading-relaxed">{founder.bio}</p>
              </div>
            )}
          </div>

          {/* Card 2: Startup Profile */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                <Building className="w-4 h-4" />
                2. Startup Profile
              </h3>
              <Badge variant="primary" size="sm">{founder.startup.stage}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Startup Name:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{founder.startup.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Website:</span>
                <p className="mt-0.5">
                  {founder.startup.website ? (
                    <a
                      href={founder.startup.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      {founder.startup.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Sector & Sub-sector:</span>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {founder.startup.sector} {founder.startup.subSector ? `(${founder.startup.subSector})` : ''}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Founded Year & Team Size:</span>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {founder.startup.foundedYear || 2024} • {founder.startup.teamSize} members
                </p>
              </div>
            </div>

            {founder.startup.problem && (
              <div className="pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-400 font-semibold">Problem:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{founder.startup.problem}</p>
              </div>
            )}

            {founder.startup.solution && (
              <div className="pt-1 text-xs">
                <span className="text-slate-400 font-semibold">Solution:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{founder.startup.solution}</p>
              </div>
            )}
          </div>

          {/* Card 3: Funding Details */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                3. Funding Track
              </h3>
              <Badge variant={founder.funding.type === 'Funded' ? 'success' : 'neutral'} size="sm">
                {founder.funding.stage}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Type:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{founder.funding.type}</p>
              </div>
              <div>
                <span className="text-slate-400">Amount Raised:</span>
                <p className="font-bold text-emerald-600 text-sm mt-0.5">
                  {founder.funding.amountRaised || 'Bootstrapped'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Currently Fundraising:</span>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {founder.funding.currentlyFundraising ? (
                    <span className="text-amber-600 font-bold">Yes (Target: {founder.funding.targetAmount || '$1M+'})</span>
                  ) : (
                    'No'
                  )}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Investors:</span>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {founder.funding.investors.length > 0
                    ? founder.funding.investors.join(', ')
                    : 'Angel syndicate / None listed'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: DraperU Relationship */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              4. DraperU India Relationship
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="gold" size="lg">
                {founder.relationship}
              </Badge>
              {founder.tags.map((tag, idx) => (
                <Badge key={idx} variant="purple" size="md">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Permanent Dynamic QR & 360° Timeline */}
        <div className="space-y-6">
          {/* Scannable Dynamic QR Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4 text-blue-600" />
              Permanent Founder Pass
            </h3>

            <div className="p-3 bg-white rounded-2xl max-w-[200px] mx-auto shadow-inner">
              {typeof window !== 'undefined' && (
                <QRCodeCard
                  value={`${window.location.origin}/f/${founder.id}`}
                  title={founder.name}
                  subtitle={founder.id}
                  idBadge={founder.id}
                  size={150}
                  showActions={false}
                  className="p-0 border-0 bg-transparent shadow-none"
                />
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              Printable QR for founder badge, event lanyard, or membership pass.
            </p>

            <Link
              href={`/f/${founder.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Badge Card</span>
            </Link>
          </div>

          {/* Complete Founder Timeline (Requirement 5) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Complete Founder Timeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unified history of event registrations, calls, and intros.
                </p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-4 pt-2 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
              {interactions.map((int) => (
                <div key={int.id} className="flex items-start gap-3 relative z-10 text-xs">
                  <div className="shrink-0 mt-0.5">{getInteractionIcon(int.type)}</div>
                  <div className="flex-1 space-y-0.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">{int.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(int.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{int.description}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      By {int.createdBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Log Interaction Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={`Log Interaction for ${founder.name}`}
        subtitle="Record calls, meetings, emails, or investor introductions."
      >
        <form onSubmit={handleLogInteractionSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Interaction Type
            </label>
            <select
              value={interactionForm.type}
              onChange={(e) =>
                setInteractionForm({ ...interactionForm, type: e.target.value as InteractionType })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="call">📞 Phone Call</option>
              <option value="email">📧 Email Update</option>
              <option value="meeting">🤝 1-on-1 Meeting</option>
              <option value="investor_intro">🚀 Investor Introduction</option>
              <option value="note">📝 Internal Note</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Title / Summary <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Discussed Series A deck with Blume Ventures"
              value={interactionForm.title}
              onChange={(e) =>
                setInteractionForm({ ...interactionForm, title: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Notes & Discussion Details
            </label>
            <textarea
              rows={3}
              placeholder="Key takeaways, metrics shared, next steps..."
              value={interactionForm.description}
              onChange={(e) =>
                setInteractionForm({ ...interactionForm, description: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition"
            >
              Save Interaction
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Follow-Up Modal */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title={`Schedule Follow-up Task for ${founder.name}`}
        subtitle="Ensure timely follow-through on investor intros and accelerator applications."
      >
        <form onSubmit={handleCreateFollowUpSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Follow-up Title <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Follow up regarding investor introduction"
              value={followUpForm.title}
              onChange={(e) => setFollowUpForm({ ...followUpForm, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={followUpForm.dueDate}
                onChange={(e) => setFollowUpForm({ ...followUpForm, dueDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Assigned Team Member
              </label>
              <select
                value={followUpForm.assignedTo}
                onChange={(e) => setFollowUpForm({ ...followUpForm, assignedTo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="Anshi">Anshi (Community Team)</option>
                <option value="Rahul">Rahul (Founder Team)</option>
                <option value="Event Ops">Event Ops Team</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Task Notes / Context
            </label>
            <textarea
              rows={2}
              placeholder="Add details about target check size, investor partner names, or cohort deadlines..."
              value={followUpForm.description}
              onChange={(e) => setFollowUpForm({ ...followUpForm, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsFollowUpModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition"
            >
              Create Follow-up
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
