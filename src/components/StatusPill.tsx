import type { LeadStatus } from "@/api/types";
import { statusToFriendly } from "@/api/mock";
import { statusMeta } from "@/api/status";
import { cn } from "@/lib/utils";

/**
 * Lead status badge, colour-coded from the shared vocabulary (src/api/status.ts).
 * `internal` (admin) shows the real status; the default shows the client-friendly word.
 */
export function StatusPill({ status, internal = false, className }: { status: LeadStatus; internal?: boolean; className?: string }) {
  const m = statusMeta(status);
  return (
    <span className={cn("inline-flex items-center gap-1.5 h-6 px-2.5 rounded-pill border text-small text-ink whitespace-nowrap", m.tone, className)}>
      <span className={cn("w-2 h-2 rounded-pill", m.dot)} aria-hidden="true" />
      {internal ? m.label : statusToFriendly[status]}
    </span>
  );
}
