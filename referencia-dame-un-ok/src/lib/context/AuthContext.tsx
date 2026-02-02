"use client";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "../services/supabase";
import type { Session, User } from "@supabase/supabase-js";

export interface DokUser {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  pet_name: string;
  pet_type: string;
  streak: number;
  last_check_in: string | null;
  onboarded: boolean;
}

export interface DokFamiliar {
  id: string;
  auth_id: string;
  user_id: string;
  familiar_name: string;
  familiar_email: string;
  relacion: string;
  onboarded: boolean;
  rol?: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  dokUser: DokUser | null;
  dokFamiliar: DokFamiliar | null;
  loading: boolean;
  role: "user" | "familiar" | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  dokUser: null,
  dokFamiliar: null,
  loading: true,
  role: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dokUser, setDokUser] = useState<DokUser | null>(null);
  const [dokFamiliar, setDokFamiliar] = useState<DokFamiliar | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"user" | "familiar" | null>(null);

  const loadProfile = useCallback(async (authUser: User, retries = 2) => {
    try {
    for (let attempt = 0; attempt < retries; attempt++) {
      // Check if this auth user is a dok_user
      const { data: dokUserData } = await supabase
        .from("dok_users")
        .select("*")
        .eq("auth_id", authUser.id)
        .maybeSingle();

      if (dokUserData) {
        setDokUser(dokUserData);
        setRole("user");
        setDokFamiliar(null);
        setLoading(false);
        return;
      }

      // Check if this auth user is a familiar
      const { data: famData } = await supabase
        .from("dok_familiares")
        .select("*")
        .eq("auth_id", authUser.id)
        .maybeSingle();

      if (famData) {
        setDokFamiliar(famData);
        setRole("familiar");
        setDokUser(null);
        setLoading(false);
        return;
      }

      // Profile not found yet — retry after delay (race condition on signup)
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Authenticated but no profile after all retries
    setRole(null);
    setDokUser(null);
    setDokFamiliar(null);
    setLoading(false);
    } catch (err) {
      console.error("loadProfile error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user);
      } else {
        setDokUser(null);
        setDokFamiliar(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setDokUser(null);
    setDokFamiliar(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, dokUser, dokFamiliar, loading, role, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
