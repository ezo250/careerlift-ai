import { motion } from 'framer-motion';
import { Users, FileText, BarChart3, TrendingUp, AlertTriangle, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_SUBMISSIONS, DEMO_JOBS, DEMO_USERS, DEMO_SECTIONS } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import SubmissionDetail from '@/components/SubmissionDetail';
import { StudentSubmission } from '@/types';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [selectedSub, setSelectedSub] = useState<StudentSubmission | null>(null);

  const assignedSections = DEMO_SECTIONS.filter(s => user?.assignedSections?.includes(s.id));
  const sectionStudents = DEMO_USERS.filter(u => u.role === 'student' && user?.assignedSections?.includes(u.sectionId || ''));
  const sectionJobs = DEMO_JOBS.filter(j => user?.assignedSections?.includes(j.sectionId));
  const sectionSubmissions = DEMO_SUBMISSIONS.filter(sub => {
    const student = DEMO_USERS.find(u => u.id === sub.studentId);
    return student && user?.assignedSections?.includes(student.sectionId || '');
  });

  const avgScore = sectionSubmissions.length
    ? Math.round(sectionSubmissions.reduce((a, s) => a + s.overallScore, 0) / sectionSubmissions.length)
    : 0;

  // Common weaknesses for this teacher's students
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
        {[
          { label: 'My Students', value: sectionStudents.length, icon: Users, color: 'bg-primary/10 text-primary' },
          { label: 'Submissions', value: sectionSubmissions.length, icon: FileText, color: 'bg-secondary/10 text-secondary' },
          { label: 'Active Jobs', value: sectionJobs.length, icon: BarChart3, color: 'bg-kepler-gold/10 text-kepler-gold' },
          { label: 'Avg. Score', value: `${avgScore}%`, icon: TrendingUp, color: 'bg-kepler-orange/10 text-kepler-orange' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
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
        {/* Weakness areas */}
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
          <div className="space-y-4">
            {avgWeaknesses.map((w, i) => (
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
          </div>
        </motion.div>

        {/* Students list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-elevated p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">My Students</h3>
          <div className="space-y-3">
            {sectionStudents.map(student => {
              const subs = DEMO_SUBMISSIONS.filter(s => s.studentId === student.id);
              const bestScore = subs.length ? Math.max(...subs.map(s => s.overallScore)) : 0;
              const section = DEMO_SECTIONS.find(s => s.id === student.sectionId);
              return (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
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
        <h3 className="font-display font-semibold text-foreground mb-4">All Submissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
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
                const job = DEMO_JOBS.find(j => j.id === sub.jobId);
                return (
                  <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">{sub.studentName}</td>
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
                    <td className="py-3 text-muted-foreground">{sub.submittedAt}</td>
                    <td className="py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSub(sub)}
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
        </div>
      </motion.div>
    </div>
  );
}
