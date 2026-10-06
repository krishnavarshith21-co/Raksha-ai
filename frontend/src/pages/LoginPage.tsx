import React, { useState, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';

const SecurityCore = React.lazy(() =>
  import('../components/three/SecurityCore').then(m => ({ default: m.SecurityCore }))
);

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@rakshya.sec');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Authentication failed. Please verify credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-graphite-950 flex">
      {/* Left: Brand panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col justify-between relative overflow-hidden"
      >
        {/* Subtle ambient gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-copper-500/[0.02] blur-[140px] rounded-full" />
        </div>

        <div className="relative z-10 p-12 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-8 h-8 rounded-lg bg-graphite-800 border border-graphite-600 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-copper-400" />
            </div>
            <span className="font-semibold tracking-wider text-stone-50 text-sm">RAKSHYA</span>
          </div>

          {/* 3D Visualization */}
          <div className="flex-1 flex items-center justify-center">
            <Suspense fallback={<div className="h-[350px]" />}>
              <SecurityCore size="md" className="w-full max-w-md" />
            </Suspense>
          </div>

          <div className="mt-auto space-y-3">
            <p className="text-stone-50 text-lg font-medium leading-snug max-w-sm">
              Security infrastructure for<br />autonomous systems.
            </p>
            <p className="text-graphite-300 text-sm max-w-xs leading-relaxed">
              Evaluate, enforce, and control AI-driven actions before they execute.
            </p>
          </div>
        </div>

        {/* Vertical border */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-graphite-800" />
      </motion.div>

      {/* Right: Login form */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16"
      >
        <div className="w-full max-w-sm">
          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-graphite-800 border border-graphite-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-copper-400" />
            </div>
            <span className="font-semibold tracking-wider text-stone-50">RAKSHYA</span>
          </div>

          <div className="mb-8">
            <div className="eyebrow text-graphite-400 mb-2">Security Console</div>
            <h1 className="text-xl font-semibold text-stone-50 mb-1.5">Authenticate Session</h1>
            <p className="text-sm text-graphite-300">
              Sign in to access enforcement controls and governance configuration.
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-graphite-200 mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="analyst@rakshya.sec"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-graphite-900 border border-graphite-700 rounded-lg text-sm text-stone-100 placeholder:text-graphite-500 focus:border-copper-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-graphite-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-graphite-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-graphite-900 border border-graphite-700 rounded-lg text-sm text-stone-100 placeholder:text-graphite-500 focus:border-copper-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-50 bg-graphite-700 border border-graphite-500 rounded-lg hover:bg-graphite-600 hover:border-graphite-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)' }}
            >
              {submitting ? (
                <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill */}
          <div className="mt-8 pt-6 border-t border-graphite-800">
            <div className="eyebrow text-graphite-500 mb-3 text-[10px]">
              Enterprise Test Profiles
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@rakshya.sec', 'Admin@123456')}
                className="px-3 py-2 rounded-lg bg-graphite-900 hover:bg-graphite-800 border border-graphite-700 hover:border-graphite-600 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-medium text-stone-100 group-hover:text-copper-300 transition-colors">Admin / CSO</div>
                <div className="text-[10px] text-graphite-400 font-mono mt-0.5">admin@rakshya.sec</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('analyst@rakshya.sec', 'Analyst@123456')}
                className="px-3 py-2 rounded-lg bg-graphite-900 hover:bg-graphite-800 border border-graphite-700 hover:border-graphite-600 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-medium text-stone-100 group-hover:text-copper-300 transition-colors">Security Analyst</div>
                <div className="text-[10px] text-graphite-400 font-mono mt-0.5">analyst@rakshya.sec</div>
              </button>
            </div>
          </div>

          {/* Register link */}
          <div className="mt-8 text-center text-sm text-graphite-400">
            Need a dedicated deployment?{' '}
            <Link to="/register" className="text-graphite-200 hover:text-stone-50 font-medium transition-colors">
              Register Organization
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
