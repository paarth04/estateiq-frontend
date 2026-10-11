# CLAUDE.md — Real Estate AI Platform

## Project Overview
An AI-powered real estate platform for a single organization operating across Nashik (60%) and Pune (40%). The org has multiple named projects/developments across both cities. Clients visit the website, click a "Call the Agent" widget, and talk to a Vapi AI voice agent that answers property enquiries in real time. Call transcripts are then analyzed for sentiment, fed into a lead scoring model, and displayed on role-based dashboards.

## Tech Stack
- **Language:** Python 3.11
- **Framework:** FastAPI (async)
- **Database:** PostgreSQL 16
- **ORM:** SQLAlchemy 2.0 (async-compatible)
- **Migrations:** Alembic
- **Validation:** Pydantic v2
- **Auth:** JWT (python-jose + passlib)
- **ML/NLP:** HuggingFace Transformers (sentiment fine-tuning), XGBoost (lead scoring), SHAP (explainability)
- **Voice AI:** Vapi (integrated in Week 7, not built from scratch)
- **Containerization:** Docker Compose (Postgres + API)
- **Dev environment:** Antigravity IDE + Claude Code

## Project Structure
```
real-estate-platform/
├── CLAUDE.md
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models/          # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── base.py      # DeclarativeBase + TimestampMixin
│   │   │   └── core.py      # All table models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   │   ├── __init__.py
│   │   │   └── ...          # One file per entity
│   │   ├── api/             # FastAPI routers
│   │   │   ├── __init__.py
│   │   │   └── ...          # One router per entity
│   │   └── core/            # Config, DB session, security
│   │       ├── __init__.py
│   │       ├── config.py
│   │       ├── database.py
│   │       └── security.py
│   ├── alembic/
│   ├── alembic.ini
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
├── dataset/
│   ├── generate.py           # Anthropic API script for bulk generation
│   ├── raw/                  # Seed batches, reviewed here first
│   └── processed/            # Frozen, approved final datasets
└── README.md
```

## Database Schema

### Core tables (build in Week 1)

**projects** — The org's named developments
- id (UUID, PK)
- name (String, not null) — e.g. "Skyline Heights", "Baner Business Bay"
- city (Enum: Nashik/Pune, not null)
- locality (String, not null) — e.g. "Gangapur Road", "Baner"
- status (String, default "ongoing")
- total_units (Integer, default 0)
- created_at (DateTime)

**properties** — Individual units within a project
- id (UUID, PK)
- project_id (UUID, FK → projects.id)
- type (String) — e.g. "2BHK", "3BHK", "Villa"
- price (Float)
- bedrooms (Integer)
- bathrooms (Integer)
- features (JSONB, default {})
- status (String, default "available")
- created_at (DateTime)

**clients** — People who call through the widget
- id (UUID, PK)
- name (String, nullable)
- phone (String, unique, indexed, not null) — primary dedup key
- email (String, nullable)
- created_at (DateTime)

**leads** — Each enquiry/interaction a client has
- id (UUID, PK)
- client_id (UUID, FK → clients.id)
- project_id (UUID, FK → projects.id, nullable)
- source (String, default "website_widget_call")
- status (String, default "new") — new/contacted/converted/lost
- created_at (DateTime)

**calls** — Transcript of each conversation (NO audio storage)
- id (UUID, PK)
- lead_id (UUID, FK → leads.id)
- transcript (Text, not null)
- duration_seconds (Integer)
- call_metadata (JSONB, default {}) — tool calls made during conversation, etc.
- created_at (DateTime)

**users** — For dashboard auth
- id (UUID, PK)
- name (String)
- email (String, unique)
- password_hash (String)
- role (Enum: client/agent/admin)
- created_at (DateTime)

### Placeholder tables (scaffold in Week 1, populated later)

**sentiment_scores** (Week 2)
- id (UUID, PK)
- call_id (UUID, FK → calls.id)
- score (Float)
- label (String) — positive/neutral/negative
- confidence (Float)
- model_version (String)
- created_at (DateTime)

**lead_features** (Week 3)
- id (UUID, PK)
- lead_id (UUID, FK → leads.id)
- features (JSONB)
- created_at (DateTime)

