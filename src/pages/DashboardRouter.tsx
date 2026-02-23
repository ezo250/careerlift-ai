import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import AdminDashboard from '@/pages/dashboards/AdminDashboard';
import TeacherDashboard from '@/pages/dashboards/TeacherDashboard';
import StudentDashboard from '@/pages/dashboards/StudentDashboard';
import SettingsPage from '@/pages/dashboards/SettingsPage';
import SectionsPage from '@/pages/dashboards/admin/SectionsPage';
import TeachersPage from '@/pages/dashboards/admin/TeachersPage';
import JobsPage from '@/pages/dashboards/admin/JobsPage';
import GradesPage from '@/pages/dashboards/admin/GradesPage';
import ChecklistsPage from '@/pages/dashboards/admin/ChecklistsPage';
import StudentsPage from '@/pages/dashboards/admin/StudentsPage';
import TeacherStudentsPage from '@/pages/dashboards/teacher/StudentsPage';
import TeacherSubmissionsPage from '@/pages/dashboards/teacher/SubmissionsPage';
import TeacherAnalyticsPage from '@/pages/dashboards/teacher/AnalyticsPage';
import StudentJobsPage from '@/pages/dashboards/student/JobsPage';
import StudentSubmissionsPage from '@/pages/dashboards/student/SubmissionsPage';
import StudentGradesPage from '@/pages/dashboards/student/GradesPage';
import SelfEvaluationPage from '@/pages/dashboards/student/SelfEvaluationPage';

export default function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <Routes>
        {user.role === 'superadmin' && (
          <>
            <Route index element={<AdminDashboard />} />
            <Route path="sections" element={<SectionsPage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="grades" element={<GradesPage />} />
            <Route path="checklists" element={<ChecklistsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </>
        )}
        {user.role === 'teacher' && (
          <>
            <Route index element={<TeacherDashboard />} />
            <Route path="students" element={<TeacherStudentsPage />} />
            <Route path="submissions" element={<TeacherSubmissionsPage />} />
            <Route path="analytics" element={<TeacherAnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </>
        )}
        {user.role === 'student' && (
          <>
            <Route index element={<StudentDashboard />} />
            <Route path="jobs" element={<StudentJobsPage />} />
            <Route path="submissions" element={<StudentSubmissionsPage />} />
            <Route path="grades" element={<StudentGradesPage />} />
            <Route path="self-evaluation" element={<SelfEvaluationPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
