import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Hardened'];
  const strengthColor = [
    '',
    'bg-status-red',
    'bg-status-orange',
    'bg-status-yellow',
    'bg-status-green',
    'bg-status-green',
  ];
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
      navigate('/dashboard');
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
    <div className="min-h-screen bg-graphite-950 flex flex-col justify-center items-center p-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[360px] bg-copper-500/[0.025] blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-[440px] relative z-10 animate-fade-in">
        {/* Brand identity header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-10 h-10 rounded-md bg-graphite-850 border border-graphite-750 flex items-center justify-center mb-3 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-copper-400" />
          </div>
          <span className="font-mono text-xs tracking-[0.25em] text-copper-400 font-medium uppercase mb-1">
            RAKSHYA
          </span>
          <h1 className="text-lg font-medium text-stone-100 tracking-tight">
            Provision Organization
          </h1>
          <p className="text-xs text-graphite-400 mt-1">
            Deploy dedicated AI enforcement cluster
          </p>
        </div>

        {/* Card */}
        <div className="bg-graphite-850 border border-graphite-750 rounded-lg p-6 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded bg-status-red/[0.08] border border-status-red/25 flex items-start gap-2.5 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-status-red shrink-0 mt-0.5" />
              <span className="text-xs text-status-red leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
                Security Officer Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-graphite-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ada Lovelace"
                  className="w-full pl-9 pr-3 py-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
                Organization Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-graphite-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="security@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
                Enterprise Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-graphite-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  placeholder="Acme Defense Systems"
                  className="w-full pl-9 pr-3 py-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
                Master Secret
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-graphite-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 8 characters"
                  className="w-full pl-9 pr-3 py-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none transition-colors"
                />
              </div>
              {password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-0.5 flex-1 rounded-full transition-colors ${
                          i <= strength ? strengthColor[strength] : 'bg-graphite-800'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-graphite-400 font-mono">
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
                Verify Secret
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-graphite-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm password"
                  className="w-full pl-9 pr-3 py-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-9 flex items-center justify-center gap-2 px-4 rounded text-xs font-medium text-graphite-950 bg-copper-500 hover:bg-copper-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-graphite-950/40 border-t-graphite-950 rounded-full animate-spin" />
              ) : (
                <>
                  <span>Deploy Org Environment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-5 text-center text-xs text-graphite-400">
          Already registered?{' '}
          <Link
            to="/login"
            className="text-stone-200 hover:text-copper-400 font-medium transition-colors"
          >
            Sign In to Console
          </Link>
        </div>
      </div>
    </div>
  );
};
