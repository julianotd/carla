import { useEffect, useState } from "react";
import { format, addDays, startOfWeek, endOfWeek, subWeeks, addWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // Shadcn Calendar

import { AgendaBoard } from "@/components/admin/agenda/AgendaBoard";
import { AppointmentDrawer } from "@/components/admin/agenda/AppointmentDrawer";
import { Appointment, Therapist, TimeOff } from "@/lib/agenda/types";
import { listAppointments, listTherapists, listTimeOff } from "@/lib/agenda/api";
import { cn } from "@/lib/utils";

import { useNavigate } from "react-router-dom"; // Add import

export default function AgendaPage() {
    const navigate = useNavigate();
    const role: "admin" | "secretary" | "therapist" = "admin"; // TODO: Get from AuthContext

    useEffect(() => {
        if (role === "therapist") {
            navigate("/admin/agenda/minha", { replace: true });
        }
    }, [role, navigate]);

    const [date, setDate] = useState(new Date());

    // Data
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ therapistId: string; date: Date } | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Load Data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // 1. Therapists
            const allTherapists = await listTherapists();
            setTherapists(allTherapists);

            // 2. Appointments & TimeOff (Daily View for now)
            // For "Clinic View", we load data for the selected day for ALL therapists
            const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);

            const apts = await listAppointments({
                from: startOfDay.toISOString(),
                to: endOfDay.toISOString(),
            });

            const toffs = await listTimeOff({
                from: startOfDay.toISOString(),
                to: endOfDay.toISOString(),
            });

            setAppointments(apts);
            setTimeOff(toffs);
        } catch (e) {
            console.error("Failed to load agenda", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [date]);

    // Handlers
    const handleSlotClick = (therapistId: string, slotDate: Date) => {
        setSelectedSlot({ therapistId, date: slotDate });
        setSelectedAppointment(null);
        setIsDrawerOpen(true);
    };

    const handleAppointmentClick = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setSelectedSlot(null); // Clear creation context
        setIsDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setSelectedSlot(null);
        setSelectedAppointment(null);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between p-4 border-b bg-white/50 backdrop-blur">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold tracking-tight text-foreground hidden md:block">Agenda Clínica</h1>

                    <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDate(d => addDays(d, -1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="font-medium min-w-[140px]">
                                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {format(date, "EEE, dd MMM", { locale: ptBR })}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDate(d => addDays(d, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
                        Hoje
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Buscar paciente..." className="pl-9 w-[200px] h-9" />
                    </div>

                    <Button onClick={() => { setSelectedAppointment(null); setSelectedSlot(null); setIsDrawerOpen(true); }}>
                        + Agendar
                    </Button>
                </div>
            </div>

            {/* Main Board */}
            <div className="flex-1 overflow-hidden p-4 bg-gray-50/50">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                ) : (
                    <AgendaBoard
                        date={date}
                        therapists={therapists}
                        appointments={appointments}
                        timeOff={timeOff}
                        onSlotClick={handleSlotClick}
                        onAppointmentClick={handleAppointmentClick}
                    />
                )}
            </div>

            {/* Drawer */}
            <AppointmentDrawer
                isOpen={isDrawerOpen}
                onClose={handleDrawerClose}
                onSuccess={fetchData} // Refresh data on save
                initialDate={selectedSlot?.date || date}
                initialTherapistId={selectedSlot?.therapistId}
                editAppointment={selectedAppointment}
            />
        </div>
    );
}
