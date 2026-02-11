import { useEffect, useMemo, useRef } from "react";
import { ArrowRight, HeartHandshake, MapPin, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLandingData } from "@/hooks/useLandingData";

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="text-xs font-semibold tracking-[0.18em] text-foreground/70">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-foreground/80">{description}</p>}
    </div>
  );
}

function Divider() {
  return <div aria-hidden className="mx-auto my-12 h-px w-44 section-divider opacity-60 sm:my-16" />;
}

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { brand, links, services, testimonials, content } = useLandingData();

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el || reducedMotion) return;

    const handleMove = (ev: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = Math.min(Math.max(0, ev.clientX - rect.left), rect.width);
      const y = Math.min(Math.max(0, ev.clientY - rect.top), rect.height);
      el.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
      el.style.setProperty("--my", `${(y / rect.height) * 100}%`);
    };

    el.addEventListener("pointermove", handleMove);
    return () => el.removeEventListener("pointermove", handleMove);
  }, [reducedMotion]);

  return (
    <div id="topo" className="min-h-screen">
      <main className="pt-16">
        {/* HERO */}
        <section ref={heroRef} className="hero-field relative overflow-hidden">
          <div className="container py-14 sm:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-xs font-medium text-foreground/80">
                  <Sparkles className="h-4 w-4 text-gold" />
                  {brand.modality} • {brand.schedule}
                </p>

                <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.06] text-ink sm:text-6xl">
                  Cuidado que vai além da pele.
                </h1>
                <p className="mt-4 text-balance text-lg leading-relaxed text-foreground/85 sm:text-xl">
                  {brand.slogan}
                </p>
                 <p className="mt-4 max-w-prose text-base leading-relaxed text-foreground/75">
                   {content.support_text ??
                     "Um espaço premium, minimalista e acolhedor para você se reconectar com seu corpo, suas emoções e sua energia — com presença, respeito e acompanhamento."}
                 </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild variant="premium" size="lg">
                     <a href={links.whatsapp} target="_blank" rel="noreferrer">
                       Agendar pelo WhatsApp <ArrowRight className="ml-1" />
                     </a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="#servicos">Ver serviços</a>
                  </Button>
                </div>

                <div className="mt-8 flex flex-col gap-2 text-sm text-foreground/75 sm:flex-row sm:items-center sm:gap-6">
                  <span className="inline-flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-primary" />
                     Terapeuta: <span className="font-medium text-ink">{brand.therapist}</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Passo Fundo - RS
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <Card className="rounded-2xl border bg-background/70 shadow-soft">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl text-ink">Atendimento</CardTitle>
                    <CardDescription className="text-foreground/75">
                      Uma experiência com calma, presença e orientação — do primeiro contato ao acompanhamento.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="rounded-xl bg-secondary p-4">
                      <p className="text-sm font-medium text-ink">Horário</p>
                       <p className="mt-1 text-sm text-foreground/80">{brand.schedule}</p>
                    </div>
                    <div className="rounded-xl bg-secondary p-4">
                      <p className="text-sm font-medium text-ink">Contato</p>
                       <p className="mt-1 text-sm text-foreground/80">WhatsApp: {brand.whatsappDisplay}</p>
                       <p className="mt-1 text-sm text-foreground/80">Instagram: {brand.instagramHandle}</p>
                    </div>
                    <div className="rounded-xl bg-secondary p-4">
                      <p className="text-sm font-medium text-ink">Local</p>
                       <p className="mt-1 text-sm text-foreground/80">{brand.address}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-3 sm:flex-row">
                    <Button asChild variant="hero" className="w-full sm:w-auto">
                       <a href={links.whatsapp} target="_blank" rel="noreferrer">
                         Quero agendar
                       </a>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                       <a href={links.maps} target="_blank" rel="noreferrer">
                         Como chegar
                       </a>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* SOBRE */}
        <section id="sobre" className="scroll-mt-24">
          <div className="container py-6 sm:py-10">
            <SectionHeader
               eyebrow={brand.name}
               title="Um convite ao seu bem-estar, com sutileza e profundidade"
               description={
                 content.about_text ??
                 "A Além da Pele é uma clínica de terapias integrativas criada para quem busca reconexão e transformação com acolhimento. Aqui, cada sessão é construída com escuta, técnica e sensibilidade — sem pressa e sem excessos."
               }
             />

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
              {[ 
                {
                  title: "Acolhimento real",
                  text: "Um espaço seguro para você ser escutado(a) com presença e respeito.",
                },
                {
                  title: "Cuidado personalizado",
                  text: "Cada atendimento é guiado pelo seu momento — com técnica e intuição na medida.",
                },
                {
                  title: "Integração no dia a dia",
                  text: "Orientações simples e acompanhamento para sustentar resultados com leveza.",
                },
              ].map((item) => (
                <Card key={item.title} className="rounded-2xl bg-secondary/60 shadow-soft">
                  <CardHeader className="pb-4">
                    <CardTitle className="font-display text-xl text-ink">{item.title}</CardTitle>
                    <CardDescription className="text-foreground/75">{item.text}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* SERVIÇOS */}
        <section id="servicos" className="scroll-mt-24">
          <div className="container py-6 sm:py-10">
            <SectionHeader
              eyebrow="Serviços"
              title="Terapias integrativas para apoiar sua transformação"
              description="Escolha o que mais ressoa com você — ou converse com a Carla para uma indicação alinhada ao seu momento." 
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
               {services.map((service) => (
                 <Card key={service.title} className="group rounded-2xl bg-background/70 shadow-soft transition-transform will-change-transform hover:-translate-y-0.5">
                  <CardHeader>
                    <CardTitle className="font-display text-xl text-ink">{service.title}</CardTitle>
                    <CardDescription className="text-foreground/75">{service.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="justify-between">
                    <Button asChild variant="hero" className="w-full">
                       <a href={links.whatsapp} target="_blank" rel="noreferrer">
                         Quero agendar
                       </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="scroll-mt-24">
          <div className="container py-6 sm:py-10">
            <SectionHeader
              eyebrow="Como funciona"
              title="Um processo em três passos"
              description="Clareza e cuidado em cada etapa — para que você se sinta amparado(a) e confiante." 
            />

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Acolhimento",
                  text: "Entendemos suas necessidades, sua história e seu objetivo para a sessão.",
                },
                {
                  step: "2",
                  title: "Investigação e cuidado",
                  text: "Aplicamos as técnicas integrativas adequadas com orientação clara e conforto.",
                },
                {
                  step: "3",
                  title: "Integração e acompanhamento",
                  text: "Você sai com direcionamentos e, se fizer sentido, seguimos com acompanhamento.",
                },
              ].map((item) => (
                <Card key={item.step} className="rounded-2xl bg-secondary/60 shadow-soft">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-sm font-semibold text-ink shadow-soft">
                      {item.step}
                    </div>
                    <CardTitle className="font-display text-xl text-ink">{item.title}</CardTitle>
                    <CardDescription className="text-foreground/75">{item.text}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button asChild variant="premium" size="lg">
                 <a href={links.whatsapp} target="_blank" rel="noreferrer">
                   Quero conversar e agendar
                   <ArrowRight className="ml-1" />
                 </a>
              </Button>
            </div>
          </div>
        </section>

        <Divider />

        {/* DEPOIMENTOS */}
        <section aria-label="Depoimentos" className="scroll-mt-24">
          <div className="container py-6 sm:py-10">
            <SectionHeader
              eyebrow="Depoimentos"
              title="Relatos de quem viveu a experiência"
              description="Depoimentos curtos e reais — preservando a privacidade." 
            />

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
               {testimonials.map((t, idx) => (
                 <Card key={idx} className="rounded-2xl bg-background/70 shadow-soft">
                  <CardHeader>
                    <CardTitle className="font-display text-lg text-ink">{t.role}</CardTitle>
                    <CardDescription className="text-foreground/75">“{t.quote}”</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* LOCAL */}
        <section id="local" className="scroll-mt-24">
          <div className="container py-6 sm:py-10">
            <SectionHeader
              eyebrow="Local"
              title="Passo Fundo - RS"
              description="Atendimento presencial em um ambiente calmo e acolhedor — e também online." 
            />

            <div className="mx-auto mt-10 max-w-4xl">
              <Card className="rounded-2xl bg-secondary/60 shadow-soft">
                <CardHeader>
                  <CardTitle className="font-display text-2xl text-ink">Endereço</CardTitle>
                   <CardDescription className="text-foreground/75">{brand.address}</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                     <a href={links.maps} target="_blank" rel="noreferrer">
                       Como chegar
                     </a>
                  </Button>
                  <Button asChild variant="hero" className="w-full sm:w-auto">
                     <a href={links.whatsapp} target="_blank" rel="noreferrer">
                       Quero agendar
                     </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        <Divider />

        {/* CONTATO */}
        <section id="contato" className="scroll-mt-24">
          <div className="container py-10 sm:py-14">
            <div className="mx-auto max-w-5xl rounded-3xl border bg-background/70 p-6 shadow-soft sm:p-10">
              <div className="grid items-center gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <h2 className="text-balance font-display text-3xl font-semibold text-ink sm:text-4xl">
                    Vamos agendar seu atendimento?
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-foreground/80">
                     {content.contact_intro ??
                       "Envie uma mensagem no WhatsApp e a Carla te ajuda a encontrar o melhor horário. Sem formulários longos — direto, humano e acolhedor."}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="premium" size="lg" className="w-full sm:w-auto">
                       <a href={links.whatsapp} target="_blank" rel="noreferrer">
                         Agendar agora
                         <ArrowRight className="ml-1" />
                       </a>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                       <a href={links.instagram} target="_blank" rel="noreferrer">
                         {brand.instagramHandle}
                       </a>
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <Card className={cn("rounded-2xl bg-secondary/60 shadow-soft")}
                  >
                    <CardHeader>
                      <CardTitle className="font-display text-xl text-ink">Contato</CardTitle>
                      <CardDescription className="text-foreground/75">
                        Resposta de segunda a sexta, conforme disponibilidade.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="rounded-xl bg-background/70 p-4">
                        <p className="text-xs font-semibold tracking-[0.18em] text-foreground/70">WHATSAPP</p>
                         <p className="mt-2 text-sm font-medium text-ink">{brand.whatsappDisplay}</p>
                      </div>
                      <div className="rounded-xl bg-background/70 p-4">
                        <p className="text-xs font-semibold tracking-[0.18em] text-foreground/70">INSTAGRAM</p>
                         <p className="mt-2 text-sm font-medium text-ink">{brand.instagramHandle}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <footer className="mt-10 border-t pt-6 text-center text-xs text-foreground/70">
                <p>
                   © {new Date().getFullYear()} {brand.name} • {brand.therapist} • Passo Fundo - RS
                </p>
              </footer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
