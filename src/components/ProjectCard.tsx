import type { Project } from "@/api/types";
import { Card } from "./Card";
import { CityPill } from "./CityPill";

export function ProjectCard({ project, onOpen }: { project: Project; onOpen?: (p: Project) => void }) {
  return (
    <Card className="p-4 eq-risein" onClick={onOpen ? () => onOpen(project) : undefined}>
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className="font-semibold text-h3">{project.name}</h3>
        <span className="ml-auto"><CityPill city={project.city} /></span>
      </div>
      <p className="text-body text-ink-soft">{project.locality}</p>
      <div className="flex items-center justify-between mt-3 text-body">
        <span className="text-ink">{project.unitTypes}</span>
        <span className="text-ink-muted">{project.status}</span>
      </div>
      <p className="text-body font-medium mt-2 tnum">{project.priceRange}</p>
    </Card>
  );
}
