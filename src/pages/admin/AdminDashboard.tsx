import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, CalendarDays, Users, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin", "dashboard_stats"],
    queryFn: async () => {
      const [services, events, therapists, testimonials] = await Promise.all([
        supabase.from("services").select("id", { count: "exact" }),
        supabase.from("events").select("id", { count: "exact" }),
        supabase.from("therapists").select("id", { count: "exact" }),
        supabase.from("testimonials").select("id", { count: "exact" })
      ]);

      return {
        services: services.count || 0,
        events: events.count || 0,
        therapists: therapists.count || 0,
        testimonials: testimonials.count || 0
      };
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Serviços Ativos
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.services || 0}</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados no portal
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eventos & Rodas
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.events || 0}</div>
            <p className="text-xs text-muted-foreground">
              Mapeados na agenda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Terapeutas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.therapists || 0}</div>
            <p className="text-xs text-muted-foreground">
              Profissionais da equipe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Depoimentos
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.testimonials || 0}</div>
            <p className="text-xs text-muted-foreground">
              Feedbacks em exibição
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-muted/50 p-8 text-center mt-8">
        <h3 className="text-lg font-medium">Bem-vindo à Área Administrativa</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">
          Use o menu lateral para gerenciar todo o conteúdo vivo do seu portal: cadastrar novos depoimentos, ajustar portfólio de serviços ou abrir inscrições para os próximos eventos.
        </p>
      </div>
    </div>
  );
}
