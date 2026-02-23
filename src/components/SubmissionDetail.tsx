import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SubmissionDetailProps {
  submission: any;
  onBack: () => void;
}

export default function SubmissionDetail({ submission, onBack }: SubmissionDetailProps) {
  if (!submission) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No submission data available</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const hasAdvancedGrading = submission.overallGrade && submission.categories;

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-2">
      <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground sticky top-0 bg-background z-10">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {submission.studentId?.name || submission.studentName || 'Student'} — Submission #{submission.submissionNumber}
          </h1>
          <p className="text-muted-foreground">
            {submission.jobId?.title || 'Job Position'} • {new Date(submission.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div className="text-center px-6 py-3 rounded-xl font-display text-3xl font-bold shadow-lg bg-primary/10 text-primary border-2 border-primary/30">
          {submission.overallScore}%
        </div>
      </div>

      {hasAdvancedGrading && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-card p-4 text-center">
              <div className="text-sm text-muted-foreground">Overall Grade</div>
              <div className="text-2xl font-bold text-foreground">{submission.overallGrade}</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-sm text-muted-foreground">JD Alignment</div>
              <div className="text-2xl font-bold text-foreground">{submission.jdAlignment}%</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-sm text-muted-foreground">Interview Probability</div>
              <div className="text-2xl font-bold text-foreground">{submission.documentAnalysis?.interviewProbability || 0}%</div>
            </div>
          </div>

          <div className="glass-card-elevated p-6">
            <h3 className="font-display font-semibold text-foreground mb-2">Top Strength</h3>
            <p className="text-foreground">{submission.topStrength}</p>
          </div>

          <div className="glass-card-elevated p-6 border-l-4 border-destructive">
            <h3 className="font-display font-semibold text-destructive mb-2">Top Priority</h3>
            <p className="text-foreground">{submission.topPriority}</p>
          </div>

          <div className="glass-card-elevated p-6">
            <h3 className="font-display font-semibold text-foreground mb-2">Instructor Assessment</h3>
            <p className="text-foreground leading-relaxed">{submission.instructorAssessment}</p>
          </div>

          {submission.categories?.map((category: any, idx: number) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="glass-card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-semibold text-foreground">{category.name}</h3>
                <div className="text-2xl font-bold text-primary">{category.score}%</div>
              </div>
              <div className="space-y-3">
                {category.items?.map((item: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-start gap-3 mb-2">
                      {item.status === 'pass' ? (
                        <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      ) : item.status === 'partial' ? (
                        <AlertCircle className="w-5 h-5 text-kepler-gold flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-foreground">{item.criterion}</p>
                          <span className="text-sm font-bold text-muted-foreground">{item.points}/{item.maxPoints}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.feedback}</p>
                        {item.evidence && (
                          <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                            <p className="text-xs font-semibold text-destructive mb-1">❌ Evidence:</p>
                            <p className="text-xs text-foreground font-mono">{item.evidence}</p>
                          </div>
                        )}
                        {item.improvement && (
                          <div className="mt-2 p-2 rounded bg-secondary/10 border border-secondary/20">
                            <p className="text-xs font-semibold text-secondary mb-1">✅ Improvement:</p>
                            <p className="text-xs text-foreground">{item.improvement}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </>
      )}

      {submission.grades?.map((grade: any, i: number) => (
        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="glass-card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display font-semibold text-lg text-foreground">{grade.criterionName}</h4>
            <div className="text-3xl font-bold text-primary">{grade.percentage}%</div>
          </div>
          <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm font-semibold text-foreground mb-2">Expert Analysis:</p>
            <p className="text-sm text-foreground leading-relaxed">{grade.feedback}</p>
          </div>
          {grade.improvements && grade.improvements.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">How to Improve:</p>
              <div className="space-y-3">
                {grade.improvements.map((improvement: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg bg-kepler-gold/5 border border-kepler-gold/20">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-kepler-gold text-white flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                      <p className="text-sm font-medium text-foreground">{grade.suggestions[idx]}</p>
                    </div>
                    <div className="ml-7 space-y-2">
                      <div className="p-2 rounded bg-destructive/10 border border-destructive/20">
                        <p className="text-xs font-semibold text-destructive mb-1">❌ What you wrote:</p>
                        <p className="text-xs text-foreground font-mono">{improvement.original}</p>
                      </div>
                      <div className="p-2 rounded bg-secondary/10 border border-secondary/20">
                        <p className="text-xs font-semibold text-secondary mb-1">✅ Improved version:</p>
                        <p className="text-xs text-foreground font-mono">{improvement.improved}</p>
                        <button onClick={() => { navigator.clipboard.writeText(improvement.improved); toast.success('Copied!'); }} className="mt-2 text-xs text-secondary hover:underline">📋 Copy improved text</button>
                      </div>
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-xs text-muted-foreground"><span className="font-semibold">Why this is better:</span> {improvement.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ))}

      <div className="flex gap-4">
        {submission.coverLetterUrl && submission.coverLetterName && (
          <div className="glass-card p-4 flex items-center gap-3 flex-1">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{submission.coverLetterName}</p>
              <p className="text-xs text-muted-foreground">Cover Letter</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => toast.info('Download coming soon')}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
        {submission.resumeUrl && submission.resumeName && (
          <div className="glass-card p-4 flex items-center gap-3 flex-1">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{submission.resumeName}</p>
              <p className="text-xs text-muted-foreground">Resume</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => toast.info('Download coming soon')}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
