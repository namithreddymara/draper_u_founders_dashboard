export type StartupStage = 'Idea' | 'MVP' | 'Early Traction' | 'Growth' | 'Scaling';
export type FundingStage = 'Bootstrapped' | 'Pre-Seed' | 'Seed' | 'Pre-Series A' | 'Series A' | 'Series B+' | 'Growth';
export type BusinessModel = 'B2B' | 'B2C' | 'B2B2C' | 'D2C' | 'Marketplace' | 'SaaS' | 'Enterprise';
export type DraperURelationship = 'Community member' | 'Event attendee' | 'Founder program' | 'Mentor' | 'Investor' | 'Partner' | 'Alumni';

export type UserRole = 'admin' | 'community_team' | 'event_team' | 'viewer';

export interface StartupInfo {
  name: string;
  website?: string;
  sector: string; // e.g. "AI / ML", "FinTech", "HealthTech", "SaaS", "DeepTech", "ClimateTech", "EdTech", "Web3"
  subSector?: string;
  foundedYear?: number;
  stage: StartupStage;
  teamSize: string; // "1-5", "6-15", "16-50", "50+"
  businessModel: BusinessModel;
  problem?: string;
  solution?: string;
  pitchDeckUrl?: string;
}

export interface FundingInfo {
  type: 'Bootstrapped' | 'Funded';
  stage: FundingStage;
  amountRaised?: string; // e.g. "$500K", "₹4 Cr", "Bootstrapped"
  currency?: 'USD' | 'INR';
  investors: string[]; // e.g. ["Sequoia Surge", "Blume Ventures", "Angel Syndicate"]
  currentlyFundraising: boolean;
  targetAmount?: string; // e.g. "$1.5M"
  lastRoundDate?: string; // "2026-02"
}

export interface Founder {
  id: string; // e.g. "DRU-F-000124"
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  linkedin?: string;
  twitter?: string;
  location: string; // e.g. "Hyderabad, Telangana" or "Bengaluru, Karnataka"
  designation: string; // e.g. "Founder & CEO"
  avatarUrl?: string;
  bio?: string;
  
  startup: StartupInfo;
  funding: FundingInfo;
  
  relationship: DraperURelationship;
  isHighPriority: boolean;
  tags: string[]; // ["AI Mafia", "Demo Day 2026", "Hot Lead", "Fundraising"]
  notesCount?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface DraperUEvent {
  id: string;
  slug: string; // "founder-mafia-night-blr", "founder-friday-hyd"
  title: string;
  tagline: string;
  description: string;
  date: string; // "2026-08-21T18:00:00+05:30"
  endDate?: string;
  venue: string;
  city: string;
  bannerUrl?: string;
  category: 'Founder Mafia Night' | 'Founder Friday' | 'Demo Day' | 'Masterclass' | 'Mixer' | 'Flagship Summit';
  status: 'upcoming' | 'live' | 'past';
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  newFoundersCount: number;
  existingFoundersCount: number;
  qrCodeUrl?: string;
  allowWalkins: boolean;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  founderId: string;
  founderName: string;
  founderEmail: string;
  founderPhone: string;
  founderCompany: string;
  founderSector: string;
  isNewFounder: boolean;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  source: 'QR Scan' | 'Direct Link' | 'Walk-in Desk' | 'Admin Added' | 'Sheet Import';
  notes?: string;
}

export type InteractionType = 
  | 'event_registration'
  | 'event_attendance'
  | 'call'
  | 'email'
  | 'meeting'
  | 'investor_intro'
  | 'program_application'
  | 'note'
  | 'milestone';

export interface Interaction {
  id: string;
  founderId: string;
  type: InteractionType;
  title: string;
  description: string;
  date: string;
  createdBy: string;
  metadata?: {
    eventId?: string;
    eventTitle?: string;
    investorName?: string;
    programBatch?: string;
    callOutcome?: string;
  };
}

export type FollowUpStatus = 'overdue' | 'today' | 'this_week' | 'upcoming' | 'completed';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface FollowUp {
  id: string;
  founderId: string;
  founderName: string;
  founderCompany: string;
  founderEmail: string;
  founderPhone: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  assignedTo: string; // "Anshi", "Rahul", "DraperU Community"
  status: FollowUpStatus;
  priority: PriorityLevel;
  eventId?: string;
  eventTitle?: string;
  completedAt?: string;
  createdAt: string;
}

export interface DuplicateDetectionResult {
  hasDuplicate: boolean;
  matchType: 'exact_email' | 'exact_phone' | 'exact_linkedin' | 'fuzzy_name_company' | 'none';
  matchConfidence: number; // 0 to 100
  matchedFounder?: Founder;
  matchedFields: string[];
}

export interface ImportMapping {
  nameCol: string;
  companyCol: string;
  emailCol: string;
  phoneCol: string;
  linkedinCol: string;
  sectorCol: string;
  cityCol: string;
  designationCol: string;
  stageCol: string;
  fundingCol: string;
  eventCol?: string;
}

export interface ExecutiveMetrics {
  totalFounders: number;
  totalStartups: number;
  totalEvents: number;
  followUpsCount: {
    overdue: number;
    today: number;
    thisWeek: number;
    upcoming: number;
    totalActive: number;
  };
  highPriorityFounders: number;
  newFoundersThisMonth: number;
  sectorBreakdown: { sector: string; count: number; percentage: number }[];
  stageBreakdown: { stage: string; count: number }[];
  cityBreakdown: { city: string; count: number }[];
}
