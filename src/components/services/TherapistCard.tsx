import { useState } from "react";
import { Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import { Therapist, Service } from "@/data/services";

interface TherapistCardProps {
  therapist: Therapist;
  services: Service[];
  onFilterClick: (slug: string) => void;
}

export function TherapistCard({
  therapist,
  services,
  onFilterClick,
}: TherapistCardProps) {
  const [imgError, setImgError] = useState(false);
  const therapistServices = services.filter(
    (s) => s.therapistSlug === therapist.slug || (s as any).therapistId === therapist.id
  );

  return (
    <div className="group bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:border-energy-gold/30 hover:-translate-y-1 h-full flex flex-col">
      {/* ── PHOTO AREA ── */}
      <div className="relative h-96 overflow-hidden shrink-0 bg-mystic-deep">
        {/* Photo */}
        {therapist.photo && !imgError ? (
          <img
            src={therapist.photo}
            alt={therapist.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className={cn(
              "w-full h-full object-cover object-top transition-transform duration-700",
              "group-hover:scale-[1.04]"
            )}
          />
        ) : (
          /* Fallback sofisticado */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 via-energy-gold/[0.06] to-white/5">
            <div className="w-24 h-24 rounded-full border-2 border-energy-gold/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(200,169,106,0.15)] bg-mystic-black/60">
              <span className="font-serif text-3xl text-energy-gold font-light tracking-widest">
                {therapist.initials}
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-energy-gold/60">
              {therapist.name}
            </span>
          </div>
        )}

        {/* Overlay gradiente inferior */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent" />

        {/* Overlay escuro sutil */}
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />

        {/* Nome, cargo e social sobrepostos */}
        <div className="absolute bottom-0 left-0 right-0 px-7 pb-5 z-10 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-2xl font-light text-[#EAE6DF] mb-1 tracking-wide truncate">
              {therapist.name}
            </h3>
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-energy-gold block">
              {therapist.roleLabel}
            </span>
          </div>
          
          {therapist.socialUrl && (
            <a 
              href={therapist.socialUrl} 
              target="_blank" 
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-energy-gold/60 hover:text-energy-gold hover:bg-white/10 hover:border-energy-gold/30 transition-all duration-300 backdrop-blur-md mb-0.5 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Instagram className="w-5 h-5" />
            </a>
          )}
        </div>

        {/* Badge de destaque */}
        {therapist.role === "principal" && (
          <span className="absolute top-4 left-4 z-10 font-mono text-[10px] tracking-widest uppercase text-energy-gold bg-black/60 backdrop-blur-sm border border-energy-gold/20 rounded-full px-3 py-1">
            Fundadora
          </span>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className="px-7 pb-7 pt-5 flex flex-col flex-1">
        {/* Bio */}
        <p className="text-[0.95rem] text-[#EAE6DF]/70 leading-relaxed mb-6 italic">
          "{therapist.bio}"
        </p>

        {/* Services pills */}
        <div className="mb-6">
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#EAE6DF]/30 mb-3 block">
            Serviços
          </span>
          <div className="flex flex-wrap gap-2">
            {therapistServices.map((s) => (
              <span
                key={s.id}
                className="font-mono text-[11px] tracking-wide text-[#EAE6DF]/60 bg-white/[0.03] border border-white/5 rounded-full px-3 py-1.5 whitespace-nowrap flex items-center gap-1.5"
              >
                <span className="text-sm">{s.icon}</span>
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onFilterClick(therapist.slug)}
          className={cn(
            "w-full font-mono text-xs tracking-wider uppercase text-energy-gold mt-auto",
            "bg-transparent border border-white/10 rounded-full py-3.5",
            "cursor-pointer transition-all duration-300",
            "hover:border-energy-gold hover:bg-energy-gold/[0.05]"
          )}
        >
          Ver {therapist.serviceCount > 1 ? "serviços" : "serviço"} de{" "}
          {therapist.name.split(" ")[0]} →
        </button>
      </div>
    </div>
  );
}
