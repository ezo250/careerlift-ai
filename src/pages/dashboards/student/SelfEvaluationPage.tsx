import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { gradeDocument, extractTextFromFile } from '@/lib/puterAI';
import { api } from '@/lib/api';
import SubmissionDetail from '@/components/SubmissionDetail';

export default function SelfEvaluationPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleEvaluate = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description');
      return;
    }
    if (!coverLetter && !resume) {
      toast.error('Please upload at least one document');
      return;
    }

    setEvaluating(true);
    try {
      const checklists = await api.getChecklists();
      const checklist = checklists[0];
      if (!checklist) throw new Error('No checklist available');

      toast.info('Extracting text from documents...');
      const texts = [];
      if (coverLetter) {
        const coverLetterText = await extractTextFromFile(coverLetter);
        texts.push(`COVER LETTER:\n${coverLetterText}`);
      }
      if (resume) {
        const resumeText = await extractTextFromFile(resume);
        texts.push(`RESUME:\n${resumeText}`);
      }

      const combinedText = texts.join('\n\n');

      toast.info('AI is evaluating your documents...');
      const gradeResult = await gradeDocument(combinedText, checklist, jobDescription);

      setResult({
        ...gradeResult,
        coverLetterName: coverLetter?.name,
        resumeName: resume?.name,
        coverLetterUrl: 'self-eval',
        resumeUrl: 'self-eval',
        createdAt: new Date(),
        submissionNumber: 0,
        studentName: 'Self Evaluation',
        jobId: { title: 'Self Evaluation' },
        grades: gradeResult.grades,
        overallScore: gradeResult.overallScore,
        aiFeedback: gradeResult.aiFeedback,
        documentAnalysis: gradeResult.documentAnalysis,
        detailedBreakdown: gradeResult.detailedBreakdown
      });

      toast.success(`Evaluation complete! Your score: ${gradeResult.overallScore}%`);
    } catch (error: any) {
      console.error('Evaluation error:', error);
      toast.error(error.message || 'Failed to evaluate documents');
    } finally {
      setEvaluating(false);
    }
  };

  if (result) {
    return (
      <div>
        <Button 
          variant="ghost" 
          onClick={() => setResult(null)} 
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> New Evaluation
        </Button>
        <SubmissionDetail submission={result} onBack={() => setResult(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-kepler-gold" />
          Self Evaluation
        </h1>
        <p className="text-muted-foreground mt-1">
          Evaluate your resume and cover letter against any job description
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Job Description <span className="text-destructive">*</span>
          </label>
          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            className="kepler-input"
            rows={8}
            placeholder="Paste the job description here..."
            disabled={evaluating}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cover Letter (Optional)
            </label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={e => setCoverLetter(e.target.files?.[0] || null)}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
              disabled={evaluating}
            />
            {coverLetter && <p className="text-xs text-secondary mt-1">✓ {coverLetter.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Resume (Optional)
            </label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={e => setResume(e.target.files?.[0] || null)}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
              disabled={evaluating}
            />
            {resume && <p className="text-xs text-secondary mt-1">✓ {resume.name}</p>}
          </div>
        </div>

        <Button
          onClick={handleEvaluate}
          disabled={evaluating || !jobDescription.trim() || (!coverLetter && !resume)}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          {evaluating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Evaluating...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" /> Evaluate My Documents
            </>
          )}
        </Button>

        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> This is a self-evaluation tool. Results are not saved and won't count towards your submissions.
            Use this to practice and improve your documents before official submissions.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
