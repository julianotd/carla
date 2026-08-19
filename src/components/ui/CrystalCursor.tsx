import { useEffect, useState } from "react";

export function CrystalCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if device supports touch or reduced motion
    const touchQuery = window.matchMedia("(pointer: coarse)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (touchQuery.matches || motionQuery.matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [visible]);

  useEffect(() => {
    if (isTouchDevice || !visible) return;

    // Smooth trailing animation loop
    let animationFrameId: number;
    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const animateTrail = () => {
      setTrailingPos((prev) => ({
        x: lerp(prev.x, position.x, 0.15),
        y: lerp(prev.y, position.y, 0.15),
      }));
      animationFrameId = requestAnimationFrame(animateTrail);
    };

    animationFrameId = requestAnimationFrame(animateTrail);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position, visible, isTouchDevice]);

  if (isTouchDevice || !visible) return null;

  return (
    <>
      {/* Central Crystal Pointer */}
      <div
        className="pointer-events-none fixed z-50 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-energy-gold shadow-[0_0_12px_rgba(200,169,106,0.9)] transition-transform duration-75"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      {/* Soft Aura Trail */}
      <div
        className="pointer-events-none fixed z-40 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-energy-gold/30 bg-energy-gold/10 backdrop-blur-[1px] shadow-[0_0_20px_rgba(200,169,106,0.2)] transition-opacity duration-300"
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
        }}
      />
    </>
  );
}
