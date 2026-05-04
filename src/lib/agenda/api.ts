import {
    Appointment,
    BestSlot,
    BestSlotsParams,
    ListAppointmentsParams,
    RangeQuery,
    Service,
    Therapist,
    TimeOff
} from "./types";
import { MOCK_APPOINTMENTS, MOCK_SERVICES, MOCK_THERAPISTS, MOCK_TIMEOFF } from "./mockData";
import { addMinutes, areIntervalsOverlapping, differenceInMinutes, format, isAfter, isBefore, parseISO, startOfDay, addDays, isSameDay } from "date-fns";

import { supabase } from "@/integrations/supabase/client";

// --- Helpers ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const checkOverlap = (
    start: string,
    end: string,
    therapistId: string,
    appointments: Appointment[],
    timeOff: TimeOff[]
) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    const hasAptConflict = appointments.some(apt => {
        if (apt.therapist_id !== therapistId) return false;
        if (apt.status === "cancelled") return false;
        return areIntervalsOverlapping(
            { start: startDate, end: endDate },
            { start: parseISO(apt.start_at), end: parseISO(apt.end_at) }
        );
    });

    if (hasAptConflict) return true;

    const hasTimeOffConflict = timeOff.some(to => {
        if (to.therapist_id !== therapistId) return false;
        return areIntervalsOverlapping(
            { start: startDate, end: endDate },
            { start: parseISO(to.start_at), end: parseISO(to.end_at) }
        );
    });

    return hasTimeOffConflict;
};

// --- API Methods ---

export async function getTherapistByUserId(userId: string): Promise<Therapist | null> {
    const { data, error } = await supabase
        .from("therapists")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
    
    if (error) throw error;
    return data as Therapist | null;
}

export async function listTherapists(): Promise<Therapist[]> {
    const { data, error } = await supabase
        .from("therapists")
        .select("*")
        .order("name");
    
    if (error) throw error;
    return data as Therapist[];
}

export async function listServices(): Promise<Service[]> {
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
    
    if (error) throw error;
    return data as Service[];
}

