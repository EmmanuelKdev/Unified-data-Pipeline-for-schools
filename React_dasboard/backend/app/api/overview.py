from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.schema import Student, FinancialLedger, TuitionAccount
from app.schemas.pydantic_models import KpiSummary
from app.api.deps import get_current_user

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("/kpis", response_model=KpiSummary)
def get_executive_kpis(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total_students = db.query(func.count(Student.id)).scalar() or 0
    avg_gpa = db.query(func.avg(Student.gpa)).scalar() or 0.0
    avg_attendance = db.query(func.avg(Student.attendance_rate)).scalar() or 0.0
    at_risk_count = db.query(func.count(Student.id)).filter(Student.status == "At Risk").scalar() or 0

    # Financial Aggregations
    total_rev = db.query(func.sum(FinancialLedger.amount)).filter(FinancialLedger.type == "Revenue").scalar() or 0.0
    total_exp = db.query(func.sum(FinancialLedger.amount)).filter(FinancialLedger.type == "Expense").scalar() or 0.0
    net_margin = total_rev - total_exp

    total_tuition_due = db.query(func.sum(TuitionAccount.total_due)).scalar() or 1.0
    total_tuition_paid = db.query(func.sum(TuitionAccount.paid_amount)).scalar() or 0.0
    collection_rate = (total_tuition_paid / total_tuition_due) * 100.0 if total_tuition_due > 0 else 100.0

    total_overdue = db.query(func.sum(TuitionAccount.balance_due)).filter(TuitionAccount.status == "Overdue").scalar() or 0.0

    return {
        "total_students": total_students,
        "average_gpa": round(avg_gpa, 2),
        "attendance_rate": round(avg_attendance, 1),
        "at_risk_students": at_risk_count,
        "total_revenue": round(total_rev, 2),
        "operating_expenses": round(total_exp, 2),
        "net_margin": round(net_margin, 2),
        "tuition_collection_rate": round(collection_rate, 1),
        "total_overdue_tuition": round(total_overdue, 2)
    }
