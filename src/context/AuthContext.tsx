import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { login, logout, register, getCurrentUser } from '../services/auth';
import { setAuthToken, setTokenExpiry, getTokenExpiry, getAuthToken } from '../lib/api';
import type { AuthUser, Profile } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ServiceError = { error?: string };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { user: currentUser, profile: currentProfile } = await getCurrentUser();
      setUser(currentUser);
      setProfile(currentProfile);
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const checkTokenExpiry = () => {
      const expiry = getTokenExpiry();
      if (expiry && Date.now() > expiry - 60000) {
        refreshAccessToken().catch(() => {});
      }
    };

    const interval = setInterval(checkTokenExpiry, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        setTokenExpiry(Date.now() + 3600000);
      } else if (response.status === 401) {
        setUser(null);
        setProfile(null);
        setAuthToken(null);
      }
    } catch {
      // Silently fail - will be handled on next request
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await login({ email, password });
      setTokenExpiry(Date.now() + 3600000);
      await fetchUser();
      return { error: null };
    } catch (err: unknown) {
      const e = err as ServiceError;
      return { error: e?.error ? new Error(e.error) : new Error('Erreur de connexion') };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      await register({ email, password, full_name: fullName });
      await fetchUser();
      return { error: null };
    } catch (err: unknown) {
      const e = err as ServiceError;
      return { error: e?.error ? new Error(e.error) : new Error('Erreur d\'inscription') };
    }
  };

  const signOut = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      setProfile(null);
      setAuthToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: !!profile?.is_admin || !!user?.is_admin,
        signIn,
        signUp,
        signOut,
        refreshProfile: fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}