import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/api/hooks";
import { ProjectCard } from "@/components/ProjectCard";
import { DataState } from "@/components/DataState";
import { FilterChip as Chip } from "@/components/FilterChip";

export function Projects() {
  const navigate = useNavigate();
  const { data, isLoading } = useProjects();
  const [city, setCity] = useState("All");

  const list = (data ?? []).filter((p) => city === "All" || p.city === city);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-h1 font-semibold tracking-tight">Projects</h1>
      <div className="flex flex-wrap gap-2">
        {["All", "Nashik", "Pune"].map((c) => <Chip key={c} active={city === c} onClick={() => setCity(c)}>{c}</Chip>)}
      </div>
      {isLoading && <DataState kind="loading" />}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((pr) => <ProjectCard key={pr.id} project={pr} onOpen={(p) => navigate(`/projects/${p.id}`)} />)}
      </div>
    </div>
  );
}
