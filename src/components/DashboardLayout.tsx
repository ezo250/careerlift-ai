import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, FileText, BarChart3, Settings,
  LogOut, Menu, X, ChevronRight, GraduationCap, UserCheck, ClipboardList, Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import keplerLogo from '@/assets/kepler-logo.png';

interface NavItem {
  label: string;
  icon: any;
  path: string;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Sections', icon: GraduationCap, path: '/dashboard/sections' },
  { label: 'Teachers', icon: UserCheck, path: '/dashboard/teachers' },
  { label: 'Job Submissions', icon: Briefcase, path: '/dashboard/jobs' },
  { label: 'Student Grades', icon: BarChart3, path: '/dashboard/grades' },
  { label: 'Checklists', icon: ClipboardList, path: '/dashboard/checklists' },
];

const teacherNav: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'My Students', icon: Users, path: '/dashboard/students' },
  { label: 'Submissions', icon: FileText, path: '/dashboard/submissions' },
  { label: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
];

const studentNav: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Job Opportunities', icon: Briefcase, path: '/dashboard/jobs' },
  { label: 'My Submissions', icon: FileText, path: '/dashboard/submissions' },
  { label: 'My Grades', icon: BarChart3, path: '/dashboard/grades' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const navItems = user.role === 'superadmin' ? adminNav : user.role === 'teacher' ? teacherNav : studentNav;
  const roleLabel = user.role === 'superadmin' ? 'Super Admin' : user.role === 'teacher' ? 'Teacher' : 'Student';
  const roleColor = user.role === 'superadmin' ? 'bg-kepler-gold' : user.role === 'teacher' ? 'bg-kepler-green' : 'bg-primary';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <img src={keplerLogo} alt="Kepler" className="h-9 brightness-0 invert" />
        <div>
          <div className="font-display font-bold text-sidebar-foreground text-sm">CareerLift</div>
          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${roleColor} text-primary-foreground mt-0.5`}>
            {roleLabel}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={active ? 'sidebar-item-active' : 'sidebar-item-inactive'}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground font-semibold text-sm">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-item-inactive w-full text-sidebar-foreground/60 hover:text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-sidebar fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/80 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-64 bg-sidebar z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-muted-foreground hover:text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-kepler-green rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
