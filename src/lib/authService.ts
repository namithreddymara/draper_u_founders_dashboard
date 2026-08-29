import { UserRole } from '@/types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatarUrl?: string;
  company?: string;
  createdAt: string;
}

const STORAGE_KEY_AUTH = 'dru_auth_user_v1';

class AuthService {
  public getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: AuthUser | null): void {
    if (typeof window === 'undefined') return;
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
        // Also sync role with dataService
        localStorage.setItem('dru_current_role_v1', JSON.stringify(user.role));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
      window.dispatchEvent(new CustomEvent('dru_auth_changed', { detail: { user } }));
    } catch (e) {
      console.error('Failed to set current user', e);
    }
  }

  public async login(email: string, password?: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Authentication is not configured. Add the Supabase environment variables.' };
    }
    if (!password) return { success: false, error: 'Please enter your password.' };
    const trimmedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    if (error || !data.user) return { success: false, error: error?.message || 'Invalid email or password.' };
    const user = this.mapSupabaseUser(data.user);
    this.setCurrentUser(user);
    return { success: true, user };
  }

  public async loginWithGoogle(): Promise<{ success: boolean; user: AuthUser }> {
    if (!supabase) throw new Error('Authentication is not configured.');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) throw error;
    return { success: true, user: this.getCurrentUser() as AuthUser };
  }

  public async signup(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    company?: string;
  }): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Authentication is not configured. Add the Supabase environment variables.' };
    }
    const trimmedEmail = data.email.trim().toLowerCase();
    const { data: result, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: data.password,
      options: { data: { name: data.name.trim(), company: data.company, role: data.role || 'admin' } },
    });
    if (error || !result.user) return { success: false, error: error?.message || 'Unable to create account.' };
    const user = this.mapSupabaseUser(result.user);
    if (result.session) this.setCurrentUser(user);
    return { success: true, user };
  }

  public async getCurrentUserFromSession(): Promise<AuthUser | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    return this.mapSupabaseUser(data.session.user);
  }

  private mapSupabaseUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string }): AuthUser {
    const metadata = user.user_metadata || {};
    const role = metadata.role === 'community_team' || metadata.role === 'event_team' ? metadata.role : 'admin';
    return {
      id: user.id,
      name: typeof metadata.name === 'string' ? metadata.name : user.email?.split('@')[0] || 'DraperU Member',
      email: user.email || '',
      role,
      roleTitle: role === 'admin' ? 'Executive Admin' : role === 'community_team' ? 'Community Lead' : 'Event Operations',
      company: typeof metadata.company === 'string' ? metadata.company : undefined,
      createdAt: user.created_at || new Date().toISOString(),
    };
  }

  public logout(): void {
    this.setCurrentUser(null);
  }
}

export const authService = new AuthService();
