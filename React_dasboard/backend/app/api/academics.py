from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from app.db.database import get_db
from app.models.schema import FactGrades, DimStudent
from app.schemas.pydantic_models import AcademicGradeResponse, AcademicAnalyticsResponse, GradeResponse

router = APIRouter(prefix="/academics", tags=["Academics"])

@router.get(
    "/{student_id}/grades",
    response_model=List[AcademicGradeResponse],
)
def get_student_grades(
    student_id: int,
    db: Session = Depends(get_db)
):
    """Fetch academic grade reports for a student across courses."""

    query = text(
        """
        SELECT *
        FROM v_api_student_academics
        WHERE student_id = :sid
        """
    )

    results = (
        db.execute(
            query,
            {"sid": student_id}
        )
        .mappings()
        .all()
    )

    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"No academic records found for Student ID {student_id}"
        )

    return [dict(row) for row in results]


@router.get("/analytics", response_model=AcademicAnalyticsResponse)
def get_academic_analytics(
    academic_year: Optional[str] = Query("Fall 2025", description="Filters term_name in v_api_student_academics"),
    db: Session = Depends(get_db)
):
    # 1. Honor Roll Query: Avg student GPA >= 3.70
    honor_roll_query = text("""
        WITH student_gpas AS (
            SELECT student_id, AVG(CAST(NULLIF(gpa_points, '[null]') AS FLOAT)) as avg_gpa
            FROM v_api_student_academics
            WHERE term_name = :term 
              AND gpa_points IS NOT NULL 
              AND gpa_points != '[null]'
            GROUP BY student_id
        )
        SELECT 
            COUNT(CASE WHEN avg_gpa >= 3.70 THEN 1 END) as honor_students,
            COUNT(*) as total_students,
            ROUND(
                COALESCE(
                    (COUNT(CASE WHEN avg_gpa >= 3.70 THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
                    0
                ), 1
            ) as percentage
        FROM student_gpas;
    """)
    honor_res = db.execute(honor_roll_query, {"term": academic_year}).fetchone()

    # 2. Pass Rate Query: Letter grades A, B, C ratio
    pass_rate_query = text("""
        SELECT 
            COUNT(CASE WHEN UPPER(letter_grade) IN ('A', 'B', 'C') THEN 1 END) as pass_count,
            COUNT(*) as total_count,
            ROUND(
                COALESCE(
                    (COUNT(CASE WHEN UPPER(letter_grade) IN ('A', 'B', 'C') THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
                    0
                ), 1
            ) as pass_rate
        FROM v_api_student_academics
        WHERE term_name = :term 
          AND letter_grade IS NOT NULL 
          AND letter_grade != '[null]';
    """)
    pass_res = db.execute(pass_rate_query, {"term": academic_year}).fetchone()

    # 3. Subject Ledger & Mastery Radar Query
    subject_perf_query = text("""
        SELECT 
            subject as subject_name,
            ROUND(AVG(CAST(NULLIF(final_score, '[null]') AS FLOAT))::DECIMAL, 1) as average_score,
            ROUND(MAX(CAST(NULLIF(final_score, '[null]') AS FLOAT))::DECIMAL, 1) as highest_score,
            ROUND(MIN(CAST(NULLIF(final_score, '[null]') AS FLOAT))::DECIMAL, 1) as lowest_score
        FROM v_api_student_academics
        WHERE term_name = :term 
          AND subject IS NOT NULL 
          AND subject != '[null]'
          AND final_score IS NOT NULL 
          AND final_score != '[null]'
        GROUP BY subject
        ORDER BY average_score DESC;
    """)
    subject_rows = db.execute(subject_perf_query, {"term": academic_year}).fetchall()

    # 4. Letter Grade Distribution Query
    grade_dist_query = text("""
        SELECT letter_grade, COUNT(*) as count
        FROM v_api_student_academics
        WHERE term_name = :term 
          AND letter_grade IS NOT NULL 
          AND letter_grade != '[null]'
        GROUP BY letter_grade
        ORDER BY letter_grade ASC;
    """)
    grade_rows = db.execute(grade_dist_query, {"term": academic_year}).fetchall()

    # Process subject stats for ledger and top performing KPI
    performance_ledger = []
    for row in subject_rows:
        avg_s = float(row.average_score or 0.0)
        
        if avg_s >= 85.0:
            status = "Exceeds Expectations"
        elif avg_s >= 75.0:
            status = "Meets Target"
        else:
            status = "Below Benchmark"

        performance_ledger.append({
            "subject_name": row.subject_name,
            "average_score": avg_s,
            "highest_score": float(row.highest_score or 0.0),
            "lowest_score": float(row.lowest_score or 0.0),
            "status_benchmark": status
        })

    top_subject = performance_ledger[0] if performance_ledger else {"subject_name": "N/A", "average_score": 0.0}
    runner_up = performance_ledger[1] if len(performance_ledger) > 1 else None

    return {
        "kpis": {
            "honor_roll": {
                "percentage": float(honor_res.percentage or 0.0) if honor_res else 0.0,
                "student_count": honor_res.honor_students if honor_res else 0,
                "gpa_threshold": 3.70
            },
            "highest_performing_subject": {
                "subject_name": top_subject["subject_name"],
                "average_score": top_subject["average_score"],
                "runner_up_subject": runner_up["subject_name"] if runner_up else None,
                "runner_up_score": runner_up["average_score"] if runner_up else None
            },
            "pass_rate": {
                "percentage": float(pass_res.pass_rate or 0.0) if pass_res else 0.0,
                "target_met": (float(pass_res.pass_rate or 0.0) >= 90.0) if pass_res else False
            }
        },
        "subject_mastery_radar": [
            {"subject": item["subject_name"], "average_score": item["average_score"]}
            for item in performance_ledger
        ],
        "grade_distribution": [
            {"grade": r.letter_grade, "count": r.count} for r in grade_rows
        ],
        "performance_ledger": performance_ledger
    }