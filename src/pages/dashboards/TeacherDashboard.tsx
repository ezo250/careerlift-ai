import { motion } from 'framer-motion';
import { Users, FileText, BarChart3, TrendingUp, AlertTriangle, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import SubmissionDetail from '@/components/SubmissionDetail';
import { StudentSubmission } from '@/types';
import { api } from '@/lib/api';

interface Section {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  sectionId: string;
}

interface Job {
  _id: string;
  title: string;
  sectionId: string;
}

interface Submission {
  _id: string;
  studentId: string;
  studentName: string;
  jobId: string;
  overallScore: number;
  submissionNumber: number;
  createdAt: string;
  grades: Array<{
    criterionName: string;
    percentage: number;
  }>;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [selectedSub, setSelectedSub] = useState<StudentSubmission | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sectionsData, usersData, submissionsData, jobsData] = await Promise.all([
          api.getSections(),
          api.getUsers(),
          api.getSubmissions(),
          api.getJobs()
        ]);

        setSections(sectionsData);
        setStudents(usersData.filter((u: any) => u.role === 'student'));
        setSubmissions(submissionsData);
        setJobs(jobsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Convert assigned section IDs to strings for comparison
  const assignedSectionIds = user?.assignedSections?.map((s: any) => s._id?.toString() || s.toString()) || [];

  const assignedSections = sections.filter(s => assignedSectionIds.includes(s._id?.toString() || s._id));
  const sectionStudents = students.filter(u => {
    const studentSectionId = u.sectionId?._id?.toString() || u.sectionId?.toString() || u.sectionId;
    return assignedSectionIds.some(id => id === studentSectionId);
  });
  const sectionJobs = jobs.filter(j => {
    const jobSectionId = j.sectionId?._id?.toString() || j.sectionId?.toString() || j.sectionId;
    return assignedSectionIds.some(id => id === jobSectionId);
  });
  // Server already filters submissions by teacher's sections, so use all submissions
  const sectionSubmissions = submissions;

  const totalSubmissions = sectionSubmissions.length;
  const avgScore = totalSubmissions
    ? Math.round(sectionSubmissions.reduce((a, s) => a + s.overallScore, 0) / totalSubmissions)
    : 0;

  const weaknesses: Record<string, number[]> = {};
  sectionSubmissions.forEach(sub => {
    sub.grades.forEach(g => {
      if (!weaknesses[g.criterionName]) weaknesses[g.criterionName] = [];
      weaknesses[g.criterionName].push(g.percentage);
    });
  });
  const avgWeaknesses = Object.entries(weaknesses)
    .map(([area, scores]) => ({ area, avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) }))
    .sort((a, b) => a.avg - b.avg);

  const aiRecommendations = avgWeaknesses.slice(0, 3).map(w => {
    if (w.avg < 60) return `Focus on ${w.area} - students averaging ${w.avg}%. Consider additional practice materials.`;
    if (w.avg < 75) return `${w.area} needs improvement (${w.avg}% avg). Review common mistakes with students.`;
    return `Monitor ${w.area} (${w.avg}% avg). Students performing adequately but can improve.`;
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-64 bg-muted animate-pulse rounded"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedSub) {
    return <SubmissionDetail submission={selectedSub} onBack={() => setSelectedSub(null)} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Teacher Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Assigned to: {assignedSections.map(s => s.name).join(', ')}
        </p>
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
          <div className="font-display text-2xl font-bold text-foreground">{sectionStudents.length}</div>
          <div className="text-xs text-muted-foreground mt-1">My Students</div>
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
          <div className="font-display text-2xl font-bold text-foreground">{totalSubmissions}</div>
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
          <div className="font-display text-2xl font-bold text-foreground">{avgScore}%</div>
          <div className="text-xs text-muted-foreground mt-1">Average Score</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-kepler-orange/10 text-kepler-orange flex items-center justify-center mb-3">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">{sectionJobs.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Active Jobs</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-elevated p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-kepler-orange" />
            <h3 className="font-display font-semibold text-foreground">Areas Needing Attention</h3>
          </div>
          {avgWeaknesses.length > 0 ? (
            <div className="space-y-4">
              {avgWeaknesses.slice(0, 5).map((w, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{w.area}</span>
                    <span className={`font-medium ${w.avg >= 80 ? 'text-secondary' : w.avg >= 60 ? 'text-kepler-gold' : 'text-destructive'}`}>
                      {w.avg}% avg
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${w.avg}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{
                        background: w.avg >= 80
                          ? 'hsl(147, 54%, 40%)'
                          : w.avg >= 60
                          ? 'hsl(40, 90%, 55%)'
                          : 'hsl(0, 72%, 51%)',
                      }}
                    />
                  </div>
                </div>
              ))}
              {aiRecommendations.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">AI Recommendations</h4>
                  <div className="space-y-2">
                    {aiRecommendations.map((rec, i) => (
                      <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet. Submissions will appear here.</p>
          )}
        </motion.div>

        {/* Students list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-elevated p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">My Students ({sectionStudents.length})</h3>
          <div className={`space-y-3 ${sectionStudents.length > 4 ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}>
            {sectionStudents.map(student => {
              const subs = sectionSubmissions.filter(s => (s.studentId?._id || s.studentId) === student._id);
              const bestScore = subs.length ? Math.max(...subs.map(s => s.overallScore)) : 0;
              const section = sections.find(s => s._id === student.sectionId);
              return (
                <div key={student._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{section?.name} • {subs.length} submission{subs.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {bestScore > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      bestScore >= 80 ? 'bg-secondary/10 text-secondary' :
                      bestScore >= 60 ? 'bg-kepler-gold/10 text-kepler-gold' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      Best: {bestScore}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Submissions table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card-elevated p-6"
      >
        <h3 className="font-display font-semibold text-foreground mb-4">All Submissions ({sectionSubmissions.length})</h3>
        <div className={`overflow-x-auto ${sectionSubmissions.length > 7 ? 'max-h-[600px] overflow-y-auto' : ''}`}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted-foreground">Student</th>
                <th className="pb-3 font-medium text-muted-foreground">Job</th>
                <th className="pb-3 font-medium text-muted-foreground">#</th>
                <th className="pb-3 font-medium text-muted-foreground">Score</th>
                <th className="pb-3 font-medium text-muted-foreground">Date</th>
                <th className="pb-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {sectionSubmissions.map(sub => {
                const job = jobs.find(j => j._id === (sub.jobId?._id || sub.jobId));
                const studentName = sub.studentId?.name || sub.studentName || 'Unknown';
                return (
                  <tr key={sub._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">{studentName}</td>
                    <td className="py-3 text-muted-foreground">{job?.title}</td>
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
                    <td className="py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSub(sub as any)}
                        className="text-primary hover:bg-primary/10"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sectionSubmissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No submissions yet
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
