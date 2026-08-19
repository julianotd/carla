
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, MessageSquare, Sparkles, MapPin, CalendarDays, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { ServiceSelection } from "./ServiceSelection";
import { PreferenceSelection } from "./PreferenceSelection";
import { ClientForm } from "./ClientForm";

const WHATSAPP_NUMBER = "5554999999999";

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
        mode: 'presencial'
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

    const handleSubmit = async (clientData: any) => {
        if (!data.service) return;

        const therapistName = data.therapist?.name || "Carla Schmitt";
        const therapistWhatsapp = data.therapist?.contact_whatsapp?.replace(/\D/g, '') || WHATSAPP_NUMBER;

        // 1. Record pending request in database for admin visibility
        try {
            await supabase.from("appointments").insert({
                service_id: data.service.id,
                therapist_id: data.therapist?.id || null,
                client_name: clientData.name,
                client_phone: clientData.phone,
                starts_at: new Date().toISOString(),
                ends_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                notes: `[SOLICITAÇÃO DE AGENDAMENTO VIA SITE] Preferred period: ${clientData.notes || 'A combinar'}. Mode: ${data.mode}`,
                status: "pending",
                mode: data.mode || 'presencial'
            });
        } catch (e) {
            console.log("Recorded request locally", e);
        }

        setCompleted(true);

        // 2. Open WhatsApp directly to Carla / Therapist
        const message = `Olá, ${therapistName}! Gostaria de solicitar um agendamento no Além da Pele:
• *Tratamento:* ${data.service.title}
• *Modalidade:* ${data.mode === 'online' ? 'Online via Vídeo' : 'Presencial (Passo Fundo - RS)'}
• *Meu Nome:* ${clientData.name}
• *Telefone:* ${clientData.phone}
${clientData.notes ? `• *Preferência de horário:* ${clientData.notes}` : ''}

Podemos combinar o melhor dia e horário?`;

        const waLink = `https://wa.me/${therapistWhatsapp}?text=${encodeURIComponent(message)}`;
        window.open(waLink, '_blank');
    };

    if (completed) {
        return (
            <Card className="text-center py-10 px-4 border-energy-gold/30 bg-card shadow-lg animate-in zoom-in-95 duration-300">
                <CardContent className="space-y-6 max-w-xl mx-auto">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-energy-gold/10 border-2 border-energy-gold/30 text-energy-gold shadow-[0_0_25px_rgba(200,169,106,0.3)]">
                        <CheckCircle2 className="h-10 w-10 text-energy-gold" />
                    </div>
                    <div>
                        <span className="font-mono text-xs uppercase tracking-widest text-energy-gold block mb-1">
                            Solicitação Enviada!
                        </span>
                        <h2 className="text-2xl font-bold font-display">Sua mensagem foi gerada com sucesso</h2>
                        <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto font-light leading-relaxed">
                            Carla ou nossa equipe de atendimento combinará diretamente com você a melhor data e horário para a sua sessão.
                        </p>
                    </div>

                    <div className="bg-muted/40 border border-border p-4 rounded-xl text-left space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Tratamento Desejado:</span>
                            <span className="font-semibold text-foreground">{data.service?.title}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Profissional:</span>
                            <span className="font-semibold text-foreground">{data.therapist?.name || "Carla Schmitt"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Modalidade:</span>
                            <span className="font-semibold text-energy-gold capitalize">
                                {data.mode === 'online' ? 'Online' : 'Presencial (Passo Fundo - RS)'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 justify-center sm:flex-row pt-2">
                        <Button size="lg" className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full font-medium shadow-md" onClick={() => {
                            const therapistName = data.therapist?.name || "Carla Schmitt";
                            const therapistWhatsapp = data.therapist?.contact_whatsapp?.replace(/\D/g, '') || WHATSAPP_NUMBER;
                            const message = `Olá, ${therapistName}! Gostaria de agendar a sessão de *${data.service?.title}* (${data.mode}).`;
                            const waLink = `https://wa.me/${therapistWhatsapp}?text=${encodeURIComponent(message)}`;
                            window.open(waLink, '_blank');
                        }}>
                            <MessageSquare className="w-5 h-5" /> Abrir WhatsApp Agora
                        </Button>
                    </div>

                    <Button variant="link" onClick={() => window.location.href = "/"} className="text-xs text-muted-foreground hover:text-energy-gold">
                        ← Voltar ao Início do Site
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-none shadow-none md:border md:shadow-sm rounded-2xl">
            <CardContent className="p-0">
                <div className="bg-muted/40 px-6 py-5 border-b">
                    <div className="flex items-center justify-between text-sm text-foreground/80">
                        <span className="font-mono text-xs uppercase tracking-wider font-semibold text-energy-gold">
                            Passo {step} de 3
                        </span>
                        {step > 1 && (
                            <Button variant="ghost" size="sm" onClick={prevStep} className="h-8 text-xs">
                                ← Voltar
                            </Button>
                        )}
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-energy-gold/10">
                        <div
                            className="h-full bg-energy-gold transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(200,169,106,0.5)]"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-1.5">
                        {step === 1 && "1. Escolha o Tratamento de Interesse"}
                        {step === 2 && "2. Escolha o Profissional e Modalidade"}
                        {step === 3 && "3. Seus Dados para Agendar com a Carla"}
                    </p>
                </div>

                <div className="p-4 md:p-8 min-h-[400px]">
                    {step === 1 && <ServiceSelection onSelect={handleServiceSelect} selectedId={data.service?.id} />}
                    {step === 2 && <PreferenceSelection service={data.service} onSelect={handlePreferenceSelect} selectedTherapistId={data.therapist?.id} selectedMode={data.mode || undefined} />}
                    {step === 3 && <ClientForm bookingData={data as any} onSubmit={handleSubmit} onBack={prevStep} />}
                </div>
            </CardContent>
        </Card>
    );
}
