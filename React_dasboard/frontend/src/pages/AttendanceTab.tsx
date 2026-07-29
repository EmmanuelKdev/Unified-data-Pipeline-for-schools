import React, { useEffect, useState } from 'react';
import { CalendarCheck, AlertTriangle, UserX, Clock, Download } from 'lucide-react';
import { fetchMonthlyAttendance, fetchTruancyAlerts } from '../api/client';
import { MonthlyAttendance, StudentDetail } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AttendanceTabProps {
  onSelectStudent: (student: StudentDetail) => void;
  onOpenExportModal: () => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ onSelectStudent, onOpenExportModal }) => {
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyAttendance[]>([]);
  const [truancyAlerts, setTruancyAlerts] = useState<StudentDetail[]>([]);

  useEffect(() => {
    fetchMonthlyAttendance().then(setMonthlyTrends);
    fetchTruancyAlerts().then(setTruancyAlerts);
  }, []);

  return (
    <div>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Attendance Rate & Truancy Analytics</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>School-wide daily attendance trends, absence classifications, and chronic absenteeism tracking.</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenExportModal}>
          <Download size={16} />
          <span>Export Attendance Log (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <CalendarCheck size={18} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUMULATIVE ATTENDANCE RATE</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>94.8%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Institutional Target: 95.0%</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <UserX size={18} color="var(--accent-amber)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXCUSED ABSENCES</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>253</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Medical & Athletic releases</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <AlertTriangle size={18} color="var(--accent-rose)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>UNEXCUSED ABSENCES</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-rose)' }}>88</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Requires guardian notification</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Clock size={18} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TARDY LOGS</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>117</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>First period arrival delays</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="dashboard-grid">
        {/* Monthly Attendance Trend Chart */}
        <div className="glass-panel col-8" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Monthly Attendance Rate Trajectory (%)</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comparison of monthly attendance performance vs 95% threshold</p>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis domain={[85, 100]} stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="attendance_rate" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#attGrad)" name="Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Absence Type Breakdown Bar Chart */}
        <div className="glass-panel col-4" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Absence Breakdown</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Excused vs Unexcused per month</p>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="excused" fill="#6366f1" name="Excused" stackId="a" />
                <Bar dataKey="unexcused" fill="#f43f5e" name="Unexcused" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chronic Absenteeism & Truancy Alert Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-rose)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} />
          Chronic Absenteeism & Truancy Risk Roster
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Code</th>
                <th>Student Name</th>
                <th>Grade Level</th>
                <th>Department</th>
                <th>Attendance Rate</th>
                <th>Academic GPA</th>
                <th>Intervention Action</th>
              </tr>
            </thead>
            <tbody>
              {truancyAlerts.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace' }}>{s.student_code}</td>
                  <td style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</td>
                  <td>{s.grade_level}</td>
                  <td>{s.department_name || 'General'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>{s.attendance_rate.toFixed(1)}%</td>
                  <td>{s.gpa.toFixed(2)}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => onSelectStudent(s)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                      Counseling Check-in
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
