<div align="center">

# 🎓 Unified School Data Pipeline

**An end-to-end data platform that unifies fragmented school systems using the Bronze → Silver → Gold medallion architecture**

[![Airflow](https://img.shields.io/badge/Apache%20Airflow-3.x-017CEE?style=flat-square&logo=apacheairflow&logoColor=white)](https://airflow.apache.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Warehouse-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Dashboard-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Power BI](https://img.shields.io/badge/BI-Power%20BI%20%7C%20Metabase%20%7C%20Tableau-F2C811?style=flat-square&logo=powerbi&logoColor=black)](#-bi-tool-integration)
[![Python](https://img.shields.io/badge/Python-3-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

[Overview](#-overview) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [Pipeline Layers](#-pipeline-layers) · [Data Model](#-data-model) · [Backend API](#-backend-api) · [Dashboard](#-frontend-dashboard) · [BI](#-bi-tool-integration) · [Structure](#-project-structure)

</div>

---

## 📌 Overview

Schools usually run several independent systems that were never designed to work together, so one student's data ends up scattered across incompatible formats and identifiers. This project unifies seven such systems into a single, analytics-ready star schema, then serves it through a REST API and a React dashboard. The same warehouse can also feed BI tools directly.

Live student data was not available during development. The pipeline is therefore built and validated against **AI-generated synthetic data** that deliberately reproduces the problems real school systems produce.

### What's built

- **3 Airflow DAGs** (extract, transform, load) chained with Airflow Assets instead of fixed cron timing
- **Bronze layer**: the raw data of all 7 sources, stored untouched with audit columns
- **Silver layer**: normalised IDs and dates, standardised text, deduplicated records, and orphans quarantined in audit tables
- **Gold layer**: a star schema with 4 dimensions and 6 fact tables
- **FastAPI backend** with JWT authentication and one router per reporting domain
- **React dashboard** with an overview, academics, attendance, financial, course and student directory views
- **BI-ready warehouse** that Power BI, Metabase or Tableau can query directly

### Data sources

| # | Source system | File | Represents |
|---|---|---|---|
| 1 | Student Information System | `sis_students.csv` | Demographics, grade level, enrolment status |
| 2 | Learning Management System | `lms_course_activity.csv` | Course enrolments, completion, status |
| 3 | Attendance | `attendance_records.csv` | Daily attendance status |
| 4 | Gradebook | `gradebook_assessments.csv` | Assessment scores, letter grades, course codes |
| 5 | Financial / ERP | `financial_erp_records.csv` | Fees, discounts, payments, balances |
| 6 | Behaviour / Discipline | `behavior_discipline_records.csv` | Incidents, severity, actions |
| 7 | Admissions | `admissions_applications.csv` | Applications, decisions, sources |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       DATA SOURCES                           │
│     7 simulated school systems  (raw CSV exports)            │
│     SIS · LMS · Attendance · Gradebook · ERP · Behaviour ·   │
│     Admissions                                               │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼  DAG 1 · school_data_extract_bronze · @daily
┌──────────────────────────────────────────────────────────────┐
│  🥉 BRONZE  ·  tables: bronze_*                              │
│                                                              │
│  Raw ingestion, no cleaning, nothing dropped                 │
│  _source_file · _ingested_at · _batch_id added to every row  │
│  Full snapshot replaced on each run                          │
└─────────────────────────────┬────────────────────────────────┘
                              │   Airflow Assets: bronze://<source>
                              ▼  DAG 2 · school_data_transform_silver
┌──────────────────────────────────────────────────────────────┐
│  🥈 SILVER  ·  tables: silver_*                              │
│                                                              │
│  ID normalisation    STU7 / stu00007 / S0007 → STU00007      │
│  Date normalisation  ISO, US/EU, DD-Mon-YYYY, Excel serial   │
│  Text cleaning       trim, collapse spaces, canonical terms  │
│  Deduplication       keep the most complete record per key   │
│  Orphan quarantine   silver_*_rejected audit tables          │
│  Missing values      kept as NULL, never invented            │
│  Run log             silver_data_quality_log                 │
└─────────────────────────────┬────────────────────────────────┘
                              │   Airflow Assets: silver://<source>
                              ▼  DAG 3 · school_data_load_gold
┌──────────────────────────────────────────────────────────────┐
│  🥇 GOLD  ·  star schema                                     │
│                                                              │
│  Dimensions   dim_student   dim_course                       │
│               dim_term      dim_date                         │
│                                                              │
│  Facts        fact_attendance   fact_course_activity         │
│               fact_grades       fact_financial               │
│               fact_behavior     fact_admissions              │
└─────────────────────────────┬────────────────────────────────┘
                              │
              ┌───────────────┴────────────────┐
              ▼                                ▼
     FastAPI backend (JWT)             BI tools (read-only SQL)
              │                        Power BI · Metabase · Tableau
              ▼
     React dashboard
```

The DAGs are not wired together with trigger operators. Each layer publishes Airflow Assets, and the next DAG is scheduled on those assets, so it starts only when every table it depends on has been refreshed.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Purpose |
|---|---|
| [Python 3](https://www.python.org/downloads/) | Pipeline, backend and tests |
| [Apache Airflow 3.x](https://airflow.apache.org/docs/) | Orchestration (run locally, in Docker, or with the [Astro CLI](https://www.astronomer.io/docs/astro/cli/install-cli)) |
| [Node.js](https://nodejs.org/) | React dashboard |
| PostgreSQL *(optional)* | Production warehouse. SQLite is used by default. |

### Step 1: Clone

```bash
git clone https://github.com/your-username/unified-school-data-pipeline.git
cd unified-school-data-pipeline
```

### Step 2: Add the source data

The seven CSV files go into `data/raw_csv/`:

```
data/raw_csv/
├── sis_students.csv
├── lms_course_activity.csv
├── attendance_records.csv
├── gradebook_assessments.csv
├── financial_erp_records.csv
├── behavior_discipline_records.csv
└── admissions_applications.csv
```

> The CSVs are AI-generated test data. Keep real student data out of the repository and add `data/` to `.gitignore`.

### Step 3: Configure

Set these as Airflow Variables, or as environment variables of the same name:

| Variable | Default | Purpose |
|---|---|---|
| `SCHOOL_RAW_DATA_DIR` | `/opt/airflow/data/raw_csv` | Folder with the 7 CSV exports |
| `SCHOOL_DW_CONN_STRING` | `sqlite:////opt/airflow/data/school_dw.db` | SQLAlchemy connection string of the warehouse |

Example for PostgreSQL:

```bash
export SCHOOL_DW_CONN_STRING=postgresql+psycopg2://user:password@localhost:5432/school_dw
```

### Step 4: Install and start Airflow

Copy `airflow_dags/*.py` into your Airflow `dags/` folder, then:

```bash
pip install apache-airflow pandas sqlalchemy psycopg2-binary
airflow standalone
```

Open **http://localhost:8080**. With Astro or Docker, use the equivalent start command of your setup.

### Step 5: Run the pipeline

Only the extract DAG needs a manual trigger. The transform and load DAGs start automatically through Assets.

```bash
airflow dags trigger school_data_extract_bronze
```

### Step 6: Start the backend and dashboard

```bash
# Backend (http://localhost:8000/docs)
cd backend
pip install -r requirements.txt
export DATABASE_URL=$SCHOOL_DW_CONN_STRING
uvicorn app.main:app --reload

# Dashboard (separate terminal)
cd frontend
npm install
npm run dev
```

> To run the API without Airflow, `python load_school_data.py` loads the CSVs through the same cleaning logic in one synchronous step.

---

## 🔧 Pipeline Layers

### DAG overview

| DAG | ID | Trigger | Responsibility |
|---|---|---|---|
| Extract | `school_data_extract_bronze` | `@daily` | Land the 7 raw sources in Bronze, untouched |
| Transform | `school_data_transform_silver` | All 7 `bronze://` assets updated | Clean, deduplicate, conform, quarantine orphans |
| Load | `school_data_load_gold` | All 7 `silver://` assets updated | Build dimensions and fact tables |

The SIS task runs first in the transform DAG, because its cleaned student IDs are the reference for the orphan check of the other six sources.

### Silver: cleaning operations

| Problem | Helper (`common.py`) | Method |
|---|---|---|
| Inconsistent student IDs | `normalize_student_id()` | Extract the digits, zero-pad to `STUxxxxx` |
| Mixed date formats | `normalize_date()` | Try Excel serial numbers and 5 text formats, output ISO 8601 |
| Casing and whitespace | `clean_text()`, `standardize_category()` | Trim, collapse spaces, match against canonical vocabularies |
| Exact and near duplicates | `deduplicate()` | Keep the row with the fewest missing values per key |
| Orphan references | `flag_orphans()` | Split rows whose student is absent from the SIS into audit tables |
| Missing values | (design decision) | Preserved as NULL and flagged, not imputed |

### Injected data problems in the test data

| Problem category | Fields affected |
|---|---|
| Inconsistent ID formats | 6,182 |
| Mixed date formats | 10,308 |
| Casing and whitespace | 9,746 |
| Missing values | 10,500 |
| Exact duplicates (records) | 648 |
| Near duplicates (records) | 380 |
| Orphan references (records) | 180 |

### Idempotent runs

Every run replaces the previous snapshot of each table, so a repeated trigger does not duplicate records. The `silver_*_rejected` tables therefore show only the latest run. An append-only audit history is a possible extension.

---

## 📊 Data Model

### Dimension tables

| Table | Grain | Notes |
|---|---|---|
| `dim_student` | 1 row per student | From the cleaned SIS table |
| `dim_course` | 1 row per course | Union of LMS and Gradebook courses |
| `dim_term` | 1 row per academic term | Standardised against a canonical term list |
| `dim_date` | 1 row per calendar day | Calendar attributes for time-series reporting |

### Fact tables

| Table | Grain | Key measures |
|---|---|---|
| `fact_attendance` | 1 row per student per day | Attendance status |
| `fact_course_activity` | 1 row per student per course | Completion, status |
| `fact_grades` | 1 row per student per assessment | Score, letter grade, course key |
| `fact_financial` | 1 row per financial record | Fees, discounts, payments, balance |
| `fact_behavior` | 1 row per incident | Severity, action taken |
| `fact_admissions` | 1 row per application | Decision, source, term |

All facts link to the dimensions through surrogate keys.

### Quality and audit tables

| Table | Content |
|---|---|
| `silver_<source>_rejected` | Quarantined orphan rows, with `_rejection_reason` |
| `silver_data_quality_log` | Row counts and issue counts per source for the latest run |

To inspect them:

```sql
\dt silver_*rejected
SELECT * FROM silver_attendance_records_rejected LIMIT 20;
SELECT * FROM silver_data_quality_log;
```

---

## 🌐 Backend API

A FastAPI service reads the Gold layer and exposes it as authenticated REST/JSON endpoints.

| Area | Examples |
|---|---|
| Auth | `POST /api/auth/login`, `GET /api/auth/me` |
| Overview | `/api/overview/kpis` |
| Students | `/api/students/list` |
| Academics | `/api/academics/subject-stats` |
| Attendance | `/api/attendance/monthly-trends` |
| Finance | `/api/finance/fee-types` |
| Courses | `/api/courses/popularity` |
| Behaviour | `/api/behavior/summary` |
| Admissions | `/api/admissions/term-trends` |

- **Security:** JWT bearer tokens, bcrypt password hashing, CORS enabled for the React app
- **Docs:** Swagger UI at `/docs`, ReDoc at `/redoc`
- **At-risk rules:** thresholds are configurable (`AT_RISK_ATTENDANCE_THRESHOLD`, default `0.75`, and `AT_RISK_HIGH_SEVERITY_COUNT`, default `2`)

---

## 🖥 Frontend Dashboard

A React and TypeScript single-page application with a lavender, navy and sky-blue theme (light by default, with a dark option).

| View | Shows |
|---|---|
| Overview | KPI cards, GPA trajectory, grade distribution, priority at-risk ledger |
| Academics | Honour roll, pass rate, subject mastery radar, subject ledger |
| Attendance | Attendance KPIs, truancy-risk chart, chronic absenteeism roster |
| Financial | Revenue and expense summary, budget utilisation, overdue accounts |
| Courses | Course popularity and sentiment views |
| Student directory | Searchable, filterable roster with a profile drill-down |

The dashboard logs in through `/api/auth/login`, keeps the JWT and sends it as a Bearer token. Recharts draws the charts. The theme is defined in `index.css` with CSS variables, and the active theme is set through the `data-theme` attribute on `<html>`.

---

## 🔌 BI Tool Integration

The Gold layer is a conventional star schema, so standard BI tools can use it without going through the dashboard.

**1. Direct database connection (recommended).** Point Power BI, Metabase, Tableau or Looker Studio at the warehouse with a read-only database role:

```
Host:     <postgres host>
Database: <warehouse database>
Tables:   dim_* and fact_*
Auth:     read-only role (do not reuse the pipeline credentials)
```

**2. REST/JSON through the API.** For tools with a web or JSON connector, use the same endpoints as the dashboard with a bearer token. This suits users who should see only curated, aggregated data.

---

## 📁 Project Structure

```
unified-school-data-pipeline/
│
├── 📁 airflow_dags/
│   ├── common.py                  Shared config and cleaning helpers
│   ├── extract_dag.py             Raw CSVs → Bronze
│   ├── transform_dag.py           Bronze → Silver
│   ├── load_dag.py                Silver → Gold star schema
│   └── README.md
│
├── 📁 backend/                    FastAPI service
│   ├── app/
│   │   ├── api/                   One router per reporting domain
│   │   ├── core/                  JWT and password hashing
│   │   ├── db/                    SQLAlchemy engine and session
│   │   ├── etl/                   Cleaning helpers (ported from common.py)
│   │   ├── models/                Gold-layer ORM models
│   │   ├── schemas/               Pydantic response models
│   │   ├── config.py
│   │   └── main.py
│   ├── load_school_data.py        Synchronous CSV → Gold loader
│   └── requirements.txt
│
├── 📁 frontend/                   React + TypeScript dashboard
│   └── src/
│       ├── pages/                 Overview, Academic, Attendance, Financial, ...
│       ├── components/            Sidebar, Header, KpiCard, modals
│       ├── api/client.ts          API calls
│       └── index.css              Theme and design system
│
└── 📁 data/raw_csv/               The 7 source CSVs (gitignored)
```

---

## 💻 Commands Reference

| Command | Description |
|---|---|
| `airflow dags list` | Confirm the three DAGs are registered |
| `airflow dags trigger school_data_extract_bronze` | Start the full Bronze → Silver → Gold chain |
| `airflow dags test school_data_transform_silver` | Run one DAG once without the scheduler |
| `python load_school_data.py` | Load the CSVs into the warehouse without Airflow |
| `uvicorn app.main:app --reload` | Start the API with auto-reload |
| `npm run dev` | Start the dashboard dev server |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Orchestration | Apache Airflow 3.x (DAGs, Assets) |
| Processing | Python, pandas |
| Warehouse | PostgreSQL (production), SQLite (local), SQLAlchemy |
| Backend | FastAPI, SQLAlchemy ORM, Pydantic v2 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Frontend | React, TypeScript, Recharts, lucide-react |
| BI | Direct SQL or REST/JSON (Power BI, Metabase, Tableau) |
| Testing | FastAPI `TestClient`, Airflow `DagBag` parse validation |

---

## ⚠️ Known Limitations

- The pipeline was validated with **synthetic data**, not live student records. Real deployments need their cleaning rules re-validated.
- Quarantined (orphan) records are kept for manual review, not corrected automatically.
- Missing values stay as NULL, so reports must handle them.
- The `silver_*_rejected` tables hold only the latest run.
- `fact_grades.course_key` and `fact_admissions.student_key` can be NULL for records without a matching dimension row.
- The dashboard has not been evaluated with real users.

---

## 🗺 Roadmap

- [x] Bronze extract with audit columns
- [x] Silver transform: IDs, dates, text, duplicates, orphans
- [x] Gold star schema with 4 dimensions and 6 facts
- [x] Asset-based chaining of the three DAGs
- [x] FastAPI backend with JWT authentication
- [x] React dashboard with a light/dark theme
- [x] BI access through read-only SQL
- [ ] Automated data-quality monitoring and alerting
- [ ] Incremental (change-data-capture) ingestion
- [ ] Append-only audit history for rejected records
- [ ] dbt models in place of Python transformations
- [ ] CI/CD with GitHub Actions (DAG parsing, tests, linting)
- [ ] Usability testing with school administrators

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss the change, and update the tests as appropriate.

---

## 📄 License

[MIT](LICENSE)

---

<div align="center">

Built as a project-based thesis at JAMK University of Applied Sciences · Test data generated with AI assistance

</div>
