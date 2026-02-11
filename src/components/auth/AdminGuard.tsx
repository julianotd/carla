import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";

export function AdminGuard() {
  const { session, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <div className="container py-10">
        <h1 className="font-display text-3xl font-semibold text-ink">Acesso restrito</h1>
        <p className="mt-3 max-w-prose text-foreground/80">
          Sua conta está autenticada, mas ainda não tem permissão de administrador.
        </p>
        <p className="mt-2 max-w-prose text-sm text-foreground/70">
          Peça para um admin adicionar seu usuário como <span className="font-medium text-ink">admin</span>.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
