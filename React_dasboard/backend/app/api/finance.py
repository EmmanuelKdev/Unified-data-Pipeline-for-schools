from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.schema import FactFinancial, DimStudent
from app.schemas.pydantic_models import FinancialResponse

router = APIRouter(prefix="/finance", tags=["Finance"])

@router.get("/records", response_model=List[FinancialResponse])
def get_financial_records(
    student_id: Optional[str] = None,
    payment_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(FactFinancial)
    if student_id:
        query = query.join(DimStudent).filter(DimStudent.student_id == student_id)
    if payment_status:
        query = query.filter(FactFinancial.payment_status == payment_status)
    return query.offset(skip).limit(limit).all()