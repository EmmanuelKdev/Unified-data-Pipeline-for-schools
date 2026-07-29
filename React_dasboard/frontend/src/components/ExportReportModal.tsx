import React, { useState } from 'react';
import { X, FileText, Download, CheckCircle } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const [selectedReport, setSelectedReport] = useState('performance');
  const [exportFormat, setExportFormat] = useState('csv');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setDownloaded(true);
    setTimeout(() => {
      // Simulate file download
      const element = document.createElement("a");
      const file = new Blob([
        `Report Type: ${selectedReport.toUpperCase()}\nExported Date: ${new Date().toISOString()}\nStatus: SUCCESS\nSchool: AuraEdu Academy\n`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `AuraEdu_${selectedReport}_report.${exportFormat}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloaded(false);
      onClose();
    }, 800);
  };

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
        maxWidth: '500px',
        padding: '2rem',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} color="var(--accent-primary)" />
          Export School Analytical Reports
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Select report parameters to export comprehensive datasets for administrators, board members, or department heads.
        </p>

        {/* Report Category Selection */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            REPORT CATEGORY
          </label>
          <select
            className="input-control"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="student_performance">Academic Performance & Grade Distribution Report</option>
            <option value="attendance_truancy">Attendance Rate & Truancy Log Report</option>
            <option value="financial_statement">School Financial Income & Budget Variance Statement</option>
            <option value="course_enjoyment">Course Enjoyment & Student Sentiment Survey Report</option>
            <option value="full_audit">Full School Master Executive Audit</option>
          </select>
        </div>

        {/* Export Format */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            FILE FORMAT
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: exportFormat === 'csv' ? 'rgba(99, 102, 241, 0.15)' : 'transparent' }}>
              <input type="radio" name="fmt" value="csv" checked={exportFormat === 'csv'} onChange={() => setExportFormat('csv')} />
              <span>CSV Spreadsheet</span>
            </label>
            <label style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: exportFormat === 'pdf' ? 'rgba(99, 102, 241, 0.15)' : 'transparent' }}>
              <input type="radio" name="fmt" value="pdf" checked={exportFormat === 'pdf'} onChange={() => setExportFormat('pdf')} />
              <span>PDF Document</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleExport} disabled={downloaded}>
            {downloaded ? (
              <>
                <CheckCircle size={16} />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
