import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GitCommit } from "lucide-react";

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

export function TimelineAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "process_steps"],
    queryFn: async () => {
      const { data, error } = await supabase.from("process_steps").select("*").order("sort_order");
      if (error) throw error;
      return data as any[];
    }
  });

  const [phase, setPhase] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setPhase("");
    setTitle("");
    setDescription("");
    setSortOrder(0);
    setIsActive(true);
  }

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setPhase(t.phase || "");
    setTitle(t.title || "");
    setDescription(t.description || "");
    setSortOrder(t.sort_order || 0);
    setIsActive(t.is_active);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title || !description) return;
    setSaving(true);

    const payload = {
      phase,
      title,
      description,
      sort_order: sortOrder,
      is_active: isActive
    };

    let error;
    if (editingId) {
      const res = await supabase.from("process_steps").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("process_steps").insert(payload);
      error = res.error;
    }
    setSaving(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      setIsDialogOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["admin", "process_steps"] });
      toast({ title: "Salvo!" });
    }
  };

  const removeStep = async (id: string) => {
    if (!confirm("Remover esta etapa da jornada?")) return;
    const { error } = await supabase.from("process_steps").delete().eq("id", id);
    if (error) toast({ variant: "destructive", description: error.message });
    else qc.invalidateQueries({ queryKey: ["admin", "process_steps"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Jornada (Timeline)</h2>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Adicionar Etapa</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Etapa do Processo</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Fase (Ex: A Escolha)</Label><Input value={phase} onChange={e => setPhase(e.target.value)} /></div>
            <div className="space-y-2"><Label>Título Chamativo</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label>Descrição Longa</Label><Textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} /></div>
            <div className="space-y-2"><Label>Ordem de exibição (Cronologia)</Label><Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} /></div>
            <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {data?.map(t => (
          <Card key={t.id}>
            <CardContent className="p-4 flex gap-4">
              <div className="shrink-0 text-primary"><GitCommit className="h-6 w-6" /></div>
              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">{t.phase}</span>
                <p className="font-semibold text-lg text-foreground">{t.title}</p>
                <p className="text-sm text-foreground/80">{t.description}</p>
                <div className="flex items-center justify-between mt-4">
                   <span className="text-xs text-muted-foreground mr-4">Posição cronológica: {t.sort_order} | {t.is_active ? "Ativo" : "Oculto"}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeStep(t.id)}><Trash2 className="h-3 w-3" /></Button>
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
