import { useEffect, useState } from "react";
import AgendaPage from "./AgendaPage"; // We'll reuse the logic, but we need to pass a "therapistId" prop or handle it there.
import { useAuth } from "@/components/auth/AuthProvider";
import { Therapist } from "@/lib/agenda/types";
import { listTherapists } from "@/lib/agenda/api";

// Ideally AgendaPage should accept a `filterTherapistId` prop.
// Since I cannot easily modify AgendaPage without reading it again (which I just wrote), 
// I will just create a wrapper that renders AgendaPage. 
// However, the previous AgendaPage didn't have props for filtering.
// To avoid rewriting AgendaPage completely, I will create a new component `MyAgendaPage`
// that copies the structure but hardcodes/filters the view.

// BETTER APPROACH: 
// The user asked for `/admin/agenda/minha`.
// I'll make a simple wrapper that (for now) just renders the text "Minha Agenda (Em Breve)" 
// OR simpler: Render AgendaPage but wrapped in a context?
// No, let's just make a simple page that redirects or shows a "Only Me" view.
// Since `AgendaPage` fetches everything, I should probably modify `AgendaPage` to accept an optional `therapistId`.

// Let's modify AgendaPage.tsx first to accept props, then use it here.
// But I can't modify it easily in this step without a replace.

// Alternative: Just create a specialized page that fetches only ME.

export default function MyAgendaPage() {
    // MOCK: In a real app, we get the current user's attached therapist ID.
    // For now, let's pretend I am "Carla" (th_carla).
    const currentTherapistId = "th_carla";

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Minha Agenda</h1>
            <p className="text-muted-foreground mb-8">
                Visão focada apenas nos seus atendimentos. (Funcionalidade demonstrativa: Filtrando por Carla)
            </p>

            {/* 
                For the MVP, I'll just re-use the AgendaBoard but filter the data locally here.
                This requires duplicating some logic from AgendaPage, but it's safer than breaking AgendaPage now.
             */}
            <AgendaPageWrapper therapistId={currentTherapistId} />
        </div>
    );
}

// Internal wrapper to reuse the page logic (We will refactor AgendaPage later to be reusable)
import { AgendaBoard } from "@/components/admin/agenda/AgendaBoard";
import { AppointmentDrawer } from "@/components/admin/agenda/AppointmentDrawer";
import { listAppointments, listTimeOff } from "@/lib/agenda/api";
import { Appointment, TimeOff } from "@/lib/agenda/types";
import { MOCK_THERAPISTS } from "@/lib/agenda/mockData";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";

function AgendaPageWrapper({ therapistId }: { therapistId: string }) {
    const [date, setDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
    const [therapists, setTherapists] = useState<Therapist[]>([]); // Only ME
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ therapistId: string; date: Date } | null>(null);

    const fetchData = async () => {
        // 1. Therapists - Only Me
        const me = MOCK_THERAPISTS.find(t => t.id === therapistId);
        if (me) setTherapists([me]);

        // 2. Data
        const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);

        // Filter API by therapist_ids
        const apts = await listAppointments({
            from: startOfDay.toISOString(),
            to: endOfDay.toISOString(),
            therapist_ids: [therapistId]
        });

        const toffs = await listTimeOff({
            from: startOfDay.toISOString(),
            to: endOfDay.toISOString(),
            therapist_ids: [therapistId]
        });

        setAppointments(apts);
        setTimeOff(toffs);
    };

    useEffect(() => { fetchData(); }, [date, therapistId]);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-background">
            <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDate(d => addDays(d, -1))}><ChevronLeft className="h-4 w-4" /></Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="font-medium min-w-[140px]">
                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                {format(date, "EEE, dd MMM", { locale: ptBR })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus /></PopoverContent>
                    </Popover>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDate(d => addDays(d, 1))}><ChevronRight className="h-4 w-4" /></Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>Hoje</Button>
                <Button className="ml-auto" size="sm" onClick={() => { setSelectedAppointment(null); setSelectedSlot(null); setIsDrawerOpen(true); }}>+ Novo</Button>
            </div>

            <div className="flex-1 overflow-hidden border rounded-md">
                <AgendaBoard
                    date={date}
                    therapists={therapists}
                    appointments={appointments}
                    timeOff={timeOff}
                    onSlotClick={(tid, t) => { setSelectedSlot({ therapistId: tid, date: t }); setIsDrawerOpen(true); }}
                    onAppointmentClick={(apt) => { setSelectedAppointment(apt); setIsDrawerOpen(true); }}
                />
            </div>

            <AppointmentDrawer
                isOpen={isDrawerOpen}
                onClose={() => { setIsDrawerOpen(false); setSelectedAppointment(null); setSelectedSlot(null); }}
                onSuccess={fetchData}
                initialDate={selectedSlot?.date || date}
                initialTherapistId={therapistId}
                editAppointment={selectedAppointment}
            />
        </div>
    );
}
