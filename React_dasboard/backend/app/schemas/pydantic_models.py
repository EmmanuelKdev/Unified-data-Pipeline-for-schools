from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import date, datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "Admin"

class UserLogin(BaseModel):
    username: EmailStr  # FastAPI OAuth2 uses username field
    password: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class KpiSummary(BaseModel):
    total_students: int
    average_gpa: float
    attendance_rate: float
    at_risk_students: int
    total_revenue: float
    operating_expenses: float
    net_margin: float
    tuition_collection_rate: float
    total_overdue_tuition: float

class StudentDetail(BaseModel):
    id: int
    student_code: str
    first_name: str
    last_name: str
    email: str
    grade_level: str
    department_name: Optional[str] = None
    status: str
    gpa: float
    attendance_rate: float
    enrollment_date: date
    tuition_status: Optional[str] = "Paid"
    balance_due: Optional[float] = 0.0
    class Config:
        from_attributes = True

class GradeDistribution(BaseModel):
    grade: str
    count: int
    percentage: float

class SubjectPerformance(BaseModel):
    subject: str
    average_score: float
    highest_score: float
    lowest_score: float

class MonthlyAttendance(BaseModel):
    month: str
    attendance_rate: float
    excused: int
    unexcused: int
    tardy: int

class FinancialSummary(BaseModel):
    total_revenue: float
    total_expenses: float
    net_surplus: float
    tuition_collection_pct: float
    total_financial_aid: float

class RevenueExpenseTrend(BaseModel):
    month: str
    revenue: float
    expense: float

class DepartmentBudget(BaseModel):
    department: str
    allocated_budget: float
    actual_spent: float
    variance: float
    utilization_pct: float

class OverdueTuitionItem(BaseModel):
    id: int
    student_name: str
    student_code: str
    grade_level: str
    balance_due: float
    due_date: date
    days_overdue: int

class CourseEnjoymentItem(BaseModel):
    id: int
    code: str
    name: str
    instructor_name: str
    department: str
    avg_satisfaction: float
    pct_recommended: float
    avg_difficulty: float
    avg_workload: float
    total_responses: int

class DepartmentSentiment(BaseModel):
    department: str
    satisfaction: float
    recommendation: float

class CourseMatrixPoint(BaseModel):
    course_name: str
    satisfaction: float
    avg_grade: float
    student_count: int
