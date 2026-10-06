import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Code2, ShieldCheck, CheckCircle2, Cpu, Lock, Radio } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-graphite-950 flex flex-col justify-between overflow-hidden relative selection:bg-copper-500/20 selection:text-stone-50">
      {/* Precision ambient background lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-copper-500/[0.025] blur-[150px] rounded-full" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-status-blue/[0.015] blur-[100px] rounded-full" />
      </div>

      {/* Ultra-clean Header */}
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-graphite-750/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-graphite-850 border border-graphite-750 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-copper-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-[0.2em] text-stone-100 font-medium">
              RAKSHYA
            </span>
            <span className="text-[10px] font-mono text-copper-400/80 px-1.5 py-0.5 rounded bg-graphite-900 border border-graphite-750">
              DEFENSE LAYER
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            to="/api-keys"
            className="hidden sm:inline-flex px-3 py-1.5 text-xs text-graphite-400 hover:text-stone-100 transition-colors font-mono"
          >
            API & SDK
          </Link>
          <Link
            to="/login"
            className="px-3 py-1.5 text-xs text-graphite-400 hover:text-stone-100 transition-colors"
          >
            Sign In
          </Link>
          <button
            onClick={() => navigate('/login')}
            className="px-3.5 py-1.5 text-xs font-medium text-graphite-950 bg-copper-500 hover:bg-copper-400 rounded-md transition-colors cursor-pointer shadow-sm"
          >
            Launch Console
          </button>
        </nav>
      </motion.header>

      {/* Main Hero */}
      <main className="relative z-10 flex-1 flex items-center py-12 lg:py-20">
        <div className="w-full max-w-[1360px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Product Value */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-7 max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-graphite-900 border border-graphite-750 text-[11px] font-mono text-graphite-300 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
                <span>INLINE AI GATEWAY • ZERO LATENCY OVERHEAD</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-medium text-stone-100 leading-[1.2] tracking-tight mb-5">
                Deterministic security infrastructure for autonomous systems.
              </h1>

              <p className="text-graphite-300 text-sm leading-relaxed mb-8 max-w-xl">
                RAKSHYA intercepts tool calls, agent execution graphs, and model actions before runtime
                execution. Enforce granular permissions, evaluate risk with sub-millisecond precision, and
                mandate cryptographic approvals.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-graphite-950 bg-copper-500 hover:bg-copper-400 rounded-md transition-colors cursor-pointer shadow-sm"
                >
                  <span>Enter Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-stone-200 bg-graphite-850 hover:bg-graphite-800 border border-graphite-750 hover:border-graphite-700 rounded-md transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-graphite-400" />
                  <span>Enforcement Specs</span>
                </button>

                <Link
                  to="/api-keys"
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs text-graphite-400 hover:text-stone-200 transition-colors font-mono"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Python / Node SDK</span>
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="mt-12 pt-6 border-t border-graphite-750/70">
                <div className="grid grid-cols-3 gap-4 text-xs font-mono text-graphite-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-copper-400 shrink-0" />
                    <span>Real-time Interception</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-copper-400 shrink-0" />
                    <span>Human-in-the-Loop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-copper-400 shrink-0" />
                    <span>Granular Tool RBAC</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Restrained Aerospace Telemetry Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="bg-graphite-850 border border-graphite-750 rounded-lg p-5 shadow-2xl relative">
                {/* Panel Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-graphite-750">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-status-green" />
                    <span className="text-[11px] font-mono text-stone-200 uppercase tracking-wider">
                      Enforcement Kernel
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-graphite-400 px-1.5 py-0.5 rounded bg-graphite-900 border border-graphite-750">
                    LATENCY 0.8ms
                  </span>
                </div>

                {/* Telemetry rows simulating live stream */}
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-3 rounded bg-graphite-900 border border-graphite-750 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-stone-200 font-medium">agent.code-writer.exec</div>
                      <div className="text-[10px] text-graphite-500 mt-0.5">tool: bash_exec("rm -rf /")</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-status-red/10 text-status-red border border-status-red/25">
                      BLOCKED
                    </span>
                  </div>

                  <div className="p-3 rounded bg-graphite-900 border border-graphite-750 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-stone-200 font-medium">agent.finance-bot.transfer</div>
                      <div className="text-[10px] text-graphite-500 mt-0.5">tool: stripe.payout($84,000)</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-status-yellow/10 text-status-yellow border border-status-yellow/25">
                      ESCALATED
                    </span>
                  </div>

                  <div className="p-3 rounded bg-graphite-900 border border-graphite-750 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-stone-200 font-medium">agent.rag-analyst.query</div>
                      <div className="text-[10px] text-graphite-500 mt-0.5">tool: pg_vector.search(kb_id)</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-status-green/10 text-status-green border border-status-green/25">
                      ALLOWED
                    </span>
                  </div>
                </div>

                {/* Micro Metric Footer */}
                <div className="mt-4 pt-3 border-t border-graphite-750/70 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] font-mono text-graphite-400">DECISIONS</div>
                    <div className="text-sm font-mono font-medium text-stone-100 mt-0.5">1,248,930</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-graphite-400">PREVENTED</div>
                    <div className="text-sm font-mono font-medium text-status-red mt-0.5">4,192</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-graphite-400">UPTIME</div>
                    <div className="text-sm font-mono font-medium text-status-green mt-0.5">99.998%</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-4 border-t border-graphite-750/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-graphite-400 font-mono">
        <span>RAKSHYA ENTERPRISE SECURITY PLATFORM</span>
        <span>ZERO TRUST DEFENSE FOR AUTONOMOUS AGENTS</span>
      </footer>
    </div>
  );
};
