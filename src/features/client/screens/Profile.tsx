import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { CLIENT } from "@/api/mock";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useClientUI } from "../ClientUI";

export function Profile() {
  const { toast } = useClientUI();
  const rows: [string, string][] = [
    ["Name", CLIENT.name],
    ["Email", CLIENT.email],
    ["Phone", CLIENT.phone],
  ];

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="font-display text-h1 font-semibold tracking-tight">Profile</h1>

      <Card className="p-5 divide-y divide-border">
        {rows.map(([k, v], i) => (
          <div key={k} className={`flex items-center justify-between ${i ? "pt-4 mt-4" : ""}`}>
            <span className="text-body text-ink-soft">{k}</span>
            <span className="text-body font-medium flex items-center gap-2">
              {v}
              {k === "Phone" && <span className="text-small text-ink-muted">(read-only)</span>}
            </span>
          </div>
        ))}
      </Card>

      <Card className="p-5 flex gap-3 items-start">
        <div className="shrink-0 w-9 h-9 grid place-items-center rounded-control bg-accent-soft text-accent-ink"><ShieldCheck size={18} strokeWidth={1.5} /></div>
        <div>
          <h3 className="font-semibold text-body">Your privacy</h3>
          <p className="text-body text-ink-soft mt-1">We keep a text transcript of your calls to serve you better. We never store the audio recording.</p>
        </div>
      </Card>

      <Button variant="secondary" className="text-negative" onClick={() => toast("Request received — we'll process your data deletion.")}>
        Request to delete my data
      </Button>

      <div>
        <Link to="/login" className="text-body text-ink-soft hover:text-ink underline underline-offset-4">Log out</Link>
      </div>
    </div>
  );
}
