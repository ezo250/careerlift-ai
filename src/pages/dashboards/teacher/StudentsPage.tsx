import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, TrendingUp, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, submissionsData] = await Promise.all([
        api.request('/users'),
        api.getSubmissions()
      ]);
      const studentsList = usersData.filter((u: any) => 
        u.role === 'student' && user?.assignedSections?.includes(u.sectionId)
      );
      setStudents(studentsList);
      setSubmissions(submissionsData);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">My Students</h1>
          <p className="text-muted-foreground mt-1">Overview of all students in your sections</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">{students.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Students</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {submissions.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Total Submissions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-kepler-gold/10 text-kepler-gold flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {submissions.length ? Math.round(submissions.reduce((sum, s) => sum + s.overallScore, 0) / submissions.length) : 0}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">Average Score</div>
        </motion.div>
      </div>

      {/* Students List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card-elevated p-6"
      >
        <h3 className="font-display font-semibold text-foreground mb-4">All Students</h3>
        <div className="space-y-3">
          {students.map(student => {
            const studentSubs = submissions.filter(s => s.studentId?._id === student._id || s.studentId === student._id);
            const bestScore = studentSubs.length ? Math.max(...studentSubs.map(s => s.overallScore)) : 0;
            const avgScore = studentSubs.length ? Math.round(studentSubs.reduce((sum, s) => sum + s.overallScore, 0) / studentSubs.length) : 0;

            return (
              <div key={student._id} className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold shadow-md">
                      {student.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {studentSubs.length} submission{studentSubs.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {studentSubs.length > 0 && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          Best: <span className={`${
                            bestScore >= 80 ? 'text-secondary' :
                            bestScore >= 60 ? 'text-kepler-gold' :
                            'text-destructive'
                          }`}>{bestScore}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg: {avgScore}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Student's recent submissions */}
                {studentSubs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Recent Submissions</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {studentSubs.slice(-3).reverse().map(sub => (
                        <div key={sub._id} className="text-xs p-2 rounded bg-muted/50">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">#{sub.submissionNumber}</span>
                            <span className={`font-bold ${
                              sub.overallScore >= 80 ? 'text-secondary' :
                              sub.overallScore >= 60 ? 'text-kepler-gold' :
                              'text-destructive'
                            }`}>
                              {sub.overallScore}%
                            </span>
                          </div>
                          <div className="text-muted-foreground truncate mt-1">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {students.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No students found in your sections</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
