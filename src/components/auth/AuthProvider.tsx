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
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) return false;
  return (data ?? []).some((r) => r.role === "admin");
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
    // Listener first (prevents race conditions)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);

      if (nextSession?.user?.id) {
        const admin = await fetchIsAdmin(nextSession.user.id);
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setLoading(false);

      const userId = data.session?.user?.id;
      if (userId) {
        const admin = await fetchIsAdmin(userId);
        setIsAdmin(admin);
      }
    });

    return () => subscription.unsubscribe();
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
