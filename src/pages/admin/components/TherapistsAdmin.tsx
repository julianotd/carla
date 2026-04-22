
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Save, X, User } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";

type TherapistRow = {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    specialties: string[] | null;
    photo_url: string | null;
    contact_whatsapp: string | null;
    social_url: string | null;
    is_active: boolean;
};

async function listTherapists(): Promise<TherapistRow[]> {
    const { data, error } = await supabase
        .from("therapists")
        .select("*")
        .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as TherapistRow[];
}

export function TherapistsAdmin() {
    const qc = useQueryClient();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { data, isLoading } = useQuery({ queryKey: ["admin", "therapists"], queryFn: listTherapists });

    // Fetch Services for linking
    const { data: services } = useQuery({
        queryKey: ["admin", "services_list"],
        queryFn: async () => {
            const { data, error } = await supabase.from("services").select("id, title").eq("is_active", true).order("sort_order");
            if (error) throw error;
            return data;
        }
    });

    // Fetch linked services for editing
    const { data: linkedServices } = useQuery({
        queryKey: ["admin", "therapist_services", editingId],
        enabled: !!editingId,
        queryFn: async () => {
            const { data, error } = await (supabase
                .from("therapist_services" as any)
                .select("service_id")
                .eq("therapist_id", editingId!)) as any;
            if (error) throw error;
            return data?.map(d => d.service_id) || [];
        }
    });

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [bio, setBio] = useState("");
    const [specialties, setSpecialties] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [socialUrl, setSocialUrl] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Update selected services when linkedServices changes
    useMemo(() => {
        if (linkedServices) {
            setSelectedServices(linkedServices);
        } else {
            setSelectedServices([]);
        }
    }, [linkedServices]);

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setSlug("");
        setBio("");
        setSpecialties("");
        setPhotoUrl("");
        setWhatsapp("");
        setSocialUrl("");
        setIsActive(true);
        setSelectedServices([]);
    };

    const handleEdit = (t: TherapistRow) => {
        setEditingId(t.id);
        setName(t.name);
        setSlug(t.slug);
        setBio(t.bio || "");
        setSpecialties((t.specialties || []).join(", "));
        setPhotoUrl(t.photo_url || "");
        setWhatsapp(t.contact_whatsapp || "");
        setSocialUrl(t.social_url || "");
        setIsActive(t.is_active);
        // selectedServices will be populated by useQuery + useMemo
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!name || !slug) return;
        setSaving(true);

        // Parse specialties
        const specsArray = specialties.split(",").map(s => s.trim()).filter(s => s.length > 0);

        const payload = {
            name: name.trim(),
            slug: slug.trim(),
            bio: bio.trim() || null,
            specialties: specsArray.length > 0 ? specsArray : null,
            photo_url: photoUrl.trim() || null,
            contact_whatsapp: whatsapp.trim() || null,
            social_url: socialUrl.trim() || null,
            is_active: isActive,
        };

        let error;
        let newId = editingId;

        if (editingId) {
            const res = await supabase.from("therapists").update(payload).eq("id", editingId);
            error = res.error;
        } else {
            const res = await supabase.from("therapists").insert(payload).select().single();
            error = res.error;
            if (res.data) newId = res.data.id;
        }

        if (error) {
            setSaving(false);
            toast({ variant: "destructive", title: "Erro ao salvar", description: error.message });
            return;
        }

        // Save Services Link
        if (newId) {
            // Delete existing
            await (supabase.from("therapist_services" as any).delete().eq("therapist_id", newId) as any);

            // Insert new
            if (selectedServices.length > 0) {
                const servicesPayload = selectedServices.map(sid => ({
                    therapist_id: newId,
                    service_id: sid
                }));
                const { error: sError } = await (supabase.from("therapist_services" as any).insert(servicesPayload) as any);
                if (sError) console.error("Error saving services", sError);
            }
        }

        setSaving(false);
        setIsDialogOpen(false);
        resetForm();
        await qc.invalidateQueries({ queryKey: ["admin", "therapists"] });
        toast({ title: "Salvo com sucesso!" });
    };

    const toggleActive = async (id: string, next: boolean) => {
        const { error } = await (supabase.from("therapists").update({ is_active: next } as any).eq("id", id));
        if (error) {
            toast({ variant: "destructive", title: "Erro", description: error.message });
            return;
        }
        await qc.invalidateQueries({ queryKey: ["admin", "therapists"] });
    };

    const removeTherapist = async (id: string) => {
        if (!window.confirm("Remover este terapeuta?")) return;
        const { error } = await supabase.from("therapists").delete().eq("id", id);
        if (error) {
            toast({ variant: "destructive", title: "Erro", description: error.message });
            return;
        }
        await qc.invalidateQueries({ queryKey: ["admin", "therapists"] });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Terapeutas</h2>
                    <p className="text-muted-foreground">Equipe de profissionais.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Terapeuta
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Editar Terapeuta" : "Novo Terapeuta"}</DialogTitle>
                        <DialogDescription>
                            Preencha os dados do terapeuta abaixo. Clique em salvar quando terminar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome Completo</Label>
                                <Input value={name} onChange={e => {
                                    setName(e.target.value);
                                    if (!editingId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                                }} placeholder="Dra. Fulana" />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (URL)</Label>
                                <Input value={slug} onChange={e => setSlug(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Bio/Descrição</Label>
                            <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} />
                        </div>

                        <div className="space-y-2">
                            <Label>Especialidades (separadas por vírgula)</Label>
                            <Input value={specialties} onChange={e => setSpecialties(e.target.value)} placeholder="Psicologia, Reiki, Massagem" />
                        </div>

                        {/* Services Management */}
                        <div className="space-y-2 border p-4 rounded-md">
                            <Label>Serviços Atendidos</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                {services?.map(s => (
                                    <div key={s.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`srv-${s.id}`}
                                            checked={selectedServices.includes(s.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedServices(prev => [...prev, s.id]);
                                                } else {
                                                    setSelectedServices(prev => prev.filter(id => id !== s.id));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`srv-${s.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {s.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>WhatsApp (apenas números)</Label>
                                    <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5511999999999" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Perfil Social (URL: Instagram, LinkedIn, etc)</Label>
                                    <Input value={socialUrl} onChange={e => setSocialUrl(e.target.value)} placeholder="https://instagram.com/..." />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label>Foto do Terapeuta</Label>
                                <ImageUpload
                                    value={photoUrl}
                                    onChange={setPhotoUrl}
                                    folder="therapists"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch checked={isActive} onCheckedChange={setIsActive} />
                            <Label>Ativo</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data?.map((t) => (
                    <Card key={t.id} className="overflow-hidden">
                        <div className="flex p-4 gap-4">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-secondary">
                                {t.photo_url ? (
                                    <img src={t.photo_url} alt={t.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <User className="h-8 w-8" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{t.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">
                                    {(t.specialties || []).join(", ")}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Switch checked={t.is_active} onCheckedChange={(v) => toggleActive(t.id, v)} className="scale-75 origin-left" />
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-4 pt-0 flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(t)}>
                                <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => removeTherapist(t.id)}>
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
