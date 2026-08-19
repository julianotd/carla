import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CalendarDays, Users, MessageSquare, ArrowRight, Clock, Plus, PhoneCall } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin", "dashboard_stats"],
    queryFn: async () => {
      const [services, events, therapists, testimonials, appointments] = await Promise.all([
        supabase.from("services").select("id", { count: "exact" }),
        supabase.from("events").select("id", { count: "exact" }),
        supabase.from("therapists").select("id", { count: "exact" }),
        supabase.from("testimonials").select("id", { count: "exact" }),
        supabase.from("appointments").select("*, services(title)").limit(5)
      ]);

      return {
        services: services.count || 0,
        events: events.count || 0,
        therapists: therapists.count || 0,
        testimonials: testimonials.count || 0,
        appointments: appointments.data || []
      };
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral do portal Além da Pele e gestão rápida do sistema.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-energy-gold/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Serviços Ativos
            </CardTitle>
            <Sparkles className="h-4 w-4 text-energy-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.services || 0}</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados no portal
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-energy-gold/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eventos & Rodas
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-energy-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.events || 0}</div>
            <p className="text-xs text-muted-foreground">
              Mapeados na agenda
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-energy-gold/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Terapeutas
            </CardTitle>
            <Users className="h-4 w-4 text-energy-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.therapists || 0}</div>
            <p className="text-xs text-muted-foreground">
              Profissionais da equipe
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-energy-gold/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Depoimentos
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-energy-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.testimonials || 0}</div>
            <p className="text-xs text-muted-foreground">
              Feedbacks em exibição
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Atalhos Rápidos */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start justify-between border-muted hover:border-energy-gold/50">
            <Link to="/admin/services">
              <div className="flex items-center gap-2 font-medium mb-1">
                <Sparkles className="w-4 h-4 text-energy-gold" /> Gerenciar Serviços
              </div>
              <span className="text-xs text-muted-foreground font-normal">Ajustar preços e descrições</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start justify-between border-muted hover:border-energy-gold/50">
            <Link to="/admin/agenda">
              <div className="flex items-center gap-2 font-medium mb-1">
                <Clock className="w-4 h-4 text-energy-gold" /> Agenda & Atendimentos
              </div>
              <span className="text-xs text-muted-foreground font-normal">Ver horários agendados</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start justify-between border-muted hover:border-energy-gold/50">
            <Link to="/admin/events">
              <div className="flex items-center gap-2 font-medium mb-1">
                <CalendarDays className="w-4 h-4 text-energy-gold" /> Cadastrar Eventos
              </div>
              <span className="text-xs text-muted-foreground font-normal">Abrir inscrições para rodas</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start justify-between border-muted hover:border-energy-gold/50">
            <Link to="/admin/therapists">
              <div className="flex items-center gap-2 font-medium mb-1">
                <Users className="w-4 h-4 text-energy-gold" /> Equipe de Terapeutas
              </div>
              <span className="text-xs text-muted-foreground font-normal">Gerenciar fotos e perfis</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Próximos Atendimentos & Ação WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximos Agendamentos Registrados</CardTitle>
          <CardDescription>
            Confira os agendamentos recentes e envie uma mensagem rápida de confirmação via WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.appointments && stats.appointments.length > 0 ? (
            <div className="space-y-3">
              {stats.appointments.map((appt: any) => (
                <div
                  key={appt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card/50 gap-3"
                >
                  <div>
                    <p className="font-medium text-sm">{appt.client_name || appt.client_email || "Cliente sem nome"}</p>
                    <p className="text-xs text-muted-foreground">
                      Serviço: <span className="font-medium text-foreground">{appt.services?.title || "Atendimento Integrativo"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {appt.client_phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const msg = encodeURIComponent(`Olá, ${appt.client_name}! Gostaria de confirmar seu agendamento no Além da Pele. Podemos confirmar?`);
                          window.open(`https://wa.me/${appt.client_phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
                        }}
                        className="text-xs border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/10"
                      >
                        <PhoneCall className="w-3.5 h-3.5 mr-1.5" /> Confirmar WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground italic text-sm">
              Nenhum agendamento pendente no momento. Os novos agendamentos aparecerão aqui automaticamente.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
