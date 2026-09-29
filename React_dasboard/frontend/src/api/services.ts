// src/api/services.ts
import { apiClient } from './client';
import { Student, OverviewMetrics, AttendanceRecord } from '../types';

export const apiService = {
  getOverviewMetrics: () => apiClient.get<OverviewMetrics>('/overview').then((res) => res.data),
  getStudents: (params?: Record<string, any>) => apiClient.get<Student[]>('/students', { params }).then((res) => res.data),
  getStudentById: (id: string) => apiClient.get<Student>(`/students/${id}`).then((res) => res.data),
  getAttendance: () => apiClient.get<AttendanceRecord[]>('/attendance').then((res) => res.data),
  login: (credentials: { username: string; pass: string }) => apiClient.post('/auth/login', credentials).then((res) => res.data),
};