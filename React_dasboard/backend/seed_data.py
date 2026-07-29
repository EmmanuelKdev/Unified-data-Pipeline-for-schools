import random
import datetime
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, Base, engine
from app.models.schema import User, Department, Student, Course, AcademicRecord, AttendanceRecord, FinancialLedger, TuitionAccount, CourseFeedback
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@school.edu").first():
            print("Database already seeded!")
            return

        print("Seeding database with demo school analytics data...")

        # 1. Create Users
        users = [
            User(email="admin@school.edu", hashed_password=get_password_hash("admin123"), full_name="Dr. Eleanor Vance", role="Admin"),
            User(email="principal@school.edu", hashed_password=get_password_hash("principal123"), full_name="Marcus Sterling", role="Principal"),
            User(email="bursar@school.edu", hashed_password=get_password_hash("bursar123"), full_name="Sarah Jenkins", role="Bursar"),
        ]
        db.add_all(users)
        db.commit()

        # 2. Create Departments
        departments = [
            Department(name="Computer Science & STEM", code="STEM", head_name="Dr. Alan Turing", annual_budget=1250000.0),
            Department(name="Humanities & Literature", code="HUM", head_name="Prof. Clara Oswald", annual_budget=850000.0),
            Department(name="Natural Sciences", code="SCI", head_name="Dr. Rosalind Franklin", annual_budget=1100000.0),
            Department(name="Fine Arts & Music", code="ARTS", head_name="Elena Rostova", annual_budget=600000.0),
            Department(name="Athletics & Physical Ed", code="ATHL", head_name="Coach Coach Carter", annual_budget=750000.0),
        ]
        db.add_all(departments)
        db.commit()

        dept_objs = db.query(Department).all()
        dept_map = {d.code: d.id for d in dept_objs}

        # 3. Create Courses
        courses = [
            Course(code="CS-101", name="Introduction to Computer Science & Python", instructor_name="Prof. David Malan", department_id=dept_map["STEM"], credits=4),
            Course(code="CS-302", name="Robotics & AI Lab", instructor_name="Dr. Alan Turing", department_id=dept_map["STEM"], credits=4),
            Course(code="ENG-201", name="Creative Writing & World Literature", instructor_name="Prof. Clara Oswald", department_id=dept_map["HUM"], credits=3),
            Course(code="ENG-402", name="AP Shakespeare & Modern Drama", instructor_name="Sir Arthur Pendelton", department_id=dept_map["HUM"], credits=3),
            Course(code="PHY-301", name="AP Physics C: Mechanics & Quantum Theory", instructor_name="Dr. Richard Feynman", department_id=dept_map["SCI"], credits=4),
            Course(code="CHEM-202", name="Organic Chemistry & Molecular Bio", instructor_name="Dr. Rosalind Franklin", department_id=dept_map["SCI"], credits=4),
            Course(code="ART-105", name="AP Digital Arts & Graphic Design", instructor_name="Elena Rostova", department_id=dept_map["ARTS"], credits=3),
            Course(code="MUS-201", name="Symphonic Band & Music Theory", instructor_name="Maestro Antonio Vivaldi", department_id=dept_map["ARTS"], credits=3),
        ]
        db.add_all(courses)
        db.commit()
        course_objs = db.query(Course).all()

        # 4. Create Students (35 detailed records)
        first_names = ["Alexander", "Sophia", "Ethan", "Emma", "Liam", "Olivia", "Noah", "Ava", "Lucas", "Isabella", "Mason", "Mia", "Oliver", "Charlotte", "Elijah", "Amelia", "Logan", "Harper", "Benjamin", "Evelyn", "James", "Abigail", "Jacob", "Emily", "Michael", "Elizabeth", "Daniel", "Mila", "Henry", "Ella", "Jackson", "Avery", "Sebastian", "Sofia", "Aiden"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright"]
        grades = ["9th", "10th", "11th", "12th"]

        students = []
        for i in range(35):
            fn = first_names[i]
            ln = last_names[i]
            code = f"STU-2026-{100 + i}"
            email = f"{fn.lower()}.{ln.lower()}@student.school.edu"
            grade = grades[i % len(grades)]
            dept_id = dept_objs[i % len(dept_objs)].id
            
            # Decide status & metrics
            if i in [3, 11, 22]:  # At risk sample
                status = "At Risk"
                gpa = round(random.uniform(1.8, 2.2), 2)
                att_rate = round(random.uniform(82.0, 87.5), 1)
            elif i in [0, 1, 4, 7, 10, 15, 18, 25, 30]:  # Honor Roll
                status = "Honor Roll"
                gpa = round(random.uniform(3.7, 4.0), 2)
                att_rate = round(random.uniform(96.5, 99.5), 1)
            else:
                status = "On Track"
                gpa = round(random.uniform(2.8, 3.6), 2)
                att_rate = round(random.uniform(91.0, 96.0), 1)

            students.append(Student(
                student_code=code,
                first_name=fn,
                last_name=ln,
                email=email,
                grade_level=grade,
                department_id=dept_id,
                status=status,
                gpa=gpa,
                attendance_rate=att_rate,
                enrollment_date=datetime.date(2023 + (i % 3), 9, 1)
            ))
        
        db.add_all(students)
        db.commit()

        student_objs = db.query(Student).all()

        # 5. Create Academic & Attendance Records & Tuition Accounts
        subjects = ["Mathematics", "Physics", "English Literature", "History", "Computer Science", "Chemistry", "Art History"]
        
        for s in student_objs:
            # Academic Records
            for subj in random.sample(subjects, 4):
                score = round(s.gpa * 22.0 + random.uniform(-4, 5), 1)
                score = max(55.0, min(100.0, score))
                if score >= 90:
                    letter = "A"
                elif score >= 80:
                    letter = "B"
                elif score >= 70:
                    letter = "C"
                elif score >= 60:
                    letter = "D"
                else:
                    letter = "F"

                db.add(AcademicRecord(
                    student_id=s.id,
                    subject=subj,
                    score=score,
                    grade_letter=letter,
                    term="Fall 2025"
                ))

            # Attendance Records (sample 10 days for each student)
            start_d = datetime.date(2025, 9, 1)
            for d_idx in range(10):
                curr_date = start_d + datetime.timedelta(days=d_idx * 7)
                if s.status == "At Risk" and d_idx % 3 == 0:
                    att_status = "Unexcused"
                elif s.status == "At Risk" and d_idx % 4 == 0:
                    att_status = "Tardy"
                elif random.random() > 0.95:
                    att_status = "Excused"
                else:
                    att_status = "Present"

                db.add(AttendanceRecord(
                    student_id=s.id,
                    date=curr_date,
                    status=att_status
                ))

            # Tuition Account
            total_tuition = 12500.0
            if s.id in [4, 15, 25]:  # Scholarship
                t_acc = TuitionAccount(
                    student_id=s.id,
                    total_due=total_tuition,
                    paid_amount=0.0,
                    balance_due=0.0,
                    due_date=datetime.date(2025, 10, 1),
                    status="Scholarship"
                )
            elif s.status == "At Risk" or s.id in [5, 14, 21]: # Overdue
                bal = round(random.uniform(2500, 6200), 2)
                t_acc = TuitionAccount(
                    student_id=s.id,
                    total_due=total_tuition,
                    paid_amount=total_tuition - bal,
                    balance_due=bal,
                    due_date=datetime.date(2025, 11, 15),
                    status="Overdue"
                )
            elif s.id % 2 == 0:  # Payment plan
                bal = round(random.uniform(1000, 3000), 2)
                t_acc = TuitionAccount(
                    student_id=s.id,
                    total_due=total_tuition,
                    paid_amount=total_tuition - bal,
                    balance_due=bal,
                    due_date=datetime.date(2026, 3, 1),
                    status="Payment Plan"
                )
            else:  # Paid
                t_acc = TuitionAccount(
                    student_id=s.id,
                    total_due=total_tuition,
                    paid_amount=total_tuition,
                    balance_due=0.0,
                    due_date=datetime.date(2025, 9, 15),
                    status="Paid"
                )
            db.add(t_acc)

        db.commit()

        # 6. Create Course Feedback (Course Enjoyment)
        feedback_comments = [
            ("Creative Writing & World Literature", "Incredible class! The workshop sessions really unlocked my writing skills.", "Interactive Labs, Great Instructor, High Engagement"),
            ("Robotics & AI Lab", "Hands-on programming with hardware was super exciting!", "Real-World Projects, Hands-on, Heavy Homework"),
            ("AP Digital Arts & Graphic Design", "Loved building real portfolios using digital design suites.", "Creative Freedom, Engaging Projects"),
            ("Introduction to Computer Science & Python", "Fun introduction to coding. Teacher made algorithms easy to grasp.", "Engaging Teacher, Clear Grading"),
            ("Symphonic Band & Music Theory", "Playing in the fall ensemble was the highlight of my semester.", "Teamwork, Fun Environment"),
            ("AP Physics C: Mechanics & Quantum Theory", "Challenging math and tough tests, but extremely rewarding physics concepts.", "Tough Exams, High Reward, Great Instructor"),
            ("Organic Chemistry & Molecular Bio", "Heavy lab reports, but the molecular models were super cool.", "Heavy Labwork, Difficult Tests"),
        ]

        tags_pool = ["Interactive Labs", "Engaging Teacher", "Real-World Projects", "High Engagement", "Creative Freedom", "Clear Grading"]

        for c in course_objs:
            # Add feedback entries for students
            for s in random.sample(student_objs, 8):
                if c.code in ["CS-302", "ENG-201", "ART-105"]:
                    sat = round(random.uniform(4.5, 5.0), 1)
                    rec = round(random.uniform(92.0, 100.0), 1)
                    diff = random.choice([3, 4])
                    work = random.choice([3, 4])
                elif c.code in ["PHY-301", "CHEM-202"]:
                    sat = round(random.uniform(4.0, 4.7), 1)
                    rec = round(random.uniform(85.0, 95.0), 1)
                    diff = random.choice([4, 5])
                    work = random.choice([4, 5])
                else:
                    sat = round(random.uniform(4.2, 4.8), 1)
                    rec = round(random.uniform(88.0, 96.0), 1)
                    diff = random.choice([2, 3, 4])
                    work = random.choice([2, 3, 4])

                matching_comment = next((fc for fc in feedback_comments if fc[0] == c.name), None)
                tag_str = matching_comment[2] if matching_comment else ", ".join(random.sample(tags_pool, 2))
                comm_str = matching_comment[1] if matching_comment else "Overall a great course experience."

                db.add(CourseFeedback(
                    course_id=c.id,
                    student_id=s.id,
                    term="Fall 2025",
                    satisfaction_score=sat,
                    recommendation_rate=rec,
                    perceived_difficulty=diff,
                    workload_rating=work,
                    feedback_tags=tag_str,
                    qualitative_comment=comm_str
                ))

        db.commit()

        # 7. Create Financial Ledger Entries
        months_dates = [
            datetime.date(2025, 9, 15),
            datetime.date(2025, 10, 15),
            datetime.date(2025, 11, 15),
            datetime.date(2025, 12, 15),
            datetime.date(2026, 1, 15),
            datetime.date(2026, 2, 15),
        ]

        for m_date in months_dates:
            # Revenue
            db.add(FinancialLedger(type="Revenue", category="Tuition & Fees", amount=1850000.0, transaction_date=m_date, description="Monthly tuition collection"))
            db.add(FinancialLedger(type="Revenue", category="State & Federal Grants", amount=420000.0, transaction_date=m_date, description="Educational development grant"))
            db.add(FinancialLedger(type="Revenue", category="Endowment & Alumni Donations", amount=180000.0, transaction_date=m_date, description="Alumni fund contribution"))
            
            # Expenses
            db.add(FinancialLedger(type="Expense", category="Faculty & Staff Salaries", amount=1250000.0, transaction_date=m_date, description="Faculty payroll", department_id=dept_objs[0].id))
            db.add(FinancialLedger(type="Expense", category="EdTech & IT Infrastructure", amount=280000.0, transaction_date=m_date, description="Cloud infrastructure and software licenses", department_id=dept_objs[0].id))
            db.add(FinancialLedger(type="Expense", category="Facilities & Utilities", amount=220000.0, transaction_date=m_date, description="Campus maintenance and heating"))
            db.add(FinancialLedger(type="Expense", category="Athletics & Campus Life", amount=140000.0, transaction_date=m_date, description="Sports equipment & tournament travel", department_id=dept_objs[4].id))

        db.commit()
        print("Database successfully seeded!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
