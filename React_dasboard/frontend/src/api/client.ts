import axios from 'axios';
import {
  OverviewMetrics,
  GradeDistribution,
  Student,
  SubjectPerformance,
  AttendanceRecord,
  CourseEnjoymentItem,
  FinancialSummary,
  RevenueExpenseTrend,
  DepartmentBudget,
  OverdueTuitionItem,
  AttendanceAnalytics,
  AcademicAnalyticsResponse,
  ExecutiveOverviewResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT auth token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Executive Dashboard & Overview
export const fetchKpis = async (): Promise<OverviewMetrics> => {
  const response = await apiClient.get<OverviewMetrics>('/kpis');
  return response.data;
};

export const fetchGradeDistribution = async (): Promise<GradeDistribution[]> => {
  const response = await apiClient.get<GradeDistribution[]>('/grade-distribution');
  return response.data;
};

export const fetchTruancyAlerts = async (): Promise<Student[]> => {
  const response = await apiClient.get<Student[]>('/truancy-alerts');
  return response.data;
};

// Academic Tab
export const fetchSubjectPerformance = async (): Promise<SubjectPerformance[]> => {
  const response = await apiClient.get<SubjectPerformance[]>('/subject-performance');
  return response.data;
};

// Attendance Tab Refactored keep
export const fetchAttendanceAnalytics = async (): Promise<AttendanceAnalytics> => {
  const response = await apiClient.get<AttendanceAnalytics>('/attendance/analytics');
  return response.data;
};

// Course Enjoyment Tab
export const fetchCourseEnjoyment = async (): Promise<CourseEnjoymentItem[]> => {
  const response = await apiClient.get<CourseEnjoymentItem[]>('/course-enjoyment');
  return response.data;
};

// Financial Tab
export const fetchFinancialSummary = async (): Promise<FinancialSummary> => {
  const response = await apiClient.get<FinancialSummary>('/financial-summary');
  return response.data;
};

export const fetchRevenueExpenseTrends = async (): Promise<RevenueExpenseTrend[]> => {
  const response = await apiClient.get<RevenueExpenseTrend[]>('/revenue-expense-trends');
  return response.data;
};

export const fetchDepartmentBudgets = async (): Promise<DepartmentBudget[]> => {
  const response = await apiClient.get<DepartmentBudget[]>('/department-budgets');
  return response.data;
};

export const fetchOverdueTuition = async (): Promise<OverdueTuitionItem[]> => {
  const response = await apiClient.get<OverdueTuitionItem[]>('/overdue-tuition');
  return response.data;
};

// Student Directory Tab KEEP/Working
export const fetchStudentsList = async (
  searchQuery?: string, 
  gradeFilter?: string, 
  statusFilter?: string
): Promise<Student[]> => {
  const response = await apiClient.get<Student[]>('/students/directory', {
    params: {
      search: searchQuery?.trim() || undefined,
      grade: gradeFilter !== 'All' ? gradeFilter : undefined,
      status: statusFilter !== 'All' ? statusFilter : undefined,
    },
  });
  return response.data;
};

// Academic Tab KEEP/Working


export const fetchAcademicAnalytics = async (
  academicYear: string = 'Fall 2025'
): Promise<AcademicAnalyticsResponse> => {
  const response = await apiClient.get<AcademicAnalyticsResponse>('/academics/analytics', {
    params: {
      academic_year: academicYear,
    },
  });

  return response.data;
};

// overview metrics for the dashboard
export const fetchExecutiveOverview = async (
  academicYear: string = 'Fall 2025'
): Promise<ExecutiveOverviewResponse> => {
  const response = await apiClient.get<ExecutiveOverviewResponse>('/overview/dashboard', {
    params: { academic_year: academicYear },
  });
  return response.data;
};