**lead_scores** (Week 4)
- id (UUID, PK)
- lead_id (UUID, FK → leads.id)
- score (Float)
- shap_values (JSONB) — feature attributions for explainability
- model_version (String)
- created_at (DateTime)

## Key Design Decisions

### Call direction
Calls are CLIENT-INITIATED. The client clicks the website widget and calls the AI voice agent. The client always speaks first in every transcript. The "agent" in transcripts is the AI voice agent (Vapi), not a human salesperson.

### No audio storage
We store transcript text only, not audio recordings. The calls table has NO audio_url column. This is a deliberate scope decision to simplify deployment and avoid storage/privacy overhead.

### Duplicate prevention
The /calls endpoint must find-or-create clients by phone number. Same phone = same client, new lead. Never create duplicate client records for the same phone number.

### Project-based architecture
Properties belong to named projects (not bare localities). A project has a city + locality. The org operates 15 projects across Nashik and Pune. All data (transcripts, listings, leads) references specific project names.

### City split
All synthetic data and test data follows a 60% Nashik / 40% Pune distribution.

### Vapi webhook shape
The POST /calls endpoint is pre-shaped to accept Vapi's webhook payload format (transcript, duration, metadata JSONB) even though Vapi integration happens in Week 7. This avoids re-architecting the endpoint later.

## The Organization's Projects

### Nashik (60%)
- Skyline Heights — Gangapur Road
- Meridian Court — College Road / Indiranagar
- Panchavati Residency — Panchavati
- Riverside Enclave — Nashik Road / Satpur
- Ashok Towers — Ashok Stambh
- CIDCO Greens — CIDCO
- Deolali Meadows — Deolali
- Trimbak Greens — Trimbak Road

### Pune (40%)
- Baner Business Bay — Baner / Aundh
- Bavdhan Ridge — Bavdhan
- Wakad Riverview — Wakad
- Hinjewadi Tech Homes — Hinjewadi
- Kharadi Skyline — Kharadi
- Kothrud Heights — Kothrud
- Magarpatta Green Enclave — Hadapsar / Magarpatta
- Wagholi Meadows — Wagholi
- Pimple Saudagar Residency — Pimple Saudagar
- Viman Nagar Residency — Viman Nagar

## Datasets Required (5 total)

| # | Dataset | Built in | Purpose |
|---|---|---|---|
| 1 | Call transcripts (labeled sentiment) | Week 1 | Train sentiment model (Week 2) |
| 2 | Property listings | Week 3 | Seed properties table |
| 3 | Client/lead profiles | Week 3 | Seed clients/leads tables |
| 4 | Labeled lead outcomes | Week 4 | Train XGBoost lead scoring model |
| 5 | Market/pricing comps | Week 5 | Feed pricing intelligence layer |

Datasets 1 & 4 are training-only (retired after model training). Datasets 2, 3, & 5 seed the live database.

## 8-Week Build Plan

- **Week 1:** Backend foundation (this schema + CRUD APIs) + generate sentiment dataset
- **Week 2:** Fine-tune sentiment model on dataset #1, integrate as scoring service
- **Week 3:** Property matching engine + feature engineering
- **Week 4:** Lead scoring model (XGBoost + SHAP) on dataset #4
- **Week 5:** Feedback/retraining loop + market/pricing intelligence
- **Week 6:** Dual dashboard (company view + client view), role-based auth
- **Week 7:** Vapi integration (webhook, searchProperties tool, website widget)
- **Week 8:** Deployment + integration testing

## Coding Conventions
- Use UUID primary keys everywhere (not auto-increment integers)
- Use JSONB for flexible/nested fields (features, metadata, shap_values)
- Use Alembic for every schema change — never modify tables manually
- Use Pydantic v2 for all request/response validation
- Separate router files per entity under app/api/
- Use async SQLAlchemy sessions where possible
- Name the metadata column "call_metadata" (not "metadata") to avoid SQLAlchemy reserved word conflict
- All timestamps use DateTime(timezone=True) with server_default=func.now()
- Commit after each working checkpoint

## Current Week: 1
## Current Focus: Backend foundation + sentiment dataset generation