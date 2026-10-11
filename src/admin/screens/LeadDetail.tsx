import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, Phone } from "lucide-react";
import { STATUS_LABEL } from "@/api/status";
import { ScoreBadge } from "@/components/ScoreBadge";
import { EnquiryDetailsCard } from "@/components/EnquiryDetailsCard";
import { SentimentChip } from "@/components/SentimentChip";
import { IntentChip } from "@/components/IntentChip";
import { Transcript } from "@/components/Transcript";
import { WhyThisScore } from "@/components/WhyThisScore";
import {
  MODELS, SENTIMENT_CONFIDENCE_THRESHOLD, callTranscript, fmtDuration, leadInsights, useLeads, type AdminLead,
} from "../mock";
import { StatusSelect } from "./Leads";

const fmtDateTime = (t: number) =>
  new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const fmtDate = (t: number) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** Lead Detail (§11.3) — everything about one lead. Reads the shared lead state, so it matches the Leads row. */
export function LeadDetail() {
  const { id } = useParams();
  const all = useLeads();
  const lead = all.find((l) => l.id === id);
  if (!lead) {
    return (
      <div className="max-w-xl rounded-card border border-border bg-surface p-8">
        <h2 className="font-semibold text-h3">Lead not found</h2>
        <p className="text-body text-ink-soft mt-1">There's no lead with id “{id}”.</p>
        <Link to="/admin/leads" className="inline-block mt-4 text-small font-medium text-accent-ink hover:underline">← Back to leads</Link>
      </div>
    );
  }
  return <LeadDetailBody lead={lead} all={all} />;
}

function LeadDetailBody({ lead: l, all }: { lead: AdminLead; all: AdminLead[] }) {
  const ins = useMemo(() => leadInsights(l), [l]);
  const others = all.filter((o) => o.phone === l.phone && o.id !== l.id);
  const calls = [...l.calls].map((c, i) => ({ c, i })).reverse(); // newest first

  return (
    <div className="space-y-6 max-w-screen-2xl">
      <Link to="/admin/leads" className="inline-flex items-center gap-1 text-small text-ink-soft hover:text-ink rounded-control">
        <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" /> All leads
      </Link>

      {/* Header */}
      <header className="rounded-card border border-border bg-surface p-4 lg:p-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display font-semibold text-h1 tracking-tight">{l.name}</h2>
          <p className="text-body text-ink-soft mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <a href={`tel:${l.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-1.5 tnum hover:text-accent-ink rounded-control">
              <Phone size={14} strokeWidth={1.5} aria-hidden="true" /> {l.phone}
            </a>
            <span aria-hidden="true" className="text-ink-muted">·</span>
            <span>{l.project} · {l.locality}, {l.city}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ScoreBadge score={l.score} band={l.band} provisional={MODELS.provisional} />
          <StatusSelect lead={l} />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] items-start">
        {/* Left: requirements + calls */}
        <div className="space-y-6 min-w-0">
          <EnquiryDetailsCard details={ins.details} friendly={false} />

          <section aria-labelledby="calls-title" className="space-y-3">
            <h3 id="calls-title" className="font-semibold text-h2">
              Calls <span className="text-ink-muted font-normal tnum">({l.calls.length})</span>
            </h3>
            {calls.map(({ c, i }, n) => {
              const tr = callTranscript(l, i);
              return (
                // Native <details>: keyboard + screen-reader friendly; newest call open by default.
                <details key={c.id} open={n === 0} className="group rounded-card border border-border bg-surface">
                  <summary className="list-none cursor-pointer px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card focus-visible:shadow-focus [&::-webkit-details-marker]:hidden">
                    <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" className="text-ink-muted transition-transform duration-base group-open:rotate-180" />
                    <span className="font-medium">Call {i + 1}</span>
                    <span className="text-body text-ink-soft tnum">{fmtDateTime(c.at)}</span>
                    <span className="text-body text-ink-soft tnum">{fmtDuration(c.durationSec)}</span>
                    <span className="flex flex-wrap items-center gap-2 ml-auto">
                      <SentimentChip label={c.sentiment} confidence={c.confidence} threshold={SENTIMENT_CONFIDENCE_THRESHOLD} />
                      <IntentChip intent={c.intent} />
                    </span>
                  </summary>
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                    <p className="text-small text-ink-muted tnum">Timestamp {new Date(c.at).toISOString()} · highlighted words are what the AI extracted</p>
                    <Transcript turns={tr.turns} youLabel={l.name.split(" ")[0]} highlights={tr.highlights} />
                    <details className="group/tech rounded-control border border-border">
                      <summary className="list-none cursor-pointer px-3 py-2 text-small font-medium text-ink-soft hover:text-ink flex items-center gap-1.5 rounded-control focus-visible:shadow-focus [&::-webkit-details-marker]:hidden">
                        <ChevronDown size={14} strokeWidth={1.5} aria-hidden="true" className="transition-transform duration-base group-open/tech:rotate-180" />
                        Technical details <span className="font-normal text-ink-muted">(call_metadata)</span>
                      </summary>
                      <pre className="px-3 pb-3 text-small text-ink-soft overflow-x-auto font-mono">{JSON.stringify(tr.metadata, null, 2)}</pre>
                    </details>
                  </div>
                </details>
              );
            })}
          </section>
        </div>

        {/* Right: SHAP + other info */}
        <aside className="space-y-6 min-w-0">
          <WhyThisScore
            score={l.score}
            band={l.band}
            bars={ins.shap}
            provisional={MODELS.provisional}
            modelVersion={MODELS.scoring}
            scoredAt={fmtDateTime(ins.scoredAt)}
          />

          <section aria-labelledby="info-title" className="rounded-card border border-border bg-surface p-4">
            <h3 id="info-title" className="font-semibold text-h3 mb-3">Lead info</h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-body">
              <dt className="text-ink-soft">Lead ID</dt><dd className="tnum">{l.id}</dd>
              <dt className="text-ink-soft">Created</dt><dd className="tnum">{fmtDateTime(l.createdAt)}</dd>
              <dt className="text-ink-soft">Source</dt><dd>Website call widget</dd>
              <dt className="text-ink-soft">Status</dt><dd>{STATUS_LABEL[l.status]} <span className="text-ink-muted">· since {fmtDate(l.statusChangedAt)}</span></dd>
              <dt className="text-ink-soft">Calls</dt><dd className="tnum">{l.calls.length}</dd>
            </dl>
            <h4 className="font-medium text-body mt-4 mb-2">Other leads from this number</h4>
            {others.length ? (
              <ul className="space-y-1.5">
                {others.map((o) => (
                  <li key={o.id}>
                    <Link to={`/admin/leads/${o.id}`} className="text-body text-accent-ink hover:underline">{o.project} · {fmtDate(o.createdAt)}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-small text-ink-muted">None — this is the only enquiry from {l.phone}.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
