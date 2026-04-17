import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, HelpCircle } from "lucide-react";

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

export function FaqsAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
      if (error) throw error;
      return data as any[];
    }
  });

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setSortOrder(0);
    setIsActive(true);
  }

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setQuestion(t.question || "");
    setAnswer(t.answer || "");
    setSortOrder(t.sort_order || 0);
    setIsActive(t.is_active);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!question || !answer) return;
    setSaving(true);

    const payload = {
      question,
      answer,
      sort_order: sortOrder,
      is_active: isActive
    };

    let error;
    if (editingId) {
      const res = await supabase.from("faqs").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("faqs").insert(payload);
      error = res.error;
    }
    setSaving(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      setIsDialogOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
      toast({ title: "Salvo!" });
    }
  };

  const removeFaq = async (id: string) => {
    if (!confirm("Remover esta pergunta?")) return;
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) toast({ variant: "destructive", description: error.message });
    else qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Faqs (Dúvidas)</h2>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Nova Pergunta</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Dúvida Frequente</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Pergunta</Label><Input value={question} onChange={e => setQuestion(e.target.value)} /></div>
            <div className="space-y-2"><Label>Resposta</Label><Textarea rows={4} value={answer} onChange={e => setAnswer(e.target.value)} /></div>
            <div className="space-y-2"><Label>Ordem de exibição</Label><Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} /></div>
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
              <div className="shrink-0 text-primary"><HelpCircle className="h-6 w-6" /></div>
              <div className="flex-1 space-y-2">
                <p className="font-semibold text-foreground">{t.question}</p>
                <p className="text-sm text-foreground/80">{t.answer}</p>
                <div className="flex items-center justify-between mt-4">
                   <span className="text-xs text-muted-foreground mr-4">Ordem: {t.sort_order} | {t.is_active ? "Ativo" : "Oculto"}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeFaq(t.id)}><Trash2 className="h-3 w-3" /></Button>
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
