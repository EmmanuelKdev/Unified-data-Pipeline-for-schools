"""
extract_dag.py
--------------
DAG: school_data_extract_bronze

Purpose
-------
Extracts the seven simulated school data sources (SIS, LMS, Attendance,
Gradebook, Financial/ERP, Behavior, Admissions) from their raw CSV exports
and lands them, unmodified, into the Bronze layer of the school data
warehouse. No cleaning or transformation happens here by design: the Bronze
layer exists to preserve an exact, auditable copy of what each source system
produced, duplicates, bad formats, and all, so that later layers can be
reprocessed from scratch if a cleaning rule needs to change.

Each extract task:
  1. Reads the source CSV file.
  2. Adds pipeline metadata columns (_source_file, _ingested_at, _batch_id)
     so every Bronze row can be traced back to the run that produced it.
  3. Writes the raw rows to a bronze_<source> table (replacing the previous
     snapshot, since these are simulated full exports rather than an
     incremental change feed).
  4. Emits an Airflow Asset event so the Silver transform DAG can be
     triggered automatically once all seven sources have landed.

Schedule: runs daily. In production this would be aligned to each source
system's real export schedule.
"""
from datetime import datetime, timedelta
import os

import pandas as pd
from airflow.sdk import DAG, Asset
from airflow.providers.standard.operators.python import PythonOperator

from common import RAW_SOURCES, BRONZE_TABLE, get_engine, get_raw_data_dir

default_args = {
    "owner": "school-data-platform",
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

BRONZE_DATASETS = {
    source: Asset(f"bronze://{source}") for source in RAW_SOURCES
}


def extract_source(source_name, file_name, **context):
    """Read one raw CSV export as-is and land it in its Bronze table."""
    raw_dir = get_raw_data_dir()
    file_path = os.path.join(raw_dir, file_name)

    df = pd.read_csv(file_path, dtype=str, keep_default_na=False)
    # Represent truly empty strings as NULL rather than the literal ""
    df = df.replace({"": None})

    df["_source_file"] = file_name
    df["_ingested_at"] = datetime.utcnow().isoformat()
    df["_batch_id"] = context["run_id"]

    engine = get_engine()
    table_name = BRONZE_TABLE(source_name)
    df.to_sql(table_name, engine, if_exists="replace", index=False)

    print(f"[extract:{source_name}] wrote {len(df)} raw rows to {table_name}")
    context["ti"].xcom_push(key="row_count", value=len(df))


with DAG(
    dag_id="1.school_data_extract_bronze",
    description="Extract raw school data source exports into the Bronze layer",
    default_args=default_args,
    schedule="@daily",
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=["school-data-pipeline", "bronze", "extract"],
) as dag:

    extract_tasks = []
    for source_name, file_name in RAW_SOURCES.items():
        task = PythonOperator(
            task_id=f"extract_{source_name}",
            python_callable=extract_source,
            op_kwargs={"source_name": source_name, "file_name": file_name},
            outlets=[BRONZE_DATASETS[source_name]],
        )
        extract_tasks.append(task)

    # All seven sources are independent of one another; they run in parallel.
    # (No explicit dependency wiring needed among extract_tasks.)
