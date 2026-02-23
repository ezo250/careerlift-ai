import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, TrendingDown, TrendingUp, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import SubmissionDetail from '@/components/SubmissionDetail';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>('all');
  const [customLimit, setCustomLimit] = useState<string>('10');
  const [selectedJob, setSelectedJob] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [submissionsData, jobsData] = await Promise.all([
        api.getSubmissions(),
        api.getJobs()
      ]);
      
      // Note: Server already filters submissions for teachers by their assigned sections
      // The /api/submissions endpoint handles role-based filtering
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

  const avgScore = submissions.length
    ? Math.round(submissions.reduce((sum, s) => sum + s.overallScore, 0) / submissions.length)
    : 0;

  const filteredByJob = selectedJob === 'all' 
    ? submissions 
    : submissions.filter(s => (s.jobId?._id || s.jobId) === selectedJob);

  const sortedSubmissions = [...filteredByJob].sort((a, b) => b.overallScore - a.overallScore);
  const displayedSubmissions = sortBy === 'all' 
    ? filteredByJob 
    : sortBy === 'custom'
    ? sortedSubmissions.slice(0, parseInt(customLimit) || 10)
    : sortedSubmissions.slice(0, parseInt(sortBy));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">All Submissions</h1>
        <p className="text-muted-foreground mt-1">View and review student submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">{avgScore}%</div>
          <div className="text-xs text-muted-foreground mt-1">Average Score</div>
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
          <div className="text-xs text-muted-foreground mt-1">Excellent (80%+)</div>
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
          <div className="text-xs text-muted-foreground mt-1">Need Help (&lt;60%)</div>
        </motion.div>
      </div>

      {/* Submissions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card-elevated p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">All Submissions</h3>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger className="w-48 h-9 rounded-xl">
                <SelectValue placeholder="Filter by job..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map(job => (
                  <SelectItem key={job._id} value={job._id}>{job.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-9 rounded-xl">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="5">Top 5</SelectItem>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {sortBy === 'custom' && (
              <input
                type="number"
                min="1"
                value={customLimit}
                onChange={e => setCustomLimit(e.target.value)}
                className="w-20 h-9 px-3 rounded-xl border border-border bg-background text-sm"
                placeholder="#"
              />
            )}
          </div>
        </div>
        <div className={`overflow-x-auto ${displayedSubmissions.length > 10 ? 'max-h-[600px] overflow-y-auto' : ''}`}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted-foreground">Rank</th>
                <th className="pb-3 font-medium text-muted-foreground">Student</th>
                <th className="pb-3 font-medium text-muted-foreground">Job</th>
                <th className="pb-3 font-medium text-muted-foreground">#</th>
                <th className="pb-3 font-medium text-muted-foreground">Score</th>
                <th className="pb-3 font-medium text-muted-foreground">Date</th>
                <th className="pb-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedSubmissions.map((sub, idx) => {
                const job = jobs.find(j => j._id === (sub.jobId?._id || sub.jobId));
                const studentName = sub.studentId?.name || 'Unknown';
                
                return (
                  <tr key={sub._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 text-muted-foreground">
                      {sortBy !== 'all' && (
                        <span className="font-semibold text-foreground">#{idx + 1}</span>
                      )}
                    </td>
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
          {displayedSubmissions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No submissions yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
