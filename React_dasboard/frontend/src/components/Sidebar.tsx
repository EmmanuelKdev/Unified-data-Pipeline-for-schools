import React from 'react';
import { LayoutDashboard, GraduationCap, CalendarCheck, DollarSign, HeartHandshake, Users, LogOut } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'academics', label: 'Academic Performance', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance Analytics', icon: CalendarCheck },
    { id: 'finance', label: 'School Financial Reports', icon: DollarSign },
    { id: 'courses', label: 'Course Enjoyment', icon: HeartHandshake },
    { id: 'directory', label: 'Student Directory', icon: Users },
  ];

  return (
    <aside className="sidebar" style={{ background: 'rgba(255, 255, 255, 0.09)'}}>
      {/* Brand Logo & Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)'
        }}>
          <GraduationCap size={24} color="var(--accent-primary)" />
        </div>
        <div>
          <h2 className="brand-title" style={{ fontSize: '1.25rem', lineHeight: '1.1' }}>AlephEdu</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>School Analytics Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', background: 'none', color: 'var(--text-primary)' }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Card & Logout */}
      {currentUser && (
        <div className="glass-panel" style={{ padding: '1rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: '1px solid var(--border-highlight)'
            }}>
              {currentUser.full_name.charAt(0)}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.full_name}
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                {currentUser.role}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', gap: '0.35rem' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};
