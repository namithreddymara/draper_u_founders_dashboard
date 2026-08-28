import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Founder, DraperUEvent, EventRegistration, FollowUp } from '@/types';

export class SupabaseBridge {
  public static isReady(): boolean {
    return isSupabaseConfigured && !!supabase;
  }

  // Check connection
  public static async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!supabase) {
      return { success: false, message: 'Supabase client is not initialized.' };
    }
    try {
      const { data, error } = await supabase.from('founders').select('count', { count: 'exact', head: true });
      if (error) {
        // Table might not exist yet
        return {
          success: false,
          message: `Connected to Supabase project, but tables need to be created. Error: ${error.message}`,
        };
      }
      return { success: true, message: 'Successfully connected to Supabase database!' };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Connection failed' };
    }
  }

  // Fetch founders
  public static async fetchFounders(): Promise<Founder[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('founders').select('*').order('created_at', { ascending: false });
      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        whatsapp: row.whatsapp,
        linkedin: row.linkedin,
        twitter: row.twitter,
        location: row.location,
        designation: row.designation,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        startup: {
          name: row.startup_name,
          website: row.startup_website,
          sector: row.startup_sector,
          subSector: row.startup_sub_sector,
          foundedYear: row.startup_founded_year,
          stage: row.startup_stage,
          teamSize: row.startup_team_size,
          businessModel: row.startup_business_model,
          problem: row.startup_problem,
          solution: row.startup_solution,
          pitchDeckUrl: row.startup_pitch_deck_url,
        },
        funding: {
          type: row.funding_type,
          stage: row.funding_stage,
          amountRaised: row.amount_raised,
          currency: row.currency,
          investors: row.investors || [],
          currentlyFundraising: row.currently_fundraising,
          targetAmount: row.target_amount,
          lastRoundDate: row.last_round_date,
        },
        relationship: row.relationship,
        isHighPriority: row.is_high_priority,
        tags: row.tags || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (e) {
      console.warn('Supabase fetchFounders error, using local data', e);
      return null;
    }
  }

  // Insert or update founder
  public static async upsertFounder(founder: Founder): Promise<boolean> {
    if (!supabase) return false;
    try {
      const row = {
        id: founder.id,
        name: founder.name,
        email: founder.email,
        phone: founder.phone,
        whatsapp: founder.whatsapp,
        linkedin: founder.linkedin,
        twitter: founder.twitter,
        location: founder.location,
        designation: founder.designation,
        avatar_url: founder.avatarUrl,
        bio: founder.bio,
        startup_name: founder.startup.name,
        startup_website: founder.startup.website,
        startup_sector: founder.startup.sector,
        startup_sub_sector: founder.startup.subSector,
        startup_founded_year: founder.startup.foundedYear,
        startup_stage: founder.startup.stage,
        startup_team_size: founder.startup.teamSize,
        startup_business_model: founder.startup.businessModel,
        startup_problem: founder.startup.problem,
        startup_solution: founder.startup.solution,
        startup_pitch_deck_url: founder.startup.pitchDeckUrl,
        funding_type: founder.funding.type,
        funding_stage: founder.funding.stage,
        amount_raised: founder.funding.amountRaised,
        currency: founder.funding.currency,
        investors: founder.funding.investors,
        currently_fundraising: founder.funding.currentlyFundraising,
        target_amount: founder.funding.targetAmount,
        last_round_date: founder.funding.lastRoundDate,
        relationship: founder.relationship,
        is_high_priority: founder.isHighPriority,
        tags: founder.tags,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('founders').upsert(row);
      if (error) {
        console.warn('Supabase upsert error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase upsert error:', e);
      return false;
    }
  }
}
