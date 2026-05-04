import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import {
  BRAND,
  INSTAGRAM_LINK,
  MAPS_LINK,
  SERVICES as STATIC_SERVICES,
  TESTIMONIALS as STATIC_TESTIMONIALS,
  WHATSAPP_LINK,
  HERO,
  CONCEPT_CARDS,
  PROFESSIONALS,
  EVENTS,
  PRODUCTS,
  PROCESS_STEPS,
  FAQ_QUESTIONS,
} from "@/components/landing/landingContent";

type ContentRow = { key: string; value: string };

async function fetchSiteContent(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("site_content").select("key,value");
  if (error) return {};
  const map: Record<string, string> = {};
  (data as ContentRow[] | null)?.forEach((r) => {
    map[r.key] = r.value;
  });
  return map;
}

type ServiceRow = {
  id?: string;
  title: string;
  description: string;
  slug?: string;
  price_text?: string;
  duration_min?: number;
  duration?: string; // Mapped from duration_min or static
  cover_image_url?: string;
  benefits?: string[];
  therapistId?: string;
  phrase?: string;
};

async function fetchServices(): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*, therapist_services(therapist_id)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(50);
  if (error) return [];
  return (data ?? []) as any[];
}

type TestimonialRow = { role_label: string; quote: string };
async function fetchTestimonials(): Promise<Array<{ role: string; quote: string }>> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("role_label,quote")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(50);
  if (error) return [];
  return ((data ?? []) as TestimonialRow[]).map((t) => ({ role: t.role_label, quote: t.quote }));
}

async function fetchFaqs() {
  const { data, error } = await supabase.from("faqs").select("*").eq("is_active", true).order("sort_order");
  if (error) return [];
  return data;
}

async function fetchProcessSteps() {
  const { data, error } = await supabase.from("process_steps").select("*").eq("is_active", true).order("sort_order");
  if (error) return [];
  return data;
}

async function fetchTherapists() {
  const { data, error } = await supabase.from("therapists").select("*").eq("is_active", true).order("created_at");
  if (error) return [];
  return data;
}

// Add fetchEvents
async function fetchEvents() {
  const { data, error } = await supabase.from("events").select("*").eq("is_published", true).order("starts_at", { ascending: true });
  if (error) return [];
  return data;
}

