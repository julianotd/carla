
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Trash2, Clock } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const DAYS = [
    { id: 0, label: "Domingo" },
    { id: 1, label: "Segunda-feira" },
    { id: 2, label: "Terça-feira" },
    { id: 3, label: "Quarta-feira" },
    { id: 4, label: "Quinta-feira" },
    { id: 5, label: "Sexta-feira" },
    { id: 6, label: "Sábado" },
];

export function AvailabilityAdmin() {
    const { toast } = useToast();
    const qc = useQueryClient();
    const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);

    // 1. Fetch Therapists
    const { data: therapists } = useQuery({
        queryKey: ["admin", "therapists"],
        queryFn: async () => {
            const { data, error } = await supabase.from("therapists").select("id, name");
            if (error) throw error;
            return data;
        },
    });

    // 2. Fetch Rules for selected therapist
    const { data: rules, isLoading: isLoadingRules } = useQuery({
        queryKey: ["admin", "availability", selectedTherapistId],
        enabled: !!selectedTherapistId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("availability_rules")
                .select("*")
                .eq("therapist_id", selectedTherapistId!);
            if (error) throw error;
            if (error) throw error;
            return data as any[];
        },
    });

    // Set default selection
    useEffect(() => {
        if (therapists && therapists.length > 0 && !selectedTherapistId) {
            setSelectedTherapistId(therapists[0].id);
        }
    }, [therapists, selectedTherapistId]);

    // Mutation to save rules
    const saveMutation = useMutation({
        mutationFn: async (newRules: any[]) => {
            // First delete existing for this therapist (simple replace strategy for MVP)
            // Or upsert? Upsert is better but we might delete days.
            // Let's delete all for this therapist and re-insert.
            if (!selectedTherapistId) return;

            const { error: delError } = await supabase
                .from("availability_rules")
                .delete()
                .eq("therapist_id", selectedTherapistId);

            if (delError) throw delError;

            if (newRules.length > 0) {
                const { error: insError } = await supabase
                    .from("availability_rules")
                    .insert(newRules.map(r => ({ ...r, therapist_id: selectedTherapistId })));
                if (insError) throw insError;
            }
        },
        onSuccess: () => {
            toast({ title: "Disponibilidade salva!" });
            qc.invalidateQueries({ queryKey: ["admin", "availability", selectedTherapistId] });
        },
        onError: (err) => {
            toast({ variant: "destructive", title: "Erro ao salvar", description: err.message });
        }
    });

    // Local state for form
    const [formRules, setFormRules] = useState<any[]>([]);

    useEffect(() => {
        if (rules) {
            setFormRules(rules.map(r => ({
                day_of_week: r.day_of_week,
                start_time: r.start_time.slice(0, 5), // HH:MM
                end_time: r.end_time.slice(0, 5),
                mode: r.mode || "both"
            })));
        } else {
            setFormRules([]);
        }
    }, [rules]);

    const handleUpdateDay = (dayId: number, active: boolean, start?: string, end?: string, mode?: string) => {
        setFormRules(prev => {
            const exists = prev.find(r => r.day_of_week === dayId);

            if (!active) {
                // Remove
                return prev.filter(r => r.day_of_week !== dayId);
            }

            if (exists) {
                // Update
                return prev.map(r => r.day_of_week === dayId ? {
                    ...r,
                    start_time: start ?? r.start_time,
                    end_time: end ?? r.end_time,
                    mode: mode ?? r.mode
                } : r);
            } else {
                // Add default
                return [...prev, { day_of_week: dayId, start_time: start || "09:00", end_time: end || "18:00", mode: mode || "both" }];
            }
        });
    };

    const handleSave = () => {
        saveMutation.mutate(formRules);
    };

    // --- BLOCKS SECTION ---
    const { data: blocks } = useQuery({
        queryKey: ["admin", "blocks", selectedTherapistId],
        enabled: !!selectedTherapistId,
        queryFn: async () => {
            const { data, error } = await (supabase
                .from("availability_blocks" as any)
                .select("*")
                .eq("therapist_id", selectedTherapistId!)
                .gte("ends_at", new Date().toISOString()) // Only future/current blocks
                .order("starts_at", { ascending: true })) as any;
            if (error) throw error;
            return data;
        },
    });

    const [blockStart, setBlockStart] = useState("");
    const [blockEnd, setBlockEnd] = useState("");
    const [blockReason, setBlockReason] = useState("");

    const addBlockMutation = useMutation({
        mutationFn: async () => {
            if (!selectedTherapistId || !blockStart || !blockEnd) return;
            const { error } = await (supabase.from("availability_blocks" as any).insert({
                therapist_id: selectedTherapistId,
                starts_at: new Date(blockStart).toISOString(),
                ends_at: new Date(blockEnd).toISOString(),
                reason: blockReason
            }) as any);
            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: "Bloqueio adicionado" });
            setBlockStart("");
            setBlockEnd("");
            setBlockReason("");
            qc.invalidateQueries({ queryKey: ["admin", "blocks", selectedTherapistId] });
        },
        onError: (e) => toast({ variant: "destructive", title: "Erro", description: e.message })
    });

    const deleteBlockMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase.from("availability_blocks" as any).delete().eq("id", id) as any);
            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: "Bloqueio removido" });
            qc.invalidateQueries({ queryKey: ["admin", "blocks", selectedTherapistId] });
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Configuração de Horários</h2>

                <div className="flex items-center gap-2">
                    <Label>Terapeuta:</Label>
                    <Select value={selectedTherapistId || ""} onValueChange={setSelectedTherapistId}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {therapists?.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Horários Semanais Recorrentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {DAYS.map((day) => {
                        const rule = formRules.find(r => r.day_of_week === day.id);
                        const isActive = !!rule;

                        return (
                            <div key={day.id} className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-4">
                                    <Switch
                                        checked={isActive}
                                        onCheckedChange={(checked) => handleUpdateDay(day.id, checked)}
                                    />
                                    <div className="w-24 font-medium">{day.label}</div>
                                </div>

                                {isActive ? (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="time"
                                                className="w-24"
                                                value={rule.start_time}
                                                onChange={(e) => handleUpdateDay(day.id, true, e.target.value, undefined)}
                                            />
                                            <span>às</span>
                                            <Input
                                                type="time"
                                                className="w-24"
                                                value={rule.end_time}
                                                onChange={(e) => handleUpdateDay(day.id, true, undefined, e.target.value)}
                                            />
                                        </div>
                                        <Select
                                            value={rule.mode}
                                            onValueChange={(val) => handleUpdateDay(day.id, true, undefined, undefined, val)}
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="both">Híbrido</SelectItem>
                                                <SelectItem value="online">Online</SelectItem>
                                                <SelectItem value="presencial">Presencial</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <Badge variant="outline" className="text-muted-foreground">Indisponível</Badge>
                                )}
                            </div>
                        );
                    })}

                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleSave} disabled={saveMutation.isPending}>
                            <Save className="mr-2 h-4 w-4" />
                            {saveMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* BLOCKS SECTION */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Bloqueios de Agenda (Férias/Feriados)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-md bg-muted/20">
                        <div className="space-y-2">
                            <Label>Início</Label>
                            <Input type="datetime-local" value={blockStart} onChange={e => setBlockStart(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Fim</Label>
                            <Input type="datetime-local" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Motivo</Label>
                            <Input value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="Ex: Férias" />
                        </div>
                        <Button onClick={() => addBlockMutation.mutate()} disabled={addBlockMutation.isPending}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Bloqueio
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {blocks?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum bloqueio futuro.</p>}
                        {blocks?.map(block => (
                            <div key={block.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
                                <div>
                                    <p className="font-medium">{block.reason || "Sem motivo"}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(block.starts_at).toLocaleString()} - {new Date(block.ends_at).toLocaleString()}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => deleteBlockMutation.mutate(block.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
