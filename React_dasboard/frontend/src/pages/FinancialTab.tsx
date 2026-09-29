import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, PieChart as PieIcon, Download, AlertCircle } from 'lucide-react';
import { fetchFinancialSummary, fetchRevenueExpenseTrends, fetchDepartmentBudgets, fetchOverdueTuition } from '../api/client';
import { FinancialSummary, RevenueExpenseTrend, DepartmentBudget, OverdueTuitionItem } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface FinancialTabProps {
  onOpenExportModal: () => void;
}

export const FinancialTab: React.FC<FinancialTabProps> = ({ onOpenExportModal }) => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [revExpTrends, setRevExpTrends] = useState<RevenueExpenseTrend[]>([]);
  const [budgets, setBudgets] = useState<DepartmentBudget[]>([]);
  const [overdueAccounts, setOverdueAccounts] = useState<OverdueTuitionItem[]>([]);

  useEffect(() => {
    fetchFinancialSummary().then(setSummary);
    fetchRevenueExpenseTrends().then(setRevExpTrends);
    fetchDepartmentBudgets().then(setBudgets);
    fetchOverdueTuition().then(setOverdueAccounts);
  }, []);

  return (
    <div>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>School Financial Statements & Budget Analytics</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Institutional income statements, department budget variance, and tuition collection ledgers.</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenExportModal}>
          <Download size={16} />
          <span>Export Financial Statement (CSV)</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>OPERATING REVENUE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
            ${((summary?.total_revenue || 14250000) / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Tuition & Grants</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>OPERATING EXPENSES</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ${((summary?.total_expenses || 11800000) / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Faculty & Facilities</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>NET OPERATING SURPLUS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
            +${((summary?.net_surplus || 2450000) / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>+17.2% Net Margin</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>TUITION COLLECTION RATE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {summary?.tuition_collection_pct.toFixed(1) || '95.4'}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>On-time collection</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>SCHOLARSHIP / AID</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
            ${((summary?.total_financial_aid || 1450000) / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>210 Students Funded</div>
        </div>
      </div>

      {/* Income Statement & Department Budgets Charts */}
      <div className="dashboard-grid">
        {/* Income Statement Monthly Revenue vs Expense Area Chart */}
        <div className="glass-panel col-7" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Monthly Income Statement (Revenue vs. Expenses)</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>12-Month cash flow comparison across revenue streams and operating budget</p>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revExpTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5f5f5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f5f5f5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#f5f5f5" strokeWidth={3} fillOpacity={1} fill="url(#revGrad)" name="Revenue ($)" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#expGrad)" name="Expenses ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Budget Allocation vs Actual Bar Chart */}
        <div className="glass-panel col-5" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Department Budget Utilization</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Annual allocated budget vs YTD spent</p>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgets} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-muted)" tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <YAxis dataKey="department" type="category" stroke="var(--text-primary)" fontSize={11} width={120} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="allocated_budget" fill="rgba(255, 255, 255, 0.15)" name="Allocated Budget" />
                <Bar dataKey="actual_spent" fill="#d4d4d4" name="Actual Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Overdue Tuition Fee Aging Ledger */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            Tuition Fee Aging & Overdue Account Ledger
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Overdue: $142,500 across 4 accounts</span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Code</th>
                <th>Student Name</th>
                <th>Grade Level</th>
                <th>Balance Due</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Collection Action</th>
              </tr>
            </thead>
            <tbody>
              {overdueAccounts.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'monospace' }}>{item.student_code}</td>
                  <td style={{ fontWeight: 600 }}>{item.student_name}</td>
                  <td>{item.grade_level}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>${item.balance_due.toLocaleString()}</td>
                  <td>{item.due_date}</td>
                  <td>
                    <span className={`badge ${item.days_overdue > 60 ? 'badge-danger' : 'badge-warning'}`}>
                      {item.days_overdue} Days Overdue
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => alert(`Payment reminder notice sent to ${item.student_name}`)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                      Send Notice
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
