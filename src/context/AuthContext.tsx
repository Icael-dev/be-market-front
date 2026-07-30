import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { initializeCsrf } from '../lib/api';
import { login, logout, register, getCurrentUser, refreshToken as refreshAuthToken } from '../services/auth';
import type { AuthUser, Profile, UserRole } from '../types';

const TOKEN_REFRESH_INTERVAL = 6 * 24 * 60 * 60 * 1000;
const TOKEN_REFRESH_KEY = 'be_market_token_refresh_timestamp';

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStaff: boolean;
  role: UserRole;
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const clearRefreshInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const setupTokenRefresh = useCallback(() => {
    clearRefreshInterval();

    const getLastRefresh = () => parseInt(localStorage.getItem(TOKEN_REFRESH_KEY) || '0', 10);

    const doRefresh = () => {
      refreshAuthToken().then(() => {
        localStorage.setItem(TOKEN_REFRESH_KEY, Date.now().toString());
      });
    };

    const now = Date.now();
    const lastRefresh = getLastRefresh();
    const elapsed = now - lastRefresh;

    if (elapsed >= TOKEN_REFRESH_INTERVAL) {
      doRefresh();
    }

    intervalRef.current = setInterval(() => {
      const currentLastRefresh = getLastRefresh();
      const currentElapsed = Date.now() - currentLastRefresh;
      if (currentElapsed >= TOKEN_REFRESH_INTERVAL) {
        doRefresh();
      }
    }, 60 * 60 * 1000);
  }, [clearRefreshInterval]);

   useEffect(() => {
     initializeCsrf().then(fetchUser);
   }, []);

  useEffect(() => {
    if (user) {
      setupTokenRefresh();
    } else {
      clearRefreshInterval();
    }
    return clearRefreshInterval;
  }, [user, setupTokenRefresh, clearRefreshInterval]);

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        clearRefreshInterval();
      });
    }
  }, [clearRefreshInterval]);

  type ServiceError = { error?: string };

  const signIn = async (email: string, password: string) => {
    try {
      await login({ email, password });
      localStorage.setItem(TOKEN_REFRESH_KEY, Date.now().toString());
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
      localStorage.setItem(TOKEN_REFRESH_KEY, Date.now().toString());
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
      clearRefreshInterval();
      localStorage.removeItem(TOKEN_REFRESH_KEY);
    }
  };

  // `role` decrit uniquement le niveau d'acces au back-office.
  // Il ne conditionne jamais l'acces boutique : un admin/staff reste un
  // utilisateur normal qui peut commander (panier, wishlist, commandes).
  // Source de verite unique : le champ `role` du backend. `is_admin` n'est
  // utilise qu'en repli legacy quand `role` est absent, pour ne pas creer
  // d'etat incoherent entre role / isAdmin / isSuperAdmin.
  const role: UserRole = profile?.role ?? (profile?.is_admin ? 'admin' : 'client');
  const isSuperAdmin = role === 'admin';
  const isStaff = role === 'staff';
  const isAdmin = isSuperAdmin || isStaff;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isSuperAdmin,
        isStaff,
        role,
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
