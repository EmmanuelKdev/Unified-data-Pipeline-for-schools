import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Text, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="Admin") # Admin, Principal, Teacher, Bursar
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    head_name = Column(String, nullable=False)
    annual_budget = Column(Float, nullable=False, default=0.0)
    
    courses = relationship("Course", back_populates="department")
    students = relationship("Student", back_populates="department")

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    student_code = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    grade_level = Column(String, nullable=False) # 9th, 10th, 11th, 12th
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    status = Column(String, default="On Track") # Honor Roll, On Track, At Risk
    gpa = Column(Float, default=0.0)
    attendance_rate = Column(Float, default=100.0)
    enrollment_date = Column(Date, nullable=False)

    department = relationship("Department", back_populates="students")
    academic_records = relationship("AcademicRecord", back_populates="student")
    attendance_records = relationship("AttendanceRecord", back_populates="student")
    tuition_account = relationship("TuitionAccount", back_populates="student", uselist=False)
    feedbacks = relationship("CourseFeedback", back_populates="student")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    instructor_name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    credits = Column(Integer, default=3)

    department = relationship("Department", back_populates="courses")
    feedbacks = relationship("CourseFeedback", back_populates="course")

class AcademicRecord(Base):
    __tablename__ = "academic_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    grade_letter = Column(String, nullable=False) # A, B, C, D, F
    term = Column(String, nullable=False) # Fall 2025, Spring 2026

    student = relationship("Student", back_populates="academic_records")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False) # Present, Excused, Unexcused, Tardy

    student = relationship("Student", back_populates="attendance_records")

class FinancialLedger(Base):
    __tablename__ = "financial_ledger"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) # Revenue, Expense
    category = Column(String, nullable=False) # Tuition, Grant, Salary, Tech, Maintenance, Athletics
    amount = Column(Float, nullable=False)
    transaction_date = Column(Date, nullable=False)
    description = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)

class TuitionAccount(Base):
    __tablename__ = "tuition_accounts"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, unique=True)
    total_due = Column(Float, nullable=False)
    paid_amount = Column(Float, nullable=False, default=0.0)
    balance_due = Column(Float, nullable=False, default=0.0)
    due_date = Column(Date, nullable=False)
    status = Column(String, nullable=False, default="Paid") # Paid, Overdue, Payment Plan, Scholarship

    student = relationship("Student", back_populates="tuition_account")

class CourseFeedback(Base):
    __tablename__ = "course_feedback"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    term = Column(String, nullable=False)
    satisfaction_score = Column(Float, nullable=False) # 1.0 to 5.0
    recommendation_rate = Column(Float, nullable=False) # 0 to 100%
    perceived_difficulty = Column(Integer, default=3) # 1 to 5
    workload_rating = Column(Integer, default=3) # 1 to 5
    feedback_tags = Column(String, nullable=True) # Comma separated
    qualitative_comment = Column(Text, nullable=True)

    course = relationship("Course", back_populates="feedbacks")
    student = relationship("Student", back_populates="feedbacks")
