import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { login, logout, register, getCurrentUser } from '../services/auth';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { user: currentUser, profile: currentProfile } = await getCurrentUser();
      setUser(currentUser);
      setProfile(currentProfile);
    } catch (error) {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await login({ email, password });
      await fetchUser();
      return { error: null };
    } catch (err: any) {
      return { error: err?.error ? new Error(err.error) : new Error('Erreur de connexion') };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      await register({ email, password, full_name: fullName });
      await fetchUser();
      return { error: null };
    } catch (err: any) {
      return { error: err?.error ? new Error(err.error) : new Error('Erreur d\'inscription') };
    }
  };

  const signOut = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.is_admin ?? false,
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
