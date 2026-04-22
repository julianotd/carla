
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon } from "lucide-react";

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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";

type ServiceRow = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  slug: string | null;
  price_text: string | null;
  duration_min: number | null;
  cover_image_url: string | null;
  benefits: string[] | null;
  hover_text: string | null;
};

async function listServices(): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ServiceRow[];
}

export function ServicesAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({ queryKey: ["admin", "services"], queryFn: listServices });

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState(60);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [benefitsText, setBenefitsText] = useState("");
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [hoverText, setHoverText] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setSlug("");
    setPrice("");
    setDuration(60);
    setSortOrder(0);
    setIsActive(true);
    setImageUrl("");
    setBenefitsText("");
    setBenefitsList([]);
    setHoverText("");
  };

  const handleEdit = (s: ServiceRow) => {
    setEditingId(s.id);
    setTitle(s.title);
    setDescription(s.description);
    setSlug(s.slug || "");
    setPrice(s.price_text || "");
    setDuration(s.duration_min || 60);
    setSortOrder(s.sort_order);
    setIsActive(s.is_active);
    setImageUrl(s.cover_image_url || "");
    setBenefitsText("");
    setBenefitsList(s.benefits || []);
    setHoverText(s.hover_text || "");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title) return;
    setSaving(true);

    // Auto-generate slug if dry
    const finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const payload = {
      title: title.trim(),
      description: description.trim(),
      slug: finalSlug,
      price_text: price.trim() || null,
      duration_min: duration || null,
      sort_order: sortOrder,
      is_active: isActive,
      cover_image_url: imageUrl.trim() || null,
      benefits: benefitsList,
      hover_text: hoverText.trim() || null,
    };

    let error;
    if (editingId) {
      const res = await supabase.from("services").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("services").insert(payload);
      error = res.error;
    }

    setSaving(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: error.message });
      return;
    }

    setIsDialogOpen(false);
    resetForm();
    await qc.invalidateQueries({ queryKey: ["admin", "services"] });
    toast({ title: "Salvo com sucesso!" });
  };

  const toggleActive = async (id: string, next: boolean) => {
    const { error: updateError } = await supabase.from("services").update({ is_active: next }).eq("id", id);
    if (updateError) {
      toast({ variant: "destructive", title: "Erro", description: updateError.message });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin", "services"] });
  };

  const removeService = async (id: string) => {
    const ok = window.confirm("Remover este serviço? Não é possível desfazer.");
    if (!ok) return;
    const { error: delError } = await supabase.from("services").delete().eq("id", id);
    if (delError) {
      toast({ variant: "destructive", title: "Erro", description: delError.message });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin", "services"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Serviços</h2>
          <p className="text-muted-foreground">Gerencie os tratamentos oferecidos.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
            <DialogDescription>Preencha os dados do serviço.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Reiki" />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL) - opcional</Label>
                <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="reiki-passo-fundo" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição Padrão</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            </div>

            <div className="space-y-2">
              <Label className="text-energy-gold">Frase Sensorial Visível (Efeito Hover)</Label>
              <Input className="border-energy-gold/30" value={hoverText} onChange={e => setHoverText(e.target.value)} placeholder="Ex: O toque que acalma e reposiciona sua estrutura" />
            </div>

            <div className="space-y-2">
              <Label>Benefícios do Tratamento</Label>
              <div className="flex gap-2">
                <Input
                  value={benefitsText}
                  onChange={e => setBenefitsText(e.target.value)}
                  placeholder="Digite um benefício e clique em adicionar"
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (benefitsText.trim()) {
                        setBenefitsList(prev => [...prev, benefitsText.trim()]);
                        setBenefitsText("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (benefitsText.trim()) {
                      setBenefitsList(prev => [...prev, benefitsText.trim()]);
                      setBenefitsText("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {benefitsList.map((b, i) => (
                  <div key={i} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <span>{b}</span>
                    <button
                      type="button"
                      onClick={() => setBenefitsList(prev => prev.filter((_, idx) => idx !== i))}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {benefitsList.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Nenhum benefício adicionado.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Preço (Texto)</Label>
                <Input value={price} onChange={e => setPrice(e.target.value)} placeholder="R$ 150,00" />
              </div>
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Capa do Serviço (Upload)</Label>
              <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  folder="services"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Serviço Ativo (visível no site)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((s) => (
          <Card key={s.id} className="overflow-hidden transition-all hover:shadow-md">
            {s.cover_image_url && (
              <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url(${s.cover_image_url})` }} />
            )}
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold line-clamp-1">{s.title}</CardTitle>
                <Switch checked={s.is_active} onCheckedChange={(v) => toggleActive(s.id, v)} />
              </div>
              <CardDescription className="line-clamp-2 min-h-[40px]">{s.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span>{s.duration_min} min</span>
                <span>{s.price_text || "Preço sob consulta"}</span>
                <span>Pos: {s.sort_order}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(s)}>
                  <Pencil className="mr-2 h-3 w-3" /> Editar
                </Button>
                <Button variant="destructive" size="sm" className="w-10 px-0" onClick={() => removeService(s.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div >
  );
}
