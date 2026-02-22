import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import keplerLogo from '@/assets/logo.png';
import { api } from '@/lib/api';

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
              Kepler CareerLift grades resumes and cover letters against real job descriptions, 
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

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={keplerLogo} alt="Kepler" className="h-8 w-auto" />
            <span className="font-display font-bold text-foreground">CareerLift</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Kepler College. All rights reserved. | Developed by Amani Alain</p>
        </div>
      </footer>
    </div>
  );
}
