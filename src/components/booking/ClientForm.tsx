
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Phone, User, Calendar as CalendarIcon, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClientFormProps {
    bookingData: {
        service: any;
        therapist: any;
        date: Date;
    };
    onSubmit: (clientData: any) => Promise<void>;
    onBack: () => void;
}

export function ClientForm({ bookingData, onSubmit, onBack }: ClientFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        notes: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            toast({ variant: "destructive", title: "Preencha os campos obrigatórios" });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro ao agendar", description: "Tente novamente." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const { service, therapist, date } = bookingData;

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold">Seus Dados</h3>
                    <p className="text-sm text-muted-foreground">Preencha para confirmarmos seu agendamento.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Maria Silva"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">WhatsApp / Telefone</Label>
                        <Input
                            id="phone"
                            placeholder="(54) 99999-9999"
                            value={formData.phone}
                            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Observações (Opcional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Alguma restrição ou dúvida?"
                            value={formData.notes}
                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                            Voltar
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Confirmando...
                                </>
                            ) : (
                                "Confirmar Agendamento"
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <Card className="h-fit bg-muted/30">
                <CardHeader>
                    <CardTitle>Resumo do Agendamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Serviço</p>
                            <p className="font-semibold text-lg">{service.title}</p>
                            <p className="text-xs text-muted-foreground">{service.duration_min} min • {service.price_text}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Profissional</p>
                            <p className="font-semibold">{therapist.name}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Data e Hora</p>
                            <p className="font-semibold capitalize">{format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
                            <p className="text-lg font-bold text-primary">{format(date, "HH:mm")}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
