import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  HeartHandshake,
  MapPin,
  Sparkles,
  Users,
  Calendar,
  Star,
  Leaf,
  Image as ImageIcon,
  ChevronDown,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useLandingData } from "@/hooks/useLandingData";
import { PortalHero } from "./PortalHero";
import { TherapistCard } from "../services/TherapistCard";
import { TherapistCardCompact } from "../services/TherapistCardCompact";

// --- Animations ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export function LandingPage() {
  const {
    brand,
    links,
    services,
    testimonials,
    content,
    professionals,
    events,
    processSteps,
    faqs,
    loading,
    hero,
    aboutSection,
    therapistsSection,
    eventsSection,
    faqSection,
    contactSection,
  } = useLandingData();

  const [serviceFilter, setServiceFilter] = useState("all");

  const filteredServices = useMemo(() => {
    if (serviceFilter === "all") return services;
    if (serviceFilter === "convidados") return services.filter((s: any) => s.therapistId !== "carla");
    return services.filter((s: any) => s.therapistId === serviceFilter);
  }, [services, serviceFilter]);

  const handleTherapistLink = (slug: string) => {
    setServiceFilter(slug);
    document.getElementById("servicos")?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="topo" className="min-h-screen bg-mystic-black text-[#EAE6DF] scroll-smooth font-sans selection:bg-energy-gold/30">
      <main>
        {/* 1. HERO SECTION (PORTAL) */}
        <PortalHero 
          title={hero.title}
          subtitle={hero.subtitle}
          cta={hero.cta}
        />

        {/* 2. O QUE É ESSE ESPAÇO? */}
        <section id="conceito" className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-mystic-black to-mystic-deep">
          {/* Subtle overlay texture */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('/noise.svg')]" />
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="container relative z-10 max-w-[900px] text-center px-6"
          >
            {/* Organic Line Form */}
            <div className="w-full flex justify-center mb-8">
              <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10 C 15 20, 45 0, 60 10" stroke="rgba(200, 169, 106, 0.4)" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            
            <h2 className="font-display text-2xl sm:text-4xl text-energy-gold font-light italic mb-8 leading-relaxed">
              {aboutSection.title}
            </h2>
            <p className="text-xl sm:text-2xl leading-relaxed text-[#EAE6DF]/90 font-light max-w-2xl mx-auto whitespace-pre-line">
              {aboutSection.description}
            </p>
          </motion.div>
        </section>

        {/* 3. QUEM CONDUZ (THERAPISTS) */}
        <section id="profissionais" className="py-24 sm:py-32 bg-mystic-black border-y border-white/5">
          <div className="container max-w-6xl relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-xl mb-16"
            >
              <motion.span variants={fadeInUp} className="font-mono text-[11px] tracking-[0.2em] uppercase text-energy-gold mb-4 block">
                {therapistsSection.label}
              </motion.span>
              <motion.h2 variants={fadeInUp} className="font-display text-4xl sm:text-5xl mb-6 text-[#EAE6DF]">
                {therapistsSection.title}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-[#EAE6DF]/60 leading-relaxed italic">
                {therapistsSection.description}
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Carla — card principal, em destaque */}
              <div className="lg:row-span-2 h-full">
                {professionals && professionals.length > 0 && (
                  <TherapistCard
                    therapist={professionals[0]}
                    services={services}
                    onFilterClick={handleTherapistLink}
                  />
                )}
              </div>

              {/* Convidados — cards compactos */}
              <div className="flex flex-col gap-6">
                {professionals?.slice(1).map((t: any) => (
                  <TherapistCardCompact
                    key={t.slug}
                    therapist={t}
                    services={services}
                    onFilterClick={handleTherapistLink}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. COMO VOCÊ PODE SER ATENDIDO (SERVICES GRID WITH FILTERS) */}
        <section id="servicos" className="py-24 bg-mystic-deep relative">
          <div className="container relative z-10 max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="mb-12 text-center"
            >
              <motion.span variants={fadeInUp} className="text-energy-gold text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
                Nossos Caminhos
              </motion.span>
              <motion.h2 variants={fadeInUp} className="font-display text-4xl sm:text-5xl text-[#EAE6DF] mb-4">
                Como você pode ser atendido
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-[#EAE6DF]/60 text-lg max-w-2xl mx-auto">
                Cada caminho é único. Escolha o acesso que mais ressoa com o seu momento atual.
              </motion.p>
            </motion.div>

            {/* Filter Bar */}
            <div className="mb-12 flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-6 gap-6">
              <div className="flex items-center gap-4 sm:gap-8 flex-wrap justify-center">
                <button 
                  onClick={() => setServiceFilter("all")}
                  className={cn(
                    "text-xs uppercase tracking-[0.1em] transition-all duration-300 relative py-2",
                    serviceFilter === "all" ? "text-energy-gold" : "text-[#EAE6DF]/40 hover:text-[#EAE6DF]/70"
                  )}
                >
                  Todos
                  {serviceFilter === "all" && <motion.div layoutId="filter-active" className="absolute bottom-0 left-0 right-0 h-px bg-energy-gold" />}
                </button>
                <button 
                  onClick={() => setServiceFilter("carla")}
                  className={cn(
                    "text-xs uppercase tracking-[0.1em] transition-all duration-300 relative py-2",
                    serviceFilter === "carla" ? "text-energy-gold" : "text-[#EAE6DF]/40 hover:text-[#EAE6DF]/70"
                  )}
                >
                  Carla Schmitt
                  {serviceFilter === "carla" && <motion.div layoutId="filter-active" className="absolute bottom-0 left-0 right-0 h-px bg-energy-gold" />}
                </button>
                <button 
                  onClick={() => setServiceFilter("convidados")}
                  className={cn(
                    "text-xs uppercase tracking-[0.1em] transition-all duration-300 relative py-2",
                    serviceFilter === "convidados" ? "text-energy-gold" : "text-[#EAE6DF]/40 hover:text-[#EAE6DF]/70"
                  )}
                >
                  Convidados
                  {serviceFilter === "convidados" && <motion.div layoutId="filter-active" className="absolute bottom-0 left-0 right-0 h-px bg-energy-gold" />}
                </button>
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#EAE6DF]/30">
                {filteredServices.length} serviços disponíveis
              </div>
            </div>

            <motion.div
              layout
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredServices.map((service: any, idx) => {
                const therapist = professionals.find((p: any) => p.id === service.therapistId) || professionals[0];
                return (
                  <motion.div 
                    layout
                    key={service.id || idx} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={cn(
                      "group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/5 p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-20px_rgba(200,169,106,0.3)] hover:border-energy-gold/30 h-full flex flex-col cursor-default",
                      service.featured && "border-energy-gold/20 bg-gradient-to-br from-white/5 to-energy-gold/[0.03]"
                    )}>
                      {/* Therapist Badge if Guest */}
                      {service.therapistId !== "carla" && (
                        <div className="absolute top-4 right-4 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest text-[#EAE6DF]/40">
                          Convidado
                        </div>
                      )}

                      {/* Icon */}
                      <div className="w-12 h-12 rounded-full bg-energy-gold/10 border border-energy-gold/20 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                        {service.icon || "✨"}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-energy-gold/80 mb-2 block font-medium">
                          {service.title}
                        </span>
                        <h3 className="font-display text-2xl mb-3 italic text-[#EAE6DF]">
                          {service.phrase || service.title}
                        </h3>
                        <p className="text-[#EAE6DF]/60 text-sm font-light leading-relaxed mb-6 line-clamp-3">
                          {service.description}
                        </p>
                      </div>

                      {/* Therapist Signature */}
                      <div className="flex items-center gap-3 py-4 mb-6 border-t border-white/5">
                        <div className="w-8 h-8 rounded-full bg-energy-gold/20 border border-energy-gold/30 flex items-center justify-center text-[10px] text-energy-gold font-bold overflow-hidden">
                          {therapist.image ? (
                            <img src={therapist.image} alt={therapist.name} className="w-full h-full object-cover" />
                          ) : (
                            therapist.avatar || "CS"
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-[#EAE6DF]/80">{therapist.name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-[#EAE6DF]/30">Terapeuta Responsável</span>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-2 mb-8">
                        {service.duration && (
                          <div className="text-[10px] bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-[#EAE6DF]/50">
                            ⏱ {service.duration}
                          </div>
                        )}
                        {service.modality && (
                          <div className="text-[10px] bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-[#EAE6DF]/50">
                            {service.modality}
                          </div>
                        )}
                        {service.price && (
                          <div className="text-[10px] bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-[#EAE6DF]/50 font-medium text-energy-gold/80">
                            {service.price}
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="flex gap-3 mt-auto">
                        <Button 
                          onClick={() => window.open(links.whatsapp, '_blank')}
                          className="flex-1 bg-energy-gold text-mystic-black hover:bg-white border-none rounded-full h-11 text-xs uppercase tracking-widest font-medium transition-all"
                        >
                          Agendar →
                        </Button>
                        <Button 
                          variant="outline"
                          className="px-6 border-white/10 text-[#EAE6DF]/60 hover:text-energy-gold hover:border-energy-gold/30 rounded-full h-11 text-xs uppercase tracking-widest transition-all"
                        >
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
        {/* 5. COMO FUNCIONA O PROCESSO (TIMELINE) */}
        <section id="como-funciona" className="py-24 sm:py-32 bg-gradient-to-b from-mystic-deep to-mystic-black relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-energy-gold/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
          
          <div className="container max-w-4xl relative z-10">
             <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl text-[#EAE6DF] mb-4">
                A jornada do seu processo
              </h2>
            </motion.div>

            <div className="relative border-l border-energy-gold/30 ml-4 sm:ml-8 pl-8 sm:pl-12 space-y-16 py-4">
              {processSteps?.map((step: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.8, delay: idx * 0.2 }}
                  className="relative group"
                >
                  <div className="absolute -left-[45px] sm:-left-[61px] top-1.5 w-4 h-4 rounded-full bg-mystic-black border-[3px] border-energy-gold/50 group-hover:scale-125 group-hover:border-energy-gold transition-all duration-300 shadow-[0_0_10px_rgba(200,169,106,0)] group-hover:shadow-[0_0_15px_rgba(200,169,106,0.6)]" />
                  
                  <span className="text-energy-gold text-xs font-semibold tracking-[0.2em] uppercase mb-2 block">
                    {step.phase}
                  </span>
                  <h3 className="font-display text-3xl mb-3">{step.title}</h3>
                  <p className="text-[#EAE6DF]/70 text-lg font-light leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. DEPOIMENTOS (PROVA EMOCIONAL) */}
        <section className="py-32 bg-mystic-deep relative overflow-hidden">
          {/* subtle particles */}
           <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
             <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_#fff]" />
             <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_#fff]" />
             <div className="absolute bottom-1/4 left-2/3 w-1.5 h-1.5 bg-energy-gold rounded-full shadow-[0_0_15px_3px_#C8A96A]" />
           </div>

          <div className="container max-w-6xl relative z-10">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-8 md:grid-cols-3"
            >
              {testimonials.map((t, idx) => (
                <motion.div key={idx} variants={fadeInUp}>
                  <div className="h-full bg-mystic-black/50 backdrop-blur-lg border border-white/5 rounded-3xl p-10 hover:border-energy-gold/20 transition-all duration-300">
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-energy-gold fill-energy-gold" />)}
                    </div>
                    <p className="text-lg text-[#EAE6DF]/90 font-display font-light leading-relaxed italic mb-8">
                      "{t.quote}"
                    </p>
                    <p className="text-xs font-semibold tracking-widest text-[#EAE6DF]/40 uppercase mt-auto">
                      {t.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 7. EXPERIÊNCIAS / EVENTOS */}
        <section id="eventos" className="py-24 bg-mystic-black">
          <div className="container max-w-5xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mb-12"
            >
              <h2 className="font-display text-4xl">Comunidade & Rodas</h2>
            </motion.div>

            {events && events.length > 0 ? (
              <div className="space-y-6">
                {events.map((evt: any) => (
                  <motion.div 
                    key={evt.id} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group flex flex-col md:flex-row items-center gap-6 bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-energy-gold/30 transition-all"
                  >
                    <div className="w-full md:w-48 text-center md:text-left md:border-r border-white/10 shrink-0 pr-6">
                       <span className="text-sm font-semibold tracking-widest text-energy-gold uppercase mb-1 block">
                        Agenda
                      </span>
                      <p className="text-xl font-display text-[#EAE6DF]">{evt.date}</p>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                        <h3 className="font-display text-2xl group-hover:text-energy-gold transition-colors">{evt.title}</h3>
                        <Badge className="bg-energy-gold/20 text-energy-gold border-none font-normal text-xs uppercase tracking-wider w-fit mx-auto md:mx-0">
                          Vivência ativa
                        </Badge>
                      </div>
                      <p className="text-[#EAE6DF]/60 text-sm">Facilitador(a): {evt.facilitator}</p>
                    </div>

                    <div className="shrink-0 mt-4 md:mt-0">
                      <Button asChild variant="outline" className="border-energy-gold text-energy-gold hover:bg-energy-gold hover:text-mystic-black rounded-full w-full md:w-auto">
                         <a href={links.whatsapp} target="_blank" rel="noreferrer">Garantir vaga</a>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 border border-white/5 rounded-2xl text-center bg-white/5">
                <p className="text-[#EAE6DF]/50 italic">Nenhum evento em comunidade aberto no momento.</p>
              </div>
            )}
          </div>
        </section>

        {/* 8. QUEBRA DE OBJEÇÃO (FAQ) */}
        <section className="py-24 bg-gradient-to-b from-mystic-black to-mystic-deep">
          <div className="container max-w-3xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mb-12 text-center"
            >
              <h2 className="font-display text-4xl mb-4">Ainda sente dúvida?</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs?.map((faq: any, i: number) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border border-white/5 bg-white/5 rounded-xl px-6 data-[state=open]:border-energy-gold/30 transition-colors">
                    <AccordionTrigger className="text-left font-display text-xl text-[#EAE6DF] hover:no-underline hover:text-energy-gold py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#EAE6DF]/70 text-base font-light leading-relaxed pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* 9. CHAMADA FINAL (CONVERSÃO) */}
        <section className="py-32 relative overflow-hidden bg-mystic-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-energy-gold/10 via-mystic-black to-mystic-black opacity-60" />
          
          <div className="container relative z-10 max-w-4xl text-center drop-shadow-[0_0_30px_rgba(200,169,106,0.15)]">
            <h2 className="font-display text-4xl sm:text-5xl font-normal text-energy-gold leading-tight mb-8">
              Se algo em você chegou até aqui,<br className="hidden sm:block" />
              talvez já seja o momento de olhar para isso.
            </h2>
            
            <div className="mt-12">
               <Button asChild size="lg" className="bg-energy-gold text-mystic-black hover:bg-white hover:scale-105 hover:shadow-[0_0_30px_rgba(200,169,106,0.6)] border-none rounded-full px-12 h-14 text-lg font-sans transition-all duration-300">
                <a href={links.whatsapp} target="_blank" rel="noreferrer">
                  Agendar meu momento
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 10. RODAPÉ */}
      <footer id="contato" className="bg-mystic-black border-t border-white/5 pt-16 pb-8">
        <div className="container max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div id="local" className="max-w-sm">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-energy-gold" />
                <span className="font-display text-2xl text-[#EAE6DF]">{brand.name}</span>
              </div>
              <p className="text-[#EAE6DF]/50 font-light text-sm">
                {brand.address}
              </p>
            </div>
            
            <div className="flex gap-12">
               <div>
                 <h4 className="font-medium text-[#EAE6DF] mb-4 text-sm font-sans tracking-wide uppercase">Contato</h4>
                 <ul className="space-y-3">
                   <li>
                     <a href={links.whatsapp} target="_blank" rel="noreferrer" className="text-[#EAE6DF]/60 hover:text-energy-gold text-sm flex items-center gap-2 transition-colors">
                       <MessageCircle className="w-4 h-4" /> {brand.whatsappDisplay}
                     </a>
                   </li>
                 </ul>
               </div>
               <div>
                 <h4 className="font-medium text-[#EAE6DF] mb-4 text-sm font-sans tracking-wide uppercase">Social</h4>
                 <ul className="space-y-3">
                   <li>
                     <a href={links.instagram} target="_blank" rel="noreferrer" className="text-[#EAE6DF]/60 hover:text-energy-gold text-sm flex items-center gap-2 transition-colors">
                       <Instagram className="w-4 h-4" /> Instagram
                     </a>
                   </li>
                 </ul>
               </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
             <p className="text-[#EAE6DF]/40 text-xs">
               &copy; {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.
             </p>
             <p className="font-display italic text-[#EAE6DF]/60 text-lg">
               Cada processo começa com um passo.
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
