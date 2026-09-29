from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.schema import FactAttendance, DimStudent
from app.schemas.pydantic_models import AttendanceAnalyticsResponse, AttendanceSummaryResponse, AttendanceResponse, MonthlyAttendanceResponse
from sqlalchemy import text


router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.get("/", response_model=List[AttendanceResponse])
def get_attendance(
    student_id: Optional[str] = None,
    date_key: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(FactAttendance)
    if student_id:
        query = query.join(DimStudent).filter(DimStudent.student_id == student_id)
    if date_key:
        query = query.filter(FactAttendance.date_key == date_key)
    return query.offset(skip).limit(limit).all()


# Student Attendance views: PYDANTIC RESPONSE MODELS


@router.get(
    "/analytics",
    response_model=AttendanceAnalyticsResponse,
)
def get_attendance_analytics(
    year: Optional[int] = Query(default=None, ge=2000, description="Four-digit year"),
    db: Session = Depends(get_db),
):
    """Fetch analytics aggregates directly from mv_api_attendance_summary safely."""

    query = """
    WITH summary_base AS (
        SELECT 
            student_id,
            COALESCE(first_name, '') AS first_name,
            COALESCE(last_name, '') AS last_name,
            total_records,
            days_present,
            days_absent,
            attendance_percentage
        FROM mv_api_attendance_summary
    ),
    
    kpi_summary AS (
        SELECT
            COALESCE(SUM(total_records), 0) AS total_records,
            COALESCE(SUM(days_present), 0) AS total_present,
            COALESCE(SUM(days_absent), 0) AS total_absent,
            ROUND(
                (COALESCE(SUM(days_present), 0)::numeric / NULLIF(SUM(total_records), 0)) * 100, 
                2
            ) AS overall_attendance_rate
        FROM summary_base
    ),

    truancy_roster AS (
        SELECT 
            student_id,
            first_name,
            last_name,
            total_records,
            days_present,
            days_absent,
            attendance_percentage
        FROM summary_base
        WHERE attendance_percentage < 85.0
        ORDER BY attendance_percentage ASC
    )

    SELECT 
        (SELECT row_to_json(kpi_summary.*) FROM kpi_summary) AS kpis,
        (SELECT json_agg(truancy_roster.*) FROM truancy_roster) AS truancy_roster;
    """

    result = db.execute(text(query)).mappings().first()
    return result

@router.get(
    "/{student_id}/one-student",
    response_model=AttendanceSummaryResponse,
)
def get_student_attendance(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Fetch aggregated attendance metrics for a student."""

    query = text(
        """
        SELECT *
        FROM mv_api_attendance_summary
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
            detail=f"No attendance records found for Student ID {student_id}"
        )

    return dict(result)