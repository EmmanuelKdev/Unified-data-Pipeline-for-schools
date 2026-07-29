import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StudentDetailModal } from './components/StudentDetailModal';
import { ExportReportModal } from './components/ExportReportModal';
import { LoginPage } from './pages/LoginPage';
import { OverviewTab } from './pages/OverviewTab';
import { AcademicTab } from './pages/AcademicTab';
import { AttendanceTab } from './pages/AttendanceTab';
import { FinancialTab } from './pages/FinancialTab';
import { CourseEnjoymentTab } from './pages/CourseEnjoymentTab';
import { StudentDirectoryTab } from './pages/StudentDirectoryTab';
import { User, StudentDetail } from './types';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [token, setToken] = useState<string | null>(localStorage.getItem('aura_token') || "demo-token-123");
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 1,
    email: 'admin@school.edu',
    full_name: 'Dr. Eleanor Vance',
    role: 'Admin'
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTerm, setSelectedTerm] = useState('Fall 2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLoginSuccess = (newToken: string, user: User) => {
    setToken(newToken);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_token');
    setToken(null);
    setCurrentUser(null);
  };

  if (!token || !currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Sticky Header */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          selectedTerm={selectedTerm}
          setSelectedTerm={setSelectedTerm}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Page Content View */}
        <main className="page-body">
          {activeTab === 'overview' && (
            <OverviewTab
              onSelectStudent={setSelectedStudent}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'academics' && (
            <AcademicTab
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceTab
              onSelectStudent={setSelectedStudent}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {activeTab === 'finance' && (
            <FinancialTab
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {activeTab === 'courses' && (
            <CourseEnjoymentTab
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {activeTab === 'directory' && (
            <StudentDirectoryTab
              onSelectStudent={setSelectedStudent}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              searchQuery={searchQuery}
            />
          )}
        </main>
      </div>

      {/* Student Profile Inspection Modal */}
      <StudentDetailModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

export default App;
