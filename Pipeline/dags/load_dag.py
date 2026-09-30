"""
load_dag.py
------------
DAG: school_data_load_gold

Purpose
-------
Reads the cleaned, conformed Silver tables and builds a star-schema style
Gold layer: shared dimension tables plus one fact table per subject area,
ready to be queried directly by BI/reporting tools (active students,
attendance rate, course completion rate, popular courses, financial summary,
behavior patterns, peak admission/learning seasons, etc.).

Dimensions are built first (dim_student, dim_course, dim_term, dim_date),
since every fact table looks up surrogate keys from them. Fact tables are
built afterward, in parallel.

Trigger: scheduled on the Silver Datasets produced by the transform DAG, so
this DAG runs automatically once all seven Silver tables are refreshed.
"""
from datetime import datetime, timedelta

import pandas as pd
from airflow.sdk import DAG, Asset
from airflow.providers.standard.operators.python import PythonOperator
from airflow.sdk.bases.operator import cross_downstream
from sqlalchemy import text

from common import RAW_SOURCES, SILVER_TABLE, GOLD_TABLE, get_engine


default_args = {
    "owner": "school-data-platform",
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}


SILVER_DATASETS = [Asset(f"silver://{source}") for source in RAW_SOURCES]


def _read_silver(source_name):
    engine = get_engine()
    return pd.read_sql_table(SILVER_TABLE(source_name), engine)


# ---------------------------------------------------------------------------
# Gold layer reset
# ---------------------------------------------------------------------------
def reset_gold_layer(**context):
    """
    Clear all Gold tables before rebuilding them.

    TRUNCATE is used instead of DROP so materialized views depending on
    the Gold tables remain intact.
    """

    engine = get_engine()

    tables = [
        "dim_student",
        "dim_course",
        "dim_term",
        "dim_date",
        "fact_attendance",
        "fact_course_activity",
        "fact_grades",
        "fact_financial",
        "fact_behavior",
        "fact_admissions",
    ]

    table_names = ", ".join(
        f'"{GOLD_TABLE(table)}"' for table in tables
    )

    with engine.begin() as conn:
        conn.execute(
            text(
                f"""
                TRUNCATE TABLE {table_names}
                RESTART IDENTITY
                """
            )
        )

    print("=== Gold layer reset ===")
    print(f"Truncated {len(tables)} Gold tables.")


def _write_gold(df, table_name, engine=None):
    """
    Append freshly generated Gold data.

    The tables are cleared once at the beginning of the DAG, so individual
    builders do not DROP/CREATE their tables.
    """

    engine = engine or get_engine()

    df.to_sql(
        GOLD_TABLE(table_name),
        engine,
        if_exists="append",
        index=False,
    )

    print(
        f"[load:{table_name}] wrote "
        f"{len(df)} rows to {GOLD_TABLE(table_name)}"
    )


# ---------------------------------------------------------------------------
# Dimension builders
# ---------------------------------------------------------------------------
def build_dim_student(**context):
    sis = _read_silver("sis_students")

    dim = sis[
        [
            "student_id",
            "first_name",
            "last_name",
            "gender",
            "date_of_birth",
            "grade_level",
            "enrollment_status",
            "enrollment_date",
            "withdrawal_date",
        ]
    ].drop_duplicates(
        subset=["student_id"]
    ).reset_index(drop=True)

    dim.insert(0, "student_key", dim.index + 1)

    _write_gold(dim, "dim_student")


def build_dim_course(**context):
    """
    Built from the union of every course_id referenced in the LMS and
    Gradebook Silver tables.
    """

    lms = _read_silver(
        "lms_course_activity"
    )[["course_id", "course_name", "subject"]]

    gradebook = _read_silver(
        "gradebook_assessments"
    )[["course_id", "course_name", "subject"]]

    dim = (
        pd.concat([lms, gradebook], ignore_index=True)
        .drop_duplicates(subset=["course_id"])
        .sort_values("course_id")
        .reset_index(drop=True)
    )

    dim.insert(0, "course_key", dim.index + 1)

    _write_gold(dim, "dim_course")


