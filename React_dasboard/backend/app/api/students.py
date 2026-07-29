from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.schema import Student, Department, TuitionAccount
from app.schemas.pydantic_models import StudentDetail
from app.api.deps import get_current_user

router = APIRouter(prefix="/students", tags=["Student Directory"])

@router.get("/list", response_model=List[StudentDetail])
def get_students_list(
    search: Optional[str] = None,
    grade_level: Optional[str] = None,
    status: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Student).join(Department, isouter=True).join(TuitionAccount, isouter=True)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Student.first_name.ilike(search_pattern)) |
            (Student.last_name.ilike(search_pattern)) |
            (Student.student_code.ilike(search_pattern)) |
            (Student.email.ilike(search_pattern))
        )

    if grade_level and grade_level != "All":
        query = query.filter(Student.grade_level == grade_level)

    if status and status != "All":
        query = query.filter(Student.status == status)

    if department and department != "All":
        query = query.filter(Department.name == department)

    students = query.order_by(Student.last_name.asc()).all()

    result = []
    for s in students:
        dept_name = s.department.name if s.department else "General"
        t_status = s.tuition_account.status if s.tuition_account else "Paid"
        bal = s.tuition_account.balance_due if s.tuition_account else 0.0

        result.append({
            "id": s.id,
            "student_code": s.student_code,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "email": s.email,
            "grade_level": s.grade_level,
            "department_name": dept_name,
            "status": s.status,
            "gpa": s.gpa,
            "attendance_rate": s.attendance_rate,
            "enrollment_date": s.enrollment_date,
            "tuition_status": t_status,
            "balance_due": bal
        })

    return result

@router.get("/{student_id}", response_model=StudentDetail)
def get_student_detail(student_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    s = db.query(Student).filter(Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student not found")

    dept_name = s.department.name if s.department else "General"
    t_status = s.tuition_account.status if s.tuition_account else "Paid"
    bal = s.tuition_account.balance_due if s.tuition_account else 0.0

    return {
        "id": s.id,
        "student_code": s.student_code,
        "first_name": s.first_name,
        "last_name": s.last_name,
        "email": s.email,
        "grade_level": s.grade_level,
        "department_name": dept_name,
        "status": s.status,
        "gpa": s.gpa,
        "attendance_rate": s.attendance_rate,
        "enrollment_date": s.enrollment_date,
        "tuition_status": t_status,
        "balance_due": bal
    }
