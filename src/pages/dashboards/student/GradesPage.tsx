import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import SubmissionDetail from '@/components/SubmissionDetail';

export default function GradesPage() {
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

  // Calculate grade breakdown
  const weaknesses: Record<string, number[]> = {};
  const strengths: Record<string, number[]> = {};
  
  submissions.forEach(sub => {
    sub.grades?.forEach((g: any) => {
      if (g.percentage < 70) {
        if (!weaknesses[g.criterionName]) weaknesses[g.criterionName] = [];
        weaknesses[g.criterionName].push(g.percentage);
      } else if (g.percentage >= 80) {
        if (!strengths[g.criterionName]) strengths[g.criterionName] = [];
        strengths[g.criterionName].push(g.percentage);
      }
    });
  });

  const avgWeaknesses = Object.entries(weaknesses)
    .map(([area, scores]) => ({
      area,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length
    }))
    .sort((a, b) => a.avg - b.avg);

  const avgStrengths = Object.entries(strengths)
    .map(([area, scores]) => ({
      area,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length
    }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">My Grades & Performance</h1>
        <p className="text-muted-foreground mt-1">Detailed analysis of your submission scores</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {avgScore ? `${avgScore}%` : '—'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Average Score</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
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
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {submissions.filter(s => s.overallScore >= 80).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Excellent Grades</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {submissions.filter(s => s.overallScore < 60).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Need Improvement</div>
        </motion.div>
      </div>

      {submissions.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Strengths */}
          {avgStrengths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card-elevated p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <h3 className="font-display font-semibold text-foreground">Your Strengths</h3>
              </div>
              <div className="space-y-4">
                {avgStrengths.slice(0, 5).map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">{s.area}</span>
                      <span className="font-medium text-secondary">{s.avg}% avg</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.avg}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full bg-secondary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Areas for Improvement */}
          {avgWeaknesses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-elevated p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-kepler-orange" />
                <h3 className="font-display font-semibold text-foreground">Areas for Improvement</h3>
              </div>
              <div className="space-y-4">
                {avgWeaknesses.slice(0, 5).map((w, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">{w.area}</span>
                      <span className={`font-medium ${
                        w.avg >= 60 ? 'text-kepler-gold' : 'text-destructive'
                      }`}>
                        {w.avg}% avg
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${w.avg}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{
                          background: w.avg >= 60 ? 'hsl(40, 90%, 55%)' : 'hsl(0, 72%, 51%)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* All Grades Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card-elevated p-6"
      >
        <h3 className="font-display font-semibold text-foreground mb-4">All Grades</h3>
        {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Job</th>
                  <th className="pb-3 font-medium text-muted-foreground">#</th>
                  <th className="pb-3 font-medium text-muted-foreground">Score</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => {
                  const job = jobs.find(j => j._id === (sub.jobId?._id || sub.jobId));
                  return (
                    <tr key={sub._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-medium text-foreground">{job?.title || 'N/A'}</td>
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
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No grades yet. Submit your first application to get started!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
