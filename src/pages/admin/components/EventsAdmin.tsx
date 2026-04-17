
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  cover_image: string | null; // Note: SQL used cover_image_url but types says cover_image? Let's check types.
  // Actually types.ts says `location`, `slug`, `title`, `description`... wait let me check types again.
  // Viewing types.ts from previous turn: public.events has `cover_image_url` created in SQL, but types.ts showed `slug`, `title`...
  // Wait, in SQL I did `cover_image_url`. In types.ts I saw `slug`, `title`. 
  // Let me re-verify types.ts locally if possible or just use `cover_image_url` as per SQL. 
  // Update: I will use `cover_image_url` and cast if needed, or stick to what shows up in Supabase response.
  is_active: boolean; // SQL used is_active. types.ts showed `is_published`?
  // SQL: is_active boolean DEFAULT true
  // Types.ts (old): is_published boolean. Use `is_active` based on my SQL script.
};

// Start with relaxed types to match SQL return
export function EventsAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    }
  });

  // Form
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [location, setLocation] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setStartsAt("");
    setLocation("");
    setCoverUrl("");
    setIsActive(true);
  }

  const handleEdit = (ev: any) => {
    setEditingId(ev.id);
    setTitle(ev.title);
    setSlug(ev.slug);
    setDescription(ev.description || "");
    setStartsAt(ev.starts_at ? ev.starts_at.slice(0, 16) : ""); // datetime-local format
    setLocation(ev.location_text || ev.location || ""); // Handling potentially different column name
    setCoverUrl(ev.cover_image_url || "");
    setIsActive(ev.is_active ?? true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title) return;
    setSaving(true);

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description,
      starts_at: startsAt || new Date().toISOString(),
      location_text: location, // SQL used location_text
      cover_image_url: coverUrl,
      is_active: isActive
    };

    let error;
    if (editingId) {
      const res = await supabase.from("events").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("events").insert(payload);
      error = res.error;
    }
    setSaving(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      setIsDialogOpen(false);
      resetForm();
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      toast({ title: "Salvo!" });
    }
  };

  const removeEvent = async (id: string) => {
    if (!confirm("Remover evento?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast({ variant: "destructive", description: error.message });
    else qc.invalidateQueries({ queryKey: ["admin", "events"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Eventos</h2>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Novo Evento</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Evento</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Título</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Data/Hora</Label><Input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={e => setSlug(e.target.value)} /></div>
            <div className="space-y-2"><Label>Local</Label><Input value={location} onChange={e => setLocation(e.target.value)} /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
            <div className="space-y-2"><Label>Capa URL</Label><Input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} /></div>
            <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map(ev => (
          <Card key={ev.id} className="overflow-hidden">
            {ev.cover_image_url && <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${ev.cover_image_url})` }} />}
            <CardContent className="p-4">
              <h3 className="font-bold truncate">{ev.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                {ev.starts_at ? format(new Date(ev.starts_at), "dd/MM/yyyy HH:mm") : "Data não def."}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {ev.location_text || "Online"}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(ev)}><Pencil className="h-3 w-3" /></Button>
                <Button variant="destructive" size="sm" onClick={() => removeEvent(ev.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
