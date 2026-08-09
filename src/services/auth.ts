import { api } from "../lib/api";
import type { AuthUser, Profile } from "../types";

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
  user: AuthUser;
  profile: Profile | null;
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  return api.post<AuthResult>("/api/auth/login", payload);
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  return api.post<AuthResult>("/api/auth/register", payload);
}

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout");
}

export async function getCurrentUser(): Promise<{ user: AuthUser; profile: Profile | null }> {
  return api.get<{ user: AuthUser; profile: Profile | null }>("/api/auth/user");
}

export async function refreshToken(): Promise<AuthResult> {
  return api.post<AuthResult>("/api/auth/refresh");
}