def build_dim_term(**context):
    """
    Builds a small term dimension from every distinct term value seen
    across the fact-producing sources.
    """

    terms = set()

    for source, col in [
        ("lms_course_activity", "term"),
        ("gradebook_assessments", "term"),
        ("financial_erp_records", "term"),
        ("admissions_applications", "intake_term"),
    ]:
        df = _read_silver(source)

        if col in df.columns:
            terms |= set(
                df[col].dropna().unique().tolist()
            )

    rows = []

    for term in sorted(terms):
        season, year = (
            (term.split(" ") + [None])[:2]
            if " " in term
            else (term, None)
        )

        rows.append(
            {
                "term_name": term,
                "season": season,
                "academic_year": year,
            }
        )

    dim = (
        pd.DataFrame(rows)
        .drop_duplicates(subset=["term_name"])
        .reset_index(drop=True)
    )

    dim.insert(0, "term_key", dim.index + 1)

    _write_gold(dim, "dim_term")


def build_dim_date(**context):
    """
    Builds a standard date dimension spanning every date observed
    across all Silver tables.
    """

    all_dates = []

    date_cols_by_source = {
        "sis_students": [
            "enrollment_date",
            "withdrawal_date",
            "date_of_birth",
        ],
        "attendance_records": ["date"],
        "behavior_discipline_records": ["incident_date"],
        "financial_erp_records": ["payment_date"],
        "admissions_applications": ["application_date"],
    }

    for source, cols in date_cols_by_source.items():
        df = _read_silver(source)

        for col in cols:
            if col in df.columns:
                all_dates.extend(
                    pd.to_datetime(
                        df[col],
                        errors="coerce",
                    ).dropna().tolist()
                )

    if not all_dates:
        min_d = pd.Timestamp("2018-01-01")
        max_d = pd.Timestamp("2026-12-31")
    else:
        min_d, max_d = min(all_dates), max(all_dates)

    date_range = pd.date_range(
        min_d.normalize(),
        max_d.normalize(),
        freq="D",
    )

    dim = pd.DataFrame({"full_date": date_range})

    dim["date_key"] = (
        dim["full_date"]
        .dt.strftime("%Y%m%d")
        .astype(int)
    )
    dim["year"] = dim["full_date"].dt.year
    dim["month"] = dim["full_date"].dt.month
    dim["month_name"] = dim["full_date"].dt.strftime("%B")
    dim["day"] = dim["full_date"].dt.day
    dim["day_of_week"] = dim["full_date"].dt.strftime("%A")
    dim["week_of_year"] = (
        dim["full_date"]
        .dt.isocalendar()
        .week
        .astype(int)
    )
    dim["is_weekend"] = dim["full_date"].dt.dayofweek >= 5

    dim = dim[
        [
            "date_key",
            "full_date",
            "year",
            "month",
            "month_name",
            "day",
            "day_of_week",
            "week_of_year",
            "is_weekend",
        ]
    ]

    _write_gold(dim, "dim_date")


# ---------------------------------------------------------------------------
# Fact builders
# ---------------------------------------------------------------------------
def _lookup_student_key(engine):
    dim = pd.read_sql_table(
        GOLD_TABLE("dim_student"),
        engine,
    )
    return dim.set_index("student_id")["student_key"]


def build_fact_attendance(**context):
    engine = get_engine()
    df = _read_silver("attendance_records")
    student_key = _lookup_student_key(engine)

    df["student_key"] = df["student_id"].map(student_key)
    df["date_key"] = (
        pd.to_datetime(df["date"], errors="coerce")
        .dt.strftime("%Y%m%d")
    )

    fact = df[
        [
            "student_key",
            "date_key",
            "attendance_status",
            "time_in",
            "time_out",
        ]
    ].dropna(subset=["student_key", "date_key"])

    _write_gold(fact, "fact_attendance")


