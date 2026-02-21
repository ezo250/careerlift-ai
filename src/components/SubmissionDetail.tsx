import { motion } from 'framer-motion';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudentSubmission } from '@/types';
import { DEMO_JOBS } from '@/data/mockData';

interface Props {
  submission: StudentSubmission;
  onBack: () => void;
}

export default function SubmissionDetail({ submission, onBack }: Props) {
  const job = DEMO_JOBS.find(j => j.id === submission.jobId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {submission.studentName} — Submission #{submission.submissionNumber}
          </h1>
          <p className="text-muted-foreground">
            {job?.title} at {job?.company} • Submitted {submission.submittedAt}
          </p>
        </div>
        <div className={`text-center px-6 py-3 rounded-xl font-display text-3xl font-bold ${
          submission.overallScore >= 80 ? 'bg-secondary/10 text-secondary' :
          submission.overallScore >= 60 ? 'bg-kepler-gold/10 text-kepler-gold' :
          'bg-destructive/10 text-destructive'
        }`}>
          {submission.overallScore}%
        </div>
      </div>

      {/* AI Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-kepler-gold" />
          <h3 className="font-display font-semibold text-foreground">AI Summary</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed">{submission.aiFeedback}</p>
      </motion.div>

      {/* Files */}
      <div className="flex gap-4">
        <div className="glass-card p-4 flex items-center gap-3 flex-1">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">{submission.coverLetterName}</p>
            <p className="text-xs text-muted-foreground">Cover Letter</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3 flex-1">
          <FileText className="w-5 h-5 text-secondary" />
          <div>
            <p className="text-sm font-medium text-foreground">{submission.resumeName}</p>
            <p className="text-xs text-muted-foreground">Resume</p>
          </div>
        </div>
      </div>

      {/* Detailed Grades */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">Detailed Breakdown</h3>
        {submission.grades.map((grade, i) => (
          <motion.div
            key={grade.criterionId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="glass-card-elevated p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {grade.percentage >= 80 ? (
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                ) : grade.percentage >= 60 ? (
                  <AlertTriangle className="w-5 h-5 text-kepler-gold" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                )}
                <h4 className="font-display font-semibold text-foreground">{grade.criterionName}</h4>
              </div>
              <span className={`font-display text-xl font-bold ${
                grade.percentage >= 80 ? 'text-secondary' :
                grade.percentage >= 60 ? 'text-kepler-gold' :
                'text-destructive'
              }`}>
                {grade.percentage}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${grade.percentage}%` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                className="h-full rounded-full"
                style={{
                  background: grade.percentage >= 80
                    ? 'hsl(147, 54%, 40%)'
                    : grade.percentage >= 60
                    ? 'hsl(40, 90%, 55%)'
                    : 'hsl(0, 72%, 51%)',
                }}
              />
            </div>

            <p className="text-sm text-muted-foreground mb-3">{grade.feedback}</p>

            {grade.suggestions.length > 0 && (
              <div className="bg-accent/50 rounded-lg p-3">
                <p className="text-xs font-medium text-accent-foreground mb-2">💡 Suggestions:</p>
                <ul className="space-y-1">
                  {grade.suggestions.map((s, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-secondary mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
