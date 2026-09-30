import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  accentColor?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  accentColor = 'var(--accent-primary)',
}) => {
  return (
    <div className="glass-panel kpi-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span className="kpi-title" style={{ color: 'var(--text-primary)' }}>{title}</span>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: `rgba(99, 102, 241, 0.12)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor
        }}>
          <Icon size={20} />
        </div>
      </div>
      
      <div className="kpi-value" style={{ fontSize: '3rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
      <div className="kpi-sub" style={{ color: accentColor }}>
        {subtext}
      </div>
    </div>
  );
};
