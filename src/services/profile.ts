import { api } from '../lib/api';
import type { Profile } from '../types';

export async function updateProfile(profile: Partial<Profile>): Promise<Profile> {
  return api.put<Profile>('/api/profile', profile);
}
