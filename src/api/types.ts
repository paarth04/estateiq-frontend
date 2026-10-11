/**
 * EstateIQ API contract (frontend view).
 *
 * These types mirror DESIGN.md §13 (Data -> Screen mapping). They are the shapes your
 * teammate's FastAPI backend should return. Build the UI against these; when the real API
 * is ready, keep the types and swap the mock functions in `mock.ts` for real fetches.
 *
 * NOTE ON ROLES: fields marked "INTERNAL" (score, SHAP, sentiment, intent, lostReason) must
 * never reach a `client`. The client-facing types below deliberately omit them (see §12).
 */

export type Role = "client" | "admin"; // rev 3: client = lead record (no login); admin = the only login
export type City = "Nashik" | "Pune";

/** rev 3 vocabulary — labels/colours live in src/api/status.ts. "not_contacted" replaces the old "new". */
export type LeadStatus = "not_contacted" | "contacted" | "call_back" | "visit_scheduled" | "converted" | "lost";
export type ScoreBand = "Hot" | "Warm" | "Cold";
export type SentimentLabel = "Positive" | "Neutral" | "Negative"; // INTERNAL — UI labels, mapped from the model's 3 classes
export type IntentLabel =
  | "Buy" | "Rent" | "Invest" | "Schedule visit" | "Info" | "Other"; // INTERNAL — confirm the 6 labels with the intent model

export interface Project {
  id: string;
  name: string;
  city: City;
  locality: string;
  status: "Ready to move" | "Under construction" | "New launch";
  unitTypes: string;
  priceRange: string;
  features: string[];
  totalUnits?: number;
  availableUnits?: number;
  description?: string;
  /** cover image: a /images/... path, or (mock only) a data URL from an upload */
  image?: string;
}

export interface Property {
  id: string;
  projectId: string;
  project: string;
  city: City;
  type: string; // "2 BHK", "Villa", ...
  price: string; // display, e.g. "₹ 65 L"
  beds: number;
  baths: number;
  tags: string[]; // from properties.features JSONB (amenities)
  status?: "available" | "sold" | "hold";
  propertyType?: PropertyType;
  bhk?: number;
  /** price in lakh — the source of truth; `price` is its ₹ display string */
  priceLakh?: number;
  areaSqft?: number;
  furnishing?: Furnishing;
  /** a /images/... path, or (mock only) a data URL from an upload */
  image?: string;
}

export type PropertyType = "Apartment" | "Villa" | "Row house" | "Penthouse" | "Plot";
export type Furnishing = "Unfurnished" | "Semi-furnished" | "Fully furnished";

/** The structured NER output (DESIGN.md §27.3). A null field renders as "Not mentioned" — never a guess. */
export interface EnquiryDetails {
  bhk: string | null;
  budget: string | null;
  city: string | null;
  locality: string | null;
  propertyType: string | null;
  amenities: string | null;
  furnishing: string | null;
}

export interface TranscriptTurn {
  who: "client" | "agent";
  text: string;
  lang?: string; // BCP-47, for correct Devanagari pronunciation (§15)
}

/** What a CLIENT may see about their own enquiry — no score/sentiment/intent/lostReason. */
export interface ClientEnquiry {
  id: string;
  projectId: string;
  project: string;
  city: City;
  date: string; // "12 Oct 2026, 4:30 PM" IST
  duration: string;
  status: LeadStatus; // shown to the client as a friendly word (see statusToFriendly)
  summary: string;
  details: EnquiryDetails;
  transcript: TranscriptTurn[];
  propertyIds: string[]; // homes discussed
}

export interface ClientProfile {
  name: string;
  email: string;
  phone: string; // "+91 98765 43210" — identity key, read-only
}

/* ---------------------------------------------------------------------------
 * INTERNAL types (agent/admin) — included so the mock layer and later screens
 * share one contract. Never pass these to a client view.
 * ------------------------------------------------------------------------- */

export interface ShapContribution {
  label: string; // humanized feature name (§26.3)
  value: number; // + raises the score, - lowers it
}

export interface LeadScore {
  score: number; // 0-100
  band: ScoreBand;
  shapValues: ShapContribution[];
  modelVersion: string;
  labelSource: "heuristic" | "model"; // "heuristic" => provisional (§26.4)
  scoredAt: string;
}

export interface Sentiment {
  label: SentimentLabel;
  confidence: number; // 0-1
  modelVersion: string;
}

export interface Lead {
  id: string;
  clientName: string;
  clientPhone: string;
  projectId: string;
  project: string;
  city: City;
  status: LeadStatus;
  lostReason?: string; // INTERNAL
  createdAt: string;
  lastCallAt: string;
  details: EnquiryDetails;
  score: LeadScore; // INTERNAL
  sentiment: Sentiment; // INTERNAL
  intent: IntentLabel; // INTERNAL
  transcript: TranscriptTurn[];
  propertyIds: string[];
}
