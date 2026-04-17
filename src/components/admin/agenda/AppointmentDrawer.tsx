import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock, User, Trash2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import { useToast } from "@/hooks/use-toast";
import { Appointment, Service, Therapist, BestSlot } from "@/lib/agenda/types";
import { createAppointment, getBestSlots, listServices, listTherapists, updateAppointment } from "@/lib/agenda/api";
import { SmartSuggestions } from "./SmartSuggestions";

interface AppointmentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialDate?: Date;
    initialTherapistId?: string;
    editAppointment?: Appointment | null;
}

export function AppointmentDrawer({
    isOpen,
    onClose,
    onSuccess,
    initialDate,
    initialTherapistId,
    editAppointment
}: AppointmentDrawerProps) {
    const { toast } = useToast();

    // Data
    const [services, setServices] = useState<Service[]>([]);
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [suggestions, setSuggestions] = useState<BestSlot[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    // Form State
    const [patientName, setPatientName] = useState("");
    const [serviceId, setServiceId] = useState("");
    const [therapistId, setTherapistId] = useState("");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState("09:00");
    const [mode, setMode] = useState<"in_person" | "online">("in_person");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState<Appointment["status"]>("confirmed");

    const [isSaving, setIsSaving] = useState(false);

    // Load Metadata
    useEffect(() => {
        if (isOpen) {
            listServices().then(setServices);
            listTherapists().then(setTherapists);
        }
    }, [isOpen]);

    // Init Form Logic
    useEffect(() => {
        if (isOpen) {
            if (editAppointment) {
                // Edit Mode
                setPatientName(editAppointment.patient_name);
                setServiceId(editAppointment.service_id);
                setTherapistId(editAppointment.therapist_id);
                const start = parseISO(editAppointment.start_at);
                setDate(start);
                setTime(format(start, "HH:mm"));
                setMode(editAppointment.mode);
                setNotes(editAppointment.notes_internal || "");
                setStatus(editAppointment.status);
            } else {
                // Create Mode
                setPatientName("");
                if (services.length > 0 && !serviceId) setServiceId(services[0].id);
                setTherapistId(initialTherapistId || (therapists.length > 0 ? therapists[0].id : ""));
                if (initialDate) {
                    setDate(initialDate);
                    setTime(format(initialDate, "HH:mm"));
                }
                setMode("in_person");
                setNotes("");
                setStatus("confirmed");
            }
        }
    }, [isOpen, editAppointment, initialDate, initialTherapistId, services, therapists]);

    // Fetch Suggestions when service changes (in Create Mode)
    useEffect(() => {
        if (isOpen && !editAppointment && serviceId) {
            setLoadingSuggestions(true);
            const today = new Date();
            getBestSlots({
                service_id: serviceId,
                therapist_id: therapistId || undefined,
                from: today.toISOString(),
                to: addMinutes(today, 10080).toISOString(), // next 7 days
                limit: 3
            })
                .then(setSuggestions)
                .finally(() => setLoadingSuggestions(false));
        }
    }, [isOpen, editAppointment, serviceId, therapistId]);

    const handleSave = async () => {
        if (!patientName || !serviceId || !therapistId || !date || !time) {
            toast({ variant: "destructive", title: "Preencha todos os campos obrigatórios" });
            return;
        }

        try {
            setIsSaving(true);

            const service = services.find(s => s.id === serviceId);
            const duration = service?.duration_min || 60;

            const [hours, mins] = time.split(":").map(Number);
            const startDate = new Date(date);
            startDate.setHours(hours, mins, 0, 0);
            const endDate = addMinutes(startDate, duration);

            const payload = {
                patient_name: patientName,
                service_id: serviceId,
                therapist_id: therapistId,
                start_at: startDate.toISOString(),
                end_at: endDate.toISOString(),
                mode,
                status,
                notes_internal: notes,
                created_by_role: "admin" as const // Mock
            };

            if (editAppointment) {
                await updateAppointment(editAppointment.id, payload);
                toast({ title: "Agendamento atualizado!" });
            } else {
                await createAppointment({ ...payload, patient_id: undefined }); // Mock patient_id
                toast({ title: "Agendamento criado!" });
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Erro ao salvar", description: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    const applySuggestion = (slot: BestSlot) => {
        const slotDate = parseISO(slot.start_at);
        setDate(slotDate);
        setTime(format(slotDate, "HH:mm"));
        setTherapistId(slot.therapist_id);
        toast({ description: "Horário sugerido aplicado!" });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{editAppointment ? "Editar Agendamento" : "Novo Agendamento"}</SheetTitle>
                    <SheetDescription>
                        {editAppointment ? "Gerencie os detalhes da consulta." : "Preencha os dados para agendar."}
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-4 py-4">
                    {/* Smart Suggestions (Only Create Mode) */}
                    {!editAppointment && (
                        <SmartSuggestions
                            slots={suggestions}
                            onSelect={applySuggestion}
                            isLoading={loadingSuggestions}
                        />
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="patient">Paciente</Label>
                        <Input
                            id="patient"
                            placeholder="Nome do paciente"
                            value={patientName}
                            onChange={e => setPatientName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Serviço</Label>
                            <Select value={serviceId} onValueChange={setServiceId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name} ({s.duration_min} min)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Profissional</Label>
                            <Select value={therapistId} onValueChange={setTherapistId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {therapists.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Data e Hora</Label>
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <Input
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                className="w-24"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Modalidade</Label>
                        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="in_person">Presencial</TabsTrigger>
                                <TabsTrigger value="online">Online</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="requested">Pendente (Solicitado)</SelectItem>
                                <SelectItem value="confirmed">Confirmado</SelectItem>
                                <SelectItem value="done">Concluído</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                                <SelectItem value="no_show">Não Compareceu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Observações Internas</Label>
                        <Textarea
                            placeholder="Detalhes para a clínica..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <SheetFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                    {editAppointment && (
                        <Button variant="destructive" size="sm" onClick={() => toast({ title: "Funcionalidade Mock: Deletar" })}>
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </Button>
                    )}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {editAppointment ? "Salvar Alterações" : "Agendar"}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
