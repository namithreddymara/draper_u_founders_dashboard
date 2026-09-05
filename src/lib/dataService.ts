import {
  Founder,
  DraperUEvent,
  EventRegistration,
  Interaction,
  FollowUp,
  DuplicateDetectionResult,
  ExecutiveMetrics,
  UserRole,
} from '@/types';
const STORAGE_KEYS = {
  FOUNDERS: 'dru_founders_v2',
  EVENTS: 'dru_events_v2',
  REGISTRATIONS: 'dru_registrations_v2',
  INTERACTIONS: 'dru_interactions_v2',
  FOLLOW_UPS: 'dru_follow_ups_v2',
  CURRENT_ROLE: 'dru_current_role_v2',
};

// Safe LocalStorage helpers
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Broadcast real-time update event across tabs and components
    window.dispatchEvent(new CustomEvent('dru_data_updated', { detail: { key, value } }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('dru_sync_channel');
        bc.postMessage({ key, timestamp: Date.now() });
        bc.close();
      } catch (e) {
        // ignore
      }
    }
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

export function subscribeToDataUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const handleCustomEvent = () => callback();
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key && e.key.startsWith('dru_')) callback();
  };

  window.addEventListener('dru_data_updated', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel('dru_sync_channel');
      bc.onmessage = () => callback();
    } catch (e) {
      // ignore
    }
  }

  return () => {
    window.removeEventListener('dru_data_updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    if (bc) bc.close();
  };
}

class DataService {
  // --- Initialization ---
  public init(): void {
    // Data is created through the app or loaded from the configured backend.
  }

