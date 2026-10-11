import { useState } from "react";
import { useProperties } from "@/api/hooks";
import { PropertyCard } from "@/components/PropertyCard";
import { DataState } from "@/components/DataState";
import { FilterChip as Chip } from "@/components/FilterChip";
import { useClientUI } from "../ClientUI";

/** "₹ 65 L" -> 65, "₹ 1.2 Cr" -> 120 (in lakh), for budget filtering. */
const toLakh = (price: string) => {
  const n = parseFloat(price.replace(/[^\d.]/g, ""));
  return /cr/i.test(price) ? n * 100 : n;
};

const BUDGETS = [
  { label: "Any budget", min: 0, max: Infinity },
  { label: "Under ₹ 70 L", min: 0, max: 70 },
  { label: "₹ 70 L – 1 Cr", min: 70, max: 100 },
  { label: "Above ₹ 1 Cr", min: 100, max: Infinity },
];

const selectCls =
  "h-10 px-3 rounded-control border border-border bg-surface text-body text-ink w-full sm:w-auto";

export function Properties() {
  const { data, isLoading } = useProperties();
  const { saved, toggleSave, openCall } = useClientUI();
  const [city, setCity] = useState("All");
  const [type, setType] = useState("All");
  const [project, setProject] = useState("All");
  const [budget, setBudget] = useState(0);
  const [beds, setBeds] = useState("Any");

  const all = data ?? [];
  const projects = [...new Set(all.filter((p) => city === "All" || p.city === city).map((p) => p.project))].sort();
  const types = [...new Set(all.map((p) => p.type))].sort();
  const b = BUDGETS[budget];

  const list = all.filter(
    (p) =>
      (city === "All" || p.city === city) &&
      (type === "All" || p.type === type) &&
      (project === "All" || p.project === project) &&
      toLakh(p.price) >= b.min && toLakh(p.price) < b.max &&
      (beds === "Any" || (beds === "4+" ? p.beds >= 4 : p.beds === Number(beds))),
  );

  const clear = () => { setCity("All"); setType("All"); setProject("All"); setBudget(0); setBeds("Any"); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-h1 font-semibold tracking-tight">Matched properties</h1>
        <p className="text-ink-soft mt-1">Homes that fit what you told the assistant.</p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="City">
          {["All", "Nashik", "Pune"].map((c) => (
            <Chip key={c} active={city === c} onClick={() => { setCity(c); setProject("All"); }}>{c}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Home type">
          {["All", ...types].map((t) => <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>)}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Bedrooms">
          {["Any", "1", "2", "3", "4+"].map((n) => (
            <Chip key={n} active={beds === n} onClick={() => setBeds(n)}>{n === "Any" ? "Any beds" : `${n} bed`}</Chip>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="sr-only" htmlFor="f-project">Project</label>
          <select id="f-project" className={selectCls} value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="All">All projects</option>
            {projects.map((p) => <option key={p}>{p}</option>)}
          </select>
          <label className="sr-only" htmlFor="f-budget">Budget</label>
          <select id="f-budget" className={selectCls} value={budget} onChange={(e) => setBudget(Number(e.target.value))}>
            {BUDGETS.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {isLoading && <DataState kind="loading" />}
      {!isLoading && list.length === 0 ? (
        <DataState kind="empty" message="No homes match these filters." action="Clear filters" onAction={clear} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <PropertyCard key={p.id} property={p} saved={saved.has(p.id)} onSave={toggleSave} onAsk={openCall} />
          ))}
        </div>
      )}
    </div>
  );
}
