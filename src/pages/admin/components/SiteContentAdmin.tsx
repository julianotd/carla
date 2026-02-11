import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type ContentRow = { key: string; value: string };

async function listContent(): Promise<ContentRow[]> {
  const { data, error } = await supabase.from("site_content").select("key,value").order("key");
  if (error) throw error;
  return (data ?? []) as ContentRow[];
}

const DEFAULT_KEYS: Array<{ key: string; label: string; type: "text" | "textarea" }> = [
  { key: "brand_name", label: "Nome da marca", type: "text" },
  { key: "brand_slogan", label: "Slogan", type: "textarea" },
  { key: "brand_modality", label: "Modalidade", type: "text" },
  { key: "brand_schedule", label: "Horário", type: "text" },
  { key: "brand_therapist", label: "Terapeuta", type: "text" },
  { key: "instagram_handle", label: "Instagram (ex: @navemistica)", type: "text" },
  { key: "whatsapp_display", label: "WhatsApp (ex: (54) 99999-6668)", type: "text" },
  { key: "address", label: "Endereço", type: "textarea" },
  { key: "support_text", label: "Texto de apoio (Hero)", type: "textarea" },
  { key: "about_text", label: "Texto (Sobre)", type: "textarea" },
  { key: "contact_intro", label: "Texto (Contato final)", type: "textarea" },
  { key: "whatsapp_link", label: "Link do WhatsApp", type: "textarea" },
  { key: "maps_link", label: "Link do Google Maps", type: "textarea" },
];

export function SiteContentAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({ queryKey: ["admin", "site_content"], queryFn: listContent });

  const map = useMemo(() => {
    const m = new Map<string, string>();
    (data ?? []).forEach((r) => m.set(r.key, r.value));
    return m;
  }, [data]);

  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const getValue = (k: string) => (draft[k] ?? map.get(k) ?? "");

  const saveAll = async () => {
    setSaving(true);

    const rows = DEFAULT_KEYS.map(({ key }) => ({ key, value: getValue(key).trim() }))
      .filter((r) => r.value.length > 0);

    const { error: upsertError } = await supabase.from("site_content").upsert(rows, { onConflict: "key" });

    setSaving(false);

    if (upsertError) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: upsertError.message });
      return;
    }

    toast({ title: "Conteúdo salvo", description: "As alterações já podem refletir no site." });
    setDraft({});
    await qc.invalidateQueries({ queryKey: ["admin", "site_content"] });
    await qc.invalidateQueries({ queryKey: ["landing", "site_content"] });
  };

  return (
    <Card className="rounded-2xl border bg-background/70 shadow-soft">
      <CardHeader>
        <CardTitle className="font-display text-xl text-ink">Conteúdo do site</CardTitle>
        <CardDescription className="text-foreground/75">
          Edite textos e dados de contato. Campos vazios continuam usando o padrão atual.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isLoading && <p className="text-sm text-foreground/70">Carregando...</p>}
        {error && <p className="text-sm text-destructive">Erro ao carregar.</p>}

        <div className="grid gap-4 lg:grid-cols-2">
          {DEFAULT_KEYS.map((k) => (
            <div key={k.key} className="grid gap-2">
              <Label htmlFor={k.key}>{k.label}</Label>
              {k.type === "textarea" ? (
                <Textarea
                  id={k.key}
                  value={getValue(k.key)}
                  onChange={(e) => setDraft((d) => ({ ...d, [k.key]: e.target.value }))}
                />
              ) : (
                <Input
                  id={k.key}
                  value={getValue(k.key)}
                  onChange={(e) => setDraft((d) => ({ ...d, [k.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="premium" onClick={saveAll} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
