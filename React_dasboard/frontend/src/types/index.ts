export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'Admin' | 'Principal' | 'Teacher' | 'Bursar';
}

// Renamed KpiSummary -> OverviewMetrics to match import
export interface OverviewMetrics {
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

// Renamed StudentDetail -> Student to match import
export interface Student {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string;
  grade_level: string;
  department_name?: string;
  status: 'Honor Roll' | 'On Track' | 'At Risk';
  gpa: number;
  attendance_rate?: number;
  attendance_percentage?: number;
  enrollment_date: string;
  tuition_status?: 'Paid' | 'Overdue' | 'Payment Plan' | 'Scholarship';
  balance_due?: number;
}

// Renamed MonthlyAttendance -> AttendanceRecord to match import
export interface AttendanceRecord {
  month: string;
  attendance_rate?: number;
  excused: number;
  unexcused: number;
  tardy: number;
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

export interface AttendanceAnalytics {
  kpis: {
    total_records: number;
    total_present: number;
    total_absent: number;
    overall_attendance_rate: number;
   
  };
  monthly_trends: Array<{
    year: number;
    month: number;
    attendance_rate: number;
    excused_count: number;
    unexcused_count: number;
  }>;
  truancy_roster: Array<{
    student_id: string;
    first_name: string;
    last_name: string;
    total_records: number;
    days_present: number;
    days_absent: number;
    attendance_percentage: number;
  }>;
}

// Academic Tab
// types.ts

export interface HonorRollKPI {
  percentage: number;
  student_count: number;
  gpa_threshold: number;
}

export interface HighestPerformingSubjectKPI {
  subject_name: string;
  average_score: number;
  runner_up_subject?: string | null;
  runner_up_score?: number | null;
}

export interface PassRateKPI {
  percentage: number;
  target_met: boolean;
}

export interface AcademicKPIs {
  honor_roll: HonorRollKPI;
  highest_performing_subject: HighestPerformingSubjectKPI;
  pass_rate: PassRateKPI;
}

export interface SubjectMasteryItem {
  subject: string;
  average_score: number;
}

export interface GradeDistributionItem {
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | string;
  count: number;
}

export interface DepartmentPerformanceItem {
  subject_name: string;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  status_benchmark: string;
}

export interface AcademicAnalyticsResponse {
  kpis: AcademicKPIs;
  subject_mastery_radar: SubjectMasteryItem[];
  grade_distribution: GradeDistributionItem[];
  performance_ledger: DepartmentPerformanceItem[];
}

// Overview Tab
export interface OverviewMetrics {
  total_enrollment: number;
  enrollment_growth_pct: number;
  average_gpa: number;
  gpa_gain: number;
  attendance_rate: number;
  at_risk_students: number;
  net_margin: number;
  total_revenue: number;
  total_expenses: number;
}

export interface AcademicTrajectory {
  term: string;
  gpa: number;
  attendance_percentage?: number;
  attendance_rate?: number;
  enrollment_count?: number;
}

export interface AcademicTrajectory {
  term: string;
  gpa: number;
  attendance: number;
}

export interface GradeDistribution {
  grade: string;
  count: number;
}

export interface ExecutiveOverviewResponse {
  kpis: OverviewMetrics;
  academic_trajectory: AcademicTrajectory[];
  grade_distribution: GradeDistribution[];
  at_risk_ledger: Student[];
}