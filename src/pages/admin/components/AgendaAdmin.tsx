
import { Calendar, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvailabilityAdmin } from "@/pages/admin/components/AvailabilityAdmin";

import { AdminCalendar } from "@/pages/admin/components/AdminCalendar";

export function AgendaAdmin() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Agenda Inteligente</h2>
                    <p className="text-muted-foreground">Gerencie agendamentos e regras de disponibilidade.</p>
                </div>
                <Button onClick={() => window.location.href = "/admin/agenda"}>
                    Novo Agendamento Clínico
                </Button>
            </div>

            <Tabs defaultValue="calendar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="calendar" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Calendário
                    </TabsTrigger>
                    <TabsTrigger value="availability" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Disponibilidade
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="space-y-4">
                    <AdminCalendar />
                </TabsContent>

                <TabsContent value="availability" className="space-y-4">
                    <AvailabilityAdmin />
                </TabsContent>
            </Tabs>
        </div>
    );
}
