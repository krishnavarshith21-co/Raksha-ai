import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';

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
          'Authentication failed. Please verify security credentials.'
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
    <div className="min-h-screen bg-graphite-950 flex flex-col justify-center items-center p-6 relative">
      {/* Precision ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[360px] bg-copper-500/[0.025] blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        {/* Brand identity header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-10 h-10 rounded-md bg-graphite-850 border border-graphite-750 flex items-center justify-center mb-3.5 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-copper-400" />
          </div>
          <span className="font-mono text-xs tracking-[0.25em] text-copper-400 font-medium uppercase mb-1">
            RAKSHYA
          </span>
          <h1 className="text-lg font-medium text-stone-100 tracking-tight">
            AI Defense Console
          </h1>
          <p className="text-xs text-graphite-400 mt-1">
            Autonomous system enforcement & policy governance
          </p>
        </div>

        {/* Card container */}
        <div className="bg-graphite-850 border border-graphite-750 rounded-lg p-6 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded bg-status-red/[0.08] border border-status-red/25 flex items-start gap-2.5 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-status-red shrink-0 mt-0.5" />
              <span className="text-xs text-status-red leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1.5">
                Principal Identity
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-graphite-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="analyst@rakshya.sec"
                  className="w-full pl-9 pr-3 py-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1.5">
                Authentication Secret
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-graphite-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-9 flex items-center justify-center gap-2 px-4 rounded text-xs font-medium text-graphite-950 bg-copper-500 hover:bg-copper-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-1 font-sans"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-graphite-950/40 border-t-graphite-950 rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill Test Credentials */}
          <div className="mt-6 pt-5 border-t border-graphite-750/70">
            <div className="text-[10px] font-mono tracking-wider text-graphite-500 uppercase mb-2.5">
              Rapid Access Credentials
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@rakshya.sec', 'Admin@123456')}
                className="p-2.5 rounded bg-graphite-900 hover:bg-graphite-800 border border-graphite-750 hover:border-graphite-700 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-medium text-stone-200 group-hover:text-copper-400 transition-colors">
                  Security Admin
                </div>
                <div className="text-[10px] text-graphite-400 font-mono mt-0.5 truncate">
                  admin@rakshya.sec
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('analyst@rakshya.sec', 'Analyst@123456')}
                className="p-2.5 rounded bg-graphite-900 hover:bg-graphite-800 border border-graphite-750 hover:border-graphite-700 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-medium text-stone-200 group-hover:text-copper-400 transition-colors">
                  SOC Analyst
                </div>
                <div className="text-[10px] text-graphite-400 font-mono mt-0.5 truncate">
                  analyst@rakshya.sec
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-5 flex items-center justify-between text-xs text-graphite-400 px-1">
          <Link
            to="/landing"
            className="hover:text-stone-200 transition-colors font-mono text-[11px]"
          >
            ← Public Portal
          </Link>
          <div>
            Need an instance?{' '}
            <Link
              to="/register"
              className="text-stone-200 hover:text-copper-400 font-medium transition-colors"
            >
              Register Org
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
