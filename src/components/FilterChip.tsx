/** Toggle pill used by list filters (city, type, bedrooms…). `aria-pressed` carries the state for screen readers. */
export function FilterChip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-8 px-3 rounded-pill text-body border transition ${
        active ? "bg-ink text-surface border-ink" : "bg-surface text-ink-soft border-border hover:bg-surface-hover"
      }`}
    >
      {children}
    </button>
  );
}
