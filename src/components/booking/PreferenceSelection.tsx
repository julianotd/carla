
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, User, Users, Monitor, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface PreferenceSelectionProps {
    service: any;
    onSelect: (therapist: any | null, mode: 'online' | 'presencial') => void;
    selectedTherapistId?: string | null;
    selectedMode?: 'online' | 'presencial';
}

export function PreferenceSelection({ service, onSelect, selectedTherapistId, selectedMode }: PreferenceSelectionProps) {
    const [mode, setMode] = useState<'online' | 'presencial'>(selectedMode || 'presencial');
    const [choiceType, setChoiceType] = useState<'any' | 'specific'>(selectedTherapistId ? 'specific' : 'any');
    const [specificTherapist, setSpecificTherapist] = useState<any | null>(null);

    // 1. Fetch Therapists who perform this service
    const { data: therapists, isLoading } = useQuery({
        queryKey: ["public", "therapists_for_service", service.id],
        queryFn: async () => {
            // First get linked therapist IDs
            const { data: links } = await (supabase
                .from("therapist_services" as any)
                .select("therapist_id")
                .eq("service_id", service.id)) as any;

            const linkedIds = links?.map(l => l.therapist_id) || [];

            if (linkedIds.length === 0) return [];

            // Then fetch therapist details
            const { data, error } = await supabase
                .from("therapists")
                .select("*")
                .in("id", linkedIds)
                .eq("is_active", true)
                .order("name");

            if (error) throw error;
            return data;
        },
    });

    const handleContinue = () => {
        if (choiceType === 'any') {
            onSelect(null, mode); // null means "First Available"
        } else {
            if (specificTherapist) {
                onSelect(specificTherapist, mode);
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Buscando profissionais disponíveis...</div>;

    if (therapists?.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">Nenhum profissional disponível para este serviço no momento.</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Mode Selection */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">1. Como você prefere ser atendido?</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div
                        className={cn(
                            "cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all hover:bg-muted/50",
                            mode === 'online' ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                        )}
                        onClick={() => setMode('online')}
                    >
                        <Monitor className="h-6 w-6 text-primary" />
                        <span className="font-medium">Online</span>
                    </div>
                    <div
                        className={cn(
                            "cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all hover:bg-muted/50",
                            mode === 'presencial' ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                        )}
                        onClick={() => setMode('presencial')}
                    >
                        <MapPin className="h-6 w-6 text-primary" />
                        <span className="font-medium">Presencial</span>
                    </div>
                </div>
            </div>

            {/* 2. Therapist Selection */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">2. Escolha o Profissional</h3>

                <RadioGroup value={choiceType} onValueChange={(v: any) => setChoiceType(v)} className="space-y-4">

                    {/* Option A: First Available */}
                    <div className={cn(
                        "flex items-center space-x-3 space-y-0 rounded-md border p-4 transition-all hover:bg-muted/50 cursor-pointer",
                        choiceType === 'any' ? "border-primary bg-primary/5" : ""
                    )} onClick={() => setChoiceType('any')}>
                        <RadioGroupItem value="any" id="any" />
                        <div className="flex-1">
                            <Label htmlFor="any" className="font-medium cursor-pointer">Qualquer Profissional (Agenda Inteligente)</Label>
                            <p className="text-sm text-muted-foreground">Encontraremos o primeiro horário disponível com qualquer terapeuta qualificado.</p>
                        </div>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Option B: Specific */}
                    <div className={cn(
                        "flex items-start space-x-3 space-y-0 rounded-md border p-4 transition-all hover:bg-muted/50 cursor-pointer",
                        choiceType === 'specific' ? "border-primary bg-primary/5" : ""
                    )} onClick={() => setChoiceType('specific')}>
                        <RadioGroupItem value="specific" id="specific" className="mt-1" />
                        <div className="flex-1 space-y-4">
                            <div>
                                <Label htmlFor="specific" className="font-medium cursor-pointer">Escolher Profissional Específico</Label>
                                <p className="text-sm text-muted-foreground">Veja a agenda de um terapeuta de sua preferência.</p>
                            </div>

                            {/* List of Therapists (Only if Specific is selected) */}
                            {choiceType === 'specific' && (
                                <div className="grid gap-3 pt-2">
                                    {therapists?.map((therapist) => (
                                        <div
                                            key={therapist.id}
                                            className={cn(
                                                "cursor-pointer flex items-center gap-3 p-3 rounded-md border bg-card hover:border-primary/50 transition-colors",
                                                specificTherapist?.id === therapist.id ? "border-primary bg-primary/10" : "border-border"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Avoid triggering parent click
                                                setChoiceType('specific');
                                                setSpecificTherapist(therapist);
                                            }}
                                        >
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarImage src={therapist.photo_url || ""} />
                                                <AvatarFallback><User /></AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-sm">{therapist.name}</p>
                                                    {specificTherapist?.id === therapist.id && <Check className="h-4 w-4 text-primary" />}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-1">{therapist.specialties?.join(", ")}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </RadioGroup>
            </div>

            <div className="pt-4 flex justify-end">
                <Button
                    size="lg"
                    onClick={handleContinue}
                    disabled={choiceType === 'specific' && !specificTherapist}
                >
                    Ver Horários Disponíveis
                </Button>
            </div>
        </div>
    );
}
