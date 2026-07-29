import React, { useEffect, useState } from 'react';
import { GraduationCap, Award, BookOpen, Download } from 'lucide-react';
import { fetchGradeDistribution, fetchSubjectPerformance } from '../api/client';
import { GradeDistribution, SubjectPerformance } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';

interface AcademicTabProps {
  onOpenExportModal: () => void;
}

export const AcademicTab: React.FC<AcademicTabProps> = ({ onOpenExportModal }) => {
  const [gradeDist, setGradeDist] = useState<GradeDistribution[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectPerformance[]>([]);

  useEffect(() => {
    fetchGradeDistribution().then(setGradeDist);
    fetchSubjectPerformance().then(setSubjectStats);
  }, []);

  const radarData = subjectStats.map(s => ({
    subject: s.subject,
    score: s.average_score,
    fullMark: 100
  }));

  const gradeColors: Record<string, string> = {
    'A': '#10b981',
    'B': '#6366f1',
    'C': '#06b6d4',
    'D': '#f59e0b',
    'F': '#f43f5e',
  };

  return (
    <div>
      {/* Header & Export Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Student Performance & Academic Reports</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Institutional grade curves, subject mastery averages, and academic achievement breakdown.</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenExportModal}>
          <Download size={16} />
          <span>Export Academic Report (CSV)</span>
        </button>
      </div>

      {/* Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Award size={20} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>HONOR ROLL RATIO</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>34.2%</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>485 Students with GPA ≥ 3.70</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <BookOpen size={20} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>HIGHEST PERFORMING SUBJECT</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Digital Arts (89.1)</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Followed by Computer Science (88.5)</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <GraduationCap size={20} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>PASS RATE (A-C GRADES)</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>90.5%</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>Core requirement target met</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid">
        {/* Subject Mastery Radar Chart */}
        <div className="glass-panel col-6" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Subject Mastery Radar Analysis</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comparison of average score benchmarks across academic departments</p>
          </div>

          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-primary)" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[50, 100]} stroke="var(--text-muted)" />
                <Radar name="Subject Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Bar Chart */}
        <div className="glass-panel col-6" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Letter Grade Distribution Curve</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Number of student enrollments per letter grade mark</p>
          </div>

          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDist} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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

      {/* Subject Performance Breakdown Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Departmental Subject Performance Ledger</h3>
        
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
              {subjectStats.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{s.subject}</td>
                  <td style={{ fontWeight: 700, color: s.average_score >= 85 ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
                    {s.average_score.toFixed(1)} / 100
                  </td>
                  <td style={{ color: 'var(--accent-emerald)' }}>{s.highest_score.toFixed(1)}</td>
                  <td style={{ color: 'var(--accent-rose)' }}>{s.lowest_score.toFixed(1)}</td>
                  <td>
                    <span className={`badge ${s.average_score >= 85 ? 'badge-success' : s.average_score >= 80 ? 'badge-info' : 'badge-warning'}`}>
                      {s.average_score >= 85 ? 'Exceeding Benchmark' : s.average_score >= 80 ? 'On Track' : 'Review Needed'}
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
