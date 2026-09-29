import React, { useEffect, useState } from 'react';
import { CalendarCheck, AlertTriangle, UserX, Clock, Download } from 'lucide-react';
import { fetchAttendanceAnalytics } from '../api/client';
import { AttendanceAnalytics } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AttendanceTabProps {
  onSelectStudent?: (student: any) => void;
  onOpenExportModal: () => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ onSelectStudent, onOpenExportModal }) => {
  const [data, setData] = useState<AttendanceAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAttendanceAnalytics()
      .then((res) => setData(res))
      .catch((err) => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis;
  console.log('Attendance Analytics Data:', data);
  const monthlyTrends = data?.monthly_trends || [];
  const truancyRoster = data?.truancy_roster || [];

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Loading attendance analytics...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Attendance Rate & Truancy Analytics</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            School-wide daily attendance trends, absence classifications, and chronic absenteeism tracking.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onOpenExportModal}>
          <Download size={16} />
          <span>Export Attendance Log (CSV)</span>
        </button>
      </div>

      {/* Dynamic KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <CalendarCheck size={18} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUMULATIVE ATTENDANCE RATE</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
            {kpis?.total_records ? ((kpis.total_present / kpis.total_records) * 100).toFixed(1) : '0.0'}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Institutional Target: 95.0%</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <UserX size={18} color="var(--accent-amber)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PRESENT</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {kpis?.total_present ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Expected Improvement: 5.0%</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <AlertTriangle size={18} color="var(--accent-rose)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>UNEXCUSED ABSENCES</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
            {kpis?.total_absent ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Requires guardian notification</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Clock size={18} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL RECORDS</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {kpis?.total_records ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Regular attendance</div>
        </div>
      </div>
{/* Dynamic Charts Grid */}
<div className="dashboard-grid">
  {/* Attendance Percentage Trajectory / Comparison */}
  <div className="glass-panel col-8" style={{ padding: '1.5rem' }}>
    <div style={{ marginBottom: '1rem' }}>
      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Truancy Risk Attendance Rates (%)</h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comparison of flagged students vs 95% threshold</p>
    </div>

    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={truancyRoster} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="last_name" 
            stroke="var(--text-muted)" 
            tickFormatter={(value, idx) => `${truancyRoster[idx]?.first_name?.[0]}. ${value}`}
          />
          <YAxis domain={[0, 100]} stroke="var(--text-muted)" />
          <Tooltip 
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            formatter={(value: number) => [`${value}%`, 'Attendance Rate']}
            labelFormatter={(label, payload) => payload[0]?.payload ? `${payload[0].payload.first_name} ${payload[0].payload.last_name}` : label}
          />
          <Area type="monotone" dataKey="attendance_percentage" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#attGrad)" name="Attendance %" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Days Present vs Days Absent Breakdown */}
  <div className="glass-panel col-4" style={{ padding: '1.5rem' }}>
    <div style={{ marginBottom: '1rem' }}>
      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Days Present vs Absent</h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Breakdown per at-risk student</p>
    </div>

    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={truancyRoster} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="last_name" 
            stroke="var(--text-muted)" 
            tickFormatter={(value, idx) => `${truancyRoster[idx]?.first_name?.[0]}. ${value}`}
          />
          <YAxis stroke="var(--text-muted)" />
          <Tooltip 
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            labelFormatter={(label, payload) => payload[0]?.payload ? `${payload[0].payload.first_name} ${payload[0].payload.last_name}` : label}
          />
          <Bar dataKey="days_present" fill="#6366f1" name="Days Present" stackId="a" />
          <Bar dataKey="days_absent" fill="#f43f5e" name="Days Absent" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>

      {/* Chronic Absenteeism Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-rose)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} />
          Chronic Absenteeism & Truancy Risk Roster
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Total Records</th>
                <th>Days Present</th>
                <th>Days Absent</th>
                <th>Attendance Percentage</th>
                <th>Academic GPA</th>
                <th>Intervention Action</th>
              </tr>
            </thead>
            <tbody>
              {truancyRoster.map((student, idx) => (
                <tr key={student.student_id || idx}>
                  <td style={{ fontFamily: 'monospace' }}>{student.student_id}</td>
                  <td style={{ fontWeight: 600 }}>{student.first_name} {student.last_name}</td>
                  <td>{student.total_records || 'N/A'}</td>
                  <td>{student.days_present || 'N/A'}</td>
                  <td>{student.days_absent || 'N/A'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>
                    {student.attendance_percentage ? student.attendance_percentage.toFixed(1) : '0.0'}%
                  </td>
                  <td>{student.academic_gpa ? student.academic_gpa.toFixed(2) : 'N/A'}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => onSelectStudent && onSelectStudent(student)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
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