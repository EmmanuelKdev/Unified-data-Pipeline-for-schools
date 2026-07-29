export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'Admin' | 'Principal' | 'Teacher' | 'Bursar';
}


export interface KpiSummary {
  total_students: number;
  average_gpa: number;
  attendance_rate: number;
  at_risk_students: number;
  total_revenue: number;
  operating_expenses: number;
  net_margin: number;
  tuition_collection_rate: number;
  total_overdue_tuition: number;
}

export interface StudentDetail {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string;
  grade_level: string;
  department_name?: string;
  status: 'Honor Roll' | 'On Track' | 'At Risk';
  gpa: number;
  attendance_rate: number;
  enrollment_date: string;
  tuition_status?: 'Paid' | 'Overdue' | 'Payment Plan' | 'Scholarship';
  balance_due?: number;
}

export interface GradeDistribution {
  grade: string;
  count: number;
  percentage: number;
}

export interface SubjectPerformance {
  subject: string;
  average_score: number;
  highest_score: number;
  lowest_score: number;
}

export interface MonthlyAttendance {
  month: string;
  attendance_rate: number;
  excused: number;
  unexcused: number;
  tardy: number;
}

export interface FinancialSummary {
  total_revenue: number;
  total_expenses: number;
  net_surplus: number;
  tuition_collection_pct: number;
  total_financial_aid: number;
}

export interface RevenueExpenseTrend {
  month: string;
  revenue: number;
  expense: number;
}

export interface DepartmentBudget {
  department: string;
  allocated_budget: number;
  actual_spent: number;
  variance: number;
  utilization_pct: number;
}

export interface OverdueTuitionItem {
  id: number;
  student_name: string;
  student_code: string;
  grade_level: string;
  balance_due: number;
  due_date: string;
  days_overdue: number;
}

export interface CourseEnjoymentItem {
  id: number;
  code: string;
  name: string;
  instructor_name: string;
  department: string;
  avg_satisfaction: number;
  pct_recommended: number;
  avg_difficulty: number;
  avg_workload: number;
  total_responses: number;
}

export interface DepartmentSentiment {
  department: string;
  satisfaction: number;
  recommendation: number;
}

export interface CourseMatrixPoint {
  course_name: string;
  satisfaction: number;
  avg_grade: number;
  student_count: number;
}
