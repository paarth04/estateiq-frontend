import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/motion";

/**
 * Hero-only doodles (DESIGN.md §17.6). Inline SVG so each stroke can DRAW via pathLength
 * (the one allowed non-transform/opacity animation). Original artwork — house, phone with three
 * signal arcs, key, and a brush underline. Decorative: aria-hidden.
 *
 * Idle loops are CSS classes (hl-*) that only run under `.hero-idle` — see index.css.
 * Under prefers-reduced-motion every stroke renders fully drawn (initial={false}).
 */

const EASE = [0.22, 1, 0.36, 1] as const;

function useDraw() {
  const reduce = useReducedMotion();
  return (delay: number, duration = 0.5) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { delay, duration, ease: EASE },
        };
}

/** House outline draws at `at`s, phone at `at + 0.15`, the three arcs right after and then pulse. */
export function HouseCallDoodleAnimated({ className = "", at = 0.9 }: { className?: string; at?: number }) {
  const draw = useDraw();
  return (
    <svg viewBox="0 0 160 140" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" className={className} aria-hidden="true">
      {/* accent trail */}
      <motion.path d="M8 120c20-6 34-22 52-24s30 10 46 4" className="text-accent-ink" stroke="currentColor" strokeWidth="6" opacity=".35" {...draw(at, 0.6)} />
      {/* house */}
      <motion.path d="M36 70 71 41l36 28" {...draw(at, 0.35)} />
      <motion.path d="M44 64.5 45 106l53 .8-.6-42" {...draw(at + 0.05, 0.4)} />
      <motion.path d="M64 106V84.5c0-1.6 1.2-2.6 2.8-2.6h9c1.5 0 2.7 1.1 2.7 2.6V106" {...draw(at + 0.1, 0.3)} />
      <motion.path d="M89 51V38h7v18" {...draw(at + 0.1, 0.25)} />
      {/* phone handset */}
      <motion.path d="M112 30c-3 0-5 2-5 5 0 15 12 27 27 27 3 0 5-2 5-5v-5l-8-3-4 4c-5-2-9-6-11-11l4-4-3-8h-5Z" {...draw(at + 0.15, 0.45)} />
      {/* three signal arcs — pulse in sequence when idle (hl-arc, --i staggers) */}
      {["M127 26c4 2 7 5 8 9", "M130 18c7 3 11 8 13 15", "M133 10c9 4 15 11 18 21"].map((d, i) => (
        <motion.path key={d} d={d} className="hl-arc" style={{ ["--i" as string]: i }} {...draw(at + 0.35 + i * 0.08, 0.25)} />
      ))}
    </svg>
  );
}

/** Key: the wrapper slides in (Landing); the inner group swings on idle (hl-swing, pivots on the ring). */
export function KeyDoodleAnimated({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" className={className} aria-hidden="true">
      <g className="hl-swing">
        <circle cx="16" cy="20" r="10" />
        <circle cx="16" cy="20" r="3" />
        <path d="M26 20h44l-2 6M60 20v6M52 20v5" />
      </g>
    </svg>
  );
}

/** Accent (amber) brush stroke under the italic accent word; absolutely positioned, so no layout shift. */
export function BrushUnderline({ at = 0.8, className = "" }: { at?: number; className?: string }) {
  const draw = useDraw();
  return (
    <svg viewBox="0 0 120 16" preserveAspectRatio="none" fill="none" aria-hidden="true"
      className={`pointer-events-none absolute left-0 w-full h-[0.22em] top-[92%] text-accent-ink ${className}`}>
      <motion.path
        d="M3 10C25 5 52 4 78 6c14 1 27 2 39 1"
        stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity=".85"
        {...draw(at, 0.5)}
      />
    </svg>
  );
}
