"use client";

/**
 * SpotlightCard — React Bits (https://reactbits.dev/components/spotlight-card),
 * JS+CSS variant adapted to TSX + Tailwind. A cursor-following radial glow that
 * fades in on hover; dependency-free (React + inline style only). Presentational
 * — pass the card's own border/background/padding via `className` and put the
 * clickable/focusable semantics on a wrapping element.
 */

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Colour of the spotlight glow. Kept subtle for a B2B look. */
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(120, 119, 198, 0.18)",
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  const overlayStyle: CSSProperties = {
    opacity,
    background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn("relative overflow-hidden", className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={overlayStyle}
      />
      {children}
    </div>
  );
}
