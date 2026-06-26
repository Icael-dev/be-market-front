import { api } from '../lib/api';
import type { Profile, AuthUser } from '../types';

export async function fetchCurrentUser(): Promise<{ user: AuthUser; profile: Profile | null }> {
  return api.get<{ user: AuthUser; profile: Profile | null }>('/api/auth/user');
}

export async function updateProfile(profile: Partial<Profile>): Promise<Profile> {
  return api.put<Profile>('/api/profile', profile);
}
