/**
 * Shared, live project + property catalog (mock store). The admin "Projects & properties"
 * screens WRITE here; the public landing grid and PropertyCards READ here — so whatever the admin
 * enters is exactly what clients see. Swap for API calls (+ refetch) when the backend lands.
 *
 * Persisted to localStorage so a landing tab opened separately sees admin edits. Large uploaded
 * images (data URLs) may not fit — then the change still applies in this tab and we say so.
 */
import { useSyncExternalStore } from "react";
import type { City, Furnishing, Project, Property, PropertyType } from "./types";
import { PROJECTS, PROPERTIES } from "./mock";

const KEY = "eq-catalog-v1";
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export interface Catalog { projects: Project[]; properties: Property[] }

/** "₹ 65 L" / "₹ 1.2 Cr" (Indian format, §7). */
export const fmtLakh = (l: number) => (l >= 100 ? `₹ ${(l / 100).toFixed(2).replace(/\.?0+$/, "")} Cr` : `₹ ${Math.round(l * 10) / 10} L`);
/** "2 BHK" · "3 BHK Villa" · "Plot" */
export const propertyTitle = (p: Pick<Property, "bhk" | "propertyType">) =>
  p.propertyType === "Plot" ? "Plot" : `${p.bhk ?? "—"} BHK${p.propertyType && p.propertyType !== "Apartment" ? ` ${p.propertyType}` : ""}`;

/** Parse the seed "₹ 1.1 Cr" / "₹ 65 L" into lakh. */
const parseLakh = (s: string) => {
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  return /cr/i.test(s) ? n * 100 : n;
};

function seed(): Catalog {
  return {
    projects: PROJECTS.map((p) => ({ ...p, image: p.image ?? `/images/${slug(p.name)}.jpg`, description: p.description ?? "" })),
    properties: PROPERTIES.map((p) => {
      const bhk = parseInt(p.type, 10) || undefined;
      const furnishing = (["Semi-furnished", "Fully furnished", "Unfurnished"] as Furnishing[]).find((f) => p.tags.includes(f));
      return {
        ...p,
        propertyType: "Apartment" as PropertyType,
        bhk,
        priceLakh: parseLakh(p.price),
        areaSqft: bhk ? 450 + bhk * 300 : undefined,
        furnishing: furnishing ?? "Unfurnished",
        status: p.status ?? "available",
        tags: p.tags.filter((t) => t !== furnishing),
      };
    }),
  };
}

function load(): Catalog {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Catalog;
  } catch { /* storage blocked or corrupt — fall back to seed */ }
  return seed();
}

let state: Catalog = load();
let persistFailed = false;
const listeners = new Set<() => void>();

function commit(next: Catalog) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); persistFailed = false; } catch { persistFailed = true; }
  listeners.forEach((fn) => fn());
}

// Another tab (e.g. the landing page) edited the catalog → pick it up.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY || !e.newValue) return;
    try { state = JSON.parse(e.newValue) as Catalog; listeners.forEach((fn) => fn()); } catch { /* ignore */ }
  });
}

export function useCatalog(): Catalog {
  return useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn); }, () => state);
}
/** True when the last save couldn't be written to localStorage (usually a big uploaded image). */
export const catalogPersistFailed = () => persistFailed;

/* ---- derived views ---- */

/** Price + BHK ranges come from the project's properties when it has any, so cards can't drift. */
export function projectView(p: Project, properties: Property[]): Project {
  const own = properties.filter((x) => x.projectId === p.id && x.priceLakh != null);
  if (!own.length) return p;
  const prices = own.map((x) => x.priceLakh!);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const bhks = own.map((x) => x.bhk).filter((b): b is number => !!b);
  const bmin = Math.min(...bhks), bmax = Math.max(...bhks);
  return {
    ...p,
    priceRange: lo === hi ? fmtLakh(lo) : `${fmtLakh(lo)} – ${fmtLakh(hi).replace("₹ ", "")}`,
    unitTypes: bhks.length ? (bmin === bmax ? `${bmin} BHK` : `${bmin}–${bmax} BHK`) : p.unitTypes,
  };
}

export const projectImage = (p: Project) => p.image || `/images/${slug(p.name)}.jpg`;

/* ---- mutations (mock "POST / PATCH / DELETE") ---- */

const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export type ProjectInput = Pick<Project, "name" | "city" | "locality" | "status" | "totalUnits" | "availableUnits" | "description" | "image" | "features">;

export function saveProject(input: ProjectInput, id?: string): string {
  if (id) {
    commit({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...input } : p)),
      // keep the denormalised name/city on its properties in step
      properties: state.properties.map((x) => (x.projectId === id ? { ...x, project: input.name, city: input.city } : x)),
    });
    return id;
  }
  const pid = newId("p");
  commit({ ...state, projects: [...state.projects, { id: pid, unitTypes: "—", priceRange: "Price on request", ...input }] });
  return pid;
}

export function deleteProject(id: string) {
  commit({ projects: state.projects.filter((p) => p.id !== id), properties: state.properties.filter((x) => x.projectId !== id) });
}

export type PropertyInput = Required<Pick<Property, "propertyType" | "priceLakh" | "beds" | "baths" | "tags" | "status">> &
  Pick<Property, "bhk" | "areaSqft" | "furnishing" | "image">;

export function saveProperty(projectId: string, input: PropertyInput, id?: string): string {
  const proj = state.projects.find((p) => p.id === projectId)!;
  const full: Omit<Property, "id"> = {
    projectId,
    project: proj.name,
    city: proj.city as City,
    type: propertyTitle(input),
    price: fmtLakh(input.priceLakh),
    ...input,
  };
  if (id) {
    commit({ ...state, properties: state.properties.map((x) => (x.id === id ? { ...x, ...full } : x)) });
    return id;
  }
  const rid = newId("r");
  commit({ ...state, properties: [...state.properties, { id: rid, ...full }] });
  return rid;
}

export function deleteProperty(id: string) {
  commit({ ...state, properties: state.properties.filter((x) => x.id !== id) });
}

/** Dev helper: put the catalog back to the seed data. */
export function resetCatalog() { commit(seed()); }
