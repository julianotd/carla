import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminGuard } from "@/components/auth/AdminGuard";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Booking from "./pages/Booking";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ServicesAdmin } from "@/pages/admin/components/ServicesAdmin";
import { EventsAdmin } from "@/pages/admin/components/EventsAdmin";
import { PostsAdmin } from "@/pages/admin/components/PostsAdmin";
import { TestimonialsAdmin } from "@/pages/admin/components/TestimonialsAdmin";
import { TherapistsAdmin } from "@/pages/admin/components/TherapistsAdmin";
import { AgendaAdmin } from "@/pages/admin/components/AgendaAdmin";
import { SiteContentAdmin } from "@/pages/admin/components/SiteContentAdmin";
import { RolesAdmin } from "@/pages/admin/components/RolesAdmin";
import { AnalyticsAdmin } from "@/pages/admin/components/AnalyticsAdmin";
import { FaqsAdmin } from "@/pages/admin/components/FaqsAdmin";
import { TimelineAdmin } from "@/pages/admin/components/TimelineAdmin";
import AgendaPage from "@/pages/admin/agenda/AgendaPage";
import MyAgendaPage from "@/pages/admin/agenda/MyAgendaPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/agendar" element={<Booking />} />
            <Route element={<AdminGuard />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/services" element={<ServicesAdmin />} />
                <Route path="/admin/events" element={<EventsAdmin />} />
                <Route path="/admin/posts" element={<PostsAdmin />} />
                <Route path="/admin/testimonials" element={<TestimonialsAdmin />} />
                <Route path="/admin/therapists" element={<TherapistsAdmin />} />
                <Route path="/admin/therapists" element={<TherapistsAdmin />} />

                {/* Agenda Routes */}
                <Route path="/admin/agenda" element={<AgendaPage />} />
                <Route path="/admin/agenda/minha" element={<MyAgendaPage />} />
                <Route path="/admin/agenda/config" element={<div>Configurações (Em Breve)</div>} />
                <Route path="/admin/agenda/pendencias" element={<div>Pendências (Em Breve)</div>} />
                <Route path="/admin/agenda/espera" element={<div>Lista de Espera (Em Breve)</div>} />

                <Route path="/admin/content" element={<SiteContentAdmin />} />
                <Route path="/admin/faqs" element={<FaqsAdmin />} />
                <Route path="/admin/timeline" element={<TimelineAdmin />} />
                <Route path="/admin/users" element={<RolesAdmin />} />
                <Route path="/admin/analytics" element={<AnalyticsAdmin />} />
              </Route>
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
