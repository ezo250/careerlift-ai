import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Upload, Clock, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { gradeDocument, extractTextFromFile } from '@/lib/puterAI';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsData, submissionsData, checklistsData] = await Promise.all([
        api.getJobs(),
        api.getSubmissions(),
        api.getChecklists()
      ]);
      setJobs(jobsData.filter((j: any) => (j.sectionId?._id || j.sectionId) === user?.sectionId));
      setSubmissions(submissionsData);
      setChecklists(checklistsData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!coverLetter || !resume || !showSubmitModal) {
      toast.error('Please upload both cover letter and resume');
      return;
    }

    setSubmitting(true);
    try {
      const job = jobs.find(j => j._id === showSubmitModal);
      if (!job) throw new Error('Job not found');

      const checklist = checklists.find(c => c._id === (job.checklistId?._id || job.checklistId));
      if (!checklist) throw new Error('Checklist not found');

      toast.info('Extracting text from documents...');
      const [coverLetterText, resumeText] = await Promise.all([
        extractTextFromFile(coverLetter),
        extractTextFromFile(resume)
      ]);

      const combinedText = `COVER LETTER:\n${coverLetterText}\n\nRESUME:\n${resumeText}`;

      const submission = await api.createSubmission({
        jobId: job._id,
        coverLetterName: coverLetter.name,
        resumeName: resume.name,
        coverLetterUrl: 'pending',
        resumeUrl: 'pending'
      });

      toast.info('AI is grading your documents... This may take a moment.');
      const gradeResult = await gradeDocument(combinedText, checklist, job.description);

      await api.updateSubmissionGrade(submission._id, gradeResult);

      toast.success(`Submission graded! Your score: ${gradeResult.overallScore}%`);
      setShowSubmitModal(null);
      setCoverLetter(null);
      setResume(null);
      loadData();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit documents');
    } finally {
      setSubmitting(false);
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
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Job Opportunities</h1>
        <p className="text-muted-foreground mt-1">Browse and apply to available positions</p>
      </div>

      {/* Jobs Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map(job => {
          const jobSubs = submissions.filter(s => (s.jobId?._id || s.jobId) === job._id);
          const remaining = job.maxSubmissions - jobSubs.length;
          const latestSub = jobSubs[jobSubs.length - 1];

          return (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-elevated p-6 hover:scale-[1.01] transition-all duration-300"
            >
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
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Due: {new Date(job.deadline).toLocaleDateString()}
                </span>
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
                </div>
              )}

              <div className="flex gap-2">
                {remaining > 0 ? (
                  <Button
                    onClick={() => setShowSubmitModal(job._id)}
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
            </motion.div>
          );
        })}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No job opportunities available yet for your section.</p>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
          onClick={() => !submitting && setShowSubmitModal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-xl p-6 max-w-md w-full border border-border shadow-lg"
          >
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Submit Documents for AI Grading</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload your cover letter and resume. Our AI will analyze them against the job description and checklist criteria, providing detailed feedback.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cover Letter (PDF/TXT)</label>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={e => setCoverLetter(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                  disabled={submitting}
                />
                {coverLetter && <p className="text-xs text-secondary mt-1">✓ {coverLetter.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Resume (PDF/TXT)</label>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={e => setResume(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                  disabled={submitting}
                />
                {resume && <p className="text-xs text-secondary mt-1">✓ {resume.name}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setShowSubmitModal(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSubmit}
                disabled={submitting || !coverLetter || !resume}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" /> Submit for AI Grading</>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
