from sqlalchemy import Column, String, Integer, Float, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="staff", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String, unique=True, nullable=False)

    courses = relationship("Course", back_populates="department")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    instructor_name = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)

    department = relationship("Department", back_populates="courses")
    feedback = relationship("CourseFeedback", back_populates="course")


class CourseFeedback(Base):
    __tablename__ = "course_feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id"), index=True, nullable=False)
    satisfaction_score = Column(Float)
    recommendation_rate = Column(Float)
    perceived_difficulty = Column(Float)
    workload_rating = Column(Float)

    course = relationship("Course", back_populates="feedback")


class AcademicRecord(Base):
    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subject = Column(String, index=True, nullable=False)
    score = Column(Float)


# --- DIMENSIONS ---

class DimStudent(Base):
    __tablename__ = "gold_dim_student"

    student_key = Column(Integer, primary_key=True, autoincrement=True, index=True)
    student_id = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    gender = Column(String)
    date_of_birth = Column(Date, nullable=True)
    grade_level = Column(String)
    enrollment_status = Column(String)
    enrollment_date = Column(Date, nullable=True)
    withdrawal_date = Column(Date, nullable=True)

    # Relationships
    attendance_records = relationship("FactAttendance", back_populates="student")
    course_activities = relationship("FactCourseActivity", back_populates="student")
    grades = relationship("FactGrades", back_populates="student")
    financial_records = relationship("FactFinancial", back_populates="student")
    behavior_records = relationship("FactBehavior", back_populates="student")
    admissions_records = relationship("FactAdmissions", back_populates="student")


class DimCourse(Base):
    __tablename__ = "gold_dim_course"

    course_key = Column(Integer, primary_key=True, autoincrement=True, index=True)
    course_id = Column(String, unique=True, index=True, nullable=False)
    course_name = Column(String)
    subject = Column(String)

    # Relationships
    activities = relationship("FactCourseActivity", back_populates="course")
    grades = relationship("FactGrades", back_populates="course")


class DimTerm(Base):
    __tablename__ = "gold_dim_term"

    term_key = Column(Integer, primary_key=True, autoincrement=True, index=True)
    term_name = Column(String, unique=True, index=True, nullable=False)
    season = Column(String, nullable=True)
    academic_year = Column(String, nullable=True)

    # Relationships
    course_activities = relationship("FactCourseActivity", back_populates="term")
    grades = relationship("FactGrades", back_populates="term")
    financial_records = relationship("FactFinancial", back_populates="term")
    admissions = relationship("FactAdmissions", back_populates="term")


class DimDate(Base):
    __tablename__ = "gold_dim_date"

    date_key = Column(Integer, primary_key=True, index=True)
    full_date = Column(Date, nullable=False)
    year = Column(Integer)
    month = Column(Integer)
    month_name = Column(String)
    day = Column(Integer)
    day_of_week = Column(String)
    week_of_year = Column(Integer)
    is_weekend = Column(Boolean)


# --- FACTS ---

class FactAttendance(Base):
    __tablename__ = "gold_fact_attendance"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_key = Column(Integer, ForeignKey("gold_dim_student.student_key"), index=True, nullable=False)
    date_key = Column(Integer, ForeignKey("gold_dim_date.date_key"), index=True, nullable=False)
    attendance_status = Column(String)
    time_in = Column(String, nullable=True)
    time_out = Column(String, nullable=True)

    student = relationship("DimStudent", back_populates="attendance_records")


class FactCourseActivity(Base):
    __tablename__ = "gold_fact_course_activity"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_key = Column(Integer, ForeignKey("gold_dim_student.student_key"), index=True, nullable=False)
    course_key = Column(Integer, ForeignKey("gold_dim_course.course_key"), index=True, nullable=False)
    term_key = Column(Integer, ForeignKey("gold_dim_term.term_key"), index=True, nullable=True)
    completion_percentage = Column(Float)
    course_status = Column(String)
    avg_assignment_score = Column(Float)

    student = relationship("DimStudent", back_populates="course_activities")
    course = relationship("DimCourse", back_populates="activities")
    term = relationship("DimTerm", back_populates="course_activities")


class FactGrades(Base):
    __tablename__ = "gold_fact_grades"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_key = Column(Integer, ForeignKey("gold_dim_student.student_key"), index=True, nullable=False)
    course_key = Column(Integer, ForeignKey("gold_dim_course.course_key"), index=True, nullable=False)
    term_key = Column(Integer, ForeignKey("gold_dim_term.term_key"), index=True, nullable=True)
    subject = Column(String)
    midterm_score = Column(Float)
    final_score = Column(Float)
    letter_grade = Column(String)
    gpa_points = Column(Float)

    student = relationship("DimStudent", back_populates="grades")
    course = relationship("DimCourse", back_populates="grades")
    term = relationship("DimTerm", back_populates="grades")


class FactFinancial(Base):
    __tablename__ = "gold_fact_financial"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_key = Column(Integer, ForeignKey("gold_dim_student.student_key"), index=True, nullable=False)
    term_key = Column(Integer, ForeignKey("gold_dim_term.term_key"), index=True, nullable=True)
    fee_type = Column(String)
    amount_due = Column(Float)
    scholarship_discount = Column(Float)
    amount_paid = Column(Float)
    balance = Column(Float)
    payment_status = Column(String)
    payment_date_key = Column(Integer, ForeignKey("gold_dim_date.date_key"), nullable=True)

    student = relationship("DimStudent", back_populates="financial_records")
    term = relationship("DimTerm", back_populates="financial_records")


class FactBehavior(Base):
    __tablename__ = "gold_fact_behavior"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_key = Column(Integer, ForeignKey("gold_dim_student.student_key"), index=True, nullable=False)
    date_key = Column(Integer, ForeignKey("gold_dim_date.date_key"), index=True, nullable=False)
    incident_type = Column(String)
    severity = Column(String)
    disciplinary_action = Column(String)
    merit_demerit_points = Column(Integer)

    student = relationship("DimStudent", back_populates="behavior_records")


class FactAdmissions(Base):
    __tablename__ = "gold_fact_admissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_key = Column(Integer, ForeignKey("gold_dim_student.student_key"), index=True, nullable=True)
    term_key = Column(Integer, ForeignKey("gold_dim_term.term_key"), index=True, nullable=True)
    application_date_key = Column(Integer, ForeignKey("gold_dim_date.date_key"), nullable=True)
    applicant_source = Column(String)
    program_applied = Column(String)
    decision_status = Column(String)

    student = relationship("DimStudent", back_populates="admissions_records")
    term = relationship("DimTerm", back_populates="admissions")