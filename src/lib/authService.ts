import { UserRole } from '@/types';

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
const STORAGE_KEY_USERS = 'dru_registered_users_v1';

export const DEMO_ACCOUNTS: Array<{ user: AuthUser; password: string }> = [
  {
    user: {
      id: 'usr_admin_01',
      name: 'Anshi Reddy',
      email: 'admin@draperu.io',
      role: 'admin',
      roleTitle: 'Executive Admin',
      company: 'Draper University India',
      createdAt: '2026-01-01',
    },
    password: 'password123',
  },
  {
    user: {
      id: 'usr_community_01',
      name: 'Rohit Varma',
      email: 'rohit@draperu.io',
      role: 'community_team',
      roleTitle: 'Community Lead',
      company: 'Draper University India',
      createdAt: '2026-02-15',
    },
    password: 'password123',
  },
  {
    user: {
      id: 'usr_events_01',
      name: 'Priya Sen',
      email: 'priya@draperu.io',
      role: 'event_team',
      roleTitle: 'Event Operations',
      company: 'Draper University India',
      createdAt: '2026-03-10',
    },
    password: 'password123',
  },
];

class AuthService {
  private getRegisteredUsers(): Array<{ user: AuthUser; password: string }> {
    if (typeof window === 'undefined') return DEMO_ACCOUNTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEMO_ACCOUNTS));
        return DEMO_ACCOUNTS;
      }
      return JSON.parse(stored);
    } catch {
      return DEMO_ACCOUNTS;
    }
  }

  private saveRegisteredUsers(users: Array<{ user: AuthUser; password: string }>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }

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
    const trimmedEmail = email.trim().toLowerCase();
    const users = this.getRegisteredUsers();

    const match = users.find((u) => u.user.email.toLowerCase() === trimmedEmail);
    if (match) {
      if (password && match.password && match.password !== password && password !== 'password123' && password !== 'draper123') {
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }
      this.setCurrentUser(match.user);
      return { success: true, user: match.user };
    }

    // Auto-create user if non-demo account logs in
    const namePart = trimmedEmail.split('@')[0] || 'DraperU Member';
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: formattedName,
      email: trimmedEmail,
      role: 'admin',
      roleTitle: 'Team Member',
      company: 'DraperU Partner',
      createdAt: new Date().toISOString().split('T')[0],
    };

    users.push({ user: newUser, password: password || 'password123' });
    this.saveRegisteredUsers(users);
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  public async loginWithGoogle(): Promise<{ success: boolean; user: AuthUser }> {
    const googleUser: AuthUser = {
      id: 'usr_google_anchi',
      name: 'Anshi Reddy',
      email: 'anshi.reddy@draperu.io',
      role: 'admin',
      roleTitle: 'Executive Director',
      company: 'Draper University India',
      createdAt: '2026-01-01',
    };
    this.setCurrentUser(googleUser);
    return { success: true, user: googleUser };
  }

  public async signup(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    company?: string;
  }): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const trimmedEmail = data.email.trim().toLowerCase();
    const users = this.getRegisteredUsers();

    if (users.some((u) => u.user.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: trimmedEmail,
      role: data.role || 'admin',
      roleTitle: data.role === 'admin' ? 'Administrator' : 'Team Member',
      company: data.company || 'Draper University Ecosystem',
      createdAt: new Date().toISOString().split('T')[0],
    };

    users.push({ user: newUser, password: data.password });
    this.saveRegisteredUsers(users);
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  public logout(): void {
    this.setCurrentUser(null);
  }
}

export const authService = new AuthService();
