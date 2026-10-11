import type { LeadStatus } from "@/api/types";
import { statusToFriendly } from "@/api/mock";

const dot: Record<LeadStatus, string> = {
  new: "bg-cold",
  contacted: "bg-warm",
  converted: "bg-positive",
  lost: "bg-ink-muted",
};

/** Client-facing status: shows the friendly word, never the raw enum (§10.3). */
export function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-pill bg-surface border border-border text-small text-ink">
      <span className={`w-2 h-2 rounded-pill ${dot[status]}`} />
      {statusToFriendly[status]}
    </span>
  );
}
