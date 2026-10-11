/**
 * Original hand-drawn-style doodles (§17.3 #5) — a house, a key, and a phone with sound waves.
 * Line art in currentColor with an accent trail. Decorative only (aria-hidden).
 * `pathLength=1` lets .eq-draw animate any stroke from 0 -> full.
 */
export function HouseCallDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" className={className} aria-hidden="true">
      {/* accent trail */}
      <path d="M8 120c20-6 34-22 52-24s30 10 46 4" className="text-accent-ink" stroke="currentColor" strokeWidth="6" opacity=".35" />
      {/* house, slightly wobbly */}
      <path d="M36 70 71 41l36 28" />
      <path d="M44 64.5 45 106l53 .8-.6-42" />
      <path d="M64 106V84.5c0-1.6 1.2-2.6 2.8-2.6h9c1.5 0 2.7 1.1 2.7 2.6V106" />
      <path d="M89 51V38h7v18" />
      {/* phone handset */}
      <path d="M112 30c-3 0-5 2-5 5 0 15 12 27 27 27 3 0 5-2 5-5v-5l-8-3-4 4c-5-2-9-6-11-11l4-4-3-8h-5Z" />
      {/* sound waves */}
      <path d="M128 24c5 2 8 6 9 11" />
      <path d="M131 15c8 3 13 10 15 18" />
    </svg>
  );
}

export function KeyDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="16" cy="20" r="10" />
      <circle cx="16" cy="20" r="3" />
      <path d="M26 20h44l-2 6M60 20v6M52 20v5" />
    </svg>
  );
}

/** Hand-drawn arrow that draws itself when its parent gets .is-visible (#5). */
export function ArrowDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" className={className} aria-hidden="true">
      <path pathLength={1} className="eq-draw" d="M6 8c18 2 46 6 62 36" />
      <path pathLength={1} className="eq-draw" d="m58 40 10 6 4-12" />
    </svg>
  );
}
