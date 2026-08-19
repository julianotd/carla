import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Music, Play, Pause, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FrequencyPreset {
  id: string;
  name: string;
  hz: number;
  description: string;
}

const PRESETS: FrequencyPreset[] = [
  { id: "432", name: "432 Hz", hz: 432, description: "Harmonização Cósmica & Calma" },
  { id: "528", name: "528 Hz", hz: 528, description: "Transformação & Regeneração" },
  { id: "639", name: "639 Hz", hz: 639, description: "Conexão & Equilíbrio Emocional" },
];

export function FrequencyPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState<FrequencyPreset>(PRESETS[0]);
  const [volume, setVolume] = useState(0.2);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stopAudio = () => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.3);
      setTimeout(() => {
        try {
          osc1Ref.current?.stop();
          osc2Ref.current?.stop();
          osc1Ref.current?.disconnect();
          osc2Ref.current?.disconnect();
        } catch (_) {}
        osc1Ref.current = null;
        osc2Ref.current = null;
      }, 400);
    }
  };

  const startAudio = (hz: number) => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      stopAudio();

      const ctx = audioCtxRef.current;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.setTargetAtTime(isMuted ? 0 : volume, ctx.currentTime + 0.1, 0.4);

      // Primary sine oscillator (fundamental frequency)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(hz, ctx.currentTime);

      // Subtle warm sub-octave oscillator
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(hz / 2, ctx.currentTime);

      const subGain = ctx.createGain();
      subGain.gain.value = 0.25;

      osc1.connect(gainNode);
      osc2.connect(subGain);
      subGain.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      gainRef.current = gainNode;
    } catch (e) {
      console.error("Audio synth error:", e);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio(activePreset.hz);
      setIsPlaying(true);
    }
  };

  const handleSelectPreset = (preset: FrequencyPreset) => {
    setActivePreset(preset);
    if (isPlaying) {
      startAudio(preset.hz);
    }
  };

  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setTargetAtTime(
        isMuted ? 0 : volume,
        audioCtxRef.current.currentTime,
        0.1
      );
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      stopAudio();
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Expanded Control Box */}
      {isExpanded ? (
        <div className="crystal-card w-72 rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-energy-gold/30 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-energy-gold" />
              <span className="font-mono text-xs uppercase tracking-wider text-energy-gold font-medium">
                Frequências de Cura
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[#EAE6DF]/40 hover:text-[#EAE6DF] transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#EAE6DF]/60 mb-4 font-light leading-relaxed">
            {activePreset.description}
          </p>

          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={cn(
                  "py-2 px-1 rounded-xl text-xs font-mono transition-all border",
                  activePreset.id === p.id
                    ? "bg-energy-gold/20 border-energy-gold text-energy-gold font-bold shadow-[0_0_10px_rgba(200,169,106,0.3)]"
                    : "bg-white/5 border-white/5 text-[#EAE6DF]/60 hover:border-white/20"
                )}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={togglePlay}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all",
                isPlaying
                  ? "bg-energy-gold text-mystic-black font-semibold shadow-[0_0_20px_rgba(200,169,106,0.5)]"
                  : "bg-white/10 text-[#EAE6DF] hover:bg-white/20"
              )}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pausar
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Tocar
                </>
              )}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-[#EAE6DF]/70 hover:text-energy-gold transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        /* Floating Mini Pill */
        <button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "group flex items-center gap-3 px-4 py-2.5 rounded-full crystal-card border transition-all duration-300 hover:scale-105 hover:border-energy-gold/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
            isPlaying ? "border-energy-gold/40 text-energy-gold" : "border-white/10 text-[#EAE6DF]/70"
          )}
        >
          <div className="relative flex items-center justify-center">
            <Music className={cn("w-4 h-4 transition-transform", isPlaying && "animate-pulse")} />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-energy-gold animate-ping" />
            )}
          </div>

          <span className="font-mono text-xs tracking-wider uppercase">
            {isPlaying ? `${activePreset.name} Ativo` : "Som Ambiente"}
          </span>
        </button>
      )}
    </div>
  );
}