def build_fact_course_activity(**context):
    engine = get_engine()
    df = _read_silver("lms_course_activity")
    student_key = _lookup_student_key(engine)

    dim_course = (
        pd.read_sql_table(
            GOLD_TABLE("dim_course"),
            engine,
        )
        .set_index("course_id")["course_key"]
    )

    dim_term = (
        pd.read_sql_table(
            GOLD_TABLE("dim_term"),
            engine,
        )
        .set_index("term_name")["term_key"]
    )

    df["student_key"] = df["student_id"].map(student_key)
    df["course_key"] = df["course_id"].map(dim_course)
    df["term_key"] = df["term"].map(dim_term)

    fact = df[
        [
            "student_key",
            "course_key",
            "term_key",
            "completion_percentage",
            "course_status",
            "avg_assignment_score",
        ]
    ].dropna(
        subset=["student_key", "course_key"]
    )

    _write_gold(fact, "fact_course_activity")


def build_fact_grades(**context):
    engine = get_engine()
    df = _read_silver("gradebook_assessments")
    student_key = _lookup_student_key(engine)

    dim_course = (
        pd.read_sql_table(
            GOLD_TABLE("dim_course"),
            engine,
        )
        .set_index("course_id")["course_key"]
    )

    dim_term = (
        pd.read_sql_table(
            GOLD_TABLE("dim_term"),
            engine,
        )
        .set_index("term_name")["term_key"]
    )

    df["student_key"] = df["student_id"].map(student_key)
    df["course_key"] = df["course_id"].map(dim_course)
    df["term_key"] = df["term"].map(dim_term)

    fact = df[
        [
            "student_key",
            "course_key",
            "term_key",
            "subject",
            "midterm_score",
            "final_score",
            "letter_grade",
            "gpa_points",
        ]
    ].dropna(subset=["student_key"])

    _write_gold(fact, "fact_grades")


def build_fact_financial(**context):
    engine = get_engine()
    df = _read_silver("financial_erp_records")
    student_key = _lookup_student_key(engine)

    dim_term = (
        pd.read_sql_table(
            GOLD_TABLE("dim_term"),
            engine,
        )
        .set_index("term_name")["term_key"]
    )

    df["student_key"] = df["student_id"].map(student_key)
    df["term_key"] = df["term"].map(dim_term)

    df["payment_date_key"] = (
        pd.to_datetime(
            df["payment_date"],
            errors="coerce",
        )
        .dt.strftime("%Y%m%d")
    )

    fact = df[
        [
            "student_key",
            "term_key",
            "fee_type",
            "amount_due",
            "scholarship_discount",
            "amount_paid",
            "balance",
            "payment_status",
            "payment_date_key",
        ]
    ].dropna(subset=["student_key"])

    _write_gold(fact, "fact_financial")


def build_fact_behavior(**context):
    engine = get_engine()
    df = _read_silver("behavior_discipline_records")
    student_key = _lookup_student_key(engine)

    df["student_key"] = df["student_id"].map(student_key)
    df["date_key"] = (
        pd.to_datetime(
            df["incident_date"],
            errors="coerce",
        )
        .dt.strftime("%Y%m%d")
    )

    fact = df[
        [
            "student_key",
            "date_key",
            "incident_type",
            "severity",
            "disciplinary_action",
            "merit_demerit_points",
        ]
    ].dropna(subset=["student_key"])

    _write_gold(fact, "fact_behavior")


def build_fact_admissions(**context):
    engine = get_engine()
    df = _read_silver("admissions_applications")
    student_key = _lookup_student_key(engine)

    dim_term = (
        pd.read_sql_table(
            GOLD_TABLE("dim_term"),
            engine,
        )
        .set_index("term_name")["term_key"]
    )

    # student_key intentionally nullable:
    # many applicants never became enrolled students.
    df["student_key"] = df["student_id"].map(student_key)
    df["term_key"] = df["intake_term"].map(dim_term)

    df["application_date_key"] = (
        pd.to_datetime(
            df["application_date"],
            errors="coerce",
        )
        .dt.strftime("%Y%m%d")
    )

    fact = df[
        [
            "student_key",
            "term_key",
            "application_date_key",
            "applicant_source",
            "program_applied",
            "decision_status",
        ]
    ]

    _write_gold(fact, "fact_admissions")


