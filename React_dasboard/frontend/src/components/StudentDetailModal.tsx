import React from 'react';
import { X, GraduationCap, Calendar, DollarSign, Award, AlertTriangle, Mail } from 'lucide-react';
import { Student } from '../types';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
  if (!student) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '650px',
        padding: '2rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.5rem',
            fontWeight: 700
          }}>
            {student.first_name.charAt(0)}{student.last_name.charAt(0)}
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
              {student.first_name} {student.last_name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {student.student_code}
              </span>
              <span className={`badge ${student.status === 'Honor Roll' ? 'badge-success' : student.status === 'At Risk' ? 'badge-danger' : 'badge-info'}`}>
                {student.status}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {student.grade_level} Grade
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <GraduationCap size={14} color="var(--accent-primary)" />
              Cumulative GPA
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {student.gpa.toFixed(2)}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <Calendar size={14} color="var(--accent-emerald)" />
              Attendance Rate
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--accent-emerald)' }}>
              {student.attendance_rate.toFixed(1)}%
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <DollarSign size={14} color="var(--accent-amber)" />
              Tuition Status
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.5rem', color: student.tuition_status === 'Overdue' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
              {student.tuition_status || 'Paid'}
            </div>
            {student.balance_due ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', marginTop: '0.1rem' }}>
                ${student.balance_due.toLocaleString()} Due
              </div>
            ) : null}
          </div>
        </div>

        {/* Detailed Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} color="var(--accent-cyan)" />
              Student Contact & Department Info
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>Email:</strong> {student.email}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Department:</strong> {student.department_name || 'General Academic'}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Enrolled Date:</strong> {student.enrollment_date}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Advisor:</strong> Dr. Alan Turing</div>
            </div>
          </div>

          {student.status === 'At Risk' && (
            <div className="glass-panel" style={{ padding: '1rem', borderColor: 'rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.08)' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-rose)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} />
                Action Plan Needed for At-Risk Student
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Student requires academic tutoring in Mathematics and a attendance counseling check-in with guardian.
              </p>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close Profile</button>
          <button className="btn btn-primary" onClick={() => alert(`Email sent to ${student.email}`)}>Send Guardian Notice</button>
        </div>
      </div>
    </div>
  );
};
