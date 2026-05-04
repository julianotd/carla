import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Point {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function PortalHero({ 
  title, 
  subtitle, 
  cta 
}: { 
  title?: React.ReactNode; 
  subtitle?: string; 
  cta?: string;
}) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create static random particles once
  const [particles, setParticles] = useState<Point[]>([]);

  useEffect(() => {
    const pts: Point[] = [];
    for (let i = 0; i < 40; i++) {
      pts.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 5 + 5,
        delay: Math.random() * 5,
      });
    }
    setParticles(pts);
  }, []);

  useEffect(() => {
    if (soundEnabled) {
      if (!audioRef.current) {
        // Local calming sound
        audioRef.current = new Audio("/ambient.ogg");
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
      }
      audioRef.current.play().catch(console.error);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [soundEnabled]);

  // Parallax based on scroll
  const { scrollY } = useScroll();
  const yFog = useTransform(scrollY, [0, 1000], [0, 200]);
  const yPortal = useTransform(scrollY, [0, 1000], [0, 400]);
  const yText = useTransform(scrollY, [0, 1000], [0, 150]);

  // Mouse Parallax Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { width, height, left, top } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    // Set custom deeper variables for layers
    containerRef.current.style.setProperty("--mx", `${x * 40}px`);
    containerRef.current.style.setProperty("--my", `${y * 40}px`);
    containerRef.current.style.setProperty("--m-portal-x", `${x * 100}px`);
    containerRef.current.style.setProperty("--m-portal-y", `${y * 100}px`);
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[100vh] min-h-[600px] overflow-hidden bg-mystic-black flex items-center justify-center font-serif text-[#EAE6DF]"
    >
      {/* 2. BASE MYSTIC BACKGROUND (Radial center to dark edges) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-mystic-light via-mystic-deep to-mystic-black opacity-80" />

      {/* 3. FOG (Smoke Drift Layer) */}
      <motion.div 
        style={{ y: yFog }}
        className="absolute inset-0 scale-[1.3] pointer-events-none" // Scale larger to allow drifting without seeing edges
      >
        <div className="absolute inset-0 spiritual-fog opacity-[0.09] animate-drift mix-blend-overlay" />
      </motion.div>

      {/* 5. THE PORTAL */}
      <motion.div 
        style={{ y: yPortal }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div 
          className="w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full animate-pulse-portal"
          style={{
            background: "radial-gradient(circle, transparent 15%, rgba(200, 169, 106, 0.4) 45%, transparent 70%)",
            filter: "blur(60px)",
            transform: "translate(var(--m-portal-x, 0), var(--m-portal-y, 0))",
            transition: "transform 0.4s ease-out"
          }}
        />
      </motion.div>

      {/* 4. PARTICLES */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-energy-gold shadow-[0_0_10px_2px_rgba(200,169,106,0.5)]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -100, -200],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* 7 & 8 & 9 & 10. TEXT AND CONTENT */}
      <motion.div 
        style={{ y: yText }}
        className="relative z-10 w-full max-w-4xl px-4 text-center pointer-events-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
      >
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="block text-energy-gold/80 text-sm sm:text-base md:text-lg uppercase tracking-[0.3em] mb-6 font-sans"
        >
          {subtitle || "Terapia Integrativa & Bem-estar Sutil"}
        </motion.span>
        <h1 
          className="text-4xl sm:text-5xl md:text-[64px] leading-tight font-medium tracking-wide drop-shadow-[0_0_25px_rgba(200,169,106,0.3)] mb-12"
          style={{ textShadow: "0px 4px 20px rgba(0,0,0,0.5)" }}
        >
          {title || (
            <>
              Nem tudo que transforma <br className="hidden md:block" />
              pode ser visto. <br className="hidden md:block" />
              <span className="text-energy-gold/90">Mas pode ser sentido.</span>
            </>
          )}
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
        >
          <Button 
            asChild
            className="bg-energy-gold text-mystic-black hover:bg-white hover:text-mystic-black hover:scale-105 hover:shadow-[0_0_30px_rgba(200,169,106,0.6)] border-none rounded-full px-12 h-14 text-lg font-sans font-medium transition-all duration-300"
          >
            <a href="#conceito">{cta || "Quero acessar esse espaço"}</a>
          </Button>
        </motion.div>
      </motion.div>

      {/* 11. AMBIENT SOUND BUTTON */}
      <div className="absolute bottom-6 right-6 z-20">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="rounded-full bg-mystic-black/40 border-energy-gold/30 text-energy-gold hover:bg-energy-gold/20 backdrop-blur-md font-sans text-xs flex gap-2 items-center"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3 h-3" /> Silenciar ambiente
            </>
          ) : (
            <>
              <VolumeX className="w-3 h-3" /> Ativar som ambiente
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