# ---------------------------------------------------------------------------
# Materialized view refresh
# ---------------------------------------------------------------------------
def refresh_materialized_views(**context):
    """
    Refresh all six API materialized views after the Gold layer
    has been completely rebuilt.
    """

    engine = get_engine()

    views = [
        "mv_api_attendance_summary",
        "mv_api_course_activity_metrics",
        "mv_api_student_behavior_summary",
        "mv_api_student_directory",
        "v_api_student_academics",
        "v_api_student_overview",
    ]

    with engine.begin() as conn:
        for view in views:
            conn.execute(
                text(
                    f'REFRESH MATERIALIZED VIEW "{view}"'
                )
            )
            print(f"[refresh] refreshed {view}")


# ---------------------------------------------------------------------------
# Gold validation
# ---------------------------------------------------------------------------
def gold_layer_summary(**context):
    """
    Simple post-load validation: row counts per Gold table.
    """

    engine = get_engine()

    tables = [
        "dim_student",
        "dim_course",
        "dim_term",
        "dim_date",
        "fact_attendance",
        "fact_course_activity",
        "fact_grades",
        "fact_financial",
        "fact_behavior",
        "fact_admissions",
    ]

    print("=== Gold layer summary ===")

    for t in tables:
        try:
            n = len(
                pd.read_sql_table(
                    GOLD_TABLE(t),
                    engine,
                )
            )
            print(
                f"  {GOLD_TABLE(t):28s} {n} rows"
            )
        except Exception as e:
            print(
                f"  {GOLD_TABLE(t):28s} ERROR: {e}"
            )


# ---------------------------------------------------------------------------
# DAG
# ---------------------------------------------------------------------------
with DAG(
    dag_id="3.school_data_load_gold",
    description=(
        "Build Gold-layer dimension and fact tables "
        "for reporting and analytics"
    ),
    default_args=default_args,
    schedule=SILVER_DATASETS,
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=[
        "school-data-pipeline",
        "gold",
        "load",
    ],
) as dag:

    # Reset Gold tables first.
    reset_gold = PythonOperator(
        task_id="reset_gold_layer",
        python_callable=reset_gold_layer,
    )

    # Dimensions.
    d_student = PythonOperator(
        task_id="build_dim_student",
        python_callable=build_dim_student,
    )

    d_course = PythonOperator(
        task_id="build_dim_course",
        python_callable=build_dim_course,
    )

    d_term = PythonOperator(
        task_id="build_dim_term",
        python_callable=build_dim_term,
    )

    d_date = PythonOperator(
        task_id="build_dim_date",
        python_callable=build_dim_date,
    )

    # Facts.
    f_attendance = PythonOperator(
        task_id="build_fact_attendance",
        python_callable=build_fact_attendance,
    )

    f_course_activity = PythonOperator(
        task_id="build_fact_course_activity",
        python_callable=build_fact_course_activity,
    )

    f_grades = PythonOperator(
        task_id="build_fact_grades",
        python_callable=build_fact_grades,
    )

    f_financial = PythonOperator(
        task_id="build_fact_financial",
        python_callable=build_fact_financial,
    )

    f_behavior = PythonOperator(
        task_id="build_fact_behavior",
        python_callable=build_fact_behavior,
    )

    f_admissions = PythonOperator(
        task_id="build_fact_admissions",
        python_callable=build_fact_admissions,
    )

    # Refresh all materialized views after the Gold layer is loaded.
    refresh_views = PythonOperator(
        task_id="refresh_materialized_views",
        python_callable=refresh_materialized_views,
    )

    # Final validation.
    summary = PythonOperator(
        task_id="gold_layer_summary",
        python_callable=gold_layer_summary,
    )

    dimensions = [
        d_student,
        d_course,
        d_term,
        d_date,
    ]

    facts = [
        f_attendance,
        f_course_activity,
        f_grades,
        f_financial,
        f_behavior,
        f_admissions,
    ]

    # Gold tables must be cleared before dimensions are rebuilt.
    reset_gold >> dimensions

    # All dimensions must exist before facts look up surrogate keys.
    cross_downstream(dimensions, facts)

    # Refresh all API materialized views after every fact has loaded.
    cross_downstream(facts, [refresh_views])

    # Validate the final Gold layer.
    refresh_views >> summary