export function useLandingData() {
  const contentQuery = useQuery({ queryKey: ["landing", "site_content"], queryFn: fetchSiteContent });
  const servicesQuery = useQuery({ queryKey: ["landing", "services"], queryFn: fetchServices });
  const testimonialsQuery = useQuery({ queryKey: ["landing", "testimonials"], queryFn: fetchTestimonials });
  const faqsQuery = useQuery({ queryKey: ["landing", "faqs"], queryFn: fetchFaqs });
  const processStepsQuery = useQuery({ queryKey: ["landing", "process_steps"], queryFn: fetchProcessSteps });
  const therapistsQuery = useQuery({ queryKey: ["landing", "therapists"], queryFn: fetchTherapists });
  const eventsQuery = useQuery({ queryKey: ["landing", "events"], queryFn: fetchEvents });

  const content = contentQuery.data ?? {};

  const derivedBrand = {
    ...BRAND,
    name: content.brand_name ?? BRAND.name,
    slogan: content.brand_slogan ?? BRAND.slogan,
    modality: content.brand_modality ?? BRAND.modality,
    schedule: content.brand_schedule ?? BRAND.schedule,
    instagramHandle: content.instagram_handle ?? BRAND.instagramHandle,
    whatsappDisplay: content.whatsapp_display ?? BRAND.whatsappDisplay,
    address: content.address ?? BRAND.address,
    therapist: content.brand_therapist ?? BRAND.therapist,
    description: content.brand_description ?? BRAND.description,
  };

  const derivedLinks = {
    whatsapp: content.whatsapp_link ?? WHATSAPP_LINK,
    maps: content.maps_link ?? MAPS_LINK,
    instagram: INSTAGRAM_LINK,
  };

  // Map DB services to have a 'duration' string if possible
  const dbServices = servicesQuery.data?.map(s => ({
    ...s,
    duration: s.duration_min ? `${s.duration_min} min` : undefined,
    phrase: (s as any).hover_text, // Map snake_case hover_text to 'phrase' used by UI
    therapistId: (s as any).therapist_services?.[0]?.therapist_id // Extract first linked therapist
  }));

  const services = dbServices && dbServices.length > 0 ? dbServices : (STATIC_SERVICES as unknown as ServiceRow[]);

  const mappedTherapists = (therapistsQuery.data || PROFESSIONALS).map((t: any) => {
    const slug = t.slug || t.id;
    const therapistServices = services.filter((s: any) => s.therapistId === t.id || s.therapistSlug === slug);
    const initials = t.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return {
      id: t.id,
      slug: slug,
      name: t.name,
      role: t.id === "carla" ? "principal" : "convidado",
      roleLabel: t.id === "carla" ? "Terapeuta integrativa · Fundadora" : t.role || "Terapeuta Convidada",
      bio: t.bio || "",
      photo: t.photo_url || t.image || null,
      emoji: t.avatar || "✨",
      initials,
      serviceCount: therapistServices.length,
      socialUrl: t.social_url || null,
    };
  });

  const finalProfessionals = mappedTherapists;

  const dbTestimonials = testimonialsQuery.data;
  const testimonials = dbTestimonials && dbTestimonials.length > 0 ? dbTestimonials : STATIC_TESTIMONIALS;

  const dbEvents = eventsQuery.data?.map(ev => {
    // try to format date locally if possible, or just build a string
    const d = new Date(ev.starts_at);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return {
      ...ev,
      date: `${day} ${month} | ${hour}h${min}`,
      facilitator: ev.location || "Presencial",
    }
  });

  const finalEvents = dbEvents && dbEvents.length > 0 ? dbEvents : EVENTS;

  const hero = {
    ...HERO,
    title: content.hero_title ?? HERO.title,
    subtitle: content.hero_subtitle ?? HERO.subtitle,
    cta: content.hero_cta ?? HERO.cta,
  };

  const aboutSection = {
    title: content.about_title ?? "Este não é apenas um espaço terapêutico.",
    description: content.about_description ?? "É um campo onde processos se revelam, emoções ganham voz e a energia encontra caminho.",
  };

  const therapistsSection = {
    label: content.therapists_label ?? "Nossos terapeutas",
    title: content.therapists_title ?? "Quem conduz os caminhos",
    description: content.therapists_description ?? "Cada terapeuta traz sua formação, sua vivência e sua forma única de acolher.",
  };

  const eventsSection = {
    label: content.events_label ?? "Experiências",
    title: content.events_title ?? "Próximos Encontros",
    description: content.events_description ?? "Espaços presenciais e online para aprofundar seu processo de autoconhecimento e cura.",
  };

  const faqSection = {
    title: content.faq_title ?? "Dúvidas Frequentes",
    description: content.faq_description ?? "Tudo o que você precisa saber para começar sua jornada.",
  };

  const contactSection = {
    title: content.contact_title ?? "Pronta para iniciar sua travessia?",
    description: content.contact_description ?? "Clique abaixo para conversarmos pelo WhatsApp e encontrarmos o melhor caminho para você.",
  };

  return {
    brand: derivedBrand,
    links: derivedLinks,
    services,
    testimonials,
    content,
    hero,
    aboutSection,
    therapistsSection,
    eventsSection,
    faqSection,
    contactSection,
    conceptCards: CONCEPT_CARDS,
    professionals: finalProfessionals,
    events: finalEvents,
    products: PRODUCTS,
    processSteps: processStepsQuery.data && processStepsQuery.data.length > 0 ? processStepsQuery.data : PROCESS_STEPS,
    faqs: faqsQuery.data && faqsQuery.data.length > 0 ? faqsQuery.data : FAQ_QUESTIONS,
    loading: contentQuery.isLoading || servicesQuery.isLoading || testimonialsQuery.isLoading || therapistsQuery.isLoading || eventsQuery.isLoading,
  };
}
