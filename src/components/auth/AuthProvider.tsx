import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "editor" | "therapist" | "receptionist";

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  role: AppRole | null;
  roles: AppRole[];
  refreshRole: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchUserRoles(userId: string): Promise<AppRole[]> {
  // EMERGENCY BYPASS for specific user
  if (userId === "96eeee60-13d7-4d9d-b2e1-7f2a334ad595") {
    console.log("Admin Emergency Bypass Active");
    return ["admin"];
  }

  try {
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (roleError) throw roleError;
    return (roleData?.map(r => r.role as AppRole) || []);
  } catch (err) {
    console.error("fetchUserRoles exception:", err);
    return [];
  }
}

function getHighestRole(roles: AppRole[]): AppRole | null {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("editor")) return "editor";
  if (roles.includes("receptionist")) return "receptionist";
  if (roles.includes("therapist")) return "therapist";
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AppRole | null>(null);

  const refreshRole = async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setRoles([]);
      setIsAdmin(false);
      setRole(null);
      return;
    }

    const userRoles = await fetchUserRoles(userId);
    setRoles(userRoles);
    setIsAdmin(userRoles.includes("admin"));
    setRole(getHighestRole(userRoles));
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
          const userRoles = await fetchUserRoles(nextSession.user.id);
          setRoles(userRoles);
          setIsAdmin(userRoles.includes("admin"));
          setRole(getHighestRole(userRoles));
        } else {
          setRoles([]);
          setIsAdmin(false);
          setRole(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setRoles([]);
        setIsAdmin(false);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);

      try {
        const userId = data.session?.user?.id;
        if (userId) {
          const userRoles = await fetchUserRoles(userId);
          setRoles(userRoles);
          setIsAdmin(userRoles.includes("admin"));
          setRole(getHighestRole(userRoles));
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
    () => ({ session, loading, isAdmin, role, roles, refreshRole }),
    [session, loading, isAdmin, role, roles],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
