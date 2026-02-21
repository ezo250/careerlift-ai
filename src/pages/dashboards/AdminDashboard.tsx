import { motion } from 'framer-motion';
import {
  Users, GraduationCap, Briefcase, BarChart3, TrendingUp, AlertTriangle,
  Plus, Send, UserPlus, ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEMO_STATS, DEMO_SECTIONS, DEMO_SUBMISSIONS, DEMO_JOBS, DEMO_INVITES, DEMO_USERS } from '@/data/mockData';
import { useState } from 'react';

const statCards = [
  { label: 'Total Students', value: DEMO_STATS.totalStudents, icon: Users, color: 'bg-primary/10 text-primary' },
  { label: 'Teachers', value: DEMO_STATS.totalTeachers, icon: GraduationCap, color: 'bg-secondary/10 text-secondary' },
  { label: 'Sections', value: DEMO_STATS.totalSections, icon: ClipboardList, color: 'bg-kepler-gold/10 text-kepler-gold' },
  { label: 'Active Jobs', value: DEMO_STATS.totalJobs, icon: Briefcase, color: 'bg-kepler-orange/10 text-kepler-orange' },
  { label: 'Submissions', value: DEMO_STATS.totalSubmissions, icon: BarChart3, color: 'bg-primary/10 text-primary' },
  { label: 'Avg. Score', value: `${DEMO_STATS.averageScore}%`, icon: TrendingUp, color: 'bg-secondary/10 text-secondary' },
];

export default function AdminDashboard() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your CareerLift platform</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowInvite(!showInvite)}
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Invite Teacher
          </Button>
        </div>
      </div>

      {/* Invite Teacher */}
      {showInvite && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card-elevated p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-3">Invite a Teacher</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enter the teacher's email. They'll receive an invite code to create their account.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="kepler-input flex-1"
              placeholder="teacher@kepler.edu"
            />
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="w-4 h-4 mr-2" /> Send Invite
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Recent Invites</p>
            <div className="space-y-2">
              {DEMO_INVITES.map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 text-sm">
                  <span className="text-foreground">{inv.email}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    inv.status === 'accepted' ? 'bg-secondary/10 text-secondary' : 'bg-kepler-gold/10 text-kepler-gold'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
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
        {/* Common Weaknesses */}
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
            {DEMO_STATS.commonWeaknesses.map((w, i) => (
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

        {/* Sections Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-elevated p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">Sections</h3>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              <Plus className="w-4 h-4 mr-1" /> New
            </Button>
          </div>
          <div className="space-y-3">
            {DEMO_SECTIONS.map(sec => {
              const teachers = DEMO_USERS.filter(u => u.role === 'teacher' && u.assignedSections?.includes(sec.id));
              return (
                <div key={sec.id} className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-semibold text-foreground">{sec.name}</span>
                    <span className="text-xs text-muted-foreground">{sec.studentCount} students</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{sec.description}</p>
                  <div className="flex gap-2 mt-2">
                    {teachers.map(t => (
                      <span key={t.id} className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
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
        <h3 className="font-display font-semibold text-foreground mb-4">Recent Submissions</h3>
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
              {DEMO_SUBMISSIONS.slice(0, 5).map(sub => {
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
