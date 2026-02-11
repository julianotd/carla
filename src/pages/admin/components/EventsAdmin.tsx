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

type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  is_published: boolean;
  starts_at: string | null;
};

async function listEvents(): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select("id,title,slug,description,is_published,starts_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export function EventsAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({ queryKey: ["admin", "events"], queryFn: listEvents });

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [startsAt, setStartsAt] = useState<string>("");
  const [location, setLocation] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  const canAdd = useMemo(() => title.trim() && slug.trim(), [title, slug]);

  const addEvent = async () => {
    if (!canAdd) return;
    setSaving(true);

    const starts = startsAt.trim() ? new Date(startsAt).toISOString() : null;

    const { error: insertError } = await supabase.from("events").insert({
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      body: body.trim() || null,
      starts_at: starts,
      location: location.trim() || null,
      is_published: isPublished,
    });

    setSaving(false);

    if (insertError) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: insertError.message });
      return;
    }

    setTitle("");
    setSlug("");
    setDescription("");
    setBody("");
    setStartsAt("");
    setLocation("");
    setIsPublished(false);

    await qc.invalidateQueries({ queryKey: ["admin", "events"] });
  };

  const removeEvent = async (id: string) => {
    const ok = window.confirm("Remover este evento?");
    if (!ok) return;
    const { error: delError } = await supabase.from("events").delete().eq("id", id);
    if (delError) {
      toast({ variant: "destructive", title: "Erro", description: delError.message });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin", "events"] });
  };

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-xl text-ink">Novo evento</CardTitle>
          <CardDescription className="text-foreground/75">Admin agora, página pública depois.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="e-title">Título</Label>
            <Input id="e-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="e-slug">Slug (ex: vivencia-marco-2026)</Label>
            <Input id="e-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="e-description">Descrição (opcional)</Label>
            <Textarea id="e-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="e-body">Detalhes (opcional)</Label>
            <Textarea id="e-body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-32" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="e-start">Data/hora início (opcional)</Label>
              <Input id="e-start" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="e-location">Local (opcional)</Label>
              <Input id="e-location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              <span className="text-sm text-foreground/80">Publicado</span>
            </div>
            <Button variant="premium" disabled={!canAdd || saving} onClick={addEvent}>
              {saving ? "Salvando..." : "Adicionar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-xl text-ink">Eventos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoading && <p className="text-sm text-foreground/70">Carregando...</p>}
          {error && <p className="text-sm text-destructive">Erro ao carregar.</p>}

          {(data ?? []).map((e) => (
            <div key={e.id} className="rounded-xl bg-secondary/40 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-ink">{e.title}</p>
                  <p className="mt-1 text-xs text-foreground/60">/{e.slug}</p>
                  {e.description && <p className="mt-2 text-sm text-foreground/80">{e.description}</p>}
                  {e.starts_at && <p className="mt-2 text-xs text-foreground/60">Início: {new Date(e.starts_at).toLocaleString()}</p>}
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <span className="text-xs text-foreground/70">{e.is_published ? "Publicado" : "Rascunho"}</span>
                  <Button variant="outline" onClick={() => removeEvent(e.id)}>
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {(data ?? []).length === 0 && !isLoading && <p className="text-sm text-foreground/70">Nenhum evento ainda.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
