import React, { useState } from 'react';
import { Search, Sun, Moon, Bell, FileSpreadsheet, Sparkles } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  selectedTerm: string;
  setSelectedTerm: (term: string) => void;
  onOpenExportModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  selectedTerm,
  setSelectedTerm,
  onOpenExportModal,
  searchQuery,
  setSearchQuery
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, type: 'warning', title: 'At-Risk Truancy Alert', desc: 'Emma Williams (12th Grade) attendance dropped below 85%', time: '2h ago' },
    { id: 2, type: 'danger', title: 'Overdue Tuition Account', desc: 'Jacob Thompson balance overdue by $5,100 (56 days)', time: '4h ago' },
    { id: 3, type: 'success', title: 'Course Feedback Milestone', desc: 'Robotics & AI Lab achieved 4.82★ student rating', time: '1d ago' },
  ];

  return (
    <header className="header-bar">
      {/* Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '400px', background: 'rgba(255, 255, 255, 0.09)'}}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-control"
            placeholder="Search students, courses, department budgets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.32)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Header Controls & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Academic Term Selector */}
        <select
          className="input-control"
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          style={{ cursor: 'pointer', fontWeight: 600 }}
        >
          <option value="Fall 2025">Academic Year: Fall 2025</option>
          <option value="Spring 2026">Academic Year: Spring 2026</option>
          <option value="Full Year 2025-2026">Full Year 2025 - 2026</option>
        </select>

        {/* Quick Export Report Button */}
        <button className="btn btn-secondary" onClick={onOpenExportModal} title="Export CSV / Print Report">
          <FileSpreadsheet size={16} color="var(--accent-emerald)" />
          <span>Export Reports</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ padding: '0.65rem', borderRadius: '50%' }}
          >
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-rose)',
              boxShadow: '0 0 8px var(--accent-rose)'
            }} />
          </button>

          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              right: 0,
              top: '120%',
              width: '320px',
              padding: '1rem',
              zIndex: 50,
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Live School Alerts</h4>
                <Sparkles size={14} color="var(--accent-amber)" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '0.65rem',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.15)',
                    borderLeft: `3px solid ${n.type === 'danger' ? 'var(--accent-rose)' : n.type === 'warning' ? 'var(--accent-amber)' : 'var(--accent-emerald)'}`
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{n.desc}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light Theme Toggle */}
        <button
          className="btn btn-secondary"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{ padding: '0.65rem', borderRadius: '50%' }}
        >
          {theme === 'dark' ? <Sun size={18} color="var(--accent-amber)" /> : <Moon size={18} color="var(--accent-primary)" />}
        </button>
      </div>
    </header>
  );
};
