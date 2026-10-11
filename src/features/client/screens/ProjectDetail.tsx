import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProject, usePropertiesByProject } from "@/api/hooks";
import { Card, SectionTitle } from "@/components/Card";
import { CityPill } from "@/components/CityPill";
import { PropertyCard } from "@/components/PropertyCard";
import { DataState } from "@/components/DataState";
import { useClientUI } from "../ClientUI";

export function ProjectDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { openCall } = useClientUI();
  const { data: pr, isLoading } = useProject(id);
  const { data: homes } = usePropertiesByProject(id);

  if (isLoading) return <DataState kind="loading" />;
  if (!pr) return <DataState kind="empty" message="Project not found." action="All projects" onAction={() => navigate("/projects")} />;

  const facts: [string, string][] = [
    ["Area", pr.locality],
    ["Status", pr.status],
    ["Unit types", pr.unitTypes],
    ["Price range", pr.priceRange],
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/projects")} className="inline-flex items-center gap-1 text-body text-ink-soft hover:text-ink">
        <ArrowLeft size={18} strokeWidth={1.5} /> All projects
      </button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-h1 font-semibold tracking-tight">{pr.name}</h1>
        <CityPill city={pr.city} />
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {facts.map(([k, v]) => (
            <div key={k}>
              <div className="text-small text-ink-muted mb-1">{k}</div>
              <div className="text-body font-medium">{v}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="text-small text-ink-muted mb-2">Features</div>
          <div className="flex flex-wrap gap-1.5">
            {pr.features.map((f) => (
              <span key={f} className="text-small text-ink-soft bg-bg border border-border rounded-pill px-2.5 py-1">{f}</span>
            ))}
          </div>
        </div>
      </Card>

      {homes && homes.length > 0 && (
        <div>
          <SectionTitle>Available homes</SectionTitle>
          <div className="grid sm:grid-cols-2 gap-4">
            {homes.map((p) => <PropertyCard key={p.id} property={p} onAsk={openCall} />)}
          </div>
        </div>
      )}
    </div>
  );
}
