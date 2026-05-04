export type Role = "admin" | "secretary" | "therapist";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "no_show" | "completed";
export type AppointmentMode = "in_person" | "online";

export interface Therapist {
    id: string;
    user_id?: string;
    name: string;
    color?: string;
    is_active: boolean;
    default_slot_minutes: number;
    timezone: string;
}

export interface Service {
    id: string;
    name: string;
    duration_min: number;
    price_text?: string;
    is_active: boolean;
}

export interface TimeOff {
    id: string;
    therapist_id: string;
    start_at: string; // ISO string
    end_at: string;   // ISO string
    reason?: string;
}

export interface Appointment {
    id: string;
    therapist_id: string;
    patient_id?: string;
    patient_name: string; // Denormalized for display
    client_phone: string;
    service_id: string;
    start_at: string; // ISO string
    end_at: string;   // ISO string
    status: AppointmentStatus;
    mode: AppointmentMode;
    created_by_role: Role;
    notes_internal?: string;
    updated_at?: string;
    created_at?: string;
}

export interface RangeQuery {
    from: string; // ISO string
    to: string;   // ISO string
}

export interface ListAppointmentsParams extends RangeQuery {
    therapist_ids?: string[];
    service_id?: string;
    status?: AppointmentStatus;
    search_patient?: string;
}

export interface BestSlotsParams extends RangeQuery {
    service_id: string;
    therapist_id?: string; // Optional: if null, check all therapists
    limit?: number; // Default 6
}

export interface BestSlot {
    therapist_id: string;
    start_at: string;
    end_at: string;
    score: number;
    reason: "earliest" | "best_fit" | "avoid_gap" | "alternate_therapist";
}
