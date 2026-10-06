import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@rakshya.sec');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background ambient mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Security Banner Header */}
      <div className="w-full max-w-md mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SECURITY ENFORCEMENT INFRASTRUCTURE</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-xl shadow-amber-900/30 border border-amber-400/30">
            <ShieldCheck className="w-7 h-7 text-zinc-950" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider text-zinc-100 font-mono">
            RAKSHYA
          </h1>
        </div>
        <p className="text-xs text-zinc-400 font-mono">
          Security Infrastructure for Autonomous AI Systems
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">Enforcer Access</h2>
        <p className="text-xs text-zinc-400 mb-6">
          Authenticate to inspect real-time agent actions and configure governance rules.
        </p>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-start gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="analyst@rakshya.sec"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-zinc-300">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            loading={submitting}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Authenticate Session
          </Button>
        </form>

        {/* Demo Quick-Fill Roles */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80">
          <div className="text-[11px] font-mono text-zinc-400 mb-2 uppercase tracking-wider">
            Quick-Fill Enterprise Profiles
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@rakshya.sec', 'Admin@123456')}
              className="px-2.5 py-1.5 rounded-md bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-medium text-amber-400">Admin / CSO</div>
              <div className="text-[10px] text-zinc-500 font-mono truncate">admin@rakshya.sec</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('analyst@rakshya.sec', 'Analyst@123456')}
              className="px-2.5 py-1.5 rounded-md bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-medium text-sky-400">Security Analyst</div>
              <div className="text-[10px] text-zinc-500 font-mono truncate">analyst@rakshya.sec</div>
            </button>
          </div>
        </div>

        {/* Register link */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          Need a dedicated enterprise deployment?{' '}
          <Link to="/register" className="text-amber-400 hover:text-amber-300 font-medium">
            Register Organization
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center text-[11px] font-mono text-zinc-600">
        RAKSHYA Autonomous Security Gateway · Zero-Trust Agent Interceptor · v1.4.0
      </div>
    </div>
  );
};
