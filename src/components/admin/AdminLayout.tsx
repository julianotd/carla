
import { Outlet } from "react-router-dom";
import { LogOut, ExternalLink } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "./AdminSidebar";
import { ModeToggle } from "./mode-toggle";

export function AdminLayout() {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <AdminSidebar />
            <div className="flex flex-1 flex-col">
                <header className="flex items-center justify-between border-b bg-background/70 px-6 py-4 backdrop-blur">
                    <h1 className="font-display text-xl font-semibold text-ink">Área Administrativa</h1>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.open("/", "_blank")}
                            className="hidden sm:flex items-center gap-2 border-energy-gold/30 text-energy-gold hover:bg-energy-gold/10"
                        >
                            <ExternalLink className="h-4 w-4" /> Ver Site Ao Vivo
                        </Button>
                        <ModeToggle />
                        <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                            try {
                                await supabase.auth.signOut();
                            } catch (e) {
                                console.error("Logout error", e);
                            } finally {
                                window.location.href = "/";
                            }
                        }}
                    >
                            Sair <LogOut className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
