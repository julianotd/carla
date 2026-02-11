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

type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  is_published: boolean;
};

async function listPosts(): Promise<PostRow[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,is_published")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PostRow[];
}

export function PostsAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({ queryKey: ["admin", "posts"], queryFn: listPosts });

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  const canAdd = useMemo(() => title.trim() && slug.trim() && body.trim(), [title, slug, body]);

  const addPost = async () => {
    if (!canAdd) return;
    setSaving(true);

    const { error: insertError } = await supabase.from("posts").insert({
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      body: body.trim(),
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    });

    setSaving(false);

    if (insertError) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: insertError.message });
      return;
    }

    setTitle("");
    setSlug("");
    setExcerpt("");
    setBody("");
    setIsPublished(false);
    await qc.invalidateQueries({ queryKey: ["admin", "posts"] });
  };

  const removePost = async (id: string) => {
    const ok = window.confirm("Remover este post?");
    if (!ok) return;
    const { error: delError } = await supabase.from("posts").delete().eq("id", id);
    if (delError) {
      toast({ variant: "destructive", title: "Erro", description: delError.message });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin", "posts"] });
  };

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-xl text-ink">Novo post</CardTitle>
          <CardDescription className="text-foreground/75">Admin agora, página pública depois.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="p-title">Título</Label>
            <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-slug">Slug (ex: novidade-fev-2026)</Label>
            <Input id="p-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-excerpt">Resumo (opcional)</Label>
            <Textarea id="p-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-body">Conteúdo</Label>
            <Textarea id="p-body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-40" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              <span className="text-sm text-foreground/80">Publicado</span>
            </div>
            <Button variant="premium" disabled={!canAdd || saving} onClick={addPost}>
              {saving ? "Salvando..." : "Adicionar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-xl text-ink">Posts</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoading && <p className="text-sm text-foreground/70">Carregando...</p>}
          {error && <p className="text-sm text-destructive">Erro ao carregar.</p>}

          {(data ?? []).map((p) => (
            <div key={p.id} className="rounded-xl bg-secondary/40 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-ink">{p.title}</p>
                  <p className="mt-1 text-xs text-foreground/60">/{p.slug}</p>
                  {p.excerpt && <p className="mt-2 text-sm text-foreground/80">{p.excerpt}</p>}
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <span className="text-xs text-foreground/70">{p.is_published ? "Publicado" : "Rascunho"}</span>
                  <Button variant="outline" onClick={() => removePost(p.id)}>
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {(data ?? []).length === 0 && !isLoading && <p className="text-sm text-foreground/70">Nenhum post ainda.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
