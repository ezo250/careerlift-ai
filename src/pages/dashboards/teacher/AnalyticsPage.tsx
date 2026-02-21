import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const submissionsData = await api.getSubmissions();
      const teacherSubs = submissionsData.filter((sub: any) => {
        const studentSectionId = sub.studentId?.sectionId || sub.studentId?.sectionId?._id;
        return user?.assignedSections?.includes(studentSectionId);
      });
      setSubmissions(teacherSubs);
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

  // Calculate analytics
  const avgScore = submissions.length
    ? Math.round(submissions.reduce((sum, s) => sum + s.overallScore, 0) / submissions.length)
    : 0;

  // Common weaknesses analysis
  const weaknesses: Record<string, number[]> = {};
  submissions.forEach(sub => {
    sub.grades?.forEach((g: any) => {
      if (!weaknesses[g.criterionName]) weaknesses[g.criterionName] = [];
      weaknesses[g.criterionName].push(g.percentage);
    });
  });

  const avgWeaknesses = Object.entries(weaknesses)
    .map(([area, scores]) => ({
      area,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length
    }))
    .sort((a, b) => a.avg - b.avg);

  // Score distribution
  const scoreRanges = [
    { label: '90-100%', min: 90, max: 100, color: 'bg-secondary' },
    { label: '80-89%', min: 80, max: 89, color: 'bg-kepler-green' },
    { label: '70-79%', min: 70, max: 79, color: 'bg-kepler-gold' },
    { label: '60-69%', min: 60, max: 69, color: 'bg-kepler-orange' },
    { label: 'Below 60%', min: 0, max: 59, color: 'bg-destructive' },
  ];

  const distribution = scoreRanges.map(range => ({
    ...range,
    count: submissions.filter(s => s.overallScore >= range.min && s.overallScore <= range.max).length,
    percentage: submissions.length
      ? Math.round((submissions.filter(s => s.overallScore >= range.min && s.overallScore <= range.max).length / submissions.length) * 100)
      : 0
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Analytics & Insights</h1>
        <p className="text-muted-foreground mt-1">Performance metrics and trends for your students</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">{avgScore}%</div>
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
            {submissions.filter(s => s.overallScore >= 80).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">High Performers</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-kepler-gold/10 text-kepler-gold flex items-center justify-center mb-3">
            <Target className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {submissions.filter(s => s.overallScore >= 60 && s.overallScore < 80).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Average Performers</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="stat-card"
        >
          <div className="w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="font-display text-2xl font-bold text-foreground">
            {submissions.filter(s => s.overallScore < 60).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Need Attention</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-elevated p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Score Distribution</h3>
          </div>
          <div className="space-y-4">
            {distribution.map((range, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground font-medium">{range.label}</span>
                  <span className="text-muted-foreground">
                    {range.count} students ({range.percentage}%)
                  </span>
                </div>
                <div className="h-8 rounded-lg bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${range.percentage}%` }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                    className={`h-full ${range.color} flex items-center justify-center text-white text-xs font-semibold`}
                  >
                    {range.percentage > 10 && `${range.percentage}%`}
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Areas for Improvement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-elevated p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-kepler-orange" />
            <h3 className="font-display font-semibold text-foreground">Areas Needing Attention</h3>
          </div>
          <div className="space-y-4">
            {avgWeaknesses.slice(0, 6).map((w, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground font-medium">{w.area}</span>
                  <span className={`font-medium ${
                    w.avg >= 80 ? 'text-secondary' : w.avg >= 60 ? 'text-kepler-gold' : 'text-destructive'
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
                      background: w.avg >= 80
                        ? 'hsl(147, 54%, 40%)'
                        : w.avg >= 60
                        ? 'hsl(40, 90%, 55%)'
                        : 'hsl(0, 72%, 51%)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recommendations */}
      {submissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-elevated p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">AI-Powered Recommendations</h3>
          <div className="space-y-3">
            {avgWeaknesses.slice(0, 3).map((w, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Focus on {w.area}</p>
                    <p className="text-sm text-muted-foreground">
                      This area shows an average score of {w.avg}%. Consider providing additional resources
                      or workshops to help students improve in this criterion.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
