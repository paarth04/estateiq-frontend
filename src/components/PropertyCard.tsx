import { Bed, Bath, Phone, Heart } from "lucide-react";
import type { Property } from "@/api/types";
import { Card } from "./Card";
import { Button } from "./Button";
import { CityPill } from "./CityPill";

interface Props {
  property: Property;
  saved?: boolean;
  onSave?: (id: string) => void;
  onAsk?: (p: Property) => void;
}

export function PropertyCard({ property: p, saved = false, onSave, onAsk }: Props) {
  return (
    <Card className="p-4 eq-risein">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-h3">{p.type}</h3>
          <p className="text-body text-ink-soft mt-0.5">{p.project}</p>
        </div>
        <span className="font-semibold text-h3 tnum">{p.price}</span>
      </div>
      <div className="flex items-center gap-4 text-body text-ink-soft mt-3">
        <span className="inline-flex items-center gap-1.5"><Bed size={16} strokeWidth={1.5} />{p.beds}</span>
        <span className="inline-flex items-center gap-1.5"><Bath size={16} strokeWidth={1.5} />{p.baths}</span>
        <CityPill city={p.city} />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {p.tags.map((t) => (
          <span key={t} className="text-small text-ink-soft bg-bg border border-border rounded-pill px-2 py-0.5">{t}</span>
        ))}
      </div>
      {(onAsk || onSave) && (
        <div className="flex items-center gap-2 mt-4">
          {onAsk && (
            <Button variant="secondary" className="h-9 flex-1" onClick={() => onAsk(p)}>
              <Phone size={16} strokeWidth={1.5} /> Ask about this
            </Button>
          )}
          {onSave && (
            <button
              onClick={() => onSave(p.id)}
              aria-label={saved ? "Unsave" : "Save"}
              className={`h-9 w-9 shrink-0 grid place-items-center rounded-control border transition ${saved ? "bg-accent-soft border-accent text-accent-ink" : "bg-surface border-border text-ink-muted hover:text-ink"}`}
            >
              <Heart size={18} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
