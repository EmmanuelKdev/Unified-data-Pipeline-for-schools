# Unified School Data Pipeline & Analytics Platform

An end-to-end data platform that consolidates fragmented school data sources
(Student Information System, LMS, Attendance, Gradebook, Financial/ERP,
Behavior, and Admissions) into a single, analytics-ready model, and serves
it through a REST API and a React dashboard for school administrators.

This repository implements a **Medallion Architecture** (Bronze → Silver →
Gold) using Apache Airflow, exposes the resulting Gold-layer star schema
through a FastAPI backend, and is designed to be connected directly to
common BI tools for further reporting.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Data Sources](#data-sources)
- [Database](#database)
- [Data Pipeline (Airflow)](#data-pipeline-airflow)
- [Backend API](#backend-api)
- [Frontend Dashboard](#frontend-dashboard)
- [BI Tool Integration](#bi-tool-integration)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Known Limitations](#known-limitations)

---

## Project Overview

Schools typically rely on several independently operated systems that were
never designed to interoperate, so the same student's data ends up
scattered across incompatible formats and identifiers. This project
addresses that fragmentation end to end:

1. **Extract** raw data from seven simulated school source systems
2. **Transform** it: resolve inconsistent identifiers, mixed date formats,
   casing/whitespace issues, missing values, duplicate records, and orphan
   references
3. **Load** it into a clean, conformed star schema (dimensions + facts)
4. **Serve** it through a REST API
5. **Visualize** it in a React dashboard, or **connect it directly to BI
   tools** for further analysis

Because access to live student data was not available during development,
the pipeline is validated against AI-generated synthetic data engineered to
reproduce realistic data-fragmentation problems, so the cleaning logic is
tested against the same categories of mess a live deployment would
encounter.

---

## Architecture

```mermaid
flowchart LR
    subgraph Sources["7 Source Systems (raw CSV exports)"]
        SIS[SIS]
        LMS[LMS]
        ATT[Attendance]
        GRD[Gradebook]
        FIN[Financial/ERP]
        BEH[Behavior]
        ADM[Admissions]
    end

    subgraph Pipeline["Apache Airflow — Medallion Architecture"]
        direction LR
        Bronze[("Bronze\nraw, untouched")]
        Silver[("Silver\ncleaned & conformed")]
        Gold[("Gold\nstar schema")]
        Bronze -->|Transform DAG| Silver
        Silver -->|Load DAG| Gold
    end

    subgraph Serving["Serving Layer"]
        API["FastAPI Backend\n(JWT auth, REST/JSON)"]
        DB[(PostgreSQL / SQLite\nGold-layer tables)]
    end

    subgraph Consumers["Consumers"]
        React["React Dashboard"]
        BI["BI Tools\n(Power BI / Tableau / Metabase)"]
    end

    Sources -->|Extract DAG| Bronze
    Gold --> DB
    DB --> API
    API --> React
    DB -.->|direct read-only connection| BI
    API -.->|REST/JSON data source| BI
```

Each pipeline stage runs as its own Airflow DAG, chained automatically via
**Airflow Assets** (data-aware scheduling) rather than fixed cron timing:
the Transform DAG triggers once every Bronze table has landed, and the Load
DAG triggers once every Silver table is refreshed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Orchestration | Apache Airflow 3.x (DAGs, Assets/data-aware scheduling) |
| Data processing | Python, pandas |
| Data warehouse | PostgreSQL (production) / SQLite (local dev) via SQLAlchemy |
| Backend API | FastAPI, SQLAlchemy ORM, Pydantic v2 |
| Auth | JWT (python-jose), bcrypt password hashing (passlib) |
| Frontend | React (SPA), consumes the API over REST/JSON |
| BI integration | Direct SQL connection to the Gold-layer schema, or REST/JSON via the API |
| Testing | FastAPI `TestClient`, Airflow `DagBag` (DAG parse validation) |

---

## Data Sources

Seven CSV exports simulate the independently-run systems a real school
would have, sharing a common student population so records join cleanly
across sources:

| Source | File | Represents |
|---|---|---|
| Student Information System | `sis_students.csv` | Demographics, grade level, enrollment status |
| Learning Management System | `lms_course_activity.csv` | Course enrollments, completion %, status |
| Attendance | `attendance_records.csv` | Daily attendance status |
| Gradebook | `gradebook_assessments.csv` | Midterm/final scores, letter grades |
| Financial/ERP | `financial_erp_records.csv` | Fees, discounts, payments, balances |
| Behavior/Discipline | `behavior_discipline_records.csv` | Incidents, severity, disciplinary actions |
| Admissions | `admissions_applications.csv` | Applications, decisions, sources |

Each file was generated with realistic volumes (1,000+ to 40,000+ rows) and
seeded with deliberate data-quality problems (inconsistent ID formats,
mixed date formats, casing/whitespace inconsistencies, missing values,
duplicate records, and orphan references) so the pipeline's cleaning logic
has something real to resolve.

---

## Database

The data warehouse follows the Medallion Architecture, with all three
layers living in the same database (SQLite by default, PostgreSQL via
`DATABASE_URL`/`SCHOOL_DW_CONN_STRING`):

- **Bronze** (`bronze_*` tables) — raw data exactly as ingested, no
  transformation, full auditability
- **Silver** (`silver_*` tables) — cleaned, deduplicated, conformed to a
  unified schema; quarantined/orphaned rows land in `silver_*_rejected`
  audit tables instead of being silently dropped
- **Gold** (`dim_*` / `fact_*` tables) — a star schema ready for reporting:

  **Dimensions:** `dim_student`, `dim_course`, `dim_term`, `dim_date`

  **Facts:** `fact_attendance`, `fact_course_activity`, `fact_grades`,
  `fact_financial`, `fact_behavior`, `fact_admissions`

The Gold layer is what both the backend API and any BI tool should query —
it's the clean, documented, join-ready model the rest of the system is
built on.

---

## Data Pipeline (Airflow)

Three DAGs, chained via Airflow Assets:

| DAG | DAG ID | Responsibility |
|---|---|---|
| Extract | `school_data_extract_bronze` | Lands all 7 raw sources into Bronze, untouched |
| Transform | `school_data_transform_silver` | Normalizes IDs/dates/text, deduplicates, quarantines orphans |
| Load | `school_data_load_gold` | Builds the dimension and fact tables |

Key cleaning logic (shared across sources via `common.py`):

- `normalize_student_id()` — collapses ID format variants (`STU7`,
  `STU-00007`, `stu00007`, `7`, `S0007`) into one canonical form
- `normalize_date()` — parses ISO, US/EU slash, `DD-Mon-YYYY`, spelled-out,
  and Excel-serial date formats into a single ISO standard
- `clean_text()` / `standardize_category()` — whitespace/casing normalization
- `deduplicate()` — resolves exact/near-duplicate records, keeping the most
  complete version
- `flag_orphans()` — separates records referencing a student not present in
  the SIS into audit tables

Run locally:
```bash
pip install apache-airflow pandas sqlalchemy
export SCHOOL_RAW_DATA_DIR=/path/to/csvs
export SCHOOL_DW_CONN_STRING=postgresql://user:pass@host/db   # or sqlite:///...
airflow dags trigger school_data_extract_bronze
```

See `airflow_dags/README.md` for full setup details.

---

## Backend API

A FastAPI service that reads directly from the Gold-layer schema and
exposes it as authenticated REST/JSON endpoints for the dashboard (and any
other client).

- **Auth:** JWT bearer tokens (`POST /api/auth/login`, `GET /api/auth/me`)
- **Domains:** Overview KPIs, Student Directory, Academic Performance,
  Attendance Analytics, Financial Reports, Course Popularity/Completion,
  Behavior Analytics, Admissions Analytics
- **CORS:** enabled for cross-origin requests from the React dashboard
- **Docs:** interactive Swagger UI at `/docs`, ReDoc at `/redoc`, raw
  OpenAPI schema at `/api/openapi.json`

Seeding the database from the CSVs (mirrors the Airflow Transform + Load
stages synchronously, so the API can run without a live Airflow instance):
```bash
pip install -r requirements.txt
export CSV_DATA_DIR=/path/to/csvs
python load_school_data.py
uvicorn app.main:app --reload
```

See the backend's own `README.md` for the full endpoint reference and
design notes (including calibrated "at-risk" thresholds and known data
limitations).

---

## Frontend Dashboard

A React single-page application consumes the backend's REST API to present:

- An executive overview (KPI cards: active students, attendance rate,
  average GPA, at-risk students, fee collection rate)
- A searchable/filterable student directory with per-student drill-down
- Academic performance views (grade distribution, subject-level stats)
- Attendance trends and truancy alerts
- Financial summaries (fee collection, outstanding balances)
- Course popularity and completion analytics
- Behavior pattern analytics
- Admissions trends (peak application seasons, source/program breakdowns)

The frontend authenticates against `/api/auth/login`, stores the returned
JWT, and attaches it as a Bearer token on subsequent requests. Because CORS
is open on the backend, the dashboard can be developed and run separately
(e.g. `npm run dev`) against a locally running API instance.

---

## BI Tool Integration

The Gold layer is deliberately modeled as a conventional star schema
(surrogate keys, conformed dimensions, additive facts) specifically so it
can be connected directly to standard BI tools, not just the bundled React
dashboard. Two integration paths are supported:

### 1. Direct database connection (recommended for BI)
Point Power BI, Tableau, Metabase, Looker Studio, or any tool with a
PostgreSQL connector directly at the warehouse database, read-only, against
the `dim_*` / `fact_*` tables:

```
Host:     <your Postgres host>
Database: <SCHOOL_DW_CONN_STRING database>
Schema:   public (gold tables are prefixed dim_ / fact_)
Auth:     read-only database role recommended
```

This is the lowest-latency option since it queries the warehouse directly,
and it lets analysts build their own joins/aggregations beyond what the
API's fixed endpoints expose. A dedicated read-only DB role/user is
recommended over reusing the pipeline's own credentials.

### 2. REST/JSON via the API
For BI tools that support a REST/JSON or web data connector (e.g. Power
BI's Web connector, Tableau Web Data Connector), the backend's existing
endpoints can be used directly:

```
GET /api/overview/kpis
GET /api/students/list
GET /api/academics/subject-stats
GET /api/attendance/monthly-trends
GET /api/finance/fee-types
GET /api/courses/popularity
GET /api/behavior/summary
GET /api/admissions/term-trends
...
```

All require a bearer token from `/api/auth/login`. This path is a better
fit when BI users should only see pre-aggregated, curated views rather than
raw table access, or when direct database access isn't permitted by IT
policy.

---

## Repository Structure

```
.
├── airflow_dags/            # Bronze/Silver/Gold Airflow DAGs
│   ├── common.py            # shared config + cleaning helpers
│   ├── extract_dag.py
│   ├── transform_dag.py
│   ├── load_dag.py
│   └── README.md
├── backend/                 # FastAPI service
│   ├── app/
│   │   ├── api/             # one router per domain
│   │   ├── core/            # security (JWT, password hashing)
│   │   ├── db/              # SQLAlchemy engine/session
│   │   ├── etl/             # cleaning helpers (ported from common.py)
│   │   ├── models/          # Gold-layer ORM models
│   │   ├── schemas/         # Pydantic response models
│   │   ├── config.py
│   │   └── main.py
│   ├── load_school_data.py  # CSV -> clean -> Gold loader
│   ├── requirements.txt
│   └── README.md
├── frontend/                 # React dashboard
└── data/raw_csv/              # the 7 source CSVs (not committed; see below)
```

---

## Getting Started

```bash
# 1. Clone and install
git clone <this-repo>
cd <this-repo>

# 2. Backend
cd backend
pip install -r requirements.txt
export CSV_DATA_DIR=../data/raw_csv
python load_school_data.py
uvicorn app.main:app --reload      # http://localhost:8000/docs

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev                        # http://localhost:5173
```

For the full Airflow-orchestrated pipeline instead of the synchronous
loader, see `airflow_dags/README.md`.

---

## Known Limitations

- The pipeline was validated against **AI-generated synthetic data**, not
  live student records; real deployments should re-validate cleaning rules
  against actual data irregularities.
- `fact_grades.course_key` is nullable: a small fraction of Gradebook
  records have a missing `course_id` in the source data and fall back to a
  descriptive `subject` field instead of a dimension link.
- `fact_admissions.student_key` is nullable: rejected/waitlisted applicants
  never became enrolled students, so no `dim_student` row exists for them.
- Quarantined (orphan) records are isolated into audit tables for review
  rather than automatically corrected or re-matched.
- "At-risk" thresholds (attendance, behavior severity) are configurable
  business rules calibrated against this dataset's actual distribution, not
  fixed source fields; see the backend README for details.
