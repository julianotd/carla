
import { useState } from "react";
import { format, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getGoogleCalendarUrl, getOutlookCalendarUrl, getICalUrl } from "@/lib/calendar";

import { ServiceSelection } from "./ServiceSelection";
import { PreferenceSelection } from "./PreferenceSelection";
import { TimeSelection } from "./TimeSelection";
import { ClientForm } from "./ClientForm";

const WHATSAPP_NUMBER = "5554999999999"; // Replace with real number or therapist number

export type BookingData = {
    service: any | null;
    therapist: any | null;
    date: Date | null;
    mode: 'online' | 'presencial' | null;
};

export function BookingWizard() {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<BookingData>({
        service: null,
        therapist: null,
        date: null,
        mode: null
    });
    const [completed, setCompleted] = useState(false);
    const { toast } = useToast();

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleServiceSelect = (service: any) => {
        setData(prev => ({ ...prev, service }));
        nextStep();
    };

    const handlePreferenceSelect = (therapist: any | null, mode: 'online' | 'presencial') => {
        setData(prev => ({ ...prev, therapist, mode }));
        nextStep();
    };

    const handleTimeSelect = (date: Date) => {
        setData(prev => ({ ...prev, date }));
        nextStep();
    };

    const handleSubmit = async (clientData: any) => {
        if (!data.service || !data.date || !data.mode) return;
        // Therapist can be null if validation allows, but we probably assigned one in TimeSelection?
        // Wait, if "Any" was selected, TimeSelection should have returned a specific therapist for the selected SLOT?
        // If TimeSelection aggregates slots, the selected slot MUST belong to a therapist.
        // So onSelect in TimeSelection should probably return (date, therapistId).
        // But currently onSelect(date) only updates date.
        // Issue: If we support "Any", TimeSelection must tell us WHO was selected.
        // I will need to update TimeSelection signature to onSelect(date, therapistId?)

        const therapistId = data.therapist?.id; // If specific was chosen
        // If "Any" was chosen, we MUST know which therapist corresponds to the chosen time.
        // Let's assume TimeSelection will fail if I don't update it to pass therapist back.
        // For now, I update BookingWizard assuming TimeSelection handles it, but I need to update TimeSelection to pass therapist back.

        if (!therapistId) {
            toast({ variant: "destructive", title: "Erro", description: "Terapeuta não identificado para o horário." });
            return;
        }

        const startsAt = data.date;
        const endsAt = addMinutes(startsAt, data.service.duration_min || 60);

        // 1. Save to Database
        const { error } = await supabase.from("appointments").insert({
            service_id: data.service.id,
            therapist_id: therapistId,
            client_name: clientData.name,
            client_phone: clientData.phone,
            starts_at: startsAt.toISOString(),
            ends_at: endsAt.toISOString(),
            notes: clientData.notes,
            status: "pending",
            mode: data.mode
        });

        if (error) throw error;

        setCompleted(true);

        // 2. Redirect/Link to WhatsApp
        const message = `Olá! Gostaria de confirmar meu agendamento:
*Serviço:* ${data.service.title}
*Profissional:* ${data.therapist.name}
*Data:* ${format(startsAt, "dd/MM 'às' HH:mm")}
*Modalidade:* ${data.mode}
*Cliente:* ${clientData.name}`;

        const waLink = `https://wa.me/${data.therapist.contact_whatsapp?.replace(/\D/g, '') || WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        // Open in new tab
        window.open(waLink, '_blank');
    };

    if (completed) {
        return (
            <Card className="text-center py-12">
                <CardContent className="space-y-6">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Solicitação Enviada!</h2>
                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                            Seu agendamento foi registrado. Se o WhatsApp não abriu automaticamente, clique no botão abaixo.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 justify-center sm:flex-row">
                        <Button size="lg" className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white" onClick={() => {
                            const startsAt = data.date!;
                            const message = `Olá! Gostaria de confirmar meu agendamento:
*Serviço:* ${data.service.title}
*Profissional:* ${data.therapist.name}
*Data:* ${format(startsAt, "dd/MM 'às' HH:mm")}
*Modalidade:* ${data.mode}
`;
                            const waLink = `https://wa.me/${data.therapist.contact_whatsapp?.replace(/\D/g, '') || WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
                            window.open(waLink, '_blank');
                        }}>
                            Abrir WhatsApp
                        </Button>
                    </div>

                    <div className="pt-6 border-t">
                        <p className="text-sm font-medium text-muted-foreground mb-4">Adicionar ao Calendário</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Button variant="outline" size="sm" onClick={() => {
                                const event = {
                                    title: `Sessão: ${data.service.title} (${data.mode})`,
                                    description: `Profissional: ${data.therapist.name}`,
                                    startsAt: data.date!,
                                    durationMin: data.service.duration_min || 60,
                                    location: data.mode === 'online' ? "Online" : "Clínica Além da Pele"
                                };
                                window.open(getGoogleCalendarUrl(event), '_blank');
                            }}>
                                Google
                            </Button>
                            {/* ... Outlook/iCal omitted for brevity if needed ... */}
                        </div>
                    </div>

                    <Button variant="link" onClick={() => window.location.href = "/"}>
                        Voltar ao Início
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-none shadow-none md:border md:shadow-sm">
            <CardContent className="p-0">
                <div className="bg-muted/50 px-6 py-4 border-b">
                    <div className="flex items-center justify-between text-sm text-foreground/80">
                        <span className="font-medium">Passo {step} de 4</span>
                        {step > 1 && (
                            <Button variant="ghost" size="sm" onClick={prevStep} className="h-8">
                                Voltar
                            </Button>
                        )}
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-in-out"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {step === 1 && "Escolha o Serviço"}
                        {step === 2 && "Escolha Profissional e Local"}
                        {step === 3 && "Escolha o Horário"}
                        {step === 4 && "Finalize o Agendamento"}
                    </p>
                </div>

                <div className="p-4 md:p-8 min-h-[400px]">
                    {step === 1 && <ServiceSelection onSelect={handleServiceSelect} selectedId={data.service?.id} />}
                    {step === 2 && <PreferenceSelection service={data.service} onSelect={handlePreferenceSelect} selectedTherapistId={data.therapist?.id} selectedMode={data.mode || undefined} />}
                    {step === 3 && (
                        <TimeSelection
                            therapist={data.therapist}
                            service={data.service}
                            mode={data.mode}
                            onSelect={(date, therapist) => {
                                // If TimeSelection returns a specific therapist (e.g. from "Any" pool), update state
                                if (therapist) setData(prev => ({ ...prev, therapist }));
                                setData(prev => ({ ...prev, date }));
                                nextStep();
                            }}
                            selectedDate={data.date}
                        />
                    )}
                    {step === 4 && <ClientForm bookingData={data as any} onSubmit={handleSubmit} onBack={prevStep} />}
                </div>
            </CardContent>
        </Card>
    );
}
