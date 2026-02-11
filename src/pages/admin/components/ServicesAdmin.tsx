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

type ServiceRow = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

async function listServices(): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id,title,description,sort_order,is_active")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ServiceRow[];
}

export function ServicesAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({ queryKey: ["admin", "services"], queryFn: listServices });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const canAdd = useMemo(() => title.trim().length > 0 && description.trim().length > 0, [title, description]);

  const addService = async () => {
    if (!canAdd) return;
    setSaving(true);

    const { error: insertError } = await supabase.from("services").insert({
      title: title.trim(),
      description: description.trim(),
      sort_order: sortOrder,
      is_active: isActive,
    });

    setSaving(false);

    if (insertError) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: insertError.message });
      return;
    }

    setTitle("");
    setDescription("");
    setSortOrder(0);
    setIsActive(true);
    await qc.invalidateQueries({ queryKey: ["admin", "services"] });
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
    const ok = window.confirm("Remover este serviço?");
    if (!ok) return;
    const { error: delError } = await supabase.from("services").delete().eq("id", id);
    if (delError) {
      toast({ variant: "destructive", title: "Erro", description: delError.message });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin", "services"] });
  };

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-xl text-ink">Novo serviço</CardTitle>
          <CardDescription className="text-foreground/75">Estes cards aparecem na landing page.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="service-title">Título</Label>
            <Input id="service-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="service-description">Descrição</Label>
            <Textarea id="service-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-2 sm:grid-cols-3 sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="service-sort">Ordem</Label>
              <Input
                id="service-sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-3 pt-4 sm:pt-0">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <span className="text-sm text-foreground/80">Ativo</span>
            </div>
            <Button variant="premium" disabled={!canAdd || saving} onClick={addService}>
              {saving ? "Salvando..." : "Adicionar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-xl text-ink">Serviços cadastrados</CardTitle>
          <CardDescription className="text-foreground/75">Ative/desative ou remova.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoading && <p className="text-sm text-foreground/70">Carregando...</p>}
          {error && <p className="text-sm text-destructive">Erro ao carregar.</p>}
          {(data ?? []).map((s) => (
            <div key={s.id} className="rounded-xl bg-secondary/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-ink">{s.title}</p>
                  <p className="mt-1 text-sm text-foreground/80">{s.description}</p>
                  <p className="mt-2 text-xs text-foreground/60">Ordem: {s.sort_order}</p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="flex items-center gap-3">
                    <Switch checked={s.is_active} onCheckedChange={(v) => toggleActive(s.id, v)} />
                    <span className="text-xs text-foreground/70">Ativo</span>
                  </div>
                  <Button variant="outline" onClick={() => removeService(s.id)}>
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {(data ?? []).length === 0 && !isLoading && (
            <p className="text-sm text-foreground/70">Nenhum serviço ainda. Você pode adicionar acima.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
