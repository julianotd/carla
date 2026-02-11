import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type RoleRow = { id: string; user_id: string; role: "admin" | "editor"; created_at: string };

async function listMyRoles(): Promise<RoleRow[]> {
  const { data, error } = await supabase.from("user_roles").select("id,user_id,role,created_at").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as RoleRow[];
}

export function RolesAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();

  // Note: due to RLS, users can only see their own roles. Admins can still INSERT/UPDATE/DELETE.
  const { data, isLoading, error } = useQuery({ queryKey: ["admin", "roles"], queryFn: listMyRoles });

  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);

  const canGrant = useMemo(() => userId.trim().length > 10, [userId]);

  const grantAdmin = async () => {
    if (!canGrant) return;
    setSaving(true);

    const { error: insertError } = await supabase.from("user_roles").insert({
      user_id: userId.trim(),
      role: "admin",
    });

    setSaving(false);

    if (insertError) {
      toast({ variant: "destructive", title: "Erro ao adicionar admin", description: insertError.message });
      return;
    }

    toast({ title: "Admin adicionado", description: "A pessoa já pode acessar /admin após login." });
    setUserId("");
    await qc.invalidateQueries({ queryKey: ["admin", "roles"] });
  };

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-xl text-ink">Conceder acesso de admin</CardTitle>
          <CardDescription className="text-foreground/75">
            Cole o <span className="font-medium text-ink">User ID</span> da pessoa (UUID). Ela precisa criar conta e fazer login antes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="userId">User ID</Label>
            <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="ex: 8b8f0c0d-..." />
          </div>
          <div className="flex justify-end">
            <Button variant="premium" disabled={!canGrant || saving} onClick={grantAdmin}>
              {saving ? "Salvando..." : "Adicionar admin"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-xl text-ink">Minhas permissões</CardTitle>
          <CardDescription className="text-foreground/75">Lista limitada ao seu usuário (por segurança).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {isLoading && <p className="text-sm text-foreground/70">Carregando...</p>}
          {error && <p className="text-sm text-destructive">Erro ao carregar.</p>}
          {(data ?? []).map((r) => (
            <div key={r.id} className="rounded-xl bg-secondary/40 p-3 text-sm">
              <span className="font-medium text-ink">{r.role}</span>
              <span className="ml-2 text-foreground/70">({r.user_id})</span>
            </div>
          ))}
          {(data ?? []).length === 0 && !isLoading && (
            <p className="text-sm text-foreground/70">Nenhuma role encontrada para seu usuário.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
