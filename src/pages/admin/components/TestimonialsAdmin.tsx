import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type TestimonialRow = {
  id: string;
  role_label: string;
  quote: string;
  sort_order: number;
  is_active: boolean;
};

async function listTestimonials(): Promise<TestimonialRow[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("id,role_label,quote,sort_order,is_active")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TestimonialRow[];
}

export function TestimonialsAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({ queryKey: ["admin", "testimonials"], queryFn: listTestimonials });

  const [roleLabel, setRoleLabel] = useState("Cliente");
  const [quote, setQuote] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const canAdd = useMemo(() => quote.trim().length > 0, [quote]);

  const addRow = async () => {
    if (!canAdd) return;
    setSaving(true);

    const { error: insertError } = await supabase.from("testimonials").insert({
      role_label: roleLabel.trim() || "Cliente",
      quote: quote.trim(),
      sort_order: sortOrder,
      is_active: isActive,
    });

    setSaving(false);

    if (insertError) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: insertError.message });
      return;
    }

    setQuote("");
    setSortOrder(0);
    setIsActive(true);
    await qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
  };

  const toggleActive = async (id: string, next: boolean) => {
    const { error: updateError } = await supabase.from("testimonials").update({ is_active: next }).eq("id", id);
    if (updateError) {
      toast({ variant: "destructive", title: "Erro", description: updateError.message });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
  };

  const removeRow = async (id: string) => {
    const ok = window.confirm("Remover este depoimento?");
    if (!ok) return;
    const { error: delError } = await supabase.from("testimonials").delete().eq("id", id);
    if (delError) {
      toast({ variant: "destructive", title: "Erro", description: delError.message });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
  };

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-xl text-ink">Novo depoimento</CardTitle>
          <CardDescription className="text-foreground/75">Aparece na seção Depoimentos da landing.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="t-role">Rótulo</Label>
              <Input id="t-role" value={roleLabel} onChange={(e) => setRoleLabel(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="t-sort">Ordem</Label>
              <Input id="t-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="t-quote">Texto</Label>
            <Textarea id="t-quote" value={quote} onChange={(e) => setQuote(e.target.value)} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <span className="text-sm text-foreground/80">Ativo</span>
            </div>
            <Button variant="premium" disabled={!canAdd || saving} onClick={addRow}>
              {saving ? "Salvando..." : "Adicionar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-xl text-ink">Depoimentos cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoading && <p className="text-sm text-foreground/70">Carregando...</p>}
          {error && <p className="text-sm text-destructive">Erro ao carregar.</p>}

          {(data ?? []).map((t) => (
            <div key={t.id} className="rounded-xl bg-secondary/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{t.role_label}</p>
                  <p className="mt-1 text-sm text-foreground/80">“{t.quote}”</p>
                  <p className="mt-2 text-xs text-foreground/60">Ordem: {t.sort_order}</p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="flex items-center gap-3">
                    <Switch checked={t.is_active} onCheckedChange={(v) => toggleActive(t.id, v)} />
                    <span className="text-xs text-foreground/70">Ativo</span>
                  </div>
                  <Button variant="outline" onClick={() => removeRow(t.id)}>
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {(data ?? []).length === 0 && !isLoading && <p className="text-sm text-foreground/70">Nenhum ainda.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
