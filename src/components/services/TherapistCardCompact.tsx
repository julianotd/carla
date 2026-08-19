import { useState } from "react";
import { Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import { Therapist, Service } from "@/data/services";

interface TherapistCardProps {
  therapist: Therapist;
  services: Service[];
  onFilterClick: (slug: string) => void;
}

export function TherapistCardCompact({
  therapist,
  services,
  onFilterClick,
}: TherapistCardProps) {
  const [imgError, setImgError] = useState(false);
  const therapistServices = services.filter(
    (s) => s.therapistSlug === therapist.slug || (s as any).therapistId === therapist.id
  );

  return (
    <div className="group bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden flex transition-all duration-500 hover:border-energy-gold/30 hover:-translate-y-0.5 min-h-[220px]">
      {/* Photo — lateral */}
      <div className="relative w-36 shrink-0 overflow-hidden bg-mystic-deep">
        {therapist.photo && !imgError ? (
          <img
            src={therapist.photo}
            alt={therapist.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 via-energy-gold/[0.06] to-white/5">
            <div className="w-12 h-12 rounded-full border border-energy-gold/30 flex items-center justify-center bg-mystic-black/60 shadow-[0_0_15px_rgba(200,169,106,0.15)]">
              <span className="font-serif text-lg text-energy-gold font-light">
                {therapist.initials}
              </span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1A1A1A]/80" />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center px-6 py-5 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h3 className="text-lg font-light text-[#EAE6DF] truncate">
            {therapist.name}
          </h3>
          {therapist.socialUrl && (
            <a 
              href={therapist.socialUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-[#EAE6DF]/30 hover:text-energy-gold transition-colors shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}
        </div>
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-energy-gold mb-3 block">
          {therapist.roleLabel}
        </span>
        <p className="text-sm text-[#EAE6DF]/60 leading-relaxed mb-4 line-clamp-2 italic">
          "{therapist.bio}"
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {therapistServices.slice(0, 3).map((s) => (
            <span
              key={s.id}
              className="font-mono text-[10px] tracking-wide text-[#EAE6DF]/40 bg-white/[0.03] border border-white/5 rounded-full px-2.5 py-1 flex items-center gap-1"
            >
              <span className="text-xs">{s.icon}</span>
              {s.name}
            </span>
          ))}
          {therapistServices.length > 3 && (
            <span className="font-mono text-[10px] text-[#EAE6DF]/30 py-1">
              +{therapistServices.length - 3}
            </span>
          )}
        </div>
        <button
          onClick={() => onFilterClick(therapist.slug)}
          className="font-mono text-[11px] tracking-wider text-energy-gold bg-transparent border-none cursor-pointer self-start transition-all duration-300 hover:tracking-[0.1em] uppercase"
        >
          Ver serviço →
        </button>
      </div>
    </div>
  );
}
