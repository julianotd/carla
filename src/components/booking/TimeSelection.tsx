
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Loader2, Sparkles, User } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimeSelectionProps {
    therapist: any | null; // Null if "Any"
    service: any;
    mode: 'online' | 'presencial' | null;
    onSelect: (date: Date, therapist?: any) => void; // Pass back therapist if "Any" was used
    selectedDate?: Date | null;
}

export function TimeSelection({ therapist, service, mode, onSelect, selectedDate }: TimeSelectionProps) {
    const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());
    const [filteredTherapists, setFilteredTherapists] = useState<any[]>([]);

    // 1. Fetch relevant therapists if "Any" is selected
    const { data: eligibleTherapists, isLoading: isLoadingTherapists } = useQuery({
        queryKey: ["public", "eligible_therapists", service.id, therapist?.id],
        queryFn: async () => {
            if (therapist) return [therapist]; // Already selected

            // Fetch all linked therapists
            const { data: links } = await (supabase
                .from("therapist_services" as any)
                .select("therapist_id")
                .eq("service_id", service.id)) as any;

            const ids = links?.map((l: any) => l.therapist_id) || [];
            if (ids.length === 0) return [];

            const { data } = await supabase
                .from("therapists")
                .select("*")
                .in("id", ids)
                .eq("is_active", true);
            return data || [];
        }
    });

    // 2. Fetch Availability Rules for ALL eligible therapists
    const { data: allRules, isLoading: isLoadingRules } = useQuery({
        queryKey: ["public", "all_rules", eligibleTherapists?.map(t => t.id).join(",")],
        enabled: !!eligibleTherapists && eligibleTherapists.length > 0,
        queryFn: async () => {
            const ids = eligibleTherapists!.map(t => t.id);
            const { data, error } = await supabase
                .from("availability_rules")
                .select("*")
                .in("therapist_id", ids);
            if (error) throw error;
            // Filter by MODE in JS or DB? DB better but 'both' logic covers both.
            // Rule mode: 'online', 'presencial', 'both'.
            // Requested mode: 'online' or 'presencial'.
            // Match: rule.mode == requested OR rule.mode == 'both'.
            return data as any[];
        }
    });

    // 3. Fetch Blocks for ALL eligible therapists (New in Phase 5)
    const { data: allBlocks } = useQuery({
        queryKey: ["public", "all_blocks", eligibleTherapists?.map(t => t.id).join(",")],
        enabled: !!eligibleTherapists && eligibleTherapists.length > 0,
        queryFn: async () => {
            const ids = eligibleTherapists!.map(t => t.id);
            const { data } = await (supabase
                .from("availability_blocks" as any) // Assuming table exists now
                .select("*")
                .in("therapist_id", ids)
                .gte("ends_at", new Date().toISOString())) as any;
            return data || [];
        }
    });

    // 4. Fetch Appointments for ALL eligible therapists (14 days)
    const { data: allAppointments, isLoading: isLoadingAppts } = useQuery({
        queryKey: ["public", "all_appointments", eligibleTherapists?.map(t => t.id).join(",")],
        enabled: !!eligibleTherapists && eligibleTherapists.length > 0,
        queryFn: async () => {
            const ids = eligibleTherapists!.map(t => t.id);
            const now = new Date();
            const startRange = startOfDay(now).toISOString();
            const endRange = addDays(startOfDay(now), 14).toISOString(); // 14 days fetch

            const { data, error } = await supabase
                .from("appointments")
                .select("therapist_id, starts_at, ends_at") // minimal fields
                .in("therapist_id", ids)
                .gte("starts_at", startRange)
                .lt("starts_at", endRange)
                .neq("status", "cancelled");

            if (error) throw error;
            return data;
        }
    });

    const isLoading = isLoadingTherapists || isLoadingRules || isLoadingAppts;

    // 5. Calculate Slots Logic
    // Output: { date: Date, time: string, therapist: any }[]
    const [slots, setSlots] = useState<{ time: string, therapist: any }[]>([]);
    const [suggestions, setSuggestions] = useState<{ date: Date, time: string, therapist: any }[]>([]);

    useEffect(() => {
        if (!eligibleTherapists || !allRules || !allAppointments || !date) return;

        // --- Helper to check availability for a specific therapist ---
        const getSlotsForTherapist = (t: any, checkDate: Date, limit: number = 100): { time: string, date: Date }[] => {
            const dayOfWeek = checkDate.getDay();
            // 1. Find relevant rule
            const rule = allRules.find(r =>
                r.therapist_id === t.id &&
                r.day_of_week === dayOfWeek &&
                (r.mode === 'both' || r.mode === mode)
            );
            if (!rule) return [];

            // 2. Blocks check
            const hasBlock = allBlocks?.some(b =>
                b.therapist_id === t.id &&
                new Date(b.starts_at) <= checkDate && // Very rough block check (whole day?)
                new Date(b.ends_at) >= checkDate // Blocks are range based. 
                // If block covers the slot, we check inside loop.
                // If block covers whole day, skip.
            );
            // Better block check inside slot loop.

            const daily: { time: string, date: Date }[] = [];
            const [startH, startM] = rule.start_time.slice(0, 5).split(':').map(Number);
            const [endH, endM] = rule.end_time.slice(0, 5).split(':').map(Number);

            let current = new Date(checkDate);
            current.setHours(startH, startM, 0, 0);
            const endTime = new Date(checkDate);
            endTime.setHours(endH, endM, 0, 0);

            const duration = service.duration_min || 60;

            while (current < endTime && daily.length < limit) {
                const slotEnd = new Date(current.getTime() + duration * 60000);
                if (slotEnd > endTime) break;

                // Conflict Check (Appts)
                const isBusy = allAppointments.some(appt =>
                    appt.therapist_id === t.id &&
                    (current < new Date(appt.ends_at) && slotEnd > new Date(appt.starts_at))
                );

                // Block Check
                const isBlocked = allBlocks?.some(b =>
                    b.therapist_id === t.id &&
                    (current < new Date(b.ends_at) && slotEnd > new Date(b.starts_at))
                );

                // Past Check
                const now = new Date();
                const isPast = current < now;

                if (!isBusy && !isBlocked && !isPast) {
                    daily.push({
                        time: format(current, "HH:mm"),
                        date: new Date(current)
                    });
                }
                current = slotEnd;
            }
            return daily;
        };

        // --- A. Suggestions Calculation (First 3 slots global) ---
        // Iterate next 14 days, check all therapists, sort by time.
        const allSuggestions: { date: Date, time: string, therapist: any }[] = [];
        let scanDate = new Date();
        scanDate.setMinutes(0, 0, 0);

        let daysChecked = 0;
        // Optimization: Stop when we have 3 suggestions total
        while (daysChecked < 14 && allSuggestions.length < 5) { // Get 5, take 3
            for (const t of eligibleTherapists) {
                const daySlots = getSlotsForTherapist(t, scanDate, 1); // Get 1 per therapist per day
                if (daySlots.length > 0) {
                    allSuggestions.push({
                        date: daySlots[0].date,
                        time: daySlots[0].time,
                        therapist: t
                    });
                }
            }
            scanDate = addDays(scanDate, 1);
            scanDate.setHours(0, 0, 0, 0);
            daysChecked++;
        }

        // Sort suggestions by real date/time
        allSuggestions.sort((a, b) => a.date.getTime() - b.date.getTime());
        setSuggestions(allSuggestions.slice(0, 3));

        // --- B. Slots for SELECTED Date ---
        const activeDateSlots: { time: string, therapist: any }[] = [];
        if (date) {
            for (const t of eligibleTherapists) {
                const daySlots = getSlotsForTherapist(t, date, 50);
                daySlots.forEach(s => activeDateSlots.push({ time: s.time, therapist: t }));
            }
        }
        // Sort slots by time
        activeDateSlots.sort((a, b) => {
            const tA = a.time.split(':').map(Number);
            const tB = b.time.split(':').map(Number);
            return (tA[0] * 60 + tA[1]) - (tB[0] * 60 + tB[1]);
        });
        setSlots(activeDateSlots);

    }, [date, allRules, allAppointments, allBlocks, eligibleTherapists, mode, service.duration_min]);


    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    return (
        <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-1">
                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" /> Sugestões Rápidas (Melhores horários)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((s, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    className="bg-background border-primary/30 hover:bg-primary/10 hover:border-primary text-xs flex flex-col items-start gap-1 h-auto py-2"
                                    onClick={() => {
                                        setDate(s.date);
                                        // Pass the therapist associated with this slot!
                                        onSelect(s.date, s.therapist);
                                    }}
                                >
                                    <span className="font-semibold">{format(s.date, "dd/MM (EEE) 'às' HH:mm", { locale: ptBR })}</span>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <User className="h-3 w-3" /> {s.therapist.name.split(' ')[0]}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={ptBR}
                    className="rounded-md border shadow-sm"
                    disabled={(d) => d < startOfDay(new Date())}
                />
            </div>

            <div className="flex-1">
                <h3 className="mb-4 font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horários Disponíveis ({slots.length})
                </h3>

                <ScrollArea className="h-[300px]">
                    {slots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {slots.map((slot, idx) => (
                                <Button
                                    key={`${slot.time}-${slot.therapist.id}-${idx}`}
                                    variant={selectedDate && format(selectedDate, "HH:mm") === slot.time && isSameDay(selectedDate, date!) ? "default" : "outline"}
                                    size="sm"
                                    className="justify-start px-3 h-auto py-2"
                                    onClick={() => {
                                        if (date) {
                                            const [h, m] = slot.time.split(':').map(Number);
                                            const newDate = new Date(date);
                                            newDate.setHours(h, m, 0, 0);
                                            onSelect(newDate, slot.therapist);
                                        }
                                    }}
                                >
                                    <div className="text-left">
                                        <div className="font-medium">{slot.time}</div>
                                        {/* Only show therapist name if "Any" was selected originally */}
                                        {!therapist && <div className="text-[10px] text-muted-foreground">{slot.therapist.name.split(' ')[0]}</div>}
                                    </div>
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-8">
                            Nenhum horário para este dia.
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
}
