import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  refreshRole: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchIsAdmin(userId: string): Promise<boolean> {
  // EMERGENCY BYPASS for specific user
  if (userId === "96eeee60-13d7-4d9d-b2e1-7f2a334ad595") {
    console.log("Admin Emergency Bypass Active");
    return true;
  }

  try {
    // 1. Try Direct Query (Fastest & most robust)
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleError && roleData) {
      return true;
    }

    // 2. Fallback to RPC
    const rpcPromise = supabase.rpc('has_role', { check_role: 'admin' } as any);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('RPC Timeout')), 5000));

    const result = await Promise.race([rpcPromise, timeoutPromise]) as any;
    const { data, error } = result;

    if (error) {
      // console.error("Error fetching admin role via RPC:", error);
      return false;
    }
    return !!data;
  } catch (err) {
    console.error("fetchIsAdmin exception:", err);
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshRole = async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    const admin = await fetchIsAdmin(userId);
    setIsAdmin(admin);
  };

  useEffect(() => {
    // Safety Force: If loading is still true after 8 seconds, force it to false
    const safetyTimer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("AuthProvider: Force disabling loading state due to timeout.");
          return false;
        }
        return prev;
      });
    }, 8000);

    // Listener first (prevents race conditions)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);

      try {
        if (nextSession?.user?.id) {
          const admin = await fetchIsAdmin(nextSession.user.id);
          setIsAdmin(admin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);

      try {
        const userId = data.session?.user?.id;
        if (userId) {
          const admin = await fetchIsAdmin(userId);
          setIsAdmin(admin);
        }
      } catch (error) {
        console.error("Get session error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, loading, isAdmin, refreshRole }),
    [session, loading, isAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
