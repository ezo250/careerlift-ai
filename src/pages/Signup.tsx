import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Sparkles, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import keplerLogo from '@/assets/kepler-logo.png';

export default function Signup() {
  const [isTeacher, setIsTeacher] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getSections().then(setSections).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isTeacher) {
      if (!inviteCode) {
        setError('Please enter your invite code');
        return;
      }
      const result = await signup(email, password, name, '', inviteCode);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Signup failed');
      }
    } else {
      if (!sectionId) {
        setError('Please select your section');
        return;
      }
      const result = await signup(email, password, name, sectionId);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Signup failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-kepler-green/3 rounded-full blur-3xl" />
      </div>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 bg-gradient-to-br from-[#2d7a5f] via-[#3a9b6f] to-[#2d7a5f] overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Floating shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-3xl backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-20 w-40 h-40 bg-white/10 rounded-full backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <img src={keplerLogo} alt="Kepler College" className="h-24 mx-auto drop-shadow-2xl" />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-display text-4xl font-bold text-white mb-4 tracking-tight">
              Join CareerLift
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Create your {isTeacher ? 'teacher' : 'student'} account and start building a career-ready portfolio with AI-powered feedback.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-2 text-white/80 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Grading System</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md my-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <img src={keplerLogo} alt="Kepler College" className="h-16 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground">Kepler CareerLift</h2>
          </div>

          {/* Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8">
            <div className="mb-6">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create Account</h1>
              <p className="text-muted-foreground">Get started with your journey</p>
            </div>

            {/* Role Selection */}
            <div className="flex gap-3 mb-6">
              <Button
                type="button"
                onClick={() => setIsTeacher(false)}
                variant={!isTeacher ? 'default' : 'outline'}
                className={`flex-1 h-14 rounded-xl transition-all ${
                  !isTeacher 
                    ? 'bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20' 
                    : 'border-2 hover:border-primary/50'
                }`}
              >
                <Users className="w-5 h-5 mr-2" />
                Student
              </Button>
              <Button
                type="button"
                onClick={() => setIsTeacher(true)}
                variant={isTeacher ? 'default' : 'outline'}
                className={`flex-1 h-14 rounded-xl transition-all ${
                  isTeacher 
                    ? 'bg-gradient-to-r from-secondary to-secondary/80 shadow-lg shadow-secondary/20' 
                    : 'border-2 hover:border-secondary/50'
                }`}
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                Teacher
              </Button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20 backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isTeacher && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Invite Code</label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary focus:border-transparent transition-all outline-none font-mono"
                    placeholder="KCL-TEACH-XXXXX"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter the code you received via email</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="Create a secure password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {!isTeacher && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Select Your Section</label>
                  <select
                    value={sectionId}
                    onChange={e => setSectionId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    required
                  >
                    <option value="">Choose a section...</option>
                    {sections.map(s => (
                      <option key={s._id} value={s._id}>{s.name} — {s.description}</option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70 font-semibold rounded-xl shadow-lg shadow-secondary/20 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/30 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> 
                    Create Account
                  </div>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
