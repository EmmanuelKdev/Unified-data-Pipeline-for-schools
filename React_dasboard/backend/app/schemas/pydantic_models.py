from pydantic import BaseModel, ConfigDict, field_validator, Field
from datetime import date
from typing import Optional, Literal, List


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class CourseEnjoymentItem(BaseModel):
    id: int
    code: str
    name: str
    instructor_name: Optional[str] = None
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

# --- Student Dimension ---
class StudentResponse(BaseModel):
    student_key: int
    student_id: str
    first_name: str
    last_name: str
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    grade_level: Optional[str] = None
    enrollment_status: Optional[str] = None
    enrollment_date: Optional[date] = None
    withdrawal_date: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)

# --- Attendance Fact ---
class AttendanceResponse(BaseModel):
    student_key: int
    date_key: int
    attendance_status: str
    time_in: Optional[str] = None
    time_out: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Grades Fact ---
class GradeResponse(BaseModel):
    student_key: int
    course_key: int
    term_key: Optional[int] = None
    subject: Optional[str] = None
    midterm_score: Optional[float] = None
    final_score: Optional[float] = None
    letter_grade: Optional[str] = None
    gpa_points: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

# --- Financial Fact ---
class FinancialResponse(BaseModel):
    student_key: int
    term_key: Optional[int] = None
    fee_type: Optional[str] = None
    amount_due: float
    scholarship_discount: float
    amount_paid: float
    balance: float
    payment_status: Optional[str] = None
    payment_date_key: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

# --- LMS Activity Fact ---
class LMSActivityResponse(BaseModel):
    student_key: int
    course_key: int
    term_key: Optional[int] = None
    completion_percentage: Optional[float] = None
    course_status: Optional[str] = None
    avg_assignment_score: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

# --- Dashboard Summary ---
class DashboardOverview(BaseModel):
    total_students: int
    active_students: int
    overall_attendance_rate: float
    total_revenue_collected: float
    total_outstanding_balance: float
    average_gpa: float

# =====================================================================
# Views: PYDANTIC RESPONSE MODELS
# =====================================================================


class StudentOverviewResponse(BaseModel):
    student_id: str
    first_name: str
    last_name: str
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    grade_level: Optional[str] = None
    enrollment_status: Optional[str] = None
    enrollment_date: Optional[date] = None
    withdrawal_date: Optional[date] = None
    program_applied: Optional[str] = None
    admission_status: Optional[str] = None
    applicant_source: Optional[str] = None

class StudentDirectoryResponse(BaseModel):
    id: str
    student_code: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    grade_level: str
    department_name: Optional[str] = None
    status: Literal["Honor Roll", "On Track", "At Risk"]
    gpa: float = 0.00
    attendance_rate: float = 0.00
    enrollment_date: Optional[str] = None
    tuition_status: Optional[
        Literal["Paid", "Overdue", "Payment Plan", "Scholarship"]
    ] = "Paid"
    balance_due: Optional[float] = 0.00

    @field_validator("enrollment_date", mode="before")
    @classmethod
    def sanitize_empty_dates(cls, value: str | None) -> str | None:
        # Converts empty strings ("") from database rows into None
        if isinstance(value, str) and not value.strip():
            return None
        return value

StudentDirectoryResponse.model_rebuild()

class AcademicGradeResponse(BaseModel):
    student_id: int
    course_id: str
    course_name: str
    term_name: str
    subject: Optional[str] = None
    midterm_score: Optional[float] = None
    final_score: Optional[float] = None
    letter_grade: Optional[str] = None
    gpa_points: Optional[float] = None


class AttendanceSummaryResponse(BaseModel):
    student_id: int
    first_name: str
    last_name: str
    total_records: int = 0
    days_present: int = 0
    days_absent: int = 0
    attendance_percentage: float = 0.0  # Guarantees a default float value

class BehaviorSummaryResponse(BaseModel):
    student_id: int
    first_name: str
    last_name: str
    total_incidents: int
    high_severity_count: int
    net_behavior_points: float


class CourseAnalyticsResponse(BaseModel):
    course_id: str
    course_name: str
    term_name: str
    enrolled_students: int
    completed_students: int
    avg_completion_percentage: Optional[float] = None
    avg_course_assignment_score: Optional[float] = None


class MonthlyAttendanceResponse(BaseModel):
    student_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    month: int
    year: int
    total_records: int
    days_present: int
    days_absent: int
    attendance_percentage: float

# Attendance Analytics Response

class AttendanceKPIs(BaseModel):
    total_records: int
    total_present: int
    total_absent: int
    overall_attendance_rate: float


class MonthlyTrend(BaseModel):
    month: int
    year: int
    attendance_rate: float


class TruancyRiskStudent(BaseModel):
    student_id: str
    first_name: Optional[str] = ""  # Allows None values and defaults to empty string
    last_name: Optional[str] = ""   # Allows None values and defaults to empty string
    total_records: int
    days_present: int
    days_absent: int
    attendance_percentage: float


class AttendanceAnalyticsResponse(BaseModel):
    kpis: Optional[AttendanceKPIs] = None
    monthly_trends: List[MonthlyTrend] = Field(default_factory=list)
    truancy_roster: List[TruancyRiskStudent] = Field(default_factory=list)


# Academic py dantic models

class HonorRollKPI(BaseModel):
    percentage: float
    student_count: int
    gpa_threshold: float = 3.70

class HighestPerformingSubjectKPI(BaseModel):
    subject_name: str
    average_score: float
    runner_up_subject: Optional[str] = None
    runner_up_score: Optional[float] = None

class PassRateKPI(BaseModel):
    percentage: float
    target_met: bool = True

class AcademicKPIs(BaseModel):
    honor_roll: HonorRollKPI
    highest_performing_subject: HighestPerformingSubjectKPI
    pass_rate: PassRateKPI

class SubjectMasteryItem(BaseModel):
    subject: str
    average_score: float

class GradeDistributionItem(BaseModel):
    grade: str
    count: int

class DepartmentPerformanceItem(BaseModel):
    subject_name: str
    average_score: float
    highest_score: float
    lowest_score: float
    status_benchmark: str

class AcademicAnalyticsResponse(BaseModel):
    kpis: AcademicKPIs
    subject_mastery_radar: List[SubjectMasteryItem]
    grade_distribution: List[GradeDistributionItem]
    performance_ledger: List[DepartmentPerformanceItem]



# =====================================================================
# Overview: PYDANTIC RESPONSE MODELS
# =====================================================================

class ExecutiveKPIs(BaseModel):
    total_enrollment: int
    enrollment_growth_pct: float
    average_gpa: float
    gpa_gain: float
    attendance_rate: float
    at_risk_students_count: int
    net_operating_margin: float
    total_revenue: float
    total_expenses: float

class AcademicTrajectoryItem(BaseModel):
    term_name: str
    average_gpa: float
    attendance_rate: float

class AtRiskStudentItem(BaseModel):
    student_id: str
    student_name: str
    grade_level: str
    gpa: float
    attendance_rate: float
    tuition_status: str

class ExecutiveOverviewResponse(BaseModel):
    kpis: ExecutiveKPIs
    academic_trajectory: List[AcademicTrajectoryItem]
    grade_distribution: List[dict]
    at_risk_ledger: List[AtRiskStudentItem]