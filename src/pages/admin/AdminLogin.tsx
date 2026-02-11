import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/admin";
  }, [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível entrar",
        description: error.message,
      });
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md rounded-2xl border bg-background/70 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-2xl text-ink">Entrar no painel</CardTitle>
            <CardDescription className="text-foreground/75">
              Acesso restrito para administração do site Além da Pele.
            </CardDescription>
          </CardHeader>

          <form onSubmit={onSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button type="submit" variant="premium" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/")}
              >
                Voltar ao site
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
