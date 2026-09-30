import React, { useEffect, useState } from 'react';
import { GraduationCap, Award, BookOpen, Download } from 'lucide-react';
import { fetchAcademicAnalytics } from '../api/client';
import { AcademicAnalyticsResponse } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, Cell 
} from 'recharts';

interface AcademicTabProps {
  onOpenExportModal: () => void;
}

export const AcademicTab: React.FC<AcademicTabProps> = ({ onOpenExportModal }) => {
  const [data, setData] = useState<AcademicAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAcademicAnalytics('Fall 2025')
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load academic analytics:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading academic report...</div>;
  }

  const { kpis, subject_mastery_radar, grade_distribution, performance_ledger } = data;

  const gradeColors: Record<string, string> = {
    'A': '#f5f5f5',
    'B': '#d4d4d4',
    'C': '#a3a3a3',
    'D': '#71717a',
    'F': '#ef4444',
  };

  return (
    <div>
      {/* Header & Export Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Student Performance & Academic Reports</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Institutional grade curves, subject mastery averages, and academic achievement breakdown.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onOpenExportModal}>
          <Download size={16} />
          <span>Export Academic Report (CSV)</span>
        </button>
      </div>

      {/* Dynamic KPI Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Honor Roll KPI */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Award size={20} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>HONOR ROLL RATIO</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {kpis.honor_roll.percentage}%
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
            {kpis.honor_roll.student_count} Students with GPA ≥ {kpis.honor_roll.gpa_threshold.toFixed(2)}
          </p>
        </div>

        {/* Highest Performing Subject KPI */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <BookOpen size={20} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>HIGHEST PERFORMING SUBJECT</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {kpis.highest_performing_subject.subject_name} ({kpis.highest_performing_subject.average_score.toFixed(1)})
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {kpis.highest_performing_subject.runner_up_subject 
              ? `Followed by ${kpis.highest_performing_subject.runner_up_subject} (${kpis.highest_performing_subject.runner_up_score?.toFixed(1)})`
              : 'Top performing subject overall'}
          </p>
        </div>

        {/* Pass Rate KPI */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <GraduationCap size={20} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>PASS RATE (A-C GRADES)</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {kpis.pass_rate.percentage}%
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            {kpis.pass_rate.target_met ? 'Core requirement target met' : 'Below core target threshold'}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid">
        {/* Subject Mastery Radar Chart */}
        <div className="glass-panel col-6" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Subject Mastery Radar Analysis</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Comparison of average score benchmarks across academic departments
            </p>
          </div>

          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={subject_mastery_radar}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-primary)" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[50, 100]} stroke="var(--text-muted)" />
                <Radar name="Average Score" dataKey="average_score" stroke="#f5f5f5" fill="rgba(165, 233, 123, 0.78)" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Bar Chart */}
        <div className="glass-panel col-6" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Letter Grade Distribution Curve</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Number of student enrollments per letter grade mark
            </p>
          </div>

          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grade_distribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="grade" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {grade_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={gradeColors[entry.grade] || '#a3a3a3'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject Performance Breakdown Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Departmental Subject Performance Ledger
        </h3>
        
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Average Score</th>
                <th>Highest Score</th>
                <th>Lowest Score</th>
                <th>Status Benchmark</th>
              </tr>
            </thead>
            <tbody>
              {performance_ledger.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{s.subject_name}</td>
                  <td style={{ fontWeight: 700, color: s.average_score >= 85 ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
                    {s.average_score.toFixed(1)} / 100
                  </td>
                  <td style={{ color: 'var(--accent-emerald)' }}>{s.highest_score.toFixed(1)}</td>
                  <td style={{ color: 'var(--accent-rose)' }}>{s.lowest_score.toFixed(1)}</td>
                  <td>
                    <span className={`badge ${s.average_score >= 85 ? 'badge-success' : s.average_score >= 75 ? 'badge-info' : 'badge-warning'}`}>
                      {s.status_benchmark}
                    </span>
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