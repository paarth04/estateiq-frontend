/** Temporary body for admin areas not built yet. */
export function Placeholder({ title, note }: { title: string; note?: string }) {
  return (
    <div className="max-w-xl rounded-card border border-dashed border-border bg-surface p-8">
      <h2 className="font-semibold text-h3">{title}</h2>
      <p className="text-body text-ink-soft mt-1">{note ?? "Coming in a later step."}</p>
    </div>
  );
}
