import { BestSlot } from "@/lib/agenda/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Clock, Zap, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SmartSuggestionsProps {
    slots: BestSlot[];
    onSelect: (slot: BestSlot) => void;
    isLoading?: boolean;
}

export function SmartSuggestions({ slots, onSelect, isLoading }: SmartSuggestionsProps) {
    if (isLoading) {
        return <div className="text-sm text-muted-foreground animate-pulse">Buscando melhores horários...</div>;
    }

    if (slots.length === 0) return null;

    return (
        <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-medium text-foreground">Sugestões Inteligentes</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {slots.map((slot, idx) => {
                    const startDate = parseISO(slot.start_at);

                    let badge = null;
                    let icon = null;

                    switch (slot.reason) {
                        case "earliest":
                            badge = <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 hover:bg-green-100">Mais Cedo</Badge>;
                            icon = <Clock className="h-3 w-3 text-green-600" />;
                            break;
                        case "best_fit":
                            badge = <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-800 hover:bg-blue-100">Melhor Encaixe</Badge>;
                            icon = <Zap className="h-3 w-3 text-blue-600" />;
                            break;
                        case "alternate_therapist":
                            badge = <Badge variant="outline" className="text-[10px]">Outro Profissional</Badge>;
                            icon = <User className="h-3 w-3 text-muted-foreground" />;
                            break;
                        default:
                            badge = <Badge variant="outline" className="text-[10px]">Sugestão</Badge>;
                    }

                    return (
                        <Card
                            key={`${slot.therapist_id}-${slot.start_at}`}
                            className="p-3 cursor-pointer hover:border-primary transition-all hover:bg-accent/5"
                            onClick={() => onSelect(slot)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                {badge}
                                {icon}
                            </div>
                            <div className="text-sm font-semibold">
                                {format(startDate, "EEE, dd/MM", { locale: ptBR })}
                            </div>
                            <div className="text-lg font-bold text-primary">
                                {format(startDate, "HH:mm")}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
