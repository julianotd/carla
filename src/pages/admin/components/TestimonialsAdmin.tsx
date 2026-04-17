
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Quote, Star } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function TestimonialsAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
      if (error) throw error;
      return data as any[];
    }
  });

  const [clientName, setClientName] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [photoUrl, setPhotoUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setClientName("");
    setRoleLabel("");
    setQuote("");
    setRating(5);
    setPhotoUrl("");
    setSortOrder(0);
    setIsActive(true);
  }

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setClientName(t.client_name || "");
    setRoleLabel(t.role_label || "");
    setQuote(t.quote);
    setRating(t.rating || 5);
    setPhotoUrl(t.photo_url || "");
    setSortOrder(t.sort_order || 0);
    setIsActive(t.is_active);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!quote) return;
    setSaving(true);

    const payload = {
      client_name: clientName,
      role_label: roleLabel,
      quote,
      rating,
      photo_url: photoUrl,
      sort_order: sortOrder,
      is_active: isActive
    };

    let error;
    if (editingId) {
      const res = await supabase.from("testimonials").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("testimonials").insert(payload);
      error = res.error;
    }
    setSaving(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      setIsDialogOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      toast({ title: "Salvo!" });
    }
  };

  const removeTestimonial = async (id: string) => {
    if (!confirm("Remover depoimento?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) toast({ variant: "destructive", description: error.message });
    else qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Depoimentos</h2>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Novo Depoimento</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Depoimento</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Nome do Cliente</Label><Input value={clientName} onChange={e => setClientName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Função/Título (ex: Paciente)</Label><Input value={roleLabel} onChange={e => setRoleLabel(e.target.value)} /></div>
            <div className="space-y-2"><Label>Depoimento</Label><Textarea value={quote} onChange={e => setQuote(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Avaliação (1-5)</Label><Input type="number" max={5} min={1} value={rating} onChange={e => setRating(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} /></div>
            </div>
            <div className="space-y-2"><Label>Foto URL</Label><Input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} /></div>
            <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {data?.map(t => (
          <Card key={t.id}>
            <CardContent className="p-4 flex gap-4">
              <div className="shrink-0 text-primary"><Quote className="h-6 w-6" /></div>
              <div className="flex-1 space-y-2">
                <p className="italic text-sm text-foreground/80">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {t.photo_url && <img src={t.photo_url} className="h-8 w-8 rounded-full object-cover" />}
                    <div>
                      <p className="font-semibold text-xs">{t.client_name || "Anônimo"}</p>
                      <div className="flex text-yellow-500"><Star className="h-3 w-3 fill-current" /> <span className="text-xs ml-1">{t.rating}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeTestimonial(t.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
