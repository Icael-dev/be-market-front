import { api } from "../lib/api";
import type { Profile } from "../types";

export async function updateProfile(profile: Partial<Profile>): Promise<Profile> {
  return api.put<Profile>("/api/profile", profile);
}

export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.post<{ avatar_url: string }>("/api/profile/avatar", formData);
}

export async function changePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  return api.post<{ message: string }>("/api/profile/password", payload);
}
