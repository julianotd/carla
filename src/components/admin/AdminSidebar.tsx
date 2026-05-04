
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Files,
  CalendarDays,
  Users,
  MessageSquare,
  Settings,
  Calendar,
  BarChart3,
  HelpCircle,
  GitCommit
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

// Move items inside component or use memo if dependent on role
export function AdminSidebar() {
  const { role } = useAuth();
  const location = useLocation();

  const items = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Serviços", url: "/admin/services", icon: Sparkles },
    { title: "Eventos", url: "/admin/events", icon: CalendarDays },
    { title: "Jornada (Timeline)", url: "/admin/timeline", icon: GitCommit },
    { title: "Faqs (Dúvidas)", url: "/admin/faqs", icon: HelpCircle },
    { title: "Depoimentos", url: "/admin/testimonials", icon: MessageSquare },

    // Agenda (Minha) sempre visível
    { title: "Agenda (Minha)", url: "/admin/agenda/minha", icon: Calendar },

    // Agenda: mostrar "Clínica" só para admin/receptionist
    ...((role === "admin" || role === "receptionist")
      ? [{ title: "Agenda (Clínica)", url: "/admin/agenda", icon: Calendar }]
      : []),

    { title: "Terapeutas", url: "/admin/therapists", icon: Users },
    { title: "Conteúdo Site", url: "/admin/content", icon: Settings },

    // Usuários geralmente só admin
    ...(role === "admin" ? [{ title: "Usuários", url: "/admin/users", icon: Users }] : []),

    { title: "Relatórios", url: "/admin/analytics", icon: BarChart3 },
  ];

  return (
    <nav className="flex w-64 flex-col gap-2 border-r bg-background/50 p-4">
      <div className="mb-6 px-2">
        <p className="text-xs font-semibold tracking-[0.18em] text-foreground/70">ALÉM DA PELE</p>
        <p className="text-sm font-medium text-foreground/60">Admin</p>
      </div>

      {items.map((item) => {
        // Ativo por prefixo: funciona para subrotas
        const isActive =
          location.pathname === item.url ||
          (item.url !== "/admin" && location.pathname.startsWith(item.url + "/"));

        return (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary",
              isActive ? "bg-secondary text-foreground" : "text-foreground/70"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
