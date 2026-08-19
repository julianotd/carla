
import { useState } from "react";
import { Loader2, Phone, User, Clock, MessageSquare, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { sanitizeText, isValidPhone, isBotSubmission } from "@/lib/security";

interface ClientFormProps {
    bookingData: {
        service: any;
        therapist: any;
        mode?: string;
    };
    onSubmit: (clientData: any) => Promise<void>;
    onBack: () => void;
}

export function ClientForm({ bookingData, onSubmit, onBack }: ClientFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        notes: "",
        website_hp: "" // Honeypot anti-bot trap
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Anti-Bot Honeypot Check
        if (isBotSubmission(formData.website_hp)) {
            console.warn("Submissão de bot descartada silenciosamente.");
            setFormData({ name: "", phone: "", notes: "", website_hp: "" });
            return;
        }

        // 2. Input Sanitization
        const sanitizedName = sanitizeText(formData.name, 100);
        const sanitizedPhone = sanitizeText(formData.phone, 30);
        const sanitizedNotes = sanitizeText(formData.notes, 500);

        if (!sanitizedName || !sanitizedPhone) {
            toast({ variant: "destructive", title: "Preencha os campos obrigatórios" });
            return;
        }

        if (!isValidPhone(sanitizedPhone)) {
            toast({ variant: "destructive", title: "Telefone inválido", description: "Informe um número de WhatsApp com DDD válido." });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                name: sanitizedName,
                phone: sanitizedPhone,
                notes: sanitizedNotes
            });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro ao solicitar", description: "Tente novamente." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const service = bookingData.service;
    const therapistName = bookingData.therapist?.name || "Carla Schmitt (Geral)";

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold">Seus Dados de Contato</h3>
                    <p className="text-sm text-muted-foreground">Informe seus dados para a Carla/equipe combinar seu horário.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Anti-Bot Honeypot Field (Invisível para usuários humanos) */}
                    <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                        <input
                            type="text"
                            name="website_hp"
                            tabIndex={-1}
                            autoComplete="off"
                            value={formData.website_hp}
                            onChange={e => setFormData(prev => ({ ...prev, website_hp: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Seu Nome Completo *</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Maria Silva"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Seu WhatsApp / Telefone *</Label>
                        <Input
                            id="phone"
                            placeholder="(54) 99999-9999"
                            value={formData.phone}
                            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Preferência de Dias / Horários (Opcional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Ex: Prefiro terças-feiras à tarde ou sábados pela manhã..."
                            value={formData.notes}
                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                            Voltar
                        </Button>
                        <Button type="submit" className="flex-1 bg-energy-gold text-ink hover:bg-energy-gold/90 font-medium" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Gerando Mensagem...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="mr-2 h-4 w-4" /> Solicitar via WhatsApp
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <Card className="h-fit bg-muted/30 border-energy-gold/20">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Resumo da Solicitação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-energy-gold/10 flex items-center justify-center text-energy-gold">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tratamento</p>
                            <p className="font-semibold text-base">{service?.title}</p>
                            <p className="text-xs text-muted-foreground">{service?.duration_min || 60} min • {service?.price_text || "Valor a consultar"}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-energy-gold/10 flex items-center justify-center text-energy-gold">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Terapeuta</p>
                            <p className="font-semibold">{therapistName}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-energy-gold/10 flex items-center justify-center text-energy-gold">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Modalidade Escolhida</p>
                            <p className="font-semibold capitalize text-energy-gold">
                                {bookingData.mode === 'online' ? 'Online via Vídeo' : 'Presencial em Passo Fundo - RS'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
