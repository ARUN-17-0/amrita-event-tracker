import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { LoadingState } from '@/components/common/LoadingState';

// Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { DepartmentsPage } from '@/pages/departments/DepartmentsPage';
import { SemestersPage } from '@/pages/semesters/SemestersPage';
import { SectionsPage } from '@/pages/sections/SectionsPage';
import { SubjectsPage } from '@/pages/subjects/SubjectsPage';
import { FacultyPage } from '@/pages/faculty/FacultyPage';
import { StudentsPage } from '@/pages/students/StudentsPage';
import { BulkImportPage } from '@/pages/students/BulkImportPage';
import { CRsPage } from '@/pages/crs/CRsPage';
import { CalendarPage } from '@/pages/calendar/CalendarPage';
import { AuditLogsPage } from '@/pages/audit-logs/AuditLogsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingState message="Checking authentication..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-red-500 text-lg">
        Access Denied: You must be an administrator to view this page.
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <DepartmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/semesters"
            element={
              <ProtectedRoute>
                <SemestersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sections"
            element={
              <ProtectedRoute>
                <SectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <SubjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty"
            element={
              <ProtectedRoute>
                <FacultyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/import"
            element={
              <ProtectedRoute>
                <BulkImportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crs"
            element={
              <ProtectedRoute>
                <CRsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
