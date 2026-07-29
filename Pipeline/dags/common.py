"""
common.py
---------
Shared configuration, database access, and data-cleaning helper functions used
by the three DAGs that make up the Unified School Data Pipeline prototype.

Uses an Airflow Connection (recommended) for the warehouse database.
"""

import os
import re
from datetime import datetime, date

import pandas as pd
from sqlalchemy import create_engine

try:
    from airflow.sdk import Variable
    from airflow.hooks.base import BaseHook

    AIRFLOW_AVAILABLE = True
except ImportError:
    AIRFLOW_AVAILABLE = False


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Name of the Airflow Connection
AIRFLOW_CONN_ID = "postgres_schooldw"


def _get_variable(key, default):
    """
    Read an Airflow Variable if running inside Airflow,
    otherwise fall back to an environment variable.
    """
    if AIRFLOW_AVAILABLE:
        try:
            return Variable.get(key)
        except Exception:
            pass

    return os.environ.get(key, default)


def get_raw_data_dir():
    """
    Directory containing the raw CSV files.
    """
    return _get_variable(
        "SCHOOL_RAW_DATA_DIR",
        "/usr/local/airflow/include/data",
    )


def get_engine():
    """
    Return a SQLAlchemy engine using the Airflow Connection.

    Outside Airflow, falls back to an environment variable for local testing.
    """
    if AIRFLOW_AVAILABLE:
        conn = BaseHook.get_connection(AIRFLOW_CONN_ID)
        uri = conn.get_uri()

        #Sqlalchemy 2.x requires the connection URI to be prefixed with "postgresql+psycopg2://"
        if not uri.startswith("postgresql+psycopg2://"):
            uri = "postgresql+psycopg2://" + uri.split("://", 1)[1]
        print(f"Connection URI: {uri}")
        
        return create_engine(uri)

    # Local testing outside Airflow
    return create_engine(
        os.environ.get(
            "SCHOOL_DW_CONN_STRING",
            "postgresql+psycopg2://postgres:kanda@localhost:3001/schooldw",
        )
    )


# ---------------------------------------------------------------------------
# Source configuration
# ---------------------------------------------------------------------------

RAW_SOURCES = {
    "sis_students": "sis_students.csv",
    "lms_course_activity": "lms_course_activity.csv",
    "attendance_records": "attendance_records.csv",
    "gradebook_assessments": "gradebook_assessments.csv",
    "financial_erp_records": "financial_erp_records.csv",
    "behavior_discipline_records": "behavior_discipline_records.csv",
    "admissions_applications": "admissions_applications.csv",
}

BRONZE_TABLE = "bronze_{}".format
SILVER_TABLE = "silver_{}".format
GOLD_TABLE = "gold_{}".format


# ---------------------------------------------------------------------------
# Cleaning helpers
# ---------------------------------------------------------------------------

def _is_missing(value):
    """
    True for None, empty strings, whitespace-only strings, and NaN.
    """
    if value is None:
        return True

    try:
        if pd.isna(value):
            return True
    except (TypeError, ValueError):
        pass

    return str(value).strip() == ""


_ID_DIGITS = re.compile(r"(\d+)")


def normalize_student_id(raw_id):
    """
    Convert all student ID variants to:

        STU00001
        STU00125
        STU10543

    Returns None if the value cannot be parsed.
    """
    if _is_missing(raw_id):
        return None

    match = _ID_DIGITS.search(str(raw_id))

    if not match:
        return None

    return f"STU{int(match.group(1)):05d}"


_EXCEL_EPOCH = date(1899, 12, 30)

_DATE_FORMATS = (
    "%Y-%m-%d",
    "%m/%d/%Y",
    "%d/%m/%Y",
    "%d-%b-%Y",
    "%B %d, %Y",
)


def normalize_date(raw_value):
    """
    Normalize various date formats to YYYY-MM-DD.
    """
    if _is_missing(raw_value):
        return None

    text = str(raw_value).strip()

    # Excel serial dates
    if text.isdigit() and 20000 < int(text) < 60000:
        try:
            return (
                _EXCEL_EPOCH +
                pd.Timedelta(days=int(text))
            ).date().isoformat()
        except Exception:
            pass

    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            continue

    try:
        parsed = pd.to_datetime(text, errors="raise")
        return parsed.date().isoformat()
    except Exception:
        return None


def clean_text(value):
    """
    Trim whitespace and collapse repeated spaces.
    """
    if _is_missing(value):
        return None

    return re.sub(r"\s+", " ", str(value)).strip()


def standardize_category(value, canonical_values):
    """
    Standardize categorical values while preserving canonical spelling.
    """
    text = clean_text(value)

    if text is None:
        return None

    lookup = {
        c.lower(): c
        for c in canonical_values
    }

    return lookup.get(text.lower(), text)


def deduplicate(df, key_column):
    """
    Keep the most complete row for duplicate business keys.
    """
    if key_column not in df.columns:
        before = len(df)
        df = df.drop_duplicates()
        return df, before - len(df)

    df = df.copy()

    df["_completeness"] = df.notna().sum(axis=1)

    df = df.sort_values(
        "_completeness",
        ascending=False,
    )

    duplicate_groups = df[key_column].duplicated().sum()

    df = df.drop_duplicates(
        subset=[key_column],
        keep="first",
    )

    df = df.drop(columns="_completeness")

    return df.reset_index(drop=True), int(duplicate_groups)


def flag_orphans(df, id_column, valid_ids):
    """
    Split into valid rows and orphan rows.
    """
    if id_column not in df.columns:
        return df, df.iloc[0:0]

    valid_mask = (
        df[id_column].isna()
        | df[id_column].isin(valid_ids)
    )

    return (
        df[valid_mask].reset_index(drop=True),
        df[~valid_mask].reset_index(drop=True),
    )