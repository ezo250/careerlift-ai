import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import AdminDashboard from '@/pages/dashboards/AdminDashboard';
import TeacherDashboard from '@/pages/dashboards/TeacherDashboard';
import StudentDashboard from '@/pages/dashboards/StudentDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      {user.role === 'superadmin' && <AdminDashboard />}
      {user.role === 'teacher' && <TeacherDashboard />}
      {user.role === 'student' && <StudentDashboard />}
    </DashboardLayout>
  );
}
