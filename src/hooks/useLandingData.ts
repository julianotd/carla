import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import {
  BRAND,
  INSTAGRAM_LINK,
  MAPS_LINK,
  SERVICES as STATIC_SERVICES,
  TESTIMONIALS as STATIC_TESTIMONIALS,
  WHATSAPP_LINK,
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

type ServiceRow = { title: string; description: string };
async function fetchServices(): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from("services")
    .select("title,description")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(50);
  if (error) return [];
  return (data ?? []) as ServiceRow[];
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

export function useLandingData() {
  const contentQuery = useQuery({ queryKey: ["landing", "site_content"], queryFn: fetchSiteContent });
  const servicesQuery = useQuery({ queryKey: ["landing", "services"], queryFn: fetchServices });
  const testimonialsQuery = useQuery({ queryKey: ["landing", "testimonials"], queryFn: fetchTestimonials });

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
  };

  const derivedLinks = {
    whatsapp: content.whatsapp_link ?? WHATSAPP_LINK,
    maps: content.maps_link ?? MAPS_LINK,
    instagram: INSTAGRAM_LINK,
  };

  const services = servicesQuery.data && servicesQuery.data.length > 0 ? servicesQuery.data : (STATIC_SERVICES as unknown as ServiceRow[]);
  const testimonials =
    testimonialsQuery.data && testimonialsQuery.data.length > 0
      ? testimonialsQuery.data
      : (STATIC_TESTIMONIALS as unknown as Array<{ role: string; quote: string }>);

  return {
    brand: derivedBrand,
    links: derivedLinks,
    services,
    testimonials,
    content,
    loading: contentQuery.isLoading || servicesQuery.isLoading || testimonialsQuery.isLoading,
  };
}
