# Unified School Data Pipeline — Airflow DAGs

Three DAGs implementing a Medallion Architecture (Bronze -> Silver -> Gold)
over the seven simulated school data sources.

| DAG file | DAG ID | Layer | Purpose |
|---|---|---|---|
| `extract_dag.py` | `school_data_extract_bronze` | Bronze | Land raw CSV exports untouched |
| `transform_dag.py` | `school_data_transform_silver` | Silver | Clean, dedupe, conform, quarantine orphans |
| `load_dag.py` | `school_data_load_gold` | Gold | Build dimension & fact tables for reporting |

## How the three DAGs connect

They are **not** wired together with `TriggerDagRunOperator`. Instead each
layer publishes **Airflow Assets** (`bronze://<source>`, `silver://<source>`)
as task `outlets`, and the next DAG's `schedule=` list is that same set of
Assets. Airflow triggers the downstream DAG automatically once every asset
it depends on has been updated in that run — no manual triggering, no
guessing at cron timing between layers.

```
extract_dag  --outlets-->  bronze://sis_students, bronze://lms_course_activity, ...
                                    |
                                    v (schedule=[...])
transform_dag --outlets-->  silver://sis_students, silver://lms_course_activity, ...
                                    |
                                    v (schedule=[...])
load_dag  (no outlets; terminal layer)
```

## Requirements

```
pip install apache-airflow pandas sqlalchemy
```

Tested against Apache Airflow 3.x (`airflow.sdk.DAG`, `airflow.sdk.Asset`,
`airflow.providers.standard.operators.python.PythonOperator`). For Airflow
2.x, change these three imports to the legacy paths:
`from airflow import DAG`, `from airflow.datasets import Dataset as Asset`,
`from airflow.operators.python import PythonOperator`.

## Configuration (Airflow Variables)

| Variable | Default (used if unset) | Purpose |
|---|---|---|
| `SCHOOL_RAW_DATA_DIR` | `/opt/airflow/data/raw_csv` | Folder containing the 7 raw CSV exports |
| `SCHOOL_DW_CONN_STRING` | `sqlite:////opt/airflow/data/school_dw.db` | SQLAlchemy connection string for the warehouse (Bronze/Silver/Gold tables) |

Both also fall back to plain environment variables of the same name, so the
pipeline's core logic (`common.py` + the task functions) can be exercised
outside a running Airflow scheduler for local testing.

## Files

- `common.py` — shared config, DB engine, and all data-cleaning helpers
  (`normalize_student_id`, `normalize_date`, `clean_text`,
  `standardize_category`, `deduplicate`, `flag_orphans`).
- `extract_dag.py`, `transform_dag.py`, `load_dag.py` — the three DAGs.

## Validation

All three DAGs parse successfully under `airflow.models.DagBag` with zero
import errors, and the full Bronze -> Silver -> Gold task chain was executed
end-to-end against the real generated CSVs (SQLite backend) to confirm the
cleaning, deduplication, orphan-quarantine, and star-schema build logic all
produce correct row counts.
