import { api, clearAuthToken, setAuthToken } from '../lib/api';
import type { AuthUser, Profile } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
  profile: Profile | null;
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const result = await api.post<AuthResult>('/api/auth/login', payload);
  setAuthToken(result.token);
  return result;
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const result = await api.post<AuthResult>('/api/auth/register', payload);
  setAuthToken(result.token);
  return result;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout');
  } finally {
    clearAuthToken();
  }
}

export async function getCurrentUser(): Promise<{ user: AuthUser; profile: Profile | null }> {
  return api.get<{ user: AuthUser; profile: Profile | null }>('/api/auth/user');
}

export async function refreshToken(): Promise<AuthResult> {
  const result = await api.post<AuthResult>('/api/auth/refresh');
  setAuthToken(result.token);
  return result;
}
