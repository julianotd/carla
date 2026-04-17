import { Appointment, Therapist, TimeOff } from "@/lib/agenda/types";
import { format, addDays, startOfDay, addMinutes, differenceInMinutes, parseISO, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { TimeOffBlock } from "./TimeOffBlock";
import { Video, MapPin, AlertCircle, Check, Clock } from "lucide-react";

interface AgendaBoardProps {
    date: Date;
    therapists: Therapist[];
    appointments: Appointment[];
    timeOff: TimeOff[];
    onSlotClick: (therapistId: string, time: Date) => void;
    onAppointmentClick: (apt: Appointment) => void;
}

const START_HOUR = 7;
const END_HOUR = 20;

export function AgendaBoard({
    date,
    therapists,
    appointments,
    timeOff,
    onSlotClick,
    onAppointmentClick
}: AgendaBoardProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update "current time line" every minute
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const timeSlots: Date[] = [];
    let cursor = new Date(date);
    cursor.setHours(START_HOUR, 0, 0, 0);
    const endLimit = new Date(date);
    endLimit.setHours(END_HOUR, 0, 0, 0);

    while (cursor < endLimit) {
        timeSlots.push(new Date(cursor));
        cursor = addMinutes(cursor, 30);
    }

    // Calculate position logic (30 min = 60px height)
    const PIXELS_PER_MINUTE = 2;
    const SLOT_HEIGHT = 30 * PIXELS_PER_MINUTE;

    const getTopOffset = (d: string | Date) => {
        const dateObj = typeof d === 'string' ? parseISO(d) : d;
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();
        return ((hours - START_HOUR) * 60 + minutes) * PIXELS_PER_MINUTE;
    };

    const getHeight = (start: string, end: string) => {
        const duration = differenceInMinutes(parseISO(end), parseISO(start));
        return duration * PIXELS_PER_MINUTE;
    };

    return (
        <div className="flex flex-col h-full border rounded-lg bg-white overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex border-b divide-x bg-gray-50/50">
                <div className="w-16 flex-shrink-0 p-2 text-center text-xs font-medium text-muted-foreground border-r bg-white sticky left-0 z-20">
                    Horário
                </div>
                {therapists.map(therapist => (
                    <div key={therapist.id} className="flex-1 p-3 text-center min-w-[180px]">
                        <div className="flex flex-col items-center gap-1">
                            <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm" style={{ backgroundColor: therapist.color || "#ccc" }}>
                                <AvatarFallback className="text-xs font-bold text-white bg-transparent">
                                    {therapist.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold truncate max-w-full px-2">
                                {therapist.name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                <div className="flex divide-x relative" style={{ height: timeSlots.length * SLOT_HEIGHT }}>

                    {/* Timeline axis */}
                    <div className="w-16 flex-shrink-0 bg-gray-50/30 border-r sticky left-0 z-10">
                        {timeSlots.map((slot, i) => (
                            <div
                                key={i}
                                className="text-[10px] text-muted-foreground text-center border-b border-dashed border-gray-100 flex items-start justify-center pt-1"
                                style={{ height: SLOT_HEIGHT }}
                            >
                                {/* Show label every hour */}
                                {slot.getMinutes() === 0 ? format(slot, "HH:mm") : null}
                            </div>
                        ))}
                    </div>

                    {/* Current Time Line */}
                    {isSameDay(currentTime, date) && (() => {
                        const top = getTopOffset(currentTime);
                        if (top >= 0 && top <= (END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE) {
                            return (
                                <div
                                    className="absolute left-0 right-0 border-t-2 border-red-500 z-30 pointer-events-none flex items-center"
                                    style={{ top }}
                                >
                                    <div className="bg-red-500 text-white text-[9px] px-1 rounded-r -mt-[9px]">
                                        {format(currentTime, "HH:mm")}
                                    </div>
                                </div>
                            );
                        }
                    })()}

                    {/* Columns */}
                    {therapists.map(therapist => {
                        const therapistApts = appointments.filter(a => a.therapist_id === therapist.id);
                        const therapistTimeOff = timeOff.filter(t => t.therapist_id === therapist.id);

                        return (
                            <div key={therapist.id} className="flex-1 relative min-w-[180px] group/column">

                                {/* Background Grid */}
                                {timeSlots.map((slot, i) => (
                                    <div
                                        key={i}
                                        className="border-b border-dashed border-gray-100 hover:bg-gray-50/80 transition-colors cursor-pointer"
                                        style={{ height: SLOT_HEIGHT }}
                                        onClick={() => onSlotClick(therapist.id, slot)}
                                        title={`Agendar para ${therapist.name} às ${format(slot, "HH:mm")}`}
                                    />
                                ))}

                                {/* Time Off Blocks */}
                                {therapistTimeOff.map(to => (
                                    <TimeOffBlock
                                        key={to.id}
                                        timeOff={to}
                                        style={{
                                            top: getTopOffset(to.start_at),
                                            height: getHeight(to.start_at, to.end_at)
                                        }}
                                    />
                                ))}

                                {/* Appointments */}
                                {therapistApts.map(apt => {
                                    const top = getTopOffset(apt.start_at);
                                    const height = getHeight(apt.start_at, apt.end_at);

                                    // Status Colors
                                    let borderClass = "border-l-4 border-l-blue-500";
                                    let bgClass = "bg-blue-50 text-blue-900";

                                    if (apt.status === "confirmed") {
                                        borderClass = "border-l-4 border-l-green-500";
                                        bgClass = "bg-green-50 text-green-900";
                                    } else if (apt.status === "cancelled") {
                                        borderClass = "border-l-4 border-l-red-300";
                                        bgClass = "bg-red-50 text-red-700 opacity-60";
                                    } else if (apt.status === "done") {
                                        borderClass = "border-l-4 border-l-gray-500";
                                        bgClass = "bg-gray-100 text-gray-700";
                                    }

                                    return (
                                        <div
                                            key={apt.id}
                                            className={cn(
                                                "absolute left-1 right-1 rounded border shadow-sm p-2 cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] z-20 text-xs",
                                                borderClass, bgClass
                                            )}
                                            style={{ top, height: Math.max(height, 20) }}
                                            onClick={(e) => { e.stopPropagation(); onAppointmentClick(apt); }}
                                        >
                                            <div className="font-bold line-clamp-1">{apt.patient_name}</div>
                                            <div className="line-clamp-1 opacity-90">{format(parseISO(apt.start_at), "HH:mm")} - {format(parseISO(apt.end_at), "HH:mm")}</div>

                                            <div className="flex gap-1 items-center mt-1">
                                                {apt.mode === "online" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                                {height > 40 && (
                                                    <span className="uppercase text-[9px] tracking-wider opacity-70 border px-1 rounded border-current">
                                                        {apt.status === 'requested' ? 'Pendente' : apt.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
