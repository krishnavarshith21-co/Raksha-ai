import React, { Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Code2, ShieldCheck } from 'lucide-react';

const SecurityCore = React.lazy(() =>
  import('../components/three/SecurityCore').then(m => ({ default: m.SecurityCore }))
);

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-graphite-950 flex flex-col overflow-hidden relative">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-copper-500/[0.02] blur-[160px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-graphite-600/20 blur-[100px] rounded-full" />
      </div>

      {/* Navigation */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-20 flex items-center justify-between px-8 lg:px-16 py-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-graphite-800 border border-graphite-600 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-copper-400" />
          </div>
          <span className="font-semibold tracking-wider text-stone-50 text-sm">RAKSHYA</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/api-keys" className="px-3 py-1.5 text-[13px] text-graphite-200 hover:text-stone-50 transition-colors rounded-md hover:bg-graphite-800/50">
            Documentation
          </Link>
          <Link to="/login" className="px-3 py-1.5 text-[13px] text-graphite-200 hover:text-stone-50 transition-colors rounded-md hover:bg-graphite-800/50">
            Sign In
          </Link>
          <button
            onClick={() => navigate('/login')}
            className="ml-2 px-4 py-1.5 text-[13px] font-medium text-stone-50 bg-graphite-800 border border-graphite-600 rounded-md hover:border-graphite-500 hover:bg-graphite-700 transition-all"
          >
            Enter Console
          </button>
        </nav>
      </motion.header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-8 lg:px-16 py-12 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-xl"
            >
              <div className="eyebrow mb-5 text-graphite-300">
                Security Infrastructure for Autonomous Systems
              </div>

              <h1 className="text-4xl lg:text-[2.75rem] font-semibold text-stone-50 leading-[1.15] tracking-tight mb-6">
                Control what autonomous<br />systems are allowed to do.
              </h1>

              <p className="text-graphite-200 text-[15px] leading-relaxed mb-10 max-w-md">
                Rakshya evaluates AI-driven actions before execution, enforcing policy,
                permissions, risk controls and human oversight across enterprise systems.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-lg group"
                  style={{
                    background: 'linear-gradient(135deg, #242428, #2e2e33)',
                    borderColor: '#3d3d44',
                    color: '#f5f3ef',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  <span>Enter Security Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-lg text-graphite-200 hover:text-stone-50 border-graphite-700 hover:border-graphite-500"
                  style={{ background: 'transparent' }}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Enforcement</span>
                </button>

                <Link
                  to="/api-keys"
                  className="btn btn-lg text-graphite-300 hover:text-graphite-100"
                  style={{ background: 'transparent', border: 'none' }}
                >
                  <Code2 className="w-4 h-4" />
                  <span>View API</span>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="mt-14 pt-6 border-t border-graphite-800">
                <div className="flex items-center gap-8 text-[12px] text-graphite-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-green indicator-breathing" />
                    <span>Zero-Trust Enforcement</span>
                  </div>
                  <div>Policy-Based Control</div>
                  <div>Human-in-the-Loop</div>
                </div>
              </div>
            </motion.div>

            {/* Right: 3D Security Core */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="hidden lg:block"
            >
              <Suspense fallback={
                <div className="h-[500px] flex items-center justify-center">
                  <div className="loading-spinner" style={{ width: 32, height: 32 }} />
                </div>
              }>
                <SecurityCore size="lg" />
              </Suspense>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 px-8 lg:px-16 py-5 flex items-center justify-between text-[11px] text-graphite-400 font-mono"
      >
        <span>RAKSHYA v1.4.0</span>
        <span>Security Infrastructure for Autonomous Systems</span>
      </motion.footer>
    </div>
  );
};
