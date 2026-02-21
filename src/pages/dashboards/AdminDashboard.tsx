import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, Briefcase, BarChart3, TrendingUp, AlertTriangle,
  Plus, Send, UserPlus, ClipboardList, Eye, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, sectionsData, submissionsData, jobsData] = await Promise.all([
        api.getStats(),
        api.getSections(),
        api.getSubmissions(),
        api.getJobs()
      ]);
      setStats(statsData);
      setSections(sectionsData);
      setSubmissions(submissionsData);
      setJobs(jobsData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'bg-primary/10 text-primary', link: '/dashboard/grades' },
    { label: 'Teachers', value: stats?.totalTeachers || 0, icon: GraduationCap, color: 'bg-secondary/10 text-secondary', link: '/dashboard/teachers' },
    { label: 'Sections', value: stats?.totalSections || 0, icon: ClipboardList, color: 'bg-kepler-gold/10 text-kepler-gold', link: '/dashboard/sections' },
    { label: 'Active Jobs', value: stats?.totalJobs || 0, icon: Briefcase, color: 'bg-kepler-orange/10 text-kepler-orange', link: '/dashboard/jobs' },
    { label: 'Submissions', value: stats?.totalSubmissions || 0, icon: BarChart3, color: 'bg-primary/10 text-primary', link: '/dashboard/grades' },
    { label: 'Avg. Score', value: `${stats?.averageScore || 0}%`, icon: TrendingUp, color: 'bg-secondary/10 text-secondary', link: '/dashboard/grades' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your CareerLift platform</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/dashboard/teachers')}
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Manage Teachers
          </Button>
          <Button
            onClick={() => navigate('/dashboard/jobs')}
            className="bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Job
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="stat-card cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => navigate(s.link)}
          >
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="font-display text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Common Weaknesses */}
        {stats?.commonWeaknesses && stats.commonWeaknesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card-elevated p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-kepler-orange" />
              <h3 className="font-display font-semibold text-foreground">AI Flagged: Common Weaknesses</h3>
            </div>
            <div className="space-y-4">
              {stats.commonWeaknesses.slice(0, 5).map((w: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{w.area}</span>
                    <span className="text-muted-foreground">{w.percentage}% of students</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${w.percentage}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, hsl(202, 78%, 25%), hsl(${w.percentage > 25 ? '0, 72%, 51%' : '147, 54%, 40%'}))` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sections Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-elevated p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">Sections Overview</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10"
              onClick={() => navigate('/dashboard/sections')}
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {sections.slice(0, 5).map(sec => {
              return (
                <div key={sec._id} className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => navigate('/dashboard/sections')}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-semibold text-foreground">{sec.name}</span>
                    <span className="text-xs text-muted-foreground">{sec.studentCount} students</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{sec.description}</p>
                  <div className="flex gap-2 mt-2">
                    {sec.assignedTeachers?.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                        {sec.assignedTeachers.length} teacher(s)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {sections.length === 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">
                No sections yet. <button onClick={() => navigate('/dashboard/sections')} className="text-primary hover:underline">Create one</button>
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Submissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card-elevated p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Recent Submissions</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-primary/10"
            onClick={() => navigate('/dashboard/grades')}
          >
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted-foreground">Student</th>
                <th className="pb-3 font-medium text-muted-foreground">Job</th>
                <th className="pb-3 font-medium text-muted-foreground">Submission #</th>
                <th className="pb-3 font-medium text-muted-foreground">Score</th>
                <th className="pb-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {submissions.slice(0, 5).map(sub => {
                const job = jobs.find(j => j._id === (sub.jobId?._id || sub.jobId));
                const studentName = sub.studentId?.name || 'Unknown';
                
                return (
                  <tr key={sub._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">{studentName}</td>
                    <td className="py-3 text-muted-foreground">{job?.title || 'N/A'}</td>
                    <td className="py-3 text-muted-foreground">#{sub.submissionNumber}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.overallScore >= 80 ? 'bg-secondary/10 text-secondary' :
                        sub.overallScore >= 60 ? 'bg-kepler-gold/10 text-kepler-gold' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {sub.overallScore}%
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {submissions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No submissions yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
