import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

export function AdminGuard() {
  const { session, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">Carregando verificação de segurança...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!role) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="font-display text-3xl font-semibold text-destructive">Acesso restrito</h1>
        <p className="mt-3 max-w-prose text-foreground/80">
          Sua conta está autenticada, mas ainda não tem uma função (role) atribuída no sistema.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Se você acabou de se dar permissão, tente recarregar a página.
          </p>
          <div className="p-2 bg-muted rounded text-xs font-mono break-all select-all">
            User ID: {session?.user?.id}
          </div>
          <button
            onClick={() => {
              supabase.auth.signOut().then(() => window.location.reload());
            }}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors"
          >
            Sair e Tentar Novamente
          </button>
        </div>
      </div>
    );

  }

  return <Outlet />;
}
