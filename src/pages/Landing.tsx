import { useState, useEffect, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Users, Brain, FileText, BarChart3, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import keplerLogo from '@/assets/kepler-logo.png';
import { api } from '@/lib/api';

type Feature = { icon: ElementType; title: string; description: string };

const features: Feature[] = [
  { icon: Brain, title: 'Grading', description: 'Instant, detailed feedback on resumes and cover letters using advanced AI analysis.' },
  { icon: FileText, title: 'Smart Checklists', description: 'Customizable grading criteria aligned with specific job descriptions.' },
  { icon: Users, title: 'Section Management', description: 'Organize students into cohorts and assign career staff effortlessly.' },
  { icon: BarChart3, title: 'Analytics Dashboard', description: 'Track student progress, identify common weaknesses, and select top candidates.' },
  { icon: Shield, title: 'Role-Based Access', description: 'Secure access for administrators, teachers, and students with unique permissions.' },
  { icon: Sparkles, title: 'Multiple Submissions', description: 'Allow students to iterate and improve with configurable submission limits.' },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' } }),
};

export default function Landing() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalJobs: 0,
    averageScore: 0,
    totalSubmissions: 0
  });

  useEffect(() => {
    api.getStats()
      .then(data => {
        setStats({
          totalStudents: data.totalStudents,
          totalJobs: data.totalJobs,
          averageScore: data.averageScore,
          totalSubmissions: data.totalSubmissions
        });
      })
      .catch(() => {
        // Keep default values on error
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={keplerLogo} alt="Kepler" className="h-10 w-auto" />
            <span className="font-display text-xl font-bold text-foreground">CareerLift</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="font-medium">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-float-delayed" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Career Development Platform
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-foreground">Elevate Your</span>
              <br />
              <span className="gradient-text">Career Journey</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Kepler CareerLift uses AI to grade resumes and cover letters against real job descriptions, 
              helping students land their dream jobs with actionable feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 py-6 font-semibold group">
                  Start as Student
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 font-semibold border-border hover:bg-muted">
                  Staff Login
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {[
              { label: 'Students', value: `${stats.totalStudents}+` },
              { label: 'Jobs Analyzed', value: `${stats.totalJobs}+` },
              { label: 'Avg. Score', value: `${stats.averageScore}%` },
              { label: 'Submissions', value: `${stats.totalSubmissions}+` },
            ].map((s, i) => (
              <div key={i} className="text-center glass-card p-4">
                <div className="font-display text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete platform connecting students, teachers, and administrators for career success.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i + 2}
                  className="glass-card-elevated p-6 group hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={keplerLogo} alt="Kepler" className="h-8 w-auto" />
            <span className="font-display font-bold text-foreground">CareerLift</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 Kepler College. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
