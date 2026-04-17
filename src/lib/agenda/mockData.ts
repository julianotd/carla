import { Appointment, Service, Therapist, TimeOff } from "./types";
import { addDays, setHours, setMinutes, startOfHour } from "date-fns";

// Helpers to generate dates relative to "today"
const today = new Date();
const getRelDate = (days: number, hour: number, minute: number = 0) => {
    const d = addDays(today, days);
    return setMinutes(setHours(d, hour), minute).toISOString();
};

export const MOCK_THERAPISTS: Therapist[] = [
    {
        id: "th_carla",
        name: "Carla Schmitt",
        color: "#E2C2B3", // Gold/Beige
        is_active: true,
        default_slot_minutes: 60,
        timezone: "America/Sao_Paulo",
    },
    {
        id: "th_ana",
        name: "Ana Silva",
        color: "#B3E2CD", // Soft Green
        is_active: true,
        default_slot_minutes: 50,
        timezone: "America/Sao_Paulo",
    },
    {
        id: "th_pedro",
        name: "Pedro Santos",
        color: "#CBD5E1", // Slate
        is_active: true,
        default_slot_minutes: 60,
        timezone: "America/Sao_Paulo",
    },
    {
        id: "th_julia",
        name: "Júlia Costa",
        color: "#FDC4BD", // Soft Red
        is_active: true,
        default_slot_minutes: 90,
        timezone: "America/Sao_Paulo",
    },
];

export const MOCK_SERVICES: Service[] = [
    { id: "svc_reiki", name: "Reiki Tradicional", duration_min: 60, price_text: "R$ 150", is_active: true },
    { id: "svc_massagem", name: "Massagem Relaxante", duration_min: 60, price_text: "R$ 180", is_active: true },
    { id: "svc_constelacao", name: "Constelação Familiar", duration_min: 90, price_text: "R$ 250", is_active: true },
    { id: "svc_quick", name: "Quick Massage", duration_min: 30, price_text: "R$ 80", is_active: true },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
    // Carla - Today
    {
        id: "apt_1",
        therapist_id: "th_carla",
        patient_name: "Maria Oliveira",
        service_id: "svc_reiki",
        start_at: getRelDate(0, 9, 0),
        end_at: getRelDate(0, 10, 0),
        status: "confirmed",
        mode: "in_person",
        created_by_role: "admin",
    },
    {
        id: "apt_2",
        therapist_id: "th_carla",
        patient_name: "João Silva",
        service_id: "svc_massagem",
        start_at: getRelDate(0, 14, 0),
        end_at: getRelDate(0, 15, 0),
        status: "done",
        mode: "in_person",
        created_by_role: "secretary",
    },
    // Ana - Today
    {
        id: "apt_3",
        therapist_id: "th_ana",
        patient_name: "Lucas Pereira",
        service_id: "svc_quick",
        start_at: getRelDate(0, 10, 0),
        end_at: getRelDate(0, 10, 30),
        status: "confirmed",
        mode: "in_person",
        created_by_role: "therapist",
    },
    // Pedro - Tomorrow
    {
        id: "apt_4",
        therapist_id: "th_pedro",
        patient_name: "Fernanda Costa",
        service_id: "svc_reiki",
        start_at: getRelDate(1, 15, 0),
        end_at: getRelDate(1, 16, 0),
        status: "requested",
        mode: "online",
        created_by_role: "admin",
    },
    // Carla - Next Week
    {
        id: "apt_5",
        therapist_id: "th_carla",
        patient_name: "Roberto Mendes",
        service_id: "svc_constelacao",
        start_at: getRelDate(2, 9, 30),
        end_at: getRelDate(2, 11, 0),
        status: "confirmed",
        mode: "in_person",
        created_by_role: "secretary",
    },
];

export const MOCK_TIMEOFF: TimeOff[] = [
    // Lunch breaks (Today)
    {
        id: "to_1",
        therapist_id: "th_carla",
        start_at: getRelDate(0, 12, 0),
        end_at: getRelDate(0, 13, 30),
        reason: "Almoço",
    },
    {
        id: "to_2",
        therapist_id: "th_ana",
        start_at: getRelDate(0, 12, 0),
        end_at: getRelDate(0, 13, 0),
        reason: "Almoço",
    },
    // Vacation day for Julia (Tomorrow)
    {
        id: "to_3",
        therapist_id: "th_julia",
        start_at: getRelDate(1, 8, 0),
        end_at: getRelDate(1, 18, 0),
        reason: "Folga Pessoal",
    },
];
