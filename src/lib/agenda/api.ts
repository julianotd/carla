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

// In-memory store (initialized with mocks)
let appointmentsStore = [...MOCK_APPOINTMENTS];
let timeOffStore = [...MOCK_TIMEOFF];

// --- Helpers ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const checkOverlap = (
    start: string,
    end: string,
    therapistId: string,
    excludeAppointmentId?: string
) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    // Check Appointments
    const hasAptConflict = appointmentsStore.some(apt => {
        if (apt.therapist_id !== therapistId) return false;
        if (apt.status === "cancelled") return false;
        if (excludeAppointmentId && apt.id === excludeAppointmentId) return false;

        return areIntervalsOverlapping(
            { start: startDate, end: endDate },
            { start: parseISO(apt.start_at), end: parseISO(apt.end_at) }
        );
    });

    if (hasAptConflict) return true;

    // Check TimeOff
    const hasTimeOffConflict = timeOffStore.some(to => {
        if (to.therapist_id !== therapistId) return false;

        return areIntervalsOverlapping(
            { start: startDate, end: endDate },
            { start: parseISO(to.start_at), end: parseISO(to.end_at) }
        );
    });

    return hasTimeOffConflict;
};

// --- API Methods ---

export async function listTherapists(): Promise<Therapist[]> {
    await delay(300);
    return MOCK_THERAPISTS;
}

export async function listServices(): Promise<Service[]> {
    await delay(300);
    return MOCK_SERVICES;
}

export async function listAppointments(params: ListAppointmentsParams): Promise<Appointment[]> {
    await delay(400);

    return appointmentsStore.filter(apt => {
        // Range filter
        const aptStart = parseISO(apt.start_at);
        const rangeStart = parseISO(params.from);
        const rangeEnd = parseISO(params.to);

        if (isBefore(aptStart, rangeStart) || isAfter(aptStart, rangeEnd)) return false;

        // Filters
        if (params.therapist_ids && !params.therapist_ids.includes(apt.therapist_id)) return false;
        if (params.service_id && apt.service_id !== params.service_id) return false;
        if (params.status && apt.status !== params.status) return false;
        if (params.search_patient && !apt.patient_name.toLowerCase().includes(params.search_patient.toLowerCase())) return false;

        return true;
    });
}

export async function listTimeOff(params: RangeQuery & { therapist_ids?: string[] }): Promise<TimeOff[]> {
    await delay(300);

    return timeOffStore.filter(to => {
        const toStart = parseISO(to.start_at);
        const rangeStart = parseISO(params.from);
        const rangeEnd = parseISO(params.to);

        if (isBefore(toStart, rangeStart) || isAfter(toStart, rangeEnd)) return false;
        if (params.therapist_ids && !params.therapist_ids.includes(to.therapist_id)) return false;

        return true;
    });
}