  public resetToDefaults(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.FOUNDERS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.REGISTRATIONS);
    localStorage.removeItem(STORAGE_KEYS.INTERACTIONS);
    localStorage.removeItem(STORAGE_KEYS.FOLLOW_UPS);
  }

  // --- Role Management ---
  public getCurrentRole(): UserRole {
    return getItem<UserRole>(STORAGE_KEYS.CURRENT_ROLE, 'admin');
  }

  public setCurrentRole(role: UserRole): void {
    setItem(STORAGE_KEYS.CURRENT_ROLE, role);
  }

  // --- Founder ID Generation ---
  public generateFounderId(): string {
    const founders = this.getFounders();
    let maxNum = 100;
    founders.forEach((f) => {
      const match = f.id.match(/DRU-F-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `DRU-F-${String(nextNum).padStart(6, '0')}`;
  }

  // --- Duplicate Detection ---
  public checkDuplicates(candidate: {
    email?: string;
    phone?: string;
    linkedin?: string;
    name?: string;
    company?: string;
  }): DuplicateDetectionResult {
    const founders = this.getFounders();
    const cleanEmail = candidate.email?.trim().toLowerCase();
    const cleanPhone = candidate.phone?.replace(/[^0-9]/g, '');
    const cleanLinkedIn = candidate.linkedin?.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '');
    const cleanName = candidate.name?.trim().toLowerCase();
    const cleanCompany = candidate.company?.trim().toLowerCase();

    // 1. Exact Email Check
    if (cleanEmail) {
      const matched = founders.find(
        (f) => f.email.trim().toLowerCase() === cleanEmail
      );
      if (matched) {
        return {
          hasDuplicate: true,
          matchType: 'exact_email',
          matchConfidence: 100,
          matchedFounder: matched,
          matchedFields: ['Email'],
        };
      }
    }

    // 2. Exact Phone Check
    if (cleanPhone && cleanPhone.length >= 7) {
      const matched = founders.find((f) => {
        const fPhone = f.phone.replace(/[^0-9]/g, '');
        return fPhone.endsWith(cleanPhone) || cleanPhone.endsWith(fPhone);
      });
      if (matched) {
        return {
          hasDuplicate: true,
          matchType: 'exact_phone',
          matchConfidence: 95,
          matchedFounder: matched,
          matchedFields: ['Phone Number'],
        };
      }
    }

    // 3. Exact LinkedIn Check
    if (cleanLinkedIn && cleanLinkedIn.length > 3) {
      const matched = founders.find((f) => {
        if (!f.linkedin) return false;
        const fLi = f.linkedin.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '');
        return fLi === cleanLinkedIn;
      });
      if (matched) {
        return {
          hasDuplicate: true,
          matchType: 'exact_linkedin',
          matchConfidence: 90,
          matchedFounder: matched,
          matchedFields: ['LinkedIn Profile'],
        };
      }
    }

    // 4. Fuzzy Name & Company Check
    if (cleanName && cleanCompany) {
      const matched = founders.find((f) => {
        const nameMatch = f.name.toLowerCase().includes(cleanName) || cleanName.includes(f.name.toLowerCase());
        const compMatch = f.startup.name.toLowerCase().includes(cleanCompany) || cleanCompany.includes(f.startup.name.toLowerCase());
        return nameMatch && compMatch;
      });
      if (matched) {
        return {
          hasDuplicate: true,
          matchType: 'fuzzy_name_company',
          matchConfidence: 80,
          matchedFounder: matched,
          matchedFields: ['Founder Name', 'Company Name'],
        };
      }
    }

    return {
      hasDuplicate: false,
      matchType: 'none',
      matchConfidence: 0,
      matchedFields: [],
    };
  }

  // --- Founders CRUD ---
  public getFounders(): Founder[] {
    return getItem<Founder[]>(STORAGE_KEYS.FOUNDERS, []);
  }

  public async refreshFounders(): Promise<Founder[]> {
    const localFounders = this.getFounders();

    try {
      const { SupabaseBridge } = await import('./supabaseBridge');
      const remoteFounders = await SupabaseBridge.fetchFounders();
      if (remoteFounders) {
        setItem(STORAGE_KEYS.FOUNDERS, remoteFounders);
        return remoteFounders;
      }
    } catch (err) {
      console.warn('Unable to refresh founders from Supabase, using local data', err);
    }

    return localFounders;
  }

  public async syncFounder(founder: Founder): Promise<boolean> {
    try {
      const { SupabaseBridge } = await import('./supabaseBridge');
      return SupabaseBridge.upsertFounder(founder);
    } catch (err) {
      console.warn('Unable to sync founder to Supabase', err);
      return false;
    }
  }

  public getFounderById(id: string): Founder | undefined {
    return this.getFounders().find((f) => f.id === id);
  }

  public getFounderByEmailOrPhone(query: string): Founder | undefined {
    const q = query.trim().toLowerCase();
    return this.getFounders().find((f) => {
      const email = (f.email || '').toLowerCase();
      const phone = (f.phone || '').replace(/\D/g, '');
      const cleanQ = q.replace(/\D/g, '');
      return email === q || (cleanQ.length >= 7 && phone.includes(cleanQ));
    });
  }

  public subscribeToDataUpdates(callback: () => void): () => void {
    return subscribeToDataUpdates(callback);
  }

  public createFounder(founderData: Omit<Founder, 'id' | 'createdAt' | 'updatedAt'>): Founder {
    const founders = this.getFounders();
    const id = this.generateFounderId();
    const newFounder: Founder = {
      ...founderData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    founders.unshift(newFounder);
    setItem(STORAGE_KEYS.FOUNDERS, founders);

    // Automatically log profile creation interaction
    this.addInteraction({
      founderId: id,
      type: 'milestone',
      title: 'Founder Profile Created',
      description: `Permanent DraperU Founder ID ${id} issued. Startup: ${newFounder.startup.name}.`,
      date: new Date().toISOString(),
      createdBy: 'System Automation',
    });

    // Sync to Supabase in background if configured
    import('./supabaseBridge').then(({ SupabaseBridge }) => {
      SupabaseBridge.upsertFounder(newFounder).catch(() => {});
    });

    return newFounder;
  }

  public updateFounder(id: string, updates: Partial<Founder>): Founder | undefined {
    const founders = this.getFounders();
    const index = founders.findIndex((f) => f.id === id);
    if (index === -1) return undefined;

    founders[index] = {
      ...founders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.FOUNDERS, founders);

    // Sync to Supabase in background if configured
    import('./supabaseBridge').then(({ SupabaseBridge }) => {
      SupabaseBridge.upsertFounder(founders[index]).catch(() => {});
    });

    return founders[index];
  }

  public deleteFounder(id: string): boolean {
    const founders = this.getFounders();
    const filtered = founders.filter((f) => f.id !== id);
    if (filtered.length === founders.length) return false;
    setItem(STORAGE_KEYS.FOUNDERS, filtered);
    return true;
  }

  // --- Events CRUD ---
  public getEvents(): DraperUEvent[] {
    return getItem<DraperUEvent[]>(STORAGE_KEYS.EVENTS, []);
  }

  public async refreshEvents(): Promise<DraperUEvent[]> {
    const localEvents = this.getEvents();
    try {
      const { SupabaseBridge } = await import('./supabaseBridge');
      const remoteEvents = await SupabaseBridge.fetchEvents();
      if (remoteEvents) {
        setItem(STORAGE_KEYS.EVENTS, remoteEvents);
        return remoteEvents;
      }
    } catch (err) {
      console.warn('Unable to refresh events from Supabase, using local data', err);
    }
    return localEvents;
  }

  public async syncEvent(event: DraperUEvent): Promise<boolean> {
    try {
      const { SupabaseBridge } = await import('./supabaseBridge');
      return SupabaseBridge.upsertEvent(event);
    } catch (err) {
      console.warn('Unable to sync event to Supabase', err);
      return false;
    }
  }

  public async syncEventRegistration(registration: EventRegistration): Promise<boolean> {
    try {
      const { SupabaseBridge } = await import('./supabaseBridge');
      return SupabaseBridge.upsertEventRegistration(registration);
    } catch (err) {
      console.warn('Unable to sync event registration to Supabase', err);
      return false;
    }
  }

  public getEventById(idOrSlug: string): DraperUEvent | undefined {
    return this.getEvents().find((e) => e.id === idOrSlug || e.slug === idOrSlug);
  }

  public createEvent(eventData: Omit<DraperUEvent, 'id' | 'registeredCount' | 'checkedInCount' | 'newFoundersCount' | 'existingFoundersCount'>): DraperUEvent {
    const events = this.getEvents();
    const newEvent: DraperUEvent = {
      ...eventData,
      id: `evt-${String(events.length + 1).padStart(3, '0')}`,
      registeredCount: 0,
      checkedInCount: 0,
      newFoundersCount: 0,
      existingFoundersCount: 0,
    };
    events.unshift(newEvent);
    setItem(STORAGE_KEYS.EVENTS, events);
    this.syncEvent(newEvent).catch(() => {});
    return newEvent;
  }

  public updateEvent(id: string, updates: Partial<DraperUEvent>): DraperUEvent | undefined {
    const events = this.getEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) return undefined;

    events[index] = { ...events[index], ...updates };
    setItem(STORAGE_KEYS.EVENTS, events);
    this.syncEvent(events[index]).catch(() => {});
    return events[index];
  }

  // --- Registrations & Check-In ---
  public getRegistrations(eventId?: string): EventRegistration[] {
    const all = getItem<EventRegistration[]>(STORAGE_KEYS.REGISTRATIONS, []);
    if (!eventId) return all;
    return all.filter((r) => r.eventId === eventId);
  }

  public registerForEvent(params: {
    eventId: string;
    founderId: string;
    isNewFounder: boolean;
    source?: EventRegistration['source'];
    notes?: string;
    autoCheckIn?: boolean;
  }): { registration: EventRegistration; event: DraperUEvent } {
    const event = this.getEventById(params.eventId);
    const founder = this.getFounderById(params.founderId);
    if (!event || !founder) throw new Error('Event or Founder not found');

    const registrations = this.getRegistrations();
    const existing = registrations.find(
      (r) => r.eventId === event.id && r.founderId === founder.id
    );

    let reg: EventRegistration;
    const now = new Date().toISOString();

    if (existing) {
      reg = existing;
      if (params.autoCheckIn && !reg.checkedIn) {
        reg.checkedIn = true;
        reg.checkedInAt = now;
        this.updateEventCounts(event.id);
      }
    } else {
      reg = {
        id: `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        eventId: event.id,
        eventTitle: event.title,
        founderId: founder.id,
        founderName: founder.name,
        founderEmail: founder.email,
        founderPhone: founder.phone,
        founderCompany: founder.startup.name,
        founderSector: founder.startup.sector,
        isNewFounder: params.isNewFounder,
        registeredAt: now,
        checkedIn: !!params.autoCheckIn,
        checkedInAt: params.autoCheckIn ? now : undefined,
        source: params.source || 'QR Scan',
        notes: params.notes,
      };
      registrations.unshift(reg);
      setItem(STORAGE_KEYS.REGISTRATIONS, registrations);

      // Update event metrics
      this.updateEventCounts(event.id);

      // Log Registration Interaction
      this.addInteraction({
        founderId: founder.id,
        type: 'event_registration',
        title: `Registered for ${event.title}`,
        description: `Source: ${reg.source}. Registered for event taking place at ${event.venue}, ${event.city}.`,
        date: now,
        createdBy: 'Automated Registration',
        metadata: {
          eventId: event.id,
          eventTitle: event.title,
        },
      });

      if (params.autoCheckIn) {
        this.addInteraction({
          founderId: founder.id,
          type: 'event_attendance',
          title: `Attended ${event.title}`,
          description: `Automatic check-in recorded upon entrance registration at ${event.venue}.`,
          date: now,
          createdBy: 'Entrance Desk',
          metadata: {
            eventId: event.id,
            eventTitle: event.title,
          },
        });
      }
    }

    setItem(STORAGE_KEYS.REGISTRATIONS, registrations);
    this.syncEventRegistration(reg).catch(() => {});
    return { registration: reg, event: this.getEventById(event.id)! };
  }

  public checkInFounder(eventId: string, founderId: string): { success: boolean; message: string; registration?: EventRegistration } {
    const registrations = this.getRegistrations();
    const event = this.getEventById(eventId);
    const founder = this.getFounderById(founderId);
    if (!event) return { success: false, message: 'Event not found' };
    if (!founder) return { success: false, message: 'Founder not found' };

    const index = registrations.findIndex(
      (r) => r.eventId === eventId && r.founderId === founderId
    );

    const now = new Date().toISOString();

    if (index !== -1) {
      if (registrations[index].checkedIn) {
        return {
          success: true,
          message: `${founder.name} was already checked in at ${new Date(registrations[index].checkedInAt!).toLocaleTimeString()}`,
          registration: registrations[index],
        };
      }
      registrations[index].checkedIn = true;
      registrations[index].checkedInAt = now;
      setItem(STORAGE_KEYS.REGISTRATIONS, registrations);
      this.updateEventCounts(eventId);

      // Log Attendance
      this.addInteraction({
        founderId: founder.id,
        type: 'event_attendance',
        title: `Attended ${event.title}`,
        description: `Verified entrance check-in at ${event.venue}, ${event.city}.`,
        date: now,
        createdBy: 'Entrance QR Scanner',
        metadata: {
          eventId: event.id,
          eventTitle: event.title,
        },
      });

      return {
        success: true,
        message: `Successfully checked in ${founder.name} (${founder.startup.name}) ✓`,
        registration: registrations[index],
      };
    } else {
      // Walk-in check-in
      const res = this.registerForEvent({
        eventId,
        founderId,
        isNewFounder: false,
        source: 'Walk-in Desk',
        autoCheckIn: true,
      });
      return {
        success: true,
        message: `Walk-in registered & checked in: ${founder.name} ✓`,
        registration: res.registration,
      };
    }
  }

  private updateEventCounts(eventId: string): void {
    const registrations = this.getRegistrations(eventId);
    const registeredCount = registrations.length;
    const checkedInCount = registrations.filter((r) => r.checkedIn).length;
    const newFoundersCount = registrations.filter((r) => r.isNewFounder).length;
    const existingFoundersCount = registeredCount - newFoundersCount;

    this.updateEvent(eventId, {
      registeredCount,
      checkedInCount,
      newFoundersCount,
      existingFoundersCount,
    });
  }

  // --- Interactions / Timeline ---
  public getInteractions(founderId?: string): Interaction[] {
    const all = getItem<Interaction[]>(STORAGE_KEYS.INTERACTIONS, []);
    if (!founderId) return all;
    return all.filter((i) => i.founderId === founderId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addInteraction(interaction: Omit<Interaction, 'id'>): Interaction {
    const interactions = getItem<Interaction[]>(STORAGE_KEYS.INTERACTIONS, []);
    const newInt: Interaction = {
      ...interaction,
      id: `int-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    interactions.unshift(newInt);
    setItem(STORAGE_KEYS.INTERACTIONS, interactions);

    // update notesCount on founder
    const founder = this.getFounderById(interaction.founderId);
    if (founder) {
      this.updateFounder(founder.id, {
        notesCount: (founder.notesCount || 0) + 1,
      });
    }

    return newInt;
  }

  // --- Follow-ups ---
  public getFollowUps(founderId?: string): FollowUp[] {
    const all = getItem<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, []);
    if (!founderId) return all;
    return all.filter((f) => f.founderId === founderId);
  }

  public createFollowUp(followUpData: Omit<FollowUp, 'id' | 'createdAt'>): FollowUp {
    const followUps = getItem<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, []);
    const newFlw: FollowUp = {
      ...followUpData,
      id: `flw-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    followUps.unshift(newFlw);
    setItem(STORAGE_KEYS.FOLLOW_UPS, followUps);
    return newFlw;
  }

  public updateFollowUp(id: string, updates: Partial<FollowUp>): FollowUp | undefined {
    const followUps = getItem<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, []);
    const index = followUps.findIndex((f) => f.id === id);
    if (index === -1) return undefined;

    followUps[index] = { ...followUps[index], ...updates };
    setItem(STORAGE_KEYS.FOLLOW_UPS, followUps);
    return followUps[index];
  }

  public generateEventFollowUps(eventId: string, assignee: string = 'Anshi'): FollowUp[] {
    const event = this.getEventById(eventId);
    if (!event) return [];

    const registrations = this.getRegistrations(eventId).filter((r) => r.checkedIn);
    const created: FollowUp[] = [];
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const dueDateStr = targetDate.toISOString().split('T')[0];

    registrations.forEach((reg) => {
      const founder = this.getFounderById(reg.founderId);
      if (!founder) return;

      const title = founder.funding.currentlyFundraising
        ? `Follow up on fundraising & deck review after ${event.title}`
        : `Send attendee recap & DraperU community intro after ${event.title}`;

      const flw = this.createFollowUp({
        founderId: founder.id,
        founderName: founder.name,
        founderCompany: founder.startup.name,
        founderEmail: founder.email,
        founderPhone: founder.phone,
        title,
        description: `Automated post-event trigger from ${event.title}. Connect on startup progress (${founder.startup.sector}) and evaluate for next Draper cohort.`,
        dueDate: dueDateStr,
        assignedTo: assignee,
        status: 'upcoming',
        priority: founder.isHighPriority ? 'high' : 'medium',
        eventId: event.id,
        eventTitle: event.title,
      });
      created.push(flw);
    });

    return created;
  }

  // --- Executive Dashboard Metrics ---
  public getExecutiveMetrics(): ExecutiveMetrics {
    const founders = this.getFounders();
    const events = this.getEvents();
    const followUps = this.getFollowUps();

    const todayStr = new Date().toISOString().split('T')[0];

    let overdue = 0;
    let today = 0;
    let thisWeek = 0;
    let upcoming = 0;

    followUps.forEach((f) => {
      if (f.status === 'completed') return;
      if (f.dueDate < todayStr) overdue++;
      else if (f.dueDate === todayStr) today++;
      else upcoming++;
    });
    thisWeek = today + Math.min(upcoming, 9);

    // Sector breakdown
    const sectorMap: Record<string, number> = {};
    founders.forEach((f) => {
      const sec = f.startup.sector || 'Other';
      sectorMap[sec] = (sectorMap[sec] || 0) + 1;
    });
    const sectorBreakdown = Object.entries(sectorMap)
      .map(([sector, count]) => ({
        sector,
        count,
        percentage: Math.round((count / founders.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Stage breakdown
    const stageMap: Record<string, number> = {};
    founders.forEach((f) => {
      const stg = f.startup.stage || 'Early Stage';
      stageMap[stg] = (stageMap[stg] || 0) + 1;
    });
    const stageBreakdown = Object.entries(stageMap).map(([stage, count]) => ({
      stage,
      count,
    }));

    // City breakdown
    const cityMap: Record<string, number> = {};
    founders.forEach((f) => {
      const city = f.location.split(',')[0].trim() || 'India';
      cityMap[city] = (cityMap[city] || 0) + 1;
    });
    const cityBreakdown = Object.entries(cityMap).map(([city, count]) => ({
      city,
      count,
    })).sort((a, b) => b.count - a.count);

    return {
      totalFounders: founders.length,
      totalStartups: new Set(founders.map((f) => f.startup.name)).size,
      totalEvents: events.length,
      followUpsCount: {
        overdue,
        today,
        thisWeek,
        upcoming,
        totalActive: followUps.filter((f) => f.status !== 'completed').length,
      },
      highPriorityFounders: founders.filter((f) => f.isHighPriority).length,
      newFoundersThisMonth: founders.filter((f) => f.createdAt.startsWith(todayStr.slice(0, 7))).length,
      sectorBreakdown,
      stageBreakdown,
      cityBreakdown,
    };
  }

  // --- Natural Language / AI Search Parser ---
  public searchFoundersAI(query: string): Founder[] {
    const founders = this.getFounders();
    if (!query.trim()) return founders;

    const q = query.toLowerCase();
    return founders.filter((f) => {
      // Direct text match
      const textMatch =
        f.name.toLowerCase().includes(q) ||
        f.startup.name.toLowerCase().includes(q) ||
        f.startup.sector.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q)) ||
        f.id.toLowerCase().includes(q);

      if (textMatch) return true;

      // Smart semantic rule parsing
      if (q.includes('ai') && f.startup.sector.toLowerCase().includes('ai')) return true;
      if (q.includes('saas') && f.startup.sector.toLowerCase().includes('saas')) return true;
      if (q.includes('fundrais') && f.funding.currentlyFundraising) return true;
      if (q.includes('funded') && f.funding.type === 'Funded') return true;
      if (q.includes('bootstrapped') && f.funding.type === 'Bootstrapped') return true;
      if (q.includes('high priority') && f.isHighPriority) return true;
      if (q.includes('hyderabad') && f.location.toLowerCase().includes('hyderabad')) return true;
      if (q.includes('bengaluru') && f.location.toLowerCase().includes('bengaluru')) return true;
      if (q.includes('delhi') && f.location.toLowerCase().includes('delhi')) return true;
      if (q.includes('mumbai') && f.location.toLowerCase().includes('mumbai')) return true;

      return false;
    });
  }
}

export const dataService = new DataService();
