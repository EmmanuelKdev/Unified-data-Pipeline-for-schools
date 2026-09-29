import React, { useEffect, useState } from 'react';
import { HeartHandshake, Star, ThumbsUp, Sparkles, MessageSquare, Download } from 'lucide-react';
import { fetchCourseEnjoyment } from '../api/client';
import { CourseEnjoymentItem } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';

interface CourseEnjoymentTabProps {
  onOpenExportModal: () => void;
}

export const CourseEnjoymentTab: React.FC<CourseEnjoymentTabProps> = ({ onOpenExportModal }) => {
  const [courses, setCourses] = useState<CourseEnjoymentItem[]>([]);

  useEffect(() => {
    fetchCourseEnjoyment().then(setCourses);
  }, []);

  const matrixPoints = courses.map(c => ({
    name: c.name,
    satisfaction: c.avg_satisfaction,
    difficulty: c.avg_difficulty,
    responses: c.total_responses
  }));

  return (
    <div>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Course Enjoyment & Student Sentiment Analytics</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Student course satisfaction 5-star ratings, recommendation percentages, and qualitative feedback tags.</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenExportModal}>
          <Download size={16} />
          <span>Export Sentiment Survey (CSV)</span>
        </button>
      </div>

      {/* Top 3 Most Enjoyed Courses Medals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {courses.slice(0, 3).map((c, idx) => (
          <div key={c.id} className="glass-panel" style={{
            padding: '1.5rem',
            position: 'relative',
            borderColor: idx === 0 ? 'rgba(245, 158, 11, 0.4)' : idx === 1 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(16, 185, 129, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span className={`badge ${idx === 0 ? 'badge-warning' : idx === 1 ? 'badge-info' : 'badge-success'}`}>
                {idx === 0 ? '🥇 #1 Most Enjoyed' : idx === 1 ? '🥈 #2 Most Enjoyed' : '🥉 #3 Most Enjoyed'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-amber)', fontWeight: 700, fontSize: '1.1rem' }}>
                <Star size={18} fill="var(--accent-amber)" color="var(--accent-amber)" />
                {c.avg_satisfaction.toFixed(2)} / 5.0
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{c.name}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Instructor: {c.instructor_name}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{c.department}</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ThumbsUp size={14} />
                {c.pct_recommended.toFixed(1)}% Recommend
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Sentiment Grid */}
      <div className="dashboard-grid">
        {/* Course Enjoyment vs Difficulty Matrix Scatter Chart */}
        <div className="glass-panel col-7" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Student Enjoyment vs. Perceived Difficulty Matrix</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scatter visualization showing course ratings against course workload/difficulty (1-5 scale)</p>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" dataKey="difficulty" name="Difficulty (1-5)" domain={[1, 5]} stroke="var(--text-muted)" unit="★" />
                <YAxis type="number" dataKey="satisfaction" name="Satisfaction (1-5)" domain={[3.5, 5.0]} stroke="var(--text-muted)" />
                <ZAxis type="number" dataKey="responses" range={[60, 400]} name="Responses" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Scatter name="Courses" data={matrixPoints} fill="#d4d4d4" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Feedback Tags & Student Voice */}
        <div className="glass-panel col-5" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-amber)" />
            Top Student Feedback Themes
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['#Interactive Labs', '#Engaging Instructor', '#Real-World Projects', '#High Creative Freedom', '#Clear Grading Rubric', '#Hands-on Hardware', '#Great Ensemble Music'].map((tag, i) => (
              <span key={i} className="badge badge-info" style={{ fontSize: '0.75rem', textTransform: 'none', padding: '0.4rem 0.75rem' }}>
                {tag}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', borderLeft: '3px solid var(--accent-emerald)' }}>
              <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                "Incredible class! The workshop sessions in Creative Writing really unlocked my writing confidence."
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                — Creative Writing & World Literature (Fall 2025)
              </div>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', borderLeft: '3px solid var(--accent-primary)' }}>
              <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                "Hands-on programming with physical robotics kits was super exciting and practical!"
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                — Robotics & AI Lab (Fall 2025)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Course Ratings Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Complete Course Sentiment Leaderboard</h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Instructor</th>
                <th>Department</th>
                <th>Student Rating</th>
                <th>Recommend %</th>
                <th>Workload</th>
                <th>Survey Responses</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace' }}>{c.code}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.instructor_name}</td>
                  <td>{c.department}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                      <Star size={14} fill="var(--accent-amber)" color="var(--accent-amber)" />
                      {c.avg_satisfaction.toFixed(2)}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{c.pct_recommended.toFixed(1)}%</td>
                  <td>{c.avg_workload.toFixed(1)} / 5.0</td>
                  <td>{c.total_responses} reviews</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
