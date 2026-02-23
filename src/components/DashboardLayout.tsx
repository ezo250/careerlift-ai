import { useState, ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, FileText, BarChart3, Settings,
  LogOut, Menu, X, ChevronRight, GraduationCap, UserCheck, ClipboardList, Bell, Search, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';


interface NavItem {
  label: string;
  icon: any;
  path: string;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Sections', icon: GraduationCap, path: '/dashboard/sections' },
  { label: 'Teachers', icon: UserCheck, path: '/dashboard/teachers' },
  { label: 'Students', icon: Users, path: '/dashboard/students' },
  { label: 'Job Submissions', icon: Briefcase, path: '/dashboard/jobs' },
  { label: 'Student Grades', icon: BarChart3, path: '/dashboard/grades' },
  { label: 'Checklists', icon: ClipboardList, path: '/dashboard/checklists' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

const teacherNav: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'My Students', icon: Users, path: '/dashboard/students' },
  { label: 'Submissions', icon: FileText, path: '/dashboard/submissions' },
  { label: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

const studentNav: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Job Opportunities', icon: Briefcase, path: '/dashboard/jobs' },
  { label: 'My Submissions', icon: FileText, path: '/dashboard/submissions' },
  { label: 'My Grades', icon: BarChart3, path: '/dashboard/grades' },
  { label: 'Self Evaluation', icon: Sparkles, path: '/dashboard/self-evaluation' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'teacher' || user?.role === 'superadmin') {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const submissions = await api.getSubmissions();
      const recent = submissions
        .filter((sub: any) => sub._id && sub.createdAt) // Filter out invalid submissions
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map((sub: any) => ({
          id: sub._id,
          message: `${sub.studentId?.name || 'A student'} submitted ${sub.jobId?.title || 'a job'} (Score: ${sub.overallScore}%)`,
          time: new Date(sub.createdAt).toLocaleString(),
          score: sub.overallScore
        }));
      setNotifications(recent);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]); // Set empty array on error
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const users = await api.getUsers();
      const filtered = users.filter((u: any) => {
        const matchesName = u.name.toLowerCase().includes(query.toLowerCase());
        const matchesEmail = u.email.toLowerCase().includes(query.toLowerCase());
        if (user?.role === 'superadmin') {
          return (u.role === 'student' || u.role === 'teacher') && (matchesName || matchesEmail);
        }
        return u.role === 'student' && (matchesName || matchesEmail);
      }).slice(0, 5);
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  if (!user) return null;

  const navItems = user.role === 'superadmin' ? adminNav : user.role === 'teacher' ? teacherNav : studentNav;
  const roleLabel = user.role === 'superadmin' ? 'Super Admin' : user.role === 'teacher' ? 'Teacher' : 'Student';
  const roleColor = user.role === 'superadmin' ? 'bg-[#0E4D72]' : user.role === 'teacher' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0E4D72] p-4 space-y-4">
      {/* Logo */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/20">
        <img src="/logo.jpg" alt="Kepler" className="h-10 drop-shadow-md" />
        <div>
          <div className="font-display font-bold text-white text-base">CareerLift</div>
          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleColor} text-white mt-0.5 shadow-sm`}>
            {roleLabel}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                ${active 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
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
      <div className="px-2 py-3 border-t border-white/20 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10">
          <div className={`w-10 h-10 rounded-full ${roleColor} flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-white/60 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg w-full text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium text-sm"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 bg-[#0E4D72] backdrop-blur-xl fixed inset-y-0 left-0 z-30 border-r border-white/20 shadow-xl">
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
              className="fixed inset-y-0 left-0 w-72 bg-[#0E4D72] z-50 lg:hidden shadow-2xl"
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
            {(user.role === 'teacher' || user.role === 'superadmin') && (
              <>
                <div className="relative">
                  <button 
                    onClick={() => setShowSearch(!showSearch)}
                    className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  {showSearch && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-border">
                        <input
                          type="text"
                          placeholder={user.role === 'superadmin' ? 'Search students or teachers...' : 'Search students...'}
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {searchResults.length > 0 ? (
                          searchResults.map(result => (
                            <div
                              key={result._id}
                              onClick={() => {
                                if (result.role === 'student') {
                                  navigate('/dashboard/students');
                                } else if (result.role === 'teacher') {
                                  navigate('/dashboard/teachers');
                                }
                                setShowSearch(false);
                                setSearchQuery('');
                                setSearchResults([]);
                              }}
                              className="p-4 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                                  {result.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">{result.name}</p>
                                  <p className="text-xs text-muted-foreground">{result.email}</p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full bg-kepler-gold/10 text-kepler-gold capitalize">
                                  {result.role}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : searchQuery.length >= 2 ? (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            No results found
                          </div>
                        ) : (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            Type to search...
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
                <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/50" />
                  )}
                </button>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-border">
                      <h3 className="font-semibold text-foreground">Recent Submissions</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div key={notif.id} className="p-4 border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <p className="text-sm text-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          No recent submissions
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
              </>
            )}
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
