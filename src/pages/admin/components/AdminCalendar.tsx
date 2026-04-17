
import { useState } from "react";
import { format, startOfWeek, addDays, startOfDay, isSameDay, parseISO, differenceInMinutes, getDay, getHours, getMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2, User, Clock, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00
const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function AdminCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const { data: appointments, isLoading, refetch } = useQuery({
        queryKey: ["admin", "appointments", weekStart.toISOString()],
        queryFn: async () => {
            const start = weekStart.toISOString();
            const end = addDays(weekStart, 7).toISOString();

            const { data, error } = await supabase
                .from("appointments")
                .select(`
            *,
            services (title, duration_min),
            therapists (name)
        `)
                .gte("starts_at", start)
                .lt("starts_at", end);

            if (error) throw error;
            return data;
        },
    });

    const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
    const today = () => setCurrentDate(new Date());

    const getAppointmentsForDay = (day: Date) => {
        return appointments?.filter(appt => isSameDay(parseISO(appt.starts_at), day)) || [];
    };

    const getPositionStyle = (appt: any) => {
        const start = parseISO(appt.starts_at);
        const end = parseISO(appt.ends_at);
        const startHour = getHours(start);
        const startMin = getMinutes(start);
        const duration = differenceInMinutes(end, start);

        // Grid starts at 8:00. Each hour is 60px (arbitrary).
        // Or we can use percentage if container is relative.
        // Let's use absolute positioning relative to day column.

        const topOffset = (startHour - 8) * 60 + startMin; // 1px per minute? simple.
        const height = duration;

        return {
            top: `${topOffset}px`,
            height: `${height}px`,
        };
    };

    return (
        <div className="flex flex-col h-[800px] border rounded-lg bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold capitalize ml-2">
                        {format(weekStart, "MMMM yyyy", { locale: ptBR })}
                    </h2>
                </div>
                <Button variant="secondary" onClick={today}>Hoje</Button>
            </div>

            {/* Calendar Grid */}
            <div className="flex flex-1 overflow-hidden">
                {/* Time Labels Column */}
                <div className="w-16 border-r bg-muted/10 flex flex-col pt-10">
                    {HOURS.map(hour => (
                        <div key={hour} className="h-[60px] text-xs text-muted-foreground text-right pr-2 -mt-2.5">
                            {hour}:00
                        </div>
                    ))}
                </div>

                {/* Days Columns */}
                <div className="flex-1 flex overflow-x-auto">
                    {weekDays.map((day, i) => (
                        <div key={i} className="flex-1 min-w-[120px] border-r border-border/50 bg-background relative group">
                            {/* Day Header */}
                            <div className={
                                `h-10 border-b flex items-center justify-center text-sm font-medium sticky top-0 bg-background z-10
                        ${isSameDay(day, new Date()) ? "text-primary bg-primary/5" : "text-muted-foreground"}
                    `}>
                                {format(day, "EEE, dd", { locale: ptBR })}
                            </div>

                            {/* Day Content (Slots) */}
                            <div className="relative h-[780px]"> {/* 13 hours * 60px */}
                                {/* Grid Lines */}
                                {HOURS.map(hour => (
                                    <div key={hour} className="h-[60px] border-b border-dashed border-border/30 box-border" />
                                ))}

                                {/* Appointments */}
                                {isLoading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
                                        <Loader2 className="animate-spin h-6 w-6 text-primary" />
                                    </div>
                                ) : (
                                    getAppointmentsForDay(day).map(appt => (
                                        <div
                                            key={appt.id}
                                            className="absolute inset-x-1 rounded px-2 py-1 text-xs cursor-pointer hover:brightness-95 transition-all text-white shadow-sm overflow-hidden"
                                            style={{
                                                ...getPositionStyle(appt),
                                                backgroundColor: '#0ea5e9', // default primary color
                                                zIndex: 10
                                            }}
                                            onClick={() => setSelectedAppointment(appt)}
                                        >
                                            <div className="font-semibold truncate">{appt.client_name}</div>
                                            <div className="opacity-90 truncate text-[10px]">{appt.services?.title}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalhes do Agendamento</DialogTitle>
                        <DialogDescription>
                            {selectedAppointment && format(parseISO(selectedAppointment.starts_at), "PPP 'às' HH:mm", { locale: ptBR })}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAppointment && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between">
                                <Badge variant={selectedAppointment.status === 'confirmed' ? 'default' : 'secondary'}>
                                    {selectedAppointment.status === 'confirmed' ? 'Confirmado' :
                                        selectedAppointment.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-[20px_1fr] gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-sm">Cliente</p>
                                        <p className="text-sm">{selectedAppointment.client_name}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-[20px_1fr] gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-sm">Contato</p>
                                        <p className="text-sm">{selectedAppointment.client_phone}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-[20px_1fr] gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-sm">Serviço</p>
                                        <p className="text-sm">{selectedAppointment.services?.title} ({selectedAppointment.services?.duration_min} min)</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-[20px_1fr] gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-sm">Terapeuta</p>
                                        <p className="text-sm">{selectedAppointment.therapists?.name}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedAppointment.notes && (
                                <div className="bg-muted p-3 rounded-md text-sm">
                                    <span className="font-medium">Notas:</span> {selectedAppointment.notes}
                                </div>
                            )}

                            <div className="flex gap-2 justify-end pt-4">
                                <Button variant="outline" size="sm" onClick={() => {
                                    if (!selectedAppointment) return;
                                    const start = parseISO(selectedAppointment.starts_at);
                                    const message = `Olá ${selectedAppointment.client_name}! Gostaria de confirmar seu horário de *${selectedAppointment.services?.title}* no dia ${format(start, "dd/MM 'às' HH:mm")}. Podemos confirmar?`;
                                    const num = selectedAppointment.client_phone?.replace(/\D/g, '');
                                    if (num) window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
                                }}>
                                    <Phone className="mr-2 h-4 w-4" /> WhatsApp
                                </Button>
                                <Button variant="destructive" size="sm">Cancelar</Button>
                                <Button variant="default" size="sm">Confirmar</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
