import { Button } from "./Button";

/**
 * The states every data surface must define (§22) — loading, empty, error — plus the
 * EstateIQ-specific async `processing` (§22.3). Build these in from the start; the Vapi
 * pipeline is async so a lead exists before its score/sentiment do.
 */
type Kind = "loading" | "empty" | "error" | "processing";

interface Props {
  kind: Kind;
  message?: string;
  action?: string;
  onAction?: () => void;
}

export function DataState({ kind, message, action, onAction }: Props) {
  if (kind === "processing") {
    return (
      <span className="inline-flex items-center gap-2 h-6 px-3 rounded-pill bg-accent-soft text-accent-ink text-small">
        <span className="w-2 h-2 rounded-pill bg-accent eq-breathe" />
        Processing…
      </span>
    );
  }
  if (kind === "loading") {
    return (
      <div className="bg-surface border border-border rounded-card p-4" aria-busy="true">
        {[100, 100, 60].map((w, i) => (
          <div key={i} className="h-3 rounded-control mb-2.5 last:mb-0 bg-border animate-pulse" style={{ width: `${w}%` }} />
        ))}
      </div>
    );
  }
  if (kind === "error") {
    return (
      <div className="bg-surface border border-border rounded-card p-4">
        <p className="text-body text-ink mb-3">{message ?? "Couldn't load this."}</p>
        <Button variant="secondary" className="h-9" onClick={onAction}>{action ?? "Retry"}</Button>
      </div>
    );
  }
  return (
    <div className="bg-surface border border-border rounded-card p-8 text-center">
      <p className="text-body text-ink-soft mb-3">{message ?? "Nothing here yet."}</p>
      {action && <Button variant="secondary" onClick={onAction}>{action}</Button>}
    </div>
  );
}
