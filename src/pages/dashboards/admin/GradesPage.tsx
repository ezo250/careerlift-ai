import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Filter, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import SubmissionDetail from '@/components/SubmissionDetail';

export default function GradesPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [deleteSubmission, setDeleteSubmission] = useState<any>(null);
  // use special token for "all" to avoid empty-string SelectItem values
  const ALL_TOKEN = '__all__';
  const [filterSection, setFilterSection] = useState(ALL_TOKEN);
  const [filterJob, setFilterJob] = useState(ALL_TOKEN);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [submissionsData, jobsData, sectionsData] = await Promise.all([
        api.getSubmissions(),
        api.getJobs(),
        api.getSections()
      ]);
      setSubmissions(submissionsData);
      setJobs(jobsData);
      setSections(sectionsData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteSubmission(deleteSubmission._id);
      toast.success('Submission deleted successfully');
      setDeleteSubmission(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (selectedSub) {
    return <SubmissionDetail submission={selectedSub} onBack={() => setSelectedSub(null)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredSubmissions = submissions.filter(sub => {
    if (filterSection && filterSection !== ALL_TOKEN) {
      const job = jobs.find(j => j._id === (sub.jobId?._id || sub.jobId));
      if (!job || (job.sectionId?._id || job.sectionId) !== filterSection) return false;
    }
    if (filterJob && filterJob !== ALL_TOKEN && (sub.jobId?._id || sub.jobId) !== filterJob) return false;
    return true;
  });

  const stats = {
    total: filteredSubmissions.length,
    avgScore: filteredSubmissions.length
      ? Math.round(filteredSubmissions.reduce((sum, s) => sum + s.overallScore, 0) / filteredSubmissions.length)
      : 0,
    excellent: filteredSubmissions.filter(s => s.overallScore >= 80).length,
    good: filteredSubmissions.filter(s => s.overallScore >= 60 && s.overallScore < 80).length,
    needsWork: filteredSubmissions.filter(s => s.overallScore < 60).length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Student Grades & Submissions</h1>
        <p className="text-muted-foreground mt-1">View and analyze all student submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Submissions', value: stats.total, color: 'bg-primary/10 text-primary' },
          { label: 'Avg. Score', value: `${stats.avgScore}%`, color: 'bg-secondary/10 text-secondary' },
          { label: 'Excellent (≥80%)', value: stats.excellent, color: 'bg-secondary/10 text-secondary' },
          { label: 'Good (60-79%)', value: stats.good, color: 'bg-kepler-gold/10 text-kepler-gold' },
          { label: 'Needs Work (<60%)', value: stats.needsWork, color: 'bg-destructive/10 text-destructive' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-2 text-lg font-bold`}>
              {typeof stat.value === 'number' && stat.value}
            </div>
            <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card-elevated p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-64 h-10 rounded-xl">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value={ALL_TOKEN} className="cursor-pointer hover:bg-primary/10">All Sections</SelectItem>
              {sections.map(s => (
                <SelectItem key={s._id} value={s._id} className="cursor-pointer hover:bg-primary/10">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterJob} onValueChange={setFilterJob}>
            <SelectTrigger className="w-64 h-10 rounded-xl">
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value={ALL_TOKEN} className="cursor-pointer hover:bg-primary/10">All Jobs</SelectItem>
              {jobs.map(j => (
                <SelectItem key={j._id} value={j._id} className="cursor-pointer hover:bg-primary/10">
                  {j.title} - {j.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(filterSection !== ALL_TOKEN || filterJob !== ALL_TOKEN) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setFilterSection(ALL_TOKEN);
                setFilterJob(ALL_TOKEN);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Submissions table */}
      <div className="glass-card-elevated p-6">
        <div className={`overflow-x-auto ${filteredSubmissions.length > 7 ? 'max-h-[600px] overflow-y-auto' : ''}`}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted-foreground">Student</th>
                <th className="pb-3 font-medium text-muted-foreground">Job</th>
                <th className="pb-3 font-medium text-muted-foreground">Section</th>
                <th className="pb-3 font-medium text-muted-foreground">#</th>
                <th className="pb-3 font-medium text-muted-foreground">Score</th>
                <th className="pb-3 font-medium text-muted-foreground">Date</th>
                <th className="pb-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map(sub => {
                const job = jobs.find(j => j._id === (sub.jobId?._id || sub.jobId));
                const section = sections.find(s => s._id === (job?.sectionId?._id || job?.sectionId));
                const studentName = sub.studentId?.name || 'Unknown';

                return (
                  <tr key={sub._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium text-foreground">{studentName}</td>
                    <td className="py-3 text-muted-foreground">{job?.title || 'N/A'}</td>
                    <td className="py-3 text-muted-foreground">{section?.name || 'N/A'}</td>
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
                    <td className="py-3 text-muted-foreground">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSub(sub)}
                          className="text-primary hover:bg-primary/10"
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        <button
                          onClick={() => setDeleteSubmission(sub)}
                          className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No submissions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteSubmission && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
          onClick={() => setDeleteSubmission(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-xl p-6 max-w-md w-full border border-destructive shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-destructive">Delete Submission</h3>
              <button onClick={() => setDeleteSubmission(null)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-foreground mb-2">Are you sure you want to delete this submission?</p>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="font-semibold text-foreground">{deleteSubmission.studentId?.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">Submission #{deleteSubmission.submissionNumber}</p>
                <p className="text-sm text-muted-foreground">Score: {deleteSubmission.overallScore}%</p>
              </div>
              <p className="text-sm text-destructive mt-3">This action cannot be undone. Teachers will no longer see this submission.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteSubmission(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleDelete} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Submission
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