export async function listAppointments(params: ListAppointmentsParams): Promise<Appointment[]> {
    let query = supabase
        .from("appointments")
        .select("*")
        .gte("starts_at", params.from)
        .lte("starts_at", params.to);

    if (params.therapist_ids && params.therapist_ids.length > 0) {
        query = query.in("therapist_id", params.therapist_ids);
    }
    if (params.service_id) {
        query = query.eq("service_id", params.service_id);
    }
    if (params.status) {
        query = query.eq("status", params.status);
    }
    if (params.search_patient) {
        query = query.ilike("client_name", `%${params.search_patient}%`);
    }

    const { data, error } = await query.order("starts_at", { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(item => ({
        id: item.id,
        therapist_id: item.therapist_id || "",
        patient_name: item.client_name,
        client_phone: item.client_phone,
        service_id: item.service_id || "",
        start_at: item.starts_at,
        end_at: item.ends_at,
        status: item.status as AppointmentStatus,
        mode: "in_person", // Default for now
        created_by_role: "admin", // Default for now
        notes_internal: item.notes || "",
        created_at: item.created_at,
        updated_at: item.updated_at
    }));
}

export async function listTimeOff(params: RangeQuery & { therapist_ids?: string[] }): Promise<TimeOff[]> {
    let query = supabase
        .from("availability_exceptions")
        .select("*")
        .eq("is_available", false) // Exceptions that block time
        .gte("date", params.from.split('T')[0])
        .lte("date", params.to.split('T')[0]);

    if (params.therapist_ids && params.therapist_ids.length > 0) {
        query = query.in("therapist_id", params.therapist_ids);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(item => ({
        id: item.id,
        therapist_id: item.therapist_id,
        start_at: `${item.date}T${item.start_time || "00:00:00"}`,
        end_at: `${item.date}T${item.end_time || "23:59:59"}`,
        reason: item.reason || "Indisponível"
    }));
}

export async function createAppointment(payload: Omit<Appointment, "id" | "created_at" | "updated_at">): Promise<Appointment> {
    const { data, error } = await supabase
        .from("appointments")
        .insert({
            therapist_id: payload.therapist_id,
            service_id: payload.service_id,
            client_name: payload.patient_name,
            client_phone: payload.client_phone,
            starts_at: payload.start_at,
            ends_at: payload.end_at,
            status: payload.status,
            notes: payload.notes_internal
        })
        .select()
        .single();

    if (error) throw error;

    return {
        ...payload,
        id: data.id,
        created_at: data.created_at,
        updated_at: data.updated_at
    } as Appointment;
}

export async function updateAppointment(id: string, patch: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
        .from("appointments")
        .update({
            therapist_id: patch.therapist_id,
            service_id: patch.service_id,
            client_name: patch.patient_name,
            client_phone: patch.client_phone,
            starts_at: patch.start_at,
            ends_at: patch.end_at,
            status: patch.status,
            notes: patch.notes_internal
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        patient_name: data.client_name,
        start_at: data.starts_at,
        end_at: data.ends_at,
        notes_internal: data.notes
    } as unknown as Appointment;
}

export async function createTimeOff(payload: Omit<TimeOff, "id">): Promise<TimeOff> {
    const { data, error } = await supabase
        .from("availability_exceptions")
        .insert({
            therapist_id: payload.therapist_id,
            date: payload.start_at.split('T')[0],
            start_time: payload.start_at.split('T')[1]?.substring(0, 8),
            end_time: payload.end_at.split('T')[1]?.substring(0, 8),
            is_available: false,
            reason: payload.reason
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        therapist_id: data.therapist_id,
        start_at: payload.start_at,
        end_at: payload.end_at,
        reason: data.reason
    } as TimeOff;
}

// --- Best Slots Logic ---

export async function getBestSlots(params: BestSlotsParams): Promise<BestSlot[]> {
    // 1. Fetch Necessary Data
    const [therapists, services, appointments, timeOff] = await Promise.all([
        listTherapists(),
        listServices(),
        listAppointments({ from: params.from, to: params.to }),
        listTimeOff({ from: params.from, to: params.to })
    ]);

    const service = services.find(s => s.id === params.service_id);
    if (!service) throw new Error("Service not found");

    const duration = service.duration_min || 60;
    const candidates: BestSlot[] = [];

    const therapistsToCheck = params.therapist_id
        ? therapists.filter(t => t.id === params.therapist_id)
        : therapists;

    const startRange = parseISO(params.from);
    const endRange = parseISO(params.to);

    let cursor = new Date(startRange);
    if (cursor.getMinutes() % 30 !== 0) {
        cursor = addMinutes(cursor, 30 - (cursor.getMinutes() % 30));
    }

    let safetyCount = 0;
    while (isBefore(cursor, endRange) && safetyCount < 1000) {
        safetyCount++;
        const slotStart = cursor;
        const slotEnd = addMinutes(cursor, duration);
        const slotStartIso = slotStart.toISOString();
        const slotEndIso = slotEnd.toISOString();

        // Business Hours: 08:00 - 20:00 (Can be expanded later with availability_rules)
        const hour = slotStart.getHours();
        if (hour < 8 || hour >= 20) {
            cursor = addMinutes(cursor, 30);
            continue;
        }

        for (const therapist of therapistsToCheck) {
            const isBlocked = checkOverlap(slotStartIso, slotEndIso, therapist.id, appointments, timeOff);

            if (!isBlocked) {
                let score = 0;
                let reason: BestSlot["reason"] = "best_fit";

                if (candidates.length < 3) {
                    score += 100;
                    reason = "earliest";
                }

                // Gap score
                const hasAdjacent = appointments.some(apt => {
                    if (apt.therapist_id !== therapist.id || apt.status === 'cancelled') return false;
                    const gapBefore = differenceInMinutes(slotStart, parseISO(apt.end_at));
                    const gapAfter = differenceInMinutes(parseISO(apt.start_at), slotEnd);
                    return (gapBefore >= 0 && gapBefore <= 30) || (gapAfter >= 0 && gapAfter <= 30);
                });

                if (hasAdjacent) {
                    score += 50;
                }

                candidates.push({
                    therapist_id: therapist.id,
                    start_at: slotStartIso,
                    end_at: slotEndIso,
                    score,
                    reason
                });
            }
        }
        cursor = addMinutes(cursor, 30);
    }

    candidates.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
    });

    return candidates.slice(0, params.limit || 6);
}
