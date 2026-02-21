import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import SubmissionDetail from '@/components/SubmissionDetail';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [submissionsData, jobsData] = await Promise.all([
        api.getSubmissions(),
        api.getJobs()
      ]);
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

  if (selectedSub) {
    return <SubmissionDetail submission={selectedSub} onBack={() => setSelectedSub(null)} />;
  }

  const bestScore = submissions.length ? Math.max(...submissions.map(s => s.overallScore)) : 0;
  const avgScore = submissions.length
    ? Math.round(submissions.reduce((sum, s) => sum + s.overallScore, 0) / submissions.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">My Submissions</h1>
        <p className="text-muted-foreground mt-1">Track your application submissions and scores</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">{submissions.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Submissions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-3">
            <Eye className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {bestScore ? `${bestScore}%` : '—'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Best Score</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-kepler-gold/10 text-kepler-gold flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {avgScore ? `${avgScore}%` : '—'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Average Score</div>
        </motion.div>
      </div>

      {/* Submissions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card-elevated p-6"
      >
        <h3 className="font-display font-semibold text-foreground mb-4">All Submissions</h3>
        {submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map(sub => {
              const job = jobs.find(j => j._id === (sub.jobId?._id || sub.jobId));
              return (
                <div
                  key={sub._id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedSub(sub)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-medium text-foreground">
                        {job?.title || 'Job'} — Submission #{sub.submissionNumber}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        sub.overallScore >= 80 ? 'bg-secondary/10 text-secondary' :
                        sub.overallScore >= 60 ? 'bg-kepler-gold/10 text-kepler-gold' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {sub.overallScore}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Eye className="w-5 h-5 text-primary" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No submissions yet. Start applying to jobs!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
