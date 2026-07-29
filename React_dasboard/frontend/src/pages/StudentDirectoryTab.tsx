import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, UserCheck, AlertTriangle, GraduationCap } from 'lucide-react';
import { fetchStudentsList } from '../api/client';
import { StudentDetail } from '../types';

interface StudentDirectoryTabProps {
  onSelectStudent: (student: StudentDetail) => void;
  onOpenExportModal: () => void;
  searchQuery: string;
}

export const StudentDirectoryTab: React.FC<StudentDirectoryTabProps> = ({ onSelectStudent, onOpenExportModal, searchQuery }) => {
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [gradeFilter, setGradeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    const q = searchQuery || localSearch;
    fetchStudentsList(q, gradeFilter, statusFilter).then(setStudents);
  }, [searchQuery, localSearch, gradeFilter, statusFilter]);

  return (
    <div>
      {/* Header & Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>Interactive Student Directory</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filterable student master roster with academic, attendance, and tuition status drilldowns.</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenExportModal}>
          <Download size={16} />
          <span>Export Student Roster (CSV)</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-control"
              placeholder="Filter by name, code, email..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>GRADE:</span>
            <select className="input-control" value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
              <option value="All">All Grades</option>
              <option value="9th">9th Grade</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
              <option value="12th">12th Grade</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS:</span>
            <select className="input-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Honor Roll">Honor Roll</option>
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Student Roster ({students.length} Records)</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing filtered students</span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Code</th>
                <th>Full Name</th>
                <th>Grade</th>
                <th>Academic Department</th>
                <th>Status</th>
                <th>GPA</th>
                <th>Attendance</th>
                <th>Tuition Fee Status</th>
                <th>Detail View</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.student_code}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                  </td>
                  <td>{s.grade_level}</td>
                  <td>{s.department_name || 'General'}</td>
                  <td>
                    <span className={`badge ${s.status === 'Honor Roll' ? 'badge-success' : s.status === 'At Risk' ? 'badge-danger' : 'badge-info'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: s.gpa >= 3.7 ? 'var(--accent-emerald)' : s.gpa < 2.5 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                    {s.gpa.toFixed(2)}
                  </td>
                  <td style={{ fontWeight: 700, color: s.attendance_rate < 88 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                    {s.attendance_rate.toFixed(1)}%
                  </td>
                  <td>
                    <span className={`badge ${s.tuition_status === 'Overdue' ? 'badge-danger' : s.tuition_status === 'Scholarship' ? 'badge-warning' : 'badge-success'}`}>
                      {s.tuition_status || 'Paid'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => onSelectStudent(s)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                      Inspect Profile
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