export async function createAppointment(payload: Omit<Appointment, "id" | "created_at" | "updated_at">): Promise<Appointment> {
    await delay(600);

    if (checkOverlap(payload.start_at, payload.end_at, payload.therapist_id)) {
        throw new Error("CONFLICT: Horário indisponível.");
    }

    const newApt: Appointment = {
        ...payload,
        id: `apt_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    appointmentsStore.push(newApt);
    return newApt;
}

export async function updateAppointment(id: string, patch: Partial<Appointment>): Promise<Appointment> {
    await delay(500);

    const idx = appointmentsStore.findIndex(a => a.id === id);
    if (idx === -1) throw new Error("Attendance not found");

    const current = appointmentsStore[idx];
    const updated = { ...current, ...patch, updated_at: new Date().toISOString() };

    // Check overlap only if time changed
    if (
        (patch.start_at && patch.start_at !== current.start_at) ||
        (patch.end_at && patch.end_at !== current.end_at) ||
        (patch.therapist_id && patch.therapist_id !== current.therapist_id)
    ) {
        if (checkOverlap(updated.start_at, updated.end_at, updated.therapist_id, id)) {
            throw new Error("CONFLICT: Novo horário indisponível.");
        }
    }

    appointmentsStore[idx] = updated;
    return updated;
}

export async function createTimeOff(payload: Omit<TimeOff, "id">): Promise<TimeOff> {
    await delay(400);

    if (checkOverlap(payload.start_at, payload.end_at, payload.therapist_id)) {
        throw new Error("CONFLICT: Já existe um agendamento neste horário.");
    }

    const newTO: TimeOff = {
        ...payload,
        id: `to_${Date.now()}`,
    };

    timeOffStore.push(newTO);
    return newTO;
}

// --- Best Slots Logic ---

export async function getBestSlots(params: BestSlotsParams): Promise<BestSlot[]> {
    await delay(800); // Simulate heavier calculation

    const service = MOCK_SERVICES.find(s => s.id === params.service_id);
    if (!service) throw new Error("Service not found");

    const duration = service.duration_min;
    const candidates: BestSlot[] = [];

    // Identify therapists to check
    const therapistsToCheck = params.therapist_id
        ? MOCK_THERAPISTS.filter(t => t.id === params.therapist_id)
        : MOCK_THERAPISTS;

    const startRange = parseISO(params.from);
    const endRange = parseISO(params.to);

    // Iterate days in range (simplified: just search every 30 mins)
    let cursor = new Date(startRange);
    // Normalize cursor to start of hour if needed
    if (cursor.getMinutes() % 30 !== 0) {
        cursor = addMinutes(cursor, 30 - (cursor.getMinutes() % 30));
    }

    // Limit iterations to avoid infinite loop in huge ranges
    let safetyCount = 0;
    while (isBefore(cursor, endRange) && safetyCount < 1000) {
        safetyCount++;

        // Define slot time
        const slotStart = cursor;
        const slotEnd = addMinutes(cursor, duration);
        const slotStartIso = slotStart.toISOString();
        const slotEndIso = slotEnd.toISOString();

        // Skip night/early morning (Business Hours: 08:00 - 20:00)
        const hour = slotStart.getHours();
        if (hour < 8 || hour >= 20) {
            cursor = addMinutes(cursor, 30);
            continue;
        }

        // Check each therapist
        for (const therapist of therapistsToCheck) {
            const isBlocked = checkOverlap(slotStartIso, slotEndIso, therapist.id);

            if (!isBlocked) {
                let score = 0;
                let reason: BestSlot["reason"] = "best_fit";

                // Scoring Logic

                // 1. Earliest (High Value)
                // If it's today/tomorrow and early in the list
                if (candidates.length < 3) {
                    score += 100;
                    reason = "earliest";
                }

                // 2. Avoid Gap (Gap < 60 min to another appt)
                // Find adjacent appointments
                const hasAdjacent = appointmentsStore.some(apt => {
                    if (apt.therapist_id !== therapist.id || apt.status === 'cancelled') return false;
                    const aptEnd = parseISO(apt.end_at);
                    const aptStart = parseISO(apt.start_at);

                    // Gap before
                    const gapBefore = differenceInMinutes(slotStart, aptEnd);
                    // Gap after
                    const gapAfter = differenceInMinutes(aptStart, slotEnd);

                    return (gapBefore >= 0 && gapBefore <= 30) || (gapAfter >= 0 && gapAfter <= 30);
                });

                if (hasAdjacent) {
                    score += 50; // Boost
                    reason = "best_fit";
                }

                // 3. Alternate Therapist
                // If we looked for ANY therapist, but this one is not the "preferred" (mock logic)
                // In this case, just giving a small bonus to spread load could be a strategy,
                // but here we basically value availability.
                if (!params.therapist_id) {
                    score += 10;
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

    // Sort by Score Desc, then Date Asc
    candidates.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
    });

    return candidates.slice(0, params.limit || 6);
}
