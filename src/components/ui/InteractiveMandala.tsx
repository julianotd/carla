import { useState } from "react";
import { cn } from "@/lib/utils";

interface InteractiveMandalaProps {
  className?: string;
  size?: number;
}

export function InteractiveMandala({ className, size = 420 }: InteractiveMandalaProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [pulse, setPulse] = useState(false);

  const handleClick = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 700);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative cursor-pointer transition-transform duration-700 select-none group",
        isHovered && "scale-105",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Background Soft Glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-700 blur-[80px]",
          isHovered
            ? "bg-energy-gold/30 scale-110"
            : "bg-energy-gold/15 scale-90",
          pulse && "bg-energy-gold/60 scale-125 blur-[100px]"
        )}
      />

      {/* SVG Sacred Geometry Mandala */}
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_20px_rgba(200,169,106,0.3)]"
      >
        {/* Layer 1: Outer Orbit Circle & Tick Marks */}
        <g className="mandala-rotate-slow origin-center">
          <circle
            cx="250"
            cy="250"
            r="230"
            stroke="rgba(200, 169, 106, 0.25)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <circle
            cx="250"
            cy="250"
            r="215"
            stroke="rgba(200, 169, 106, 0.15)"
            strokeWidth="1"
          />
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            const x1 = 250 + 215 * Math.cos(angle);
            const y1 = 250 + 215 * Math.sin(angle);
            const x2 = 250 + 230 * Math.cos(angle);
            const y2 = 250 + 230 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(200, 169, 106, 0.3)"
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Layer 2: Counter-Rotating Geometric Star / Octagram */}
        <g className="mandala-rotate-reverse origin-center">
          <polygon
            points="250,50 310,190 450,250 310,310 250,450 190,310 50,250 190,190"
            stroke="rgba(200, 169, 106, 0.35)"
            strokeWidth="1.2"
            fill="rgba(200, 169, 106, 0.02)"
          />
          <polygon
            points="250,70 390,250 250,430 110,250"
            stroke="rgba(200, 169, 106, 0.2)"
            strokeWidth="1"
          />
          <polygon
            points="123,123 377,123 377,377 123,377"
            stroke="rgba(200, 169, 106, 0.2)"
            strokeWidth="1"
          />
        </g>

        {/* Layer 3: Concentric Flower Petals */}
        <g className="mandala-rotate-slow origin-center opacity-80">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const cx = 250 + 75 * Math.cos(angle);
            const cy = 250 + 75 * Math.sin(angle);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="75"
                stroke="rgba(200, 169, 106, 0.3)"
                strokeWidth="1"
                fill="none"
              />
            );
          })}
        </g>

        {/* Layer 4: Central Sacred Core */}
        <circle
          cx="250"
          cy="250"
          r="45"
          stroke="rgba(200, 169, 106, 0.6)"
          strokeWidth="1.5"
          fill="rgba(200, 169, 106, 0.08)"
          className={cn("transition-all duration-500", isHovered && "fill-energy-gold/20")}
        />
        <circle
          cx="250"
          cy="250"
          r="15"
          fill="rgba(200, 169, 106, 0.8)"
          className={cn("transition-all duration-300", pulse && "scale-150 fill-white")}
        />

        {/* Outer Crystal Points */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const px = 250 + 215 * Math.cos(angle);
          const py = 250 + 215 * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={px}
              cy={py}
              r="3"
              fill="rgba(200, 169, 106, 0.9)"
            />
          );
        })}
      </svg>
    </div>
  );
}
