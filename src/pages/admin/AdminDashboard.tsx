import { useState } from "react";
import { LogOut } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ServicesAdmin } from "@/pages/admin/components/ServicesAdmin";
import { TestimonialsAdmin } from "@/pages/admin/components/TestimonialsAdmin";
import { SiteContentAdmin } from "@/pages/admin/components/SiteContentAdmin";
import { PostsAdmin } from "@/pages/admin/components/PostsAdmin";
import { EventsAdmin } from "@/pages/admin/components/EventsAdmin";
import { RolesAdmin } from "@/pages/admin/components/RolesAdmin";

export default function AdminDashboard() {
  const [tab, setTab] = useState("services");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/70 backdrop-blur">
        <div className="container flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-foreground/70">ALÉM DA PELE</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Área administrativa</h1>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
          >
            Sair <LogOut className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-secondary/40 p-2">
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="roles">Admins</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            <ServicesAdmin />
          </TabsContent>
          <TabsContent value="testimonials" className="mt-6">
            <TestimonialsAdmin />
          </TabsContent>
          <TabsContent value="content" className="mt-6">
            <SiteContentAdmin />
          </TabsContent>
          <TabsContent value="posts" className="mt-6">
            <PostsAdmin />
          </TabsContent>
          <TabsContent value="events" className="mt-6">
            <EventsAdmin />
          </TabsContent>
          <TabsContent value="roles" className="mt-6">
            <RolesAdmin />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
