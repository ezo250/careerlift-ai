import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

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

  useState(() => {
    api.getSections().then(setSections).catch(() => {});
  });

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
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12"
        style={{ background: 'linear-gradient(135deg, hsl(147, 54%, 30%), hsl(147, 54%, 40%), hsl(202, 78%, 25%))' }}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative text-center"
        >
          <img src="/kepler-logo.png" alt="Kepler" className="h-20 mx-auto mb-6 brightness-0 invert" />
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-3">Join CareerLift</h2>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            Create your student account and start building a career-ready portfolio with AI-powered feedback.
          </p>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/kepler-logo.png" alt="Kepler" className="h-10" />
            <span className="font-display text-xl font-bold text-foreground">CareerLift</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-8">Sign up to get started</p>

          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              onClick={() => setIsTeacher(false)}
              variant={!isTeacher ? 'default' : 'outline'}
              className="flex-1"
            >
              Student
            </Button>
            <Button
              type="button"
              onClick={() => setIsTeacher(true)}
              variant={isTeacher ? 'default' : 'outline'}
              className="flex-1"
            >
              Teacher
            </Button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isTeacher && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  className="kepler-input"
                  placeholder="Enter your invite code"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="kepler-input"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="kepler-input"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="kepler-input pr-10"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {!isTeacher && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Your Section</label>
                <select
                  value={sectionId}
                  onChange={e => setSectionId(e.target.value)}
                  className="kepler-input"
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
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 h-11 font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Create Account</div>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
