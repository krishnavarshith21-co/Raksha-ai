import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, ArrowRight, Building2, Mail, Lock, User } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColor = ['', 'bg-status-red', 'bg-status-orange', 'bg-status-yellow', 'bg-status-green', 'bg-status-green'];
  const strength = passwordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ email, password, name, organizationName });
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-graphite-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-copper-500/[0.015] blur-[140px] pointer-events-none rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg bg-graphite-800 border border-graphite-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-copper-400" />
          </div>
          <span className="font-semibold tracking-wider text-stone-50">RAKSHYA</span>
        </div>

        <div className="mb-8">
          <div className="eyebrow text-graphite-400 mb-2">Enterprise Deployment</div>
          <h1 className="text-xl font-semibold text-stone-50 mb-1.5">Register Organization</h1>
          <p className="text-sm text-graphite-300">
            Create a dedicated security enforcement instance for your organization.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-lg bg-status-red/[0.08] border border-status-red/20 flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-status-red shrink-0 mt-0.5" />
            <span className="text-sm text-status-red/90">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-graphite-200 mb-2">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ada Lovelace"
                className="w-full pl-10 pr-3.5 py-2.5 bg-graphite-900 border border-graphite-700 rounded-lg text-sm text-stone-100 placeholder:text-graphite-500 focus:border-copper-500/50 focus:outline-none transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-200 mb-2">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="security@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-graphite-900 border border-graphite-700 rounded-lg text-sm text-stone-100 placeholder:text-graphite-500 focus:border-copper-500/50 focus:outline-none transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-200 mb-2">Organization Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required placeholder="Acme Security Corp"
                className="w-full pl-10 pr-3.5 py-2.5 bg-graphite-900 border border-graphite-700 rounded-lg text-sm text-stone-100 placeholder:text-graphite-500 focus:border-copper-500/50 focus:outline-none transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-200 mb-2">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-3.5 py-2.5 bg-graphite-900 border border-graphite-700 rounded-lg text-sm text-stone-100 placeholder:text-graphite-500 focus:border-copper-500/50 focus:outline-none transition-colors" />
            </div>
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor[strength] : 'bg-graphite-700'}`} />
                  ))}
                </div>
                <span className="text-[11px] text-graphite-300 font-mono">{strengthLabel[strength]}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-graphite-200 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Repeat password"
                className="w-full pl-10 pr-3.5 py-2.5 bg-graphite-900 border border-graphite-700 rounded-lg text-sm text-stone-100 placeholder:text-graphite-500 focus:border-copper-500/50 focus:outline-none transition-colors" />
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-50 bg-graphite-700 border border-graphite-500 rounded-lg hover:bg-graphite-600 hover:border-graphite-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-2"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)' }}
          >
            {submitting ? (
              <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              <>
                <span>Create Organization</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-graphite-400">
          Already have access?{' '}
          <Link to="/login" className="text-graphite-200 hover:text-stone-50 font-medium transition-colors">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
