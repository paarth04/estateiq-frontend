/**
 * Mock data + mock API functions. NO network calls — this is the stand-in for your
 * teammate's FastAPI backend while you build the UI.
 *
 * To integrate later: keep the function signatures, replace the bodies with real fetches
 * (wrap them in TanStack Query hooks). The return shapes already match `types.ts`.
 */
import type {
  ClientEnquiry, ClientProfile, Project, Property, LeadStatus,
} from "./types";

const delay = <T>(data: T, ms = 300): Promise<T> =>
  new Promise((res) => setTimeout(() => res(data), ms));

export const CLIENT: ClientProfile = {
  name: "Rahul Deshpande",
  email: "rahul.d@example.com",
  phone: "+91 98765 43210",
};

export const PROJECTS: Project[] = [
  { id: "p1", name: "Skyline Heights", city: "Nashik", locality: "Gangapur Road", status: "Under construction", unitTypes: "2–3 BHK", priceRange: "₹ 65 L – 1.4 Cr", features: ["Clubhouse", "Gym", "Covered parking", "Kids' play area"], totalUnits: 48, availableUnits: 12 },
  { id: "p2", name: "Lake Vista", city: "Nashik", locality: "Indira Nagar", status: "Ready to move", unitTypes: "1–2 BHK", priceRange: "₹ 42 L – 78 L", features: ["Lake view", "Gym", "Power backup"], totalUnits: 60, availableUnits: 8 },
  { id: "p5", name: "Riverside Park", city: "Nashik", locality: "Panchavati", status: "Under construction", unitTypes: "2–4 BHK", priceRange: "₹ 60 L – 1.8 Cr", features: ["Riverfront", "Clubhouse", "Swimming pool"], totalUnits: 90, availableUnits: 40 },
  { id: "p6", name: "Hill Crest", city: "Nashik", locality: "Deolali Camp", status: "Ready to move", unitTypes: "1–2 BHK", priceRange: "₹ 38 L – 65 L", features: ["Hill view", "Power backup"], totalUnits: 44, availableUnits: 3 },
  { id: "p10", name: "Baner Greens", city: "Pune", locality: "Baner", status: "Under construction", unitTypes: "2–3 BHK", priceRange: "₹ 85 L – 1.6 Cr", features: ["Clubhouse", "Gym", "Co-working lounge"], totalUnits: 80, availableUnits: 22 },
  { id: "p14", name: "Kharadi Vista", city: "Pune", locality: "Kharadi", status: "Ready to move", unitTypes: "2–3 BHK", priceRange: "₹ 78 L – 1.4 Cr", features: ["Riverside", "Clubhouse", "Kids' play area"], totalUnits: 64, availableUnits: 9 },
];

export const PROPERTIES: Property[] = [
  { id: "r1", projectId: "p1", project: "Skyline Heights", city: "Nashik", type: "2 BHK", price: "₹ 65 L", beds: 2, baths: 2, tags: ["Covered parking", "Gym"] },
  { id: "r2", projectId: "p1", project: "Skyline Heights", city: "Nashik", type: "3 BHK", price: "₹ 1.1 Cr", beds: 3, baths: 3, tags: ["Clubhouse", "Corner unit"] },
  { id: "r3", projectId: "p10", project: "Baner Greens", city: "Pune", type: "2 BHK", price: "₹ 92 L", beds: 2, baths: 2, tags: ["Co-working lounge", "East-facing"] },
  { id: "r4", projectId: "p2", project: "Lake Vista", city: "Nashik", type: "2 BHK", price: "₹ 72 L", beds: 2, baths: 2, tags: ["Lake view", "Semi-furnished"] },
  { id: "r5", projectId: "p14", project: "Kharadi Vista", city: "Pune", type: "3 BHK", price: "₹ 1.3 Cr", beds: 3, baths: 3, tags: ["Riverside", "Kids' play area"] },
  { id: "r6", projectId: "p5", project: "Riverside Park", city: "Nashik", type: "2 BHK", price: "₹ 60 L", beds: 2, baths: 2, tags: ["Riverfront", "Pool access"] },
];

export const ENQUIRIES: ClientEnquiry[] = [
  {
    id: "e1", projectId: "p1", project: "Skyline Heights", city: "Nashik",
    date: "12 Oct 2026, 4:30 PM", duration: "3 min 12 sec", status: "contacted",
    summary: "You asked about 2 BHK homes in Skyline Heights around ₹ 65 L, and wanted a site visit this weekend. Our team is arranging it.",
    details: { bhk: "2 BHK", budget: "₹ 65 L", city: "Nashik", locality: "Gangapur Road", propertyType: "Apartment", amenities: "Covered parking, gym", furnishing: null },
    transcript: [
      { who: "client", text: "Hi, मला Gangapur Road वर 2 BHK बघायचं आहे.", lang: "mr" },
      { who: "agent", text: "Of course! Do you have a budget in mind?", lang: "en" },
      { who: "client", text: "Around ₹ 65 lakh. Site visit शनिवारी होऊ शकेल का?", lang: "mr" },
      { who: "agent", text: "Saturday works. I'll arrange a visit to Skyline Heights and share two matching homes.", lang: "en" },
    ],
    propertyIds: ["r1", "r2"],
  },
  {
    id: "e2", projectId: "p10", project: "Baner Greens", city: "Pune",
    date: "8 Oct 2026, 11:05 AM", duration: "2 min 40 sec", status: "new",
    summary: "You enquired about 2 BHK apartments in Baner Greens and asked about the co-working lounge and possession timeline.",
    details: { bhk: "2 BHK", budget: null, city: "Pune", locality: "Baner", propertyType: "Apartment", amenities: "Co-working lounge", furnishing: "Unfurnished" },
    transcript: [
      { who: "client", text: "Baner Greens मध्ये 2 BHK available आहे का?", lang: "mr" },
      { who: "agent", text: "Yes, a few are. Are you looking to move in soon, or is this an investment?", lang: "en" },
      { who: "client", text: "To live in. Possession कधी आहे?", lang: "mr" },
      { who: "agent", text: "Possession is expected next year. I'll note your enquiry and have the team call you.", lang: "en" },
    ],
    propertyIds: ["r3"],
  },
];

/** Client sees friendly words, never the raw enum (§10.3). */
export const statusToFriendly: Record<LeadStatus, string> = {
  new: "Received",
  contacted: "Team has reached out",
  converted: "Booked",
  lost: "Closed",
};

/* ---- mock API (swap bodies for real fetches at integration time) ---- */
export const api = {
  getProfile: () => delay(CLIENT),
  getEnquiries: () => delay(ENQUIRIES),
  getEnquiry: (id: string) => delay(ENQUIRIES.find((e) => e.id === id) ?? null),
  getProjects: () => delay(PROJECTS),
  getProject: (id: string) => delay(PROJECTS.find((p) => p.id === id) ?? null),
  getProperties: () => delay(PROPERTIES),
  getPropertiesByProject: (projectId: string) =>
    delay(PROPERTIES.filter((p) => p.projectId === projectId)),
  requestCallback: () => delay({ ok: true }),
};
