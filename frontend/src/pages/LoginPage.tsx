import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
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
    <div className="min-h-screen bg-graphite-950 flex relative overflow-hidden">
      {/* Left side — Brand panel */}
      <div className="hidden lg:flex w-[45%] relative flex-col justify-between p-12">
        {/* Background grid pattern */}
        <div className="absolute inset-0 pattern-dots opacity-30" />
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-copper-500/[0.025] blur-[180px] rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-graphite-850 border border-graphite-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-copper-400" />
            </div>
            <span className="font-serif text-2xl text-stone-100">Rakshya</span>
          </div>
          <div className="text-xs font-mono text-copper-500/60 tracking-[0.2em] uppercase mt-1">
            Defense Layer
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="heading-serif text-4xl mb-6 leading-[1.15]">
            Security infrastructure for autonomous systems.
          </h2>
          <p className="text-graphite-400 leading-relaxed">
            Evaluate, enforce, and govern every tool call, API request, and data access
            made by AI agents — before execution.
          </p>

          {/* Micro stats */}
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-serif text-stone-100">{"<1ms"}</div>
              <div className="text-[11px] font-mono text-graphite-500 mt-1 tracking-wider">LATENCY</div>
            </div>
            <div>
              <div className="text-2xl font-serif text-status-green">99.99%</div>
              <div className="text-[11px] font-mono text-graphite-500 mt-1 tracking-wider">UPTIME</div>
            </div>
            <div>
              <div className="text-2xl font-serif text-stone-100">0</div>
              <div className="text-[11px] font-mono text-graphite-500 mt-1 tracking-wider">FALSE NEG</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] font-mono text-graphite-600 tracking-wider">
          ZERO TRUST ENFORCEMENT ENGINE v2.0
        </div>
      </div>

      {/* Right side — Login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative">
        {/* Subtle background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-copper-500/[0.015] blur-[150px] pointer-events-none rounded-full" />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile brand header */}
          <div className="flex flex-col items-center mb-10 text-center lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-graphite-850 border border-graphite-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-copper-400" />
            </div>
            <span className="font-serif text-2xl text-stone-100 mb-1">Rakshya</span>
            <p className="text-xs text-graphite-400">Security infrastructure for autonomous systems</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-10">
            <h1 className="heading-serif text-3xl mb-2">Authenticate</h1>
            <p className="text-sm text-graphite-400">
              Sign in to the enterprise security console
            </p>
          </div>

          {/* Card container */}
          <div className="bg-graphite-850/60 border border-graphite-700 rounded-xl p-7 shadow-2xl backdrop-blur-sm">
            {error && (
              <div className="mb-5 p-3.5 rounded-lg bg-status-red/[0.06] border border-status-red/15 flex items-start gap-3 animate-slide-up">
                <AlertCircle className="w-4 h-4 text-status-red shrink-0 mt-0.5" />
                <span className="text-sm text-status-red/90 leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-[0.12em] text-graphite-400 mb-2">
                  Principal Identity
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-graphite-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="analyst@rakshya.sec"
                    className="w-full pl-10 pr-4 py-2.5 bg-graphite-900 border border-graphite-700 rounded-lg text-sm text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-[0.12em] text-graphite-400 mb-2">
                  Authentication Secret
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-graphite-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-graphite-900 border border-graphite-700 rounded-lg text-sm text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 flex items-center justify-center gap-2.5 rounded-lg text-sm font-semibold text-graphite-950 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-2 shadow-lg shadow-copper-500/10"
              >
                {submitting ? (
                  <div className="loading-spinner" style={{ borderTopColor: '#070707', borderColor: 'rgba(7,7,7,0.3)' }} />
                ) : (
                  <>
                    <span>Authenticate Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick-fill credentials */}
            <div className="mt-7 pt-6 border-t border-graphite-750">
              <div className="text-[10px] font-mono tracking-[0.15em] text-graphite-500 uppercase mb-3">
                Rapid Access Credentials
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@rakshya.sec', 'Admin@123456')}
                  className="p-3 rounded-lg bg-graphite-900/70 hover:bg-graphite-800 border border-graphite-750 hover:border-graphite-600 text-left transition-all cursor-pointer group"
                >
                  <div className="text-sm font-medium text-stone-200 group-hover:text-copper-400 transition-colors">
                    Security Admin
                  </div>
                  <div className="text-[10px] text-graphite-500 font-mono mt-1 truncate">
                    admin@rakshya.sec
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('analyst@rakshya.sec', 'Analyst@123456')}
                  className="p-3 rounded-lg bg-graphite-900/70 hover:bg-graphite-800 border border-graphite-750 hover:border-graphite-600 text-left transition-all cursor-pointer group"
                >
                  <div className="text-sm font-medium text-stone-200 group-hover:text-copper-400 transition-colors">
                    SOC Analyst
                  </div>
                  <div className="text-[10px] text-graphite-500 font-mono mt-1 truncate">
                    analyst@rakshya.sec
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 flex items-center justify-between text-sm text-graphite-400 px-1">
            <Link
              to="/landing"
              className="hover:text-stone-200 transition-colors font-mono text-xs"
            >
              ← Public Portal
            </Link>
            <div>
              Need an instance?{' '}
              <Link
                to="/register"
                className="text-copper-400 hover:text-copper-300 font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
