import axios from 'axios';
import { 
  KpiSummary, StudentDetail, GradeDistribution, SubjectPerformance, 
  MonthlyAttendance, FinancialSummary, RevenueExpenseTrend, DepartmentBudget, 
  OverdueTuitionItem, CourseEnjoymentItem, DepartmentSentiment, CourseMatrixPoint 
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject JWT token into headers if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aura_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback Mock Data for instant offline/standalone preview
const MOCK_KPIS: KpiSummary = {
  total_students: 1420,
  average_gpa: 3.42,
  attendance_rate: 94.8,
  at_risk_students: 18,
  total_revenue: 14200000.0,
  operating_expenses: 11800000.0,
  net_margin: 2400000.0,
  tuition_collection_rate: 95.4,
  total_overdue_tuition: 142500.0
};

const MOCK_GRADE_DIST: GradeDistribution[] = [
  { grade: 'A', count: 485, percentage: 34.2 },
  { grade: 'B', count: 520, percentage: 36.6 },
  { grade: 'C', count: 280, percentage: 19.7 },
  { grade: 'D', count: 117, percentage: 8.2 },
  { grade: 'F', count: 18, percentage: 1.3 },
];

const MOCK_SUBJECTS: SubjectPerformance[] = [
  { subject: 'Computer Science', average_score: 88.5, highest_score: 100.0, lowest_score: 68.0 },
  { subject: 'Creative Writing', average_score: 87.2, highest_score: 99.0, lowest_score: 72.0 },
  { subject: 'Natural Sciences', average_score: 84.6, highest_score: 98.0, lowest_score: 61.0 },
  { subject: 'Mathematics', average_score: 81.3, highest_score: 100.0, lowest_score: 55.0 },
  { subject: 'History', average_score: 83.9, highest_score: 97.0, lowest_score: 64.0 },
  { subject: 'Digital Arts', average_score: 89.1, highest_score: 100.0, lowest_score: 74.0 },
];

const MOCK_ATTENDANCE: MonthlyAttendance[] = [
  { month: 'Sep', attendance_rate: 96.2, excused: 32, unexcused: 8, tardy: 14 },
  { month: 'Oct', attendance_rate: 95.4, excused: 38, unexcused: 12, tardy: 19 },
  { month: 'Nov', attendance_rate: 94.1, excused: 45, unexcused: 18, tardy: 22 },
  { month: 'Dec', attendance_rate: 93.5, excused: 52, unexcused: 24, tardy: 28 },
  { month: 'Jan', attendance_rate: 94.8, excused: 40, unexcused: 15, tardy: 18 },
  { month: 'Feb', attendance_rate: 95.1, excused: 36, unexcused: 11, tardy: 16 },
];

const MOCK_FINANCIAL: FinancialSummary = {
  total_revenue: 14250000.0,
  total_expenses: 11800000.0,
  net_surplus: 2450000.0,
  tuition_collection_pct: 95.4,
  total_financial_aid: 1450000.0
};

const MOCK_REV_EXP: RevenueExpenseTrend[] = [
  { month: 'Sep', revenue: 2450000, expense: 1920000 },
  { month: 'Oct', revenue: 2180000, expense: 1850000 },
  { month: 'Nov', revenue: 2300000, expense: 1980000 },
  { month: 'Dec', revenue: 2600000, expense: 2100000 },
  { month: 'Jan', revenue: 2400000, expense: 1950000 },
  { month: 'Feb', revenue: 2270000, expense: 2000000 },
];

const MOCK_BUDGETS: DepartmentBudget[] = [
  { department: 'Computer Science & STEM', allocated_budget: 1250000, actual_spent: 910000, variance: 340000, utilization_pct: 72.8 },
  { department: 'Natural Sciences', allocated_budget: 1100000, actual_spent: 830000, variance: 270000, utilization_pct: 75.5 },
  { department: 'Humanities & Literature', allocated_budget: 850000, actual_spent: 615000, variance: 235000, utilization_pct: 72.4 },
  { department: 'Athletics & Physical Ed', allocated_budget: 750000, actual_spent: 590000, variance: 160000, utilization_pct: 78.7 },
  { department: 'Fine Arts & Music', allocated_budget: 600000, actual_spent: 440000, variance: 160000, utilization_pct: 73.3 },
];

const MOCK_OVERDUE: OverdueTuitionItem[] = [
  { id: 1, student_name: 'Emma Williams', student_code: 'STU-2026-103', grade_level: '12th', balance_due: 4200.0, due_date: '2025-11-15', days_overdue: 72 },
  { id: 2, student_name: 'Lucas Martinez', student_code: 'STU-2026-111', grade_level: '10th', balance_due: 3800.0, due_date: '2025-11-15', days_overdue: 72 },
  { id: 3, student_name: 'Jacob Thompson', student_code: 'STU-2026-122', grade_level: '11th', balance_due: 5100.0, due_date: '2025-12-01', days_overdue: 56 },
  { id: 4, student_name: 'Mia Davis', student_code: 'STU-2026-114', grade_level: '9th', balance_due: 2900.0, due_date: '2026-01-10', days_overdue: 18 },
];

const MOCK_COURSES: CourseEnjoymentItem[] = [
  { id: 1, code: 'ENG-201', name: 'Creative Writing & World Literature', instructor_name: 'Prof. Clara Oswald', department: 'Humanities & Literature', avg_satisfaction: 4.88, pct_recommended: 97.5, avg_difficulty: 3.2, avg_workload: 3.4, total_responses: 42 },
  { id: 2, code: 'CS-302', name: 'Robotics & AI Lab', instructor_name: 'Dr. Alan Turing', department: 'Computer Science & STEM', avg_satisfaction: 4.82, pct_recommended: 96.0, avg_difficulty: 4.1, avg_workload: 4.2, total_responses: 38 },
  { id: 3, code: 'ART-105', name: 'AP Digital Arts & Graphic Design', instructor_name: 'Elena Rostova', department: 'Fine Arts & Music', avg_satisfaction: 4.75, pct_recommended: 95.0, avg_difficulty: 2.8, avg_workload: 3.1, total_responses: 35 },
  { id: 4, code: 'CS-101', name: 'Introduction to Computer Science & Python', instructor_name: 'Prof. David Malan', department: 'Computer Science & STEM', avg_satisfaction: 4.65, pct_recommended: 94.0, avg_difficulty: 3.5, avg_workload: 3.6, total_responses: 64 },
  { id: 5, code: 'PHY-301', name: 'AP Physics C: Mechanics & Quantum Theory', instructor_name: 'Dr. Richard Feynman', department: 'Natural Sciences', avg_satisfaction: 4.42, pct_recommended: 89.0, avg_difficulty: 4.8, avg_workload: 4.7, total_responses: 29 },
];

const MOCK_STUDENTS: StudentDetail[] = [
  { id: 1, student_code: 'STU-2026-100', first_name: 'Alexander', last_name: 'Smith', email: 'alexander.smith@student.school.edu', grade_level: '9th', department_name: 'Computer Science & STEM', status: 'Honor Roll', gpa: 3.92, attendance_rate: 98.5, enrollment_date: '2023-09-01', tuition_status: 'Paid', balance_due: 0.0 },
  { id: 2, student_code: 'STU-2026-101', first_name: 'Sophia', last_name: 'Johnson', email: 'sophia.johnson@student.school.edu', grade_level: '10th', department_name: 'Humanities & Literature', status: 'Honor Roll', gpa: 3.88, attendance_rate: 99.1, enrollment_date: '2023-09-01', tuition_status: 'Paid', balance_due: 0.0 },
  { id: 3, student_code: 'STU-2026-103', first_name: 'Emma', last_name: 'Williams', email: 'emma.williams@student.school.edu', grade_level: '12th', department_name: 'Natural Sciences', status: 'At Risk', gpa: 2.12, attendance_rate: 84.2, enrollment_date: '2022-09-01', tuition_status: 'Overdue', balance_due: 4200.0 },
  { id: 4, student_code: 'STU-2026-104', first_name: 'Ethan', last_name: 'Brown', email: 'ethan.brown@student.school.edu', grade_level: '11th', department_name: 'Fine Arts & Music', status: 'On Track', gpa: 3.45, attendance_rate: 94.8, enrollment_date: '2023-09-01', tuition_status: 'Paid', balance_due: 0.0 },
  { id: 5, student_code: 'STU-2026-105', first_name: 'Liam', last_name: 'Jones', email: 'liam.jones@student.school.edu', grade_level: '9th', department_name: 'Athletics & Physical Ed', status: 'Honor Roll', gpa: 3.95, attendance_rate: 97.8, enrollment_date: '2024-09-01', tuition_status: 'Scholarship', balance_due: 0.0 },
];

export const fetchKpis = async (): Promise<KpiSummary> => {
  try {
    const res = await apiClient.get('/overview/kpis');
    return res.data;
  } catch (e) {
    return MOCK_KPIS;
  }
};

export const fetchGradeDistribution = async (): Promise<GradeDistribution[]> => {
  try {
    const res = await apiClient.get('/academics/grade-distribution');
    return res.data;
  } catch (e) {
    return MOCK_GRADE_DIST;
  }
};

export const fetchSubjectPerformance = async (): Promise<SubjectPerformance[]> => {
  try {
    const res = await apiClient.get('/academics/subject-stats');
    return res.data;
  } catch (e) {
    return MOCK_SUBJECTS;
  }
};

export const fetchMonthlyAttendance = async (): Promise<MonthlyAttendance[]> => {
  try {
    const res = await apiClient.get('/attendance/monthly-trends');
    return res.data;
  } catch (e) {
    return MOCK_ATTENDANCE;
  }
};

export const fetchTruancyAlerts = async (): Promise<StudentDetail[]> => {
  try {
    const res = await apiClient.get('/attendance/truancy-alerts');
    return res.data;
  } catch (e) {
    return MOCK_STUDENTS.filter(s => s.attendance_rate < 88);
  }
};

export const fetchFinancialSummary = async (): Promise<FinancialSummary> => {
  try {
    const res = await apiClient.get('/finance/summary');
    return res.data;
  } catch (e) {
    return MOCK_FINANCIAL;
  }
};

export const fetchRevenueExpenseTrends = async (): Promise<RevenueExpenseTrend[]> => {
  try {
    const res = await apiClient.get('/finance/trends');
    return res.data;
  } catch (e) {
    return MOCK_REV_EXP;
  }
};

export const fetchDepartmentBudgets = async (): Promise<DepartmentBudget[]> => {
  try {
    const res = await apiClient.get('/finance/budgets');
    return res.data;
  } catch (e) {
    return MOCK_BUDGETS;
  }
};

export const fetchOverdueTuition = async (): Promise<OverdueTuitionItem[]> => {
  try {
    const res = await apiClient.get('/finance/overdue-tuition');
    return res.data;
  } catch (e) {
    return MOCK_OVERDUE;
  }
};

export const fetchCourseEnjoyment = async (): Promise<CourseEnjoymentItem[]> => {
  try {
    const res = await apiClient.get('/courses/enjoyment');
    return res.data;
  } catch (e) {
    return MOCK_COURSES;
  }
};

export const fetchStudentsList = async (search?: string, grade?: string, status?: string): Promise<StudentDetail[]> => {
  try {
    const res = await apiClient.get('/students/list', {
      params: { search, grade_level: grade, status }
    });
    return res.data;
  } catch (e) {
    let list = MOCK_STUDENTS;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.first_name.toLowerCase().includes(q) || s.last_name.toLowerCase().includes(q) || s.student_code.toLowerCase().includes(q));
    }
    if (grade && grade !== 'All') {
      list = list.filter(s => s.grade_level === grade);
    }
    if (status && status !== 'All') {
      list = list.filter(s => s.status === status);
    }
    return list;
  }
};
