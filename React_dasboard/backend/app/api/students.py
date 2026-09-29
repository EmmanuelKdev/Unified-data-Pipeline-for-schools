from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.schema import DimStudent
from app.schemas.pydantic_models import (
    StudentResponse,
    StudentOverviewResponse,
    StudentDirectoryResponse,
    AcademicGradeResponse,
    AttendanceSummaryResponse,
    BehaviorSummaryResponse,
    CourseAnalyticsResponse,
)
from app.config import settings


router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


# =====================================================================
# Student Directory
# IMPORTANT: This must be defined before /{student_id}
# =====================================================================

@router.get(
    "/directory",
    response_model=List[StudentDirectoryResponse],
)
def get_student_directory(
    search: str | None = Query(default=None),
    grade: str | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """Fetch students from the materialized view with dynamic search and filtering."""
    base_query = "SELECT * FROM mv_api_student_directory WHERE 1=1"
    params = {}

    if search:
        base_query += " AND (first_name ILIKE :search OR last_name ILIKE :search OR student_code ILIKE :search)"
        params["search"] = f"%{search}%"

    if grade and grade.lower() != "all":
        base_query += " AND grade_level = :grade"
        params["grade"] = grade

    if status and status.lower() != "all":
        base_query += " AND status = :status"
        params["status"] = status

    base_query += " ORDER BY id ASC"

    results = db.execute(text(base_query), params).mappings().all()
    return [dict(row) for row in results]


# =====================================================================
# Students
# =====================================================================

@router.get(
    "/",
    response_model=List[StudentResponse]
)
def get_students(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    print("DATABASE URL:", settings.DATABASE_URL)

    students = (
        db.query(DimStudent)
        .offset(skip)
        .limit(limit)
        .all()
    )

    print("Students:", students)
    print("Students count:", len(students))

    return students


# =====================================================================
# Student by ID
# =====================================================================

@router.get(
    "/{student_id}",
    response_model=StudentResponse
)
def get_student(
    student_id: str,
    db: Session = Depends(get_db)
):
    student = (
        db.query(DimStudent)
        .filter(DimStudent.student_id == student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return student


# =====================================================================
# Student Overview
# =====================================================================

@router.get(
    "/{student_id}/overview",
    response_model=StudentOverviewResponse,
)
def get_student_overview(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Fetch complete profile and admission information for a student."""

    query = text(
        """
        SELECT *
        FROM v_api_student_overview
        WHERE student_id = :sid
        """
    )

    result = (
        db.execute(
            query,
            {"sid": student_id}
        )
        .mappings()
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Student ID {student_id} not found"
        )

    return dict(result)


# =====================================================================
# Student Grades
# =====================================================================



# =====================================================================
# Student Attendance
# =====================================================================




# =====================================================================
# Student Behavior
# =====================================================================

@router.get(
    "/{student_id}/behavior",
    response_model=BehaviorSummaryResponse,
)
def get_student_behavior(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Fetch behavioral incident summaries and net points for a student."""

    query = text(
        """
        SELECT *
        FROM mv_api_student_behavior_summary
        WHERE student_id = :sid
        """
    )

    result = (
        db.execute(
            query,
            {"sid": student_id}
        )
        .mappings()
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"No behavioral records found for Student ID {student_id}"
        )

    return dict(result)

