import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, CalendarCheck, AlertTriangle, DollarSign, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { fetchKpis, fetchGradeDistribution, fetchTruancyAlerts } from '../api/client';
import { KpiSummary, GradeDistribution, StudentDetail } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface OverviewTabProps {
  onSelectStudent: (student: StudentDetail) => void;
  setActiveTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onSelectStudent, setActiveTab }) => {
  const [kpis, setKpis] = useState<KpiSummary | null>(null);
  const [gradeDist, setGradeDist] = useState<GradeDistribution[]>([]);
  const [truancyList, setTruancyList] = useState<StudentDetail[]>([]);

  useEffect(() => {
    fetchKpis().then(setKpis);
    fetchGradeDistribution().then(setGradeDist);
    fetchTruancyAlerts().then(setTruancyList);
  }, []);

  const gpaTrendData = [
    { term: 'Fall 2023', gpa: 3.18, attendance: 92.4 },
    { term: 'Spring 2024', gpa: 3.25, attendance: 93.1 },
    { term: 'Fall 2024', gpa: 3.32, attendance: 94.0 },
    { term: 'Spring 2025', gpa: 3.38, attendance: 94.2 },
    { term: 'Fall 2025', gpa: 3.42, attendance: 94.8 },
  ];

  const gradeColors: Record<string, string> = {
    'A': '#10b981',
    'B': '#6366f1',
    'C': '#06b6d4',
    'D': '#f59e0b',
    'F': '#f43f5e',
  };

  return (
    <div>
      {/* Page Title & Intro */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Executive Dashboard Overview</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Real-time institutional briefing across academic performance, attendance, and finances.</p>
        </div>
        <div className="badge badge-info" style={{ gap: '0.4rem', padding: '0.4rem 0.85rem' }}>
          <Sparkles size={14} />
          <span>Spring Term Active</span>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="kpi-grid">
        <KpiCard
          title="Total Enrollment"
          value={kpis?.total_students.toLocaleString() || '1,420'}
          subtext="+4.2% from previous academic year"
          icon={Users}
          accentColor="var(--accent-primary)"
        />
        <KpiCard
          title="Average GPA"
          value={kpis?.average_gpa.toFixed(2) || '3.42'}
          subtext="+0.08 GPA institutional gain"
          icon={GraduationCap}
          accentColor="var(--accent-cyan)"
        />
        <KpiCard
          title="School Attendance Rate"
          value={`${kpis?.attendance_rate.toFixed(1) || '94.8'}%`}
          subtext="Benchmark target: 95.0%"
          icon={CalendarCheck}
          accentColor="var(--accent-emerald)"
        />
        <KpiCard
          title="At-Risk Students"
          value={kpis?.at_risk_students || '18'}
          subtext="Requires academic/attendance intervention"
          icon={AlertTriangle}
          accentColor="var(--accent-rose)"
        />
        <KpiCard
          title="Net Operating Margin"
          value={`$${((kpis?.net_margin || 2400000) / 1000000).toFixed(2)}M`}
          subtext="Revenue: $14.2M | Expenses: $11.8M"
          icon={DollarSign}
          accentColor="var(--accent-emerald)"
        />
      </div>

      {/* Main Charts Row */}
      <div className="dashboard-grid">
        {/* GPA Trajectory Line/Area Chart */}
        <div className="glass-panel col-8" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Institutional Academic & Attendance Trajectory</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historical term-by-term GPA growth and attendance progression</p>
            </div>
            <TrendingUp size={20} color="var(--accent-emerald)" />
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gpaTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="term" stroke="var(--text-muted)" fontSize={12} />
                <YAxis domain={[2.5, 4.0]} stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="gpa" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#gpaGrad)" name="Average GPA" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Letter Distribution Bar Chart */}
        <div className="glass-panel col-4" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Grade Distribution Curve</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current term student performance breakdown</p>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="grade" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {gradeDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={gradeColors[entry.grade] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* At-Risk & Quick Actions Row */}
      <div className="dashboard-grid">
        {/* At Risk Truancy Alert Ledger */}
        <div className="glass-panel col-8" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="var(--accent-rose)" />
                Priority At-Risk Student Ledger
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Students flagged for low attendance rate or failing GPA threshold</p>
            </div>
            <button className="btn btn-secondary" onClick={() => setActiveTab('directory')} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
              View All Directory
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Grade</th>
                  <th>GPA</th>
                  <th>Attendance</th>
                  <th>Tuition Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {truancyList.slice(0, 5).map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.student_code}</div>
                    </td>
                    <td>{s.grade_level}</td>
                    <td style={{ fontWeight: 700, color: s.gpa < 2.5 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>{s.gpa.toFixed(2)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>{s.attendance_rate.toFixed(1)}%</td>
                    <td>
                      <span className={`badge ${s.tuition_status === 'Overdue' ? 'badge-danger' : 'badge-info'}`}>
                        {s.tuition_status || 'Paid'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => onSelectStudent(s)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Executive Quick Actions */}
        <div className="glass-panel col-4" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Module Direct Access</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <button
              onClick={() => setActiveTab('finance')}
              className="glass-panel"
              style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <DollarSign size={20} color="var(--accent-emerald)" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Financial Reports</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Income statements & overdue fees</div>
                </div>
              </div>
              <ArrowUpRight size={16} color="var(--text-muted)" />
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className="glass-panel"
              style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Sparkles size={20} color="var(--accent-purple)" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Course Enjoyment</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student sentiment & 5-star ratings</div>
                </div>
              </div>
              <ArrowUpRight size={16} color="var(--text-muted)" />
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className="glass-panel"
              style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CalendarCheck size={20} color="var(--accent-cyan)" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Attendance Analytics</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly trends & truancy logs</div>
                </div>
              </div>
              <ArrowUpRight size={16} color="var(--text-muted)" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
