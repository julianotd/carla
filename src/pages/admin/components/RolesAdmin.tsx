
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, ShieldAlert, Check } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserRoleRow = {
  id: string; // profile id
  full_name: string | null;
  email?: string; // Made optional as we might not get it from profiles join
  avatar_url: string | null;
  roles: { role: string }[];
};

export function RolesAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { refreshRole } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      // Fetch profiles and their roles
      // Note: Relation might be profiles -> user_roles
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          user_roles ( role )
        `);

      if (error) throw error;
      return data?.map(p => ({
        ...p,
        roles: p.user_roles || []
      })) as UserRoleRow[];
    }
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Current logic: simple 1 role per user for MVP, or add/remove
    // For simplicity Phase 1: Overwrite or Add.
    // Let's assume 1 role strategy or just adding 'admin' capability.

    // Check if user has this role
    // For this UI, let's just allow toggling "admin" status or setting a primary role.
    // Let's implement: Select a role to ADD. To remove, we might need a list of tags.
    // BETTER MVP: Dropdown to set the MAIN role.
    // First, remove all roles, then insert new one? Or is it partial?
    // Let's try upserting into user_roles.

    try {
      // Remove existing (optional, if we want single role enforcement)
      await supabase.from("user_roles").delete().eq("user_id", userId);

      if (newRole !== 'none') {
        const { error } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: newRole as any
        });
        if (error) throw error;
      }

      toast({ title: "Permissões atualizadas!" });
      qc.invalidateQueries({ queryKey: ["admin", "roles"] });
      refreshRole();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Usuários e Permissões</h2>
        <p className="text-muted-foreground">Gerencie quem tem acesso ao painel.</p>
      </div>

      <div className="grid gap-4">
        {isLoading && <p>Carregando...</p>}
        {data?.map((user) => {
          const currentRole = user.roles.length > 0 ? user.roles[0].role : "none";

          return (
            <Card key={user.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || ""} />
                    <AvatarFallback>{user.full_name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{user.full_name || "Usuário sem nome"}</h3>
                    <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {user.roles.map(r => (
                      <span key={r.role} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                        {r.role}
                      </span>
                    ))}
                  </div>

                  <Select value={currentRole} onValueChange={(val) => handleRoleChange(user.id, val)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecione função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem acesso</SelectItem>
                      <SelectItem value="receptionist">Recepcionista</SelectItem>
                      <SelectItem value="therapist">Terapeuta</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
