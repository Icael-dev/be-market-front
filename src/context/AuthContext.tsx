/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { initializeCsrf } from "../lib/api";
import {
  login,
  logout,
  register,
  getCurrentUser,
} from "../services/auth";
import type { AuthUser, Profile, UserRole } from "../types";

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
    initializeCsrf().then(fetchUser);
  }, []);

  type ServiceError = { error?: string };

  const signIn = async (email: string, password: string) => {
    try {
      await login({ email, password });
      await fetchUser();
      return { error: null };
    } catch (err: unknown) {
      const e = err as ServiceError;
      return { error: e?.error ? new Error(e.error) : new Error("Erreur de connexion") };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      await register({ email, password, full_name: fullName });
      await fetchUser();
      return { error: null };
    } catch (err: unknown) {
      const e = err as ServiceError;
      return { error: e?.error ? new Error(e.error) : new Error("Erreur d'inscription") };
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

  // `role` decrit uniquement le niveau d'acces au back-office.
  // Il ne conditionne jamais l'acces boutique : un admin/staff reste un
  // utilisateur normal qui peut commander (panier, wishlist, commandes).
  // Source de verite unique : le champ `role` du backend. `is_admin` n'est
  // utilise qu'en repli legacy quand `role` est absent, pour ne pas creer
  // d'etat incoherent entre role / isAdmin / isSuperAdmin.
  const role: UserRole = profile?.role ?? (profile?.is_admin ? "admin" : "client");
  const isSuperAdmin = role === "admin";
  const isStaff = role === "staff";
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
        refreshProfile: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
