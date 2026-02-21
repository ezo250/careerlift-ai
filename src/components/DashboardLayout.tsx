import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, FileText, BarChart3, Settings,
  LogOut, Menu, X, ChevronRight, GraduationCap, UserCheck, ClipboardList, Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const roleColor = user.role === 'superadmin' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : user.role === 'teacher' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-200 dark:border-slate-800">
        <img src="/kepler-logo.png" alt="Kepler" className="h-10 drop-shadow-md" />
        <div>
          <div className="font-display font-bold text-foreground text-base">CareerLift</div>
          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleColor} text-white mt-0.5 shadow-sm`}>
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
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${active 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-slate-100 dark:bg-slate-800">
          <div className={`w-10 h-10 rounded-full ${roleColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl fixed inset-y-0 left-0 z-30 border-r border-slate-200 dark:border-slate-800 shadow-xl">
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
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-4 lg:px-8 shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="lg:hidden mr-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/50" />
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
