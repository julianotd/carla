
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge"; // Ensure Badge exists or use basic div
import { Textarea } from "@/components/ui/textarea"; // Simple textarea for now
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Simple Blog Post Admin - No Rich Text Editor yet to keep dependencies low for now
export function PostsAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    }
  });

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverUrl("");
    setStatus("draft");
  }

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setExcerpt(p.excerpt || "");
    setContent(p.content_html || "");
    setCoverUrl(p.cover_image_url || "");
    setStatus(p.status || "draft");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title) return;
    setSaving(true);

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      excerpt,
      content_html: content,
      cover_image_url: coverUrl,
      status
    };

    let error;
    if (editingId) {
      const res = await supabase.from("blog_posts").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("blog_posts").insert(payload);
      error = res.error;
    }
    setSaving(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      setIsDialogOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["admin", "posts"] });
      toast({ title: "Salvo!" });
    }
  };

  const removePost = async (id: string) => {
    if (!confirm("Remover post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast({ variant: "destructive", description: error.message });
    else qc.invalidateQueries({ queryKey: ["admin", "posts"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Novo Post</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader><DialogTitle>Postagem</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4 overflow-y-auto flex-1 px-1">
            <div className="space-y-2"><Label>Título</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={e => setSlug(e.target.value)} /></div>
            <div className="space-y-2"><Label>Resumo</Label><Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} /></div>
            <div className="space-y-2 flex-1"><Label>Conteúdo (HTML/Texto)</Label><Textarea className="min-h-[200px]" value={content} onChange={e => setContent(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Capa URL</Label><Input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {data?.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-secondary rounded flex items-center justify-center text-muted-foreground">
                  {p.cover_image_url ? <img src={p.cover_image_url} className="h-full w-full object-cover rounded" /> : <FileText />}
                </div>
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-xs text-muted-foreground">{p.slug}</p>
                </div>
                <Badge variant={p.status === 'published' ? 'default' : 'secondary'}>{p.status}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removePost(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
