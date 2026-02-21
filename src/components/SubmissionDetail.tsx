import { motion } from 'framer-motion';
import { 
  ArrowLeft, FileText, CheckCircle2, AlertTriangle, Lightbulb, 
  Target, TrendingUp, AlertCircle, MapPin, Award, Zap, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SubmissionDetailProps {
  submission: any;
  onBack: () => void;
}

export default function SubmissionDetail({ submission, onBack }: SubmissionDetailProps) {
  // Calculate stats from detailed breakdown
  const hasDocAnalysis = submission.documentAnalysis;
  const hasDetailedBreakdown = submission.detailedBreakdown;
  const atsScore = hasDocAnalysis?.atsCompatibility || 0;
  const interviewProb = hasDocAnalysis?.interviewProbability || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      {/* Title and Score */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {submission.studentId?.name || submission.studentName || 'Student'} — Submission #{submission.submissionNumber}
          </h1>
          <p className="text-muted-foreground">
            {submission.jobId?.title || 'Job Position'} • Submitted {new Date(submission.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasDocAnalysis && (
            <>
              <div className="text-center px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">ATS Score</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{atsScore}%</div>
              </div>
              <div className="text-center px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Interview</div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{interviewProb}%</div>
              </div>
            </>
          )}
          <div className={`text-center px-6 py-3 rounded-xl font-display text-3xl font-bold shadow-lg ${
            submission.overallScore >= 80 ? 'bg-secondary/10 text-secondary border-2 border-secondary/30' :
            submission.overallScore >= 60 ? 'bg-kepler-gold/10 text-kepler-gold border-2 border-kepler-gold/30' :
            'bg-destructive/10 text-destructive border-2 border-destructive/30'
          }`}>
            {submission.overallScore}%
          </div>
        </div>
      </div>

      {/* Document Analysis - Key Metrics */}
      {hasDocAnalysis && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card-elevated p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-secondary" />
              <h3 className="font-display font-semibold text-foreground">Top Strengths</h3>
            </div>
            <div className="space-y-2">
              {submission.documentAnalysis.strengths?.map((strength: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{strength}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Critical Issues */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card-elevated p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <h3 className="font-display font-semibold text-foreground">Critical Issues</h3>
            </div>
            <div className="space-y-2">
              {submission.documentAnalysis.criticalIssues?.map((issue: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{issue}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Overall Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-kepler-gold" />
          <h3 className="font-display font-semibold text-foreground">AI Expert Summary</h3>
        </div>
        <p className="text-foreground leading-relaxed whitespace-pre-line">{submission.aiFeedback}</p>
      </motion.div>

      {/* Competitive Positioning */}
      {hasDocAnalysis?.competitivePositioning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-elevated p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Competitive Positioning</h3>
          </div>
          <p className="text-foreground leading-relaxed">{submission.documentAnalysis.competitivePositioning}</p>
        </motion.div>
      )}

      {/* Priority Actions */}
      {hasDocAnalysis?.recommendedActions && submission.documentAnalysis.recommendedActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-elevated p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-kepler-orange" />
            <h3 className="font-display font-semibold text-foreground">Priority Action Plan</h3>
          </div>
          <div className="space-y-2">
            {submission.documentAnalysis.recommendedActions.map((action: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < 3 ? 'bg-destructive text-destructive-foreground' :
                  i < 7 ? 'bg-kepler-gold text-white' :
                  'bg-primary/20 text-primary'
                }`}>
                  {i + 1}
                </div>
                <p className="text-sm text-foreground">{action}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Section Scores */}
      {hasDetailedBreakdown?.sectionScores && Object.keys(submission.detailedBreakdown.sectionScores).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-elevated p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <h3 className="font-display font-semibold text-foreground">Section-by-Section Scores</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(submission.detailedBreakdown.sectionScores).map(([section, score]: [string, any]) => (
              <div key={section} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <span className="text-sm font-medium text-foreground">{section}</span>
                <span className={`text-lg font-bold ${
                  score >= 80 ? 'text-secondary' :
                  score >= 60 ? 'text-kepler-gold' :
                  'text-destructive'
                }`}>
                  {score}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Submitted Files */}
      <div className="flex gap-4">
        <div className="glass-card p-4 flex items-center gap-3 flex-1">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">{submission.coverLetterName || 'Cover Letter'}</p>
            <p className="text-xs text-muted-foreground">Cover Letter Document</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3 flex-1">
          <FileText className="w-5 h-5 text-secondary" />
          <div>
            <p className="text-sm font-medium text-foreground">{submission.resumeName || 'Resume'}</p>
            <p className="text-xs text-muted-foreground">Resume Document</p>
          </div>
        </div>
      </div>

      {/* Detailed Criterion Grades */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
          <Info className="w-5 h-5" />
          Detailed Criterion Analysis
        </h3>
        {submission.grades?.map((grade: any, i: number) => (
          <motion.div
            key={grade.criterionId || i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="glass-card-elevated p-6"
          >
            {/* Criterion Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {grade.percentage >= 80 ? (
                  <CheckCircle2 className="w-6 h-6 text-secondary" />
                ) : grade.percentage >= 60 ? (
                  <AlertTriangle className="w-6 h-6 text-kepler-gold" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                )}
                <div>
                  <h4 className="font-display font-semibold text-lg text-foreground">{grade.criterionName}</h4>
                  {grade.severity && (
                    <Badge 
                      variant={grade.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="mt-1"
                    >
                      {grade.severity.toUpperCase()} PRIORITY
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-display text-3xl font-bold ${
                  grade.percentage >= 80 ? 'text-secondary' :
                  grade.percentage >= 60 ? 'text-kepler-gold' :
                  'text-destructive'
                }`}>
                  {grade.percentage}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {grade.score}/{grade.maxScore} points
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm font-semibold text-foreground mb-2">Expert Analysis:</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{grade.feedback}</p>
            </div>

            {/* Exact Locations */}
            {grade.exactLocations && grade.exactLocations.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-destructive" />
                  <p className="text-sm font-semibold text-foreground">Exact Error Locations:</p>
                </div>
                <div className="space-y-2">
                  {grade.exactLocations.map((location: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-destructive/5 border border-destructive/20">
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground font-mono">{location}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {grade.suggestions && grade.suggestions.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-kepler-gold" />
                  How to Improve:
                </p>
                <div className="space-y-2">
                  {grade.suggestions.map((suggestion: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-kepler-gold/5 border border-kepler-gold/20">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-kepler-gold text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-foreground">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
