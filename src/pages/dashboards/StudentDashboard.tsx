import { motion } from 'framer-motion';
import { Briefcase, FileText, BarChart3, Upload, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_SUBMISSIONS, DEMO_JOBS, DEMO_SECTIONS } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import SubmissionDetail from '@/components/SubmissionDetail';
import { StudentSubmission } from '@/types';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [selectedSub, setSelectedSub] = useState<StudentSubmission | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<string | null>(null);

  const mySection = DEMO_SECTIONS.find(s => s.id === user?.sectionId);
  const availableJobs = DEMO_JOBS.filter(j => j.sectionId === user?.sectionId);
  const mySubmissions = DEMO_SUBMISSIONS.filter(s => s.studentId === user?.id);

  const bestScore = mySubmissions.length ? Math.max(...mySubmissions.map(s => s.overallScore)) : 0;
  const latestScore = mySubmissions.length ? mySubmissions[mySubmissions.length - 1].overallScore : 0;

  if (selectedSub) {
    return <SubmissionDetail submission={selectedSub} onBack={() => setSelectedSub(null)} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Section: {mySection?.name} — {mySection?.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available Jobs', value: availableJobs.length, icon: Briefcase, color: 'bg-primary/10 text-primary' },
          { label: 'My Submissions', value: mySubmissions.length, icon: FileText, color: 'bg-secondary/10 text-secondary' },
          { label: 'Best Score', value: bestScore ? `${bestScore}%` : '—', icon: BarChart3, color: 'bg-kepler-gold/10 text-kepler-gold' },
          { label: 'Latest Score', value: latestScore ? `${latestScore}%` : '—', icon: CheckCircle2, color: 'bg-kepler-orange/10 text-kepler-orange' },
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

      {/* Job Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Job Opportunities</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {availableJobs.map(job => {
            const jobSubs = mySubmissions.filter(s => s.jobId === job.id);
            const remaining = job.maxSubmissions - jobSubs.length;
            const latestSub = jobSubs[jobSubs.length - 1];

            return (
              <div key={job.id} className="glass-card-elevated p-6 hover:scale-[1.01] transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    job.status === 'active' ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {job.deadline}</span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {remaining}/{job.maxSubmissions} left
                  </span>
                </div>

                {latestSub && (
                  <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">Latest: Submission #{latestSub.submissionNumber}</span>
                      <span className={`text-xs font-bold ${
                        latestSub.overallScore >= 80 ? 'text-secondary' : latestSub.overallScore >= 60 ? 'text-kepler-gold' : 'text-destructive'
                      }`}>
                        {latestSub.overallScore}%
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSub(latestSub)}
                      className="text-primary hover:bg-primary/10 px-0 h-auto text-xs"
                    >
                      View detailed feedback →
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  {remaining > 0 ? (
                    <Button
                      onClick={() => setShowSubmitModal(job.id)}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" /> Submit Documents
                    </Button>
                  ) : (
                    <div className="flex-1 text-center text-xs text-muted-foreground py-2">
                      <AlertCircle className="w-4 h-4 inline mr-1" /> No submissions remaining
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Submit modal */}
      {showSubmitModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
          onClick={() => setShowSubmitModal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-xl p-6 max-w-md w-full border border-border shadow-lg"
          >
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Submit Documents</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload your cover letter and resume for AI grading. The AI will analyze your documents against the job description and checklist criteria.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cover Letter (PDF)</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click or drag to upload</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Resume (PDF)</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click or drag to upload</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 border-border" onClick={() => setShowSubmitModal(null)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowSubmitModal(null)}>
                Submit for AI Grading
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Submissions History */}
      {mySubmissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-elevated p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">My Submission History</h3>
          <div className="space-y-3">
            {mySubmissions.map(sub => {
              const job = DEMO_JOBS.find(j => j.id === sub.jobId);
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedSub(sub)}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{job?.title} — Submission #{sub.submissionNumber}</p>
                    <p className="text-xs text-muted-foreground">{sub.submittedAt}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    sub.overallScore >= 80 ? 'bg-secondary/10 text-secondary' :
                    sub.overallScore >= 60 ? 'bg-kepler-gold/10 text-kepler-gold' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {sub.overallScore}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
