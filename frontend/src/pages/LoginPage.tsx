import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, AlertCircle, ArrowRight, Lock, Mail, Shield, CheckCircle2 } from 'lucide-react';

/* Subtle canvas node network for the left panel */
const NetworkCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 700);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const nodes = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 2 + 1.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(201, 166, 107, ${0.08 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201, 166, 107, 0.4)';
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />;
};

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
    <div className="min-h-screen bg-[#070707] flex relative overflow-hidden font-sans">
      {/* ── LEFT PANEL: BRAND & SECURITY ARCHITECTURE ── */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-14 lg:p-18 border-r border-white/[0.08] bg-gradient-to-b from-[#0B0B0C] to-[#070707]">
        <NetworkCanvas />

        {/* Ambient radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[450px] bg-[#C9A66B]/[0.025] blur-[180px] pointer-events-none rounded-full" />

        {/* Brand header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#141415] border border-white/10 group-hover:border-[#C9A66B]/50 flex items-center justify-center shadow-lg shadow-black/50 transition-all">
              <ShieldCheck className="w-5 h-5 text-[#C9A66B]" />
            </div>
            <div>
              <span className="font-serif text-2xl text-[#F2EEE7] tracking-tight font-medium leading-none">
                RAKSHYA
              </span>
              <div className="text-[9px] font-mono text-[#C9A66B] tracking-[0.24em] uppercase mt-1">
                Security Core
              </div>
            </div>
          </Link>
        </div>

        {/* Center narrative statement */}
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101011] border border-white/[0.08] text-[11px] font-mono text-[#E0C28D] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ENTERPRISE INLINE PROTECTION LAYER</span>
          </div>

          <h1 className="font-serif text-4xl lg:text-5xl text-[#F2EEE7] leading-[1.12] tracking-tight">
            Security infrastructure<br />
            <span className="text-[#E0C28D]">for autonomous systems.</span>
          </h1>

          <p className="text-[#96939A] text-[16px] leading-relaxed mt-6">
            RAKSHYA evaluates, enforces, and governs every tool call, database transaction, and API
            invocation initiated by AI agents — before runtime execution.
          </p>

          {/* Core capability pillars (Genuine, no fake metrics) */}
          <div className="mt-12 pt-8 border-t border-white/[0.08] grid grid-cols-3 gap-6">
            <div>
              <div className="text-xs font-mono font-semibold text-[#F2EEE7] uppercase tracking-wider">
                Deterministic
              </div>
              <div className="text-[12px] text-[#96939A] mt-1 leading-snug">
                0–100 behavioral risk score model
              </div>
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-[#F2EEE7] uppercase tracking-wider">
                Zero-Trust
              </div>
              <div className="text-[12px] text-[#96939A] mt-1 leading-snug">
                Tool call boundaries enforced inline
              </div>
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-[#F2EEE7] uppercase tracking-wider">
                Dual-Custody
              </div>
              <div className="text-[12px] text-[#96939A] mt-1 leading-snug">
                Cryptographic operator sign-off
              </div>
            </div>
          </div>
        </div>

        {/* Footer label */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#66636A] tracking-wider">
          <span>RAKSHYA CLUSTER v2.4</span>
          <span>SOC2 TYPE II COMPLIANT ARCHITECTURE</span>
        </div>
      </div>

      {/* ── RIGHT PANEL: AUTHENTICATION FORM ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-[460px] relative z-10">
          {/* Card container */}
          <div className="surface-card p-8 sm:p-10 rounded-2xl border-white/10 shadow-2xl">
            <div className="mb-8">
              <h2 className="font-serif text-3xl text-[#F2EEE7] tracking-tight font-medium">
                Authenticate Session
              </h2>
              <p className="text-[14px] text-[#96939A] mt-2">
                Enter your credentials to access the security operations console.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-[0.2em] text-[#96939A] mb-2 font-medium">
                  Principal Identity
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#66636A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="operator@enterprise.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#070707] border border-white/10 rounded-xl text-sm text-[#F2EEE7] placeholder:text-[#66636A] focus:border-[#C9A66B] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-[0.2em] text-[#96939A] mb-2 font-medium">
                  Authentication Secret
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#66636A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-[#070707] border border-white/10 rounded-xl text-sm text-[#F2EEE7] placeholder:text-[#66636A] focus:border-[#C9A66B] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold w-full py-3.5 px-4 rounded-xl text-[14.5px] font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#C9A66B]/15"
              >
                <span>{submitting ? 'Verifying Session...' : 'Authenticate Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Rapid access credentials pills */}
            <div className="mt-8 pt-6 border-t border-white/[0.08]">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#66636A] mb-3">
                Pre-configured Security Credentials
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@rakshya.sec', 'Admin@123456')}
                  className="p-3 rounded-xl bg-[#070707] hover:bg-[#141415] border border-white/[0.08] hover:border-[#C9A66B]/40 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-medium text-[#F2EEE7] group-hover:text-[#E0C28D]">
                    Security Admin
                  </div>
                  <div className="text-[11px] font-mono text-[#66636A] truncate mt-0.5">
                    admin@rakshya.sec
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('analyst@rakshya.sec', 'Analyst@123456')}
                  className="p-3 rounded-xl bg-[#070707] hover:bg-[#141415] border border-white/[0.08] hover:border-[#C9A66B]/40 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-medium text-[#F2EEE7] group-hover:text-[#E0C28D]">
                    SOC Analyst
                  </div>
                  <div className="text-[11px] font-mono text-[#66636A] truncate mt-0.5">
                    analyst@rakshya.sec
                  </div>
                </button>
              </div>
            </div>

            {/* Footer links */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#96939A]">
              <Link to="/" className="hover:text-[#F2EEE7] transition-colors font-mono">
                ← Public Portal
              </Link>
              <Link to="/register" className="hover:text-[#E0C28D] transition-colors font-medium">
                Need an instance? <span className="text-[#C9A66B] font-semibold">Register</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
