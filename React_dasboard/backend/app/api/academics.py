from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.schema import AcademicRecord
from app.schemas.pydantic_models import GradeDistribution, SubjectPerformance
from app.api.deps import get_current_user

router = APIRouter(prefix="/academics", tags=["Academic Performance"])

@router.get("/grade-distribution", response_model=List[GradeDistribution])
def get_grade_distribution(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total_records = db.query(func.count(AcademicRecord.id)).scalar() or 1
    
    results = (
        db.query(
            AcademicRecord.grade_letter,
            func.count(AcademicRecord.id).label("count")
        )
        .group_by(AcademicRecord.grade_letter)
        .all()
    )
    
    order_map = {"A": 1, "B": 2, "C": 3, "D": 4, "F": 5}
    dist_list = []
    for letter, count in results:
        pct = round((count / total_records) * 100.0, 1)
        dist_list.append({
            "grade": letter,
            "count": count,
            "percentage": pct
        })
    
    dist_list.sort(key=lambda x: order_map.get(x["grade"], 99))
    return dist_list

@router.get("/subject-stats", response_model=List[SubjectPerformance])
def get_subject_performance(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    results = (
        db.query(
            AcademicRecord.subject,
            func.avg(AcademicRecord.score).label("avg_score"),
            func.max(AcademicRecord.score).label("max_score"),
            func.min(AcademicRecord.score).label("min_score")
        )
        .group_by(AcademicRecord.subject)
        .all()
    )

    stats = []
    for subject, avg_score, max_score, min_score in results:
        stats.append({
            "subject": subject,
            "average_score": round(avg_score, 1),
            "highest_score": round(max_score, 1),
            "lowest_score": round(min_score, 1)
        })
    
    stats.sort(key=lambda x: x["average_score"], reverse=True)
    return stats
