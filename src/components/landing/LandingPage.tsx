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
  } = useLandingData();

  return (
    <div id="topo" className="min-h-screen bg-mystic-black text-[#EAE6DF] scroll-smooth font-sans selection:bg-energy-gold/30">
      <main>
        {/* 1. HERO SECTION (PORTAL) */}
        <PortalHero />

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
              Este não é apenas um espaço terapêutico.
            </h2>
            <p className="text-xl sm:text-2xl leading-relaxed text-[#EAE6DF]/90 font-light max-w-2xl mx-auto">
              É um campo onde processos se revelam, <br className="hidden sm:block" />
              emoções ganham voz <br className="hidden sm:block" />
              e a energia encontra caminho.
            </p>
          </motion.div>
        </section>

        {/* 3. COMO VOCÊ PODE SER ATENDIDO (EXPERIENCES GRID) */}
        <section id="servicos" className="py-24 bg-mystic-deep relative">
          <div className="container relative z-10 max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="mb-16 text-center"
            >
              <motion.h2 variants={fadeInUp} className="font-display text-4xl text-[#EAE6DF] mb-4">
                Como você pode ser atendido
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-[#EAE6DF]/60 text-lg">
                Selecione o acesso que mais ressoa com o seu momento.
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {services.map((service: any, idx) => (
                <motion.div key={idx} variants={fadeInUp}>
                  <div 
                    onClick={() => window.open(links.whatsapp, '_blank', 'noopener,noreferrer')}
                    className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/5 p-8 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_-20px_rgba(200,169,106,0.3)] hover:border-energy-gold/30 h-full flex flex-col justify-between cursor-pointer"
                  >
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-mystic-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="font-display text-2xl font-normal group-hover:text-energy-gold transition-colors">
                          {service.title}
                        </h3>
                      </div>
                      <p className="text-[#EAE6DF]/70 mb-8 font-light leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="relative z-10 mt-auto pt-4 border-t border-white/10">
                      <p className="text-sm font-medium text-energy-gold/90 h-10 flex items-center transition-all duration-300 transform translate-y-2 opacity-60 group-hover:translate-y-0 group-hover:opacity-100 italic">
                        {service.hoverText || "Agende uma sessão."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 4. COMO FUNCIONA O PROCESSO (TIMELINE) */}
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

        {/* 5. QUEM CONDUZ (THERAPIST) */}
        <section id="profissionais" className="py-24 sm:py-32 bg-mystic-black relative overflow-hidden">
          <div className="container max-w-6xl relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-20 sm:mb-28"
            >
              <motion.h2 variants={fadeInUp} className="font-display text-4xl sm:text-5xl mb-6 text-[#EAE6DF]">
                Quem conduz o campo
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-[#EAE6DF]/60 text-lg sm:text-xl font-light mb-12 max-w-2xl mx-auto">
                Cada atendimento é conduzido com escuta, presença e respeito ao seu momento.
              </motion.p>
            </motion.div>

            <div className="flex flex-col gap-24 sm:gap-32">
              {professionals?.map((pro: any, index: number) => {
                const isEven = index % 2 === 0;
                // Organic border radius variations similar to the reference
                const blobStyle = isEven 
                  ? { borderRadius: "60% 40% 60% 40% / 40% 60% 40% 60%" }
                  : { borderRadius: "40% 60% 40% 60% / 60% 40% 60% 40%" };

                return (
                  <motion.div 
                    key={pro.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-15%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-20`}
                  >
                    {/* Image side */}
                    <div className="w-full md:w-1/2 flex justify-center">
                      <div 
                        className="relative group w-72 h-[22rem] sm:w-[26rem] sm:h-[32rem] overflow-hidden" 
                        style={blobStyle}
                      >
                        <div className="absolute inset-0 bg-energy-gold/10 mix-blend-multiply z-10 transition-opacity duration-700 group-hover:opacity-0 pointer-events-none" />
                        <div className="w-full h-full transform transition-transform duration-[1.5s] ease-out group-hover:scale-[1.05]">
                           {pro.image ? (
                            <img src={pro.image} alt={pro.name} className="w-full h-full object-cover filter contrast-125 saturate-50 group-hover:saturate-100 transition-all duration-[1.5s] ease-out" />
                          ) : (
                            <div className="w-full h-full bg-mystic-deep flex items-center justify-center text-energy-gold">
                              <Users className="w-24 h-24 opacity-50" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Text side */}
                    <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                      <h3 className="font-display text-4xl sm:text-5xl font-medium text-energy-gold mb-3">{pro.name}</h3>
                      <div className="flex flex-col items-center md:items-start text-center md:text-left mb-8">
                        <p className="text-white/50 font-sans uppercase tracking-[0.2em] text-xs sm:text-sm">
                          {pro.role}
                        </p>
                        {pro.socialUrl && (
                          <a href={pro.socialUrl} target="_blank" rel="noreferrer" className="mt-3 text-[#EAE6DF]/50 hover:text-energy-gold transition-colors flex items-center gap-2 text-sm">
                            <Instagram className="w-4 h-4" /> Perfil Social
                          </a>
                        )}
                      </div>
                      
                      <div className="space-y-8 flex flex-col items-center md:items-start">
                        <p className="text-[#EAE6DF]/90 text-lg sm:text-xl font-light leading-relaxed border-l-2 border-energy-gold/50 pl-6 italic max-w-lg">
                          "Acredito que a verdadeira cura acontece quando criamos um espaço seguro o suficiente para o seu corpo aceitar soltar."
                        </p>
                        <div className="pt-4">
                          <Button asChild size="lg" className="bg-transparent border border-energy-gold text-energy-gold hover:bg-energy-gold hover:text-mystic-black rounded-full px-8 h-12 transition-all duration-500 font-sans tracking-wide">
                            <a href={links.whatsapp} target="_blank" rel="noreferrer">Agendar com {pro.name.split(' ')[0]}</a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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
