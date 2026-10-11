import type { TranscriptTurn } from "@/api/types";

/**
 * Call rendered as a clean chat — no audio player (audio is never stored, §Principle 2).
 * Client opens the call, so client turns sit left, agent right. The `text` font family
 * carries Devanagari for code-mixed Hindi/Marathi/English; `lang` aids screen readers.
 */
export function Transcript({ turns, youLabel = "You" }: { turns: TranscriptTurn[]; youLabel?: string }) {
  return (
    <div className="flex flex-col gap-2.5 font-text">
      {turns.map((t, i) => {
        const client = t.who === "client";
        return (
          <div key={i} className={`flex ${client ? "justify-start" : "justify-end"}`}>
            <div
              lang={t.lang}
              className={`max-w-[80%] text-body px-3 py-2 border border-border ${
                client ? "bg-surface rounded-card rounded-bl-sm" : "bg-bg rounded-card rounded-br-sm"
              }`}
            >
              <div className="text-small text-ink-muted mb-0.5 font-sans">{client ? youLabel : "Property assistant"}</div>
              {t.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
