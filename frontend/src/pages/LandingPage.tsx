import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Eye,
  Scale,
  Gavel,
  BarChart3,
  Lock,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Code2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Terminal,
  FileSpreadsheet,
  Activity,
  Layers,
  Database,
  Radio,
} from 'lucide-react';

/* ── INTERACTIVE CANVAS: AUTONOMOUS SYSTEM PERIMETER ── */
const SecurityPerimeterCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const centerX = () => width / 2;
    const centerY = () => height / 2;

    // Rings representing Agents, Tools, Data, Infrastructure
    const rings = [
      { radius: 100, label: 'INFRASTRUCTURE', speed: 0.003, color: 'rgba(199, 164, 122, 0.25)' },
      { radius: 170, label: 'DATA RESOURCES', speed: -0.002, color: 'rgba(199, 164, 122, 0.20)' },
      { radius: 240, label: 'TOOL INTERFACES', speed: 0.0015, color: 'rgba(199, 164, 122, 0.15)' },
      { radius: 310, label: 'AUTONOMOUS AGENTS', speed: -0.001, color: 'rgba(199, 164, 122, 0.10)' },
    ];

    // Signals traveling along rings or traversing toward the core
    interface Signal {
      ringIndex: number;
      angle: number;
      radius: number;
      isThreat: boolean;
      status: 'evaluating' | 'allowed' | 'intercepted';
      speed: number;
      pulseSize: number;
    }

    const signals: Signal[] = [
      { ringIndex: 3, angle: 0.2, radius: 310, isThreat: false, status: 'allowed', speed: 0.008, pulseSize: 3.5 },
      { ringIndex: 2, angle: 1.8, radius: 240, isThreat: false, status: 'allowed', speed: 0.007, pulseSize: 3.5 },
      { ringIndex: 3, angle: 3.6, radius: 310, isThreat: true, status: 'intercepted', speed: 0.006, pulseSize: 4.5 },
      { ringIndex: 1, angle: 4.9, radius: 170, isThreat: false, status: 'allowed', speed: 0.009, pulseSize: 3 },
      { ringIndex: 2, angle: 5.8, radius: 240, isThreat: true, status: 'intercepted', speed: 0.005, pulseSize: 4.5 },
    ];

    let t = 0;

    const draw = () => {
      t += 0.015;
      ctx.clearRect(0, 0, width, height);
      const cx = centerX();
      const cy = centerY();

      // Ambient radial gradient behind core
      const glowGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 320);
      glowGrad.addColorStop(0, 'rgba(199, 164, 122, 0.04)');
      glowGrad.addColorStop(0.5, 'rgba(199, 164, 122, 0.01)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw concentric orbital rings
      rings.forEach((ring, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small orbital label
        ctx.fillStyle = 'rgba(140, 137, 130, 0.4)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        const labelAngle = t * ring.speed * 20 + idx * 1.5;
        const lx = cx + Math.cos(labelAngle) * ring.radius;
        const ly = cy + Math.sin(labelAngle) * ring.radius;
        ctx.fillText(ring.label, lx, ly);
      });

      // Central RAKSHYA Core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 48);
      coreGrad.addColorStop(0, 'rgba(199, 164, 122, 0.25)');
      coreGrad.addColorStop(0.8, 'rgba(23, 23, 26, 0.95)');
      coreGrad.addColorStop(1, 'rgba(38, 38, 43, 0.8)');
      ctx.beginPath();
      ctx.arc(cx, cy, 46, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(199, 164, 122, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Core pulsating ring
      const pulseR = 46 + Math.sin(t * 2) * 5;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(199, 164, 122, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Core Text
      ctx.fillStyle = '#F5F2EC';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('RAKSHYA', cx, cy - 4);
      ctx.fillStyle = 'rgba(199, 164, 122, 0.9)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText('ENFORCE', cx, cy + 9);

      // Animate and draw signals
      signals.forEach((sig) => {
        sig.angle += sig.speed;
        const sx = cx + Math.cos(sig.angle) * sig.radius;
        const sy = cy + Math.sin(sig.angle) * sig.radius;

        // Path line to core
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(cx, cy);
        if (sig.isThreat) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
        } else {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.10)';
        }
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Signal Point
        ctx.beginPath();
        ctx.arc(sx, sy, sig.pulseSize, 0, Math.PI * 2);
        if (sig.isThreat) {
          ctx.fillStyle = '#EF4444';
          ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = '#C7A47A';
          ctx.shadowColor = 'rgba(199, 164, 122, 0.6)';
          ctx.shadowBlur = 6;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Decision pill for signals near inspection boundary
        if (sig.isThreat) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.fillRect(sx + 8, sy - 10, 68, 16);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.strokeRect(sx + 8, sy - 10, 68, 16);
          ctx.fillStyle = '#EF4444';
          ctx.font = 'bold 8px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText('BLOCKED', sx + 14, sy + 1);
        } else if (sig.ringIndex === 1) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
          ctx.fillRect(sx + 8, sy - 10, 58, 16);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
          ctx.strokeRect(sx + 8, sy - 10, 58, 16);
          ctx.fillStyle = '#10B981';
          ctx.font = 'bold 8px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText('ALLOW', sx + 14, sy + 1);
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-[460px] sm:h-[540px] lg:h-[600px] flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};

/* ── LANDING PAGE COMPONENT ── */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'python' | 'typescript' | 'curl'>('python');
  const [copied, setCopied] = useState(false);
  const [pipelineScenario, setPipelineScenario] = useState<'safe' | 'threat'>('safe');
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection for blurred nav
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sdkCode = {
    python: `from rakshya import RakshyaClient, ActionContext

# Initialize inline defense gateway
rakshya = RakshyaClient(api_key="rk_live_9f82d1c3a07...")

# Intercept agent tool execution before runtime
decision = rakshya.evaluate(
    agent_id="agt_autonomous_sales_01",
    tool="crm.update_record",
    target_resource="salesforce/account/ACME-8902",
    payload={"deal_size": 250000, "status": "closed_won"},
    context=ActionContext(ip="10.240.0.8", trace_id="trc_9981a")
)

if decision.status == "ALLOW":
    execute_tool()
elif decision.status == "REQUIRE_APPROVAL":
    await_operator_sig(decision.approval_id)
else:
    raise SecurityInterceptionError(decision.reason)`,
    typescript: `import { RakshyaClient } from '@rakshya/sdk';

const rakshya = new RakshyaClient({
  apiKey: process.env.RAKSHYA_API_KEY!
});

// Intercept autonomous model execution inline
const decision = await rakshya.evaluate({
  agentId: 'agt_devops_remediation_bot',
  tool: 'cloud.terraform_apply',
  targetResource: 'aws/vpc/prod-core-east-1',
  payload: { destroyUnused: false, replicaCount: 4 },
  caller: { executionTier: 'autonomous', env: 'production' }
});

if (decision.status === 'BLOCKED') {
  console.error(\`[RAKSHYA INTERCEPTED]: \${decision.violation}\`);
  return;
}`,
    curl: `curl -X POST https://api.rakshya.internal/v1/actions/analyze \\
  -H "Authorization: Bearer rk_live_9f82d1c3a07..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "agt_support_triage_bot",
    "tool": "zendesk.export_tickets",
    "target_resource": "db/tickets/all_customers",
    "parameters": { "limit": 50000, "include_pii": true }
  }'`,
  };

  return (
    <div className="min-h-screen bg-graphite-950 text-stone-100 flex flex-col relative selection:bg-copper-500/20 selection:text-stone-50 overflow-x-hidden font-sans">
      {/* Subtle background ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-copper-500/[0.022] blur-[220px] rounded-full" />
        <div className="absolute top-[45%] right-[5%] w-[600px] h-[600px] bg-status-blue/[0.015] blur-[200px] rounded-full" />
        <div className="absolute bottom-[10%] left-[8%] w-[500px] h-[500px] bg-copper-500/[0.018] blur-[180px] rounded-full" />
      </div>

      {/* ── 1. GLOBAL NAVIGATION ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-graphite-950/85 backdrop-blur-md border-b border-graphite-750/70 py-3.5 shadow-2xl'
            : 'bg-transparent py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-8 h-8 rounded-lg bg-graphite-850 border border-graphite-700 group-hover:border-copper-500/50 flex items-center justify-center transition-all">
              <ShieldCheck className="w-4 h-4 text-copper-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg tracking-tight text-stone-100 font-medium">
                RAKSHYA
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-copper-500/80 hidden sm:inline">
                Security Core
              </span>
            </div>
          </Link>

          {/* Nav items */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-graphite-400">
            <a href="#control-plane" className="hover:text-stone-100 transition-colors">
              Platform
            </a>
            <a href="#pipeline" className="hover:text-stone-100 transition-colors">
              Enforcement
            </a>
            <a href="#threats" className="hover:text-stone-100 transition-colors">
              Interception
            </a>
            <a href="#sdk" className="hover:text-stone-100 transition-colors">
              Developers
            </a>
            <a href="#audit" className="hover:text-stone-100 transition-colors">
              Auditability
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3 py-1.5 text-xs text-graphite-300 hover:text-stone-100 transition-colors font-medium"
            >
              Sign In
            </Link>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-xs font-semibold text-graphite-950 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 rounded-md transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-copper-500/10"
            >
              <span>Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION (100vh) ── */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center pt-24 pb-16 px-6 lg:px-12 max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center flex-1 my-auto">
          {/* Left Hero Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-graphite-900 border border-graphite-750 text-[11px] font-mono text-graphite-300">
              <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
              <span>INLINE SECURITY GATEWAY • SUB-MILLISECOND LATENCY</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[4rem] text-stone-100 tracking-tight leading-[1.08]">
              Security infrastructure<br />
              <span className="text-copper-400">for autonomous systems.</span>
            </h1>

            <p className="text-base sm:text-lg text-graphite-300 max-w-xl leading-relaxed">
              RAKSHYA evaluates, enforces, and governs autonomous AI agent actions before they reach
              your internal tools, customer databases, and production infrastructure.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 text-sm font-semibold text-graphite-950 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 rounded-md transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-copper-500/15"
              >
                <span>Explore the platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#pipeline"
                className="px-5 py-3 text-sm font-medium text-stone-200 bg-graphite-850 hover:bg-graphite-800 border border-graphite-750 hover:border-graphite-600 rounded-md transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-copper-400" />
                <span>View architecture</span>
              </a>
            </div>

            {/* Trust highlights */}
            <div className="pt-8 border-t border-graphite-750/70 grid grid-cols-3 gap-4 text-xs font-mono text-graphite-400">
              <div>
                <div className="text-stone-200 font-medium">Zero-Trust Intercept</div>
                <div className="text-[11px] text-graphite-500 mt-0.5">Every tool call verified</div>
              </div>
              <div>
                <div className="text-stone-200 font-medium">HITL Governance</div>
                <div className="text-[11px] text-graphite-500 mt-0.5">Operator signature required</div>
              </div>
              <div>
                <div className="text-stone-200 font-medium">Immutable Audit</div>
                <div className="text-[11px] text-graphite-500 mt-0.5">Cryptographic trail</div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Autonomous Perimeter Canvas */}
          <div className="lg:col-span-6 relative flex justify-center">
            <SecurityPerimeterCanvas />
          </div>
        </div>

        {/* ── 3. HERO TELEMETRY BAR (Section 5) ── */}
        <div className="mt-8 pt-6 border-t border-graphite-750/80 grid grid-cols-2 sm:grid-cols-5 gap-4 bg-graphite-900/60 border border-graphite-750/60 rounded-lg p-4 backdrop-blur-sm">
          <div>
            <div className="text-[10px] font-mono text-graphite-500 uppercase tracking-wider">
              System Status
            </div>
            <div className="text-sm font-mono text-status-green flex items-center gap-1.5 mt-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
              <span>ONLINE</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-graphite-500 uppercase tracking-wider">
              Policy Engine
            </div>
            <div className="text-sm font-mono text-stone-200 mt-1 font-medium">ACTIVE</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-graphite-500 uppercase tracking-wider">
              Agents Monitored
            </div>
            <div className="text-sm font-mono text-stone-200 mt-1 font-medium">04 SYSTEM CORE</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-graphite-500 uppercase tracking-wider">
              Actions Evaluated
            </div>
            <div className="text-sm font-mono text-stone-200 mt-1 font-medium">1,248,930</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-graphite-500 uppercase tracking-wider">
              Threats Intercepted
            </div>
            <div className="text-sm font-mono text-status-red mt-1 font-medium">4,192 ENFORCED</div>
          </div>
        </div>
      </section>

      {/* ── 4. PRODUCT EXPLANATION (Section 6) ── */}
      <section id="control-plane" className="py-28 px-6 lg:px-12 border-t border-graphite-750/60 max-w-[1440px] mx-auto w-full">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-copper-400 mb-3">
            Core Control Plane
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 tracking-tight leading-tight">
            Autonomous systems need<br />
            a security control plane.
          </h2>
          <p className="text-sm sm:text-base text-graphite-400 mt-4 leading-relaxed">
            Without enforcement, autonomous agents act with unconstrained privileges. RAKSHYA
            establishes a deterministic boundary between agent reasoning and external tool execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 01 OBSERVE */}
          <div className="p-6 rounded-lg bg-graphite-900/40 border border-graphite-750 hover:border-graphite-600 transition-all group">
            <div className="text-xs font-mono text-copper-400/80 mb-4 font-semibold">01 / OBSERVE</div>
            <div className="w-10 h-10 rounded-md bg-graphite-850 border border-graphite-700 flex items-center justify-center mb-5 group-hover:border-copper-500/40 transition-colors">
              <Eye className="w-5 h-5 text-copper-400" />
            </div>
            <h3 className="text-base font-medium text-stone-100 mb-2">Capture Every Action</h3>
            <p className="text-xs text-graphite-400 leading-relaxed">
              Capture autonomous agent actions, tool calls, model inferences, SQL queries, and API
              destinations in flight.
            </p>
          </div>

          {/* 02 EVALUATE */}
          <div className="p-6 rounded-lg bg-graphite-900/40 border border-graphite-750 hover:border-graphite-600 transition-all group">
            <div className="text-xs font-mono text-copper-400/80 mb-4 font-semibold">02 / EVALUATE</div>
            <div className="w-10 h-10 rounded-md bg-graphite-850 border border-graphite-700 flex items-center justify-center mb-5 group-hover:border-copper-500/40 transition-colors">
              <Scale className="w-5 h-5 text-copper-400" />
            </div>
            <h3 className="text-base font-medium text-stone-100 mb-2">Deterministic Risk Engine</h3>
            <p className="text-xs text-graphite-400 leading-relaxed">
              Analyze behavioral patterns, data sensitivity (PII/keys), prompt injection signals, and
              policy context in sub-milliseconds.
            </p>
          </div>

          {/* 03 ENFORCE */}
          <div className="p-6 rounded-lg bg-graphite-900/40 border border-graphite-750 hover:border-graphite-600 transition-all group">
            <div className="text-xs font-mono text-copper-400/80 mb-4 font-semibold">03 / ENFORCE</div>
            <div className="w-10 h-10 rounded-md bg-graphite-850 border border-graphite-700 flex items-center justify-center mb-5 group-hover:border-copper-500/40 transition-colors">
              <Gavel className="w-5 h-5 text-copper-400" />
            </div>
            <h3 className="text-base font-medium text-stone-100 mb-2">Inline Gatekeeping</h3>
            <p className="text-xs text-graphite-400 leading-relaxed">
              Allow legitimate requests, instantly block hostile payloads, or mandate cryptographic
              human sign-off for critical operations.
            </p>
          </div>

          {/* 04 GOVERN */}
          <div className="p-6 rounded-lg bg-graphite-900/40 border border-graphite-750 hover:border-graphite-600 transition-all group">
            <div className="text-xs font-mono text-copper-400/80 mb-4 font-semibold">04 / GOVERN</div>
            <div className="w-10 h-10 rounded-md bg-graphite-850 border border-graphite-700 flex items-center justify-center mb-5 group-hover:border-copper-500/40 transition-colors">
              <BarChart3 className="w-5 h-5 text-copper-400" />
            </div>
            <h3 className="text-base font-medium text-stone-100 mb-2">Full Audit & Posture</h3>
            <p className="text-xs text-graphite-400 leading-relaxed">
              Maintain centralized policy controls, tool permission matrices, and tamper-evident
              audit trails for regulatory compliance.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. LIVE SECURITY VISUALIZATION (Section 7) ── */}
      <section id="pipeline" className="py-28 px-6 lg:px-12 border-t border-graphite-750/60 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.25em] text-copper-400 mb-3">
              Real-time Decision Pipeline
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 tracking-tight leading-tight">
              Every action becomes<br />
              a security decision.
            </h2>
          </div>

          {/* Pipeline Scenario Toggle */}
          <div className="flex items-center gap-2 p-1 rounded-lg bg-graphite-900 border border-graphite-750">
            <button
              onClick={() => setPipelineScenario('safe')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                pipelineScenario === 'safe'
                  ? 'bg-graphite-800 text-status-green border border-graphite-700'
                  : 'text-graphite-400 hover:text-stone-200'
              }`}
            >
              Legitimate Operation
            </button>
            <button
              onClick={() => setPipelineScenario('threat')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                pipelineScenario === 'threat'
                  ? 'bg-status-red/15 text-status-red border border-status-red/30'
                  : 'text-graphite-400 hover:text-stone-200'
              }`}
            >
              Hostile Interception
            </button>
          </div>
        </div>

        {/* Pipeline Animated Flow Box */}
        <div className="p-8 rounded-xl bg-graphite-900/60 border border-graphite-750 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Step 1: Agent Source */}
            <div className="p-5 rounded-lg bg-graphite-850 border border-graphite-700">
              <div className="text-[10px] font-mono text-graphite-400 uppercase tracking-wider mb-2">
                01 / INITIATOR
              </div>
              <div className="text-sm font-medium text-stone-100">
                {pipelineScenario === 'safe'
                  ? 'Autonomous Sales Assistant'
                  : 'Compromised Support Bot'}
              </div>
              <div className="text-xs font-mono text-copper-400/90 mt-2">
                {pipelineScenario === 'safe'
                  ? 'READ salesforce/account/ACME-8902'
                  : 'EXPORT customer_db/production/pii'}
              </div>
            </div>

            {/* Step 2: Risk Engine */}
            <div className="p-5 rounded-lg bg-graphite-850 border border-graphite-700">
              <div className="text-[10px] font-mono text-graphite-400 uppercase tracking-wider mb-2">
                02 / RISK ENGINE
              </div>
              <div className="text-sm font-medium text-stone-100">Behavioral Score</div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xl font-mono font-bold ${
                    pipelineScenario === 'safe' ? 'text-status-green' : 'text-status-red'
                  }`}
                >
                  {pipelineScenario === 'safe' ? '08 / 100' : '97 / 100'}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    pipelineScenario === 'safe'
                      ? 'bg-status-green/10 text-status-green border border-status-green/20'
                      : 'bg-status-red/10 text-status-red border border-status-red/20'
                  }`}
                >
                  {pipelineScenario === 'safe' ? 'LOW RISK' : 'CRITICAL'}
                </span>
              </div>
            </div>

            {/* Step 3: Policy Engine */}
            <div className="p-5 rounded-lg bg-graphite-850 border border-graphite-700">
              <div className="text-[10px] font-mono text-graphite-400 uppercase tracking-wider mb-2">
                03 / POLICY ENGINE
              </div>
              <div className="text-sm font-medium text-stone-100">Evaluated Rule</div>
              <div className="text-xs font-mono text-graphite-300 mt-2 truncate">
                {pipelineScenario === 'safe'
                  ? 'POL-01: CRM Standard Read'
                  : 'POL-09: Exfiltration Prevention'}
              </div>
            </div>

            {/* Step 4: Decision Result */}
            <div
              className={`p-5 rounded-lg border flex flex-col justify-between ${
                pipelineScenario === 'safe'
                  ? 'bg-status-green/5 border-status-green/30'
                  : 'bg-status-red/5 border-status-red/30'
              }`}
            >
              <div className="text-[10px] font-mono text-graphite-400 uppercase tracking-wider mb-2">
                04 / ENFORCEMENT
              </div>
              <div className="flex items-center gap-2">
                {pipelineScenario === 'safe' ? (
                  <CheckCircle2 className="w-5 h-5 text-status-green" />
                ) : (
                  <XCircle className="w-5 h-5 text-status-red" />
                )}
                <span
                  className={`text-lg font-mono font-bold ${
                    pipelineScenario === 'safe' ? 'text-status-green' : 'text-status-red'
                  }`}
                >
                  {pipelineScenario === 'safe' ? 'ALLOW' : 'BLOCKED'}
                </span>
              </div>
              <div className="text-[11px] font-mono text-graphite-400 mt-2">
                {pipelineScenario === 'safe'
                  ? 'Payload passed downstream (0.8ms)'
                  : 'Execution dropped & logged'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. THREAT INTERCEPTION SHOWCASE (Section 9) ── */}
      <section id="threats" className="py-28 px-6 lg:px-12 border-t border-graphite-750/60 max-w-[1440px] mx-auto w-full">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-copper-400 mb-3">
            Autonomous Threat Matrix
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 tracking-tight leading-tight">
            Threats specific to<br />
            autonomous execution.
          </h2>
          <p className="text-sm text-graphite-400 mt-4 leading-relaxed">
            Conventional web firewalls do not understand agent planning or multi-step tool calls.
            RAKSHYA neutralizes agent-native vulnerabilities inline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg bg-graphite-900/50 border border-graphite-750">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full bg-status-red" />
              <h3 className="text-base font-medium text-stone-100">Prompt Injection & Jailbreaks</h3>
            </div>
            <p className="text-xs text-graphite-400 leading-relaxed mb-4">
              Malicious input embedded in external emails or user docs tricking the model into
              violating instructions and calling restricted tools.
            </p>
            <div className="p-3 rounded bg-graphite-950 font-mono text-[11px] text-graphite-400 border border-graphite-800">
              <span className="text-status-red font-semibold">INTERCEPT:</span> Sanitizes injection vectors and overrides high-privilege prompt hijacking.
            </div>
          </div>

          <div className="p-6 rounded-lg bg-graphite-900/50 border border-graphite-750">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full bg-status-red" />
              <h3 className="text-base font-medium text-stone-100">Mass Data Exfiltration</h3>
            </div>
            <p className="text-xs text-graphite-400 leading-relaxed mb-4">
              Agents instructed to query sensitive internal tables and transmit records to external
              webhooks or unapproved endpoints.
            </p>
            <div className="p-3 rounded bg-graphite-950 font-mono text-[11px] text-graphite-400 border border-graphite-800">
              <span className="text-status-red font-semibold">INTERCEPT:</span> Enforces volume caps, egress blacklists, and real-time PII tokenization.
            </div>
          </div>

          <div className="p-6 rounded-lg bg-graphite-900/50 border border-graphite-750">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full bg-status-red" />
              <h3 className="text-base font-medium text-stone-100">Unconstrained Tool Invocation</h3>
            </div>
            <p className="text-xs text-graphite-400 leading-relaxed mb-4">
              Hallucinated or hijacked agents executing shell commands, dropping databases, or
              invoking unpermitted admin APIs.
            </p>
            <div className="p-3 rounded bg-graphite-950 font-mono text-[11px] text-graphite-400 border border-graphite-800">
              <span className="text-status-red font-semibold">INTERCEPT:</span> Tool-level RBAC restricting agents to strictly approved scopes.
            </div>
          </div>

          <div className="p-6 rounded-lg bg-graphite-900/50 border border-graphite-750">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 rounded-full bg-status-red" />
              <h3 className="text-base font-medium text-stone-100">Privilege Escalation Loops</h3>
            </div>
            <p className="text-xs text-graphite-400 leading-relaxed mb-4">
              Multi-agent swarms delegating tasks back and forth to bypass individual agent
              permission boundaries.
            </p>
            <div className="p-3 rounded bg-graphite-950 font-mono text-[11px] text-graphite-400 border border-graphite-800">
              <span className="text-status-red font-semibold">INTERCEPT:</span> Global execution tracing binds parent-child token lineages across swarms.
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. HUMAN-IN-THE-LOOP (Section 10) ── */}
      <section className="py-28 px-6 lg:px-12 border-t border-graphite-750/60 max-w-[1440px] mx-auto w-full">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-copper-400 mb-3">
            Governance Flow
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 tracking-tight leading-tight">
            Autonomy does not mean<br />
            uncontrolled execution.
          </h2>
          <p className="text-sm text-graphite-400 mt-4 leading-relaxed">
            When high-stakes actions exceed safe risk thresholds, RAKSHYA pauses execution and
            dispatches a cryptographic authorization request to authorized security operators.
          </p>
        </div>

        <div className="p-8 rounded-xl bg-graphite-900/50 border border-graphite-750">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center lg:text-left">
              <div className="text-[10px] font-mono text-graphite-500 uppercase">STEP 1</div>
              <div className="text-sm font-medium text-stone-100">Agent Requests Tool</div>
              <div className="text-xs font-mono text-copper-400">stripe.transfer($84,000)</div>
            </div>

            <ChevronRight className="w-4 h-4 text-graphite-600 hidden lg:block" />

            <div className="space-y-1 text-center lg:text-left">
              <div className="text-[10px] font-mono text-graphite-500 uppercase">STEP 2</div>
              <div className="text-sm font-medium text-stone-100">Risk Assessment</div>
              <div className="text-xs font-mono text-copper-400">Score 76 (High Impact)</div>
            </div>

            <ChevronRight className="w-4 h-4 text-graphite-600 hidden lg:block" />

            <div className="space-y-1 text-center lg:text-left">
              <div className="text-[10px] font-mono text-graphite-500 uppercase">STEP 3</div>
              <div className="text-sm font-medium text-stone-100">Escalation Trigger</div>
              <div className="text-xs font-mono text-status-yellow">REQUIRE_APPROVAL</div>
            </div>

            <ChevronRight className="w-4 h-4 text-graphite-600 hidden lg:block" />

            <div className="p-4 rounded-lg bg-graphite-850 border border-copper-500/30 flex items-center gap-3">
              <div>
                <div className="text-xs font-medium text-stone-100">Security Operator Sign-off</div>
                <div className="text-[10px] font-mono text-graphite-400">MFA Signed Cryptographically</div>
              </div>
              <span className="px-2 py-1 rounded text-[10px] font-mono bg-copper-500/15 text-copper-400 border border-copper-500/30">
                APPROVED
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. DEVELOPER EXPERIENCE & SDK (Section 13) ── */}
      <section id="sdk" className="py-28 px-6 lg:px-12 border-t border-graphite-750/60 max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-mono uppercase tracking-[0.25em] text-copper-400">
              Integration Layer
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 tracking-tight leading-tight">
              One security layer.<br />
              Any autonomous system.
            </h2>
            <p className="text-sm text-graphite-400 leading-relaxed">
              Drop RAKSHYA into your Python, LangChain, CrewAI, AutoGen, or custom agent loop with a
              single wrapper. No architecture overhaul required.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-graphite-300">
                <Check className="w-4 h-4 text-copper-400" />
                <span>Deterministic evaluation in &lt; 1 millisecond</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-graphite-300">
                <Check className="w-4 h-4 text-copper-400" />
                <span>Zero telemetry lock-in: Export to SIEM via OpenTelemetry</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-graphite-300">
                <Check className="w-4 h-4 text-copper-400" />
                <span>Async polling or blocking approval suspension</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/api-keys"
                className="inline-flex items-center gap-2 text-xs font-mono text-copper-400 hover:text-copper-300 font-semibold"
              >
                <span>Generate production credentials in console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Code Display */}
          <div className="lg:col-span-7">
            <div className="rounded-xl bg-graphite-900 border border-graphite-750 shadow-2xl overflow-hidden">
              {/* Header with tabs */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-graphite-750/80 bg-graphite-950/80">
                <div className="flex items-center gap-1.5">
                  {(['python', 'typescript', 'curl'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveTab(lang)}
                      className={`px-3 py-1 rounded text-xs font-mono uppercase transition-colors ${
                        activeTab === lang
                          ? 'bg-graphite-800 text-stone-100 font-medium'
                          : 'text-graphite-400 hover:text-stone-300'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleCopyCode(sdkCode[activeTab])}
                  className="flex items-center gap-1 text-[11px] font-mono text-graphite-400 hover:text-stone-200 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-status-green" />
                      <span className="text-status-green">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Pre */}
              <pre className="p-5 font-mono text-xs text-stone-200 overflow-x-auto leading-relaxed bg-graphite-950/60 selection:bg-copper-500/30">
                <code>{sdkCode[activeTab]}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. AUDIT TRAIL STREAM (Section 14) ── */}
      <section id="audit" className="py-28 px-6 lg:px-12 border-t border-graphite-750/60 max-w-[1440px] mx-auto w-full">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-copper-400 mb-3">
            Immutable Audit Trail
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 tracking-tight leading-tight">
            Every decision leaves<br />
            an auditable trail.
          </h2>
          <p className="text-sm text-graphite-400 mt-4 leading-relaxed">
            All agent operations, policy evaluations, and operator approvals are cryptographically
            hashed into an append-only audit stream.
          </p>
        </div>

        <div className="border border-graphite-750 rounded-xl bg-graphite-900/40 divide-y divide-graphite-800 font-mono text-xs">
          <div className="p-4 flex items-center justify-between text-graphite-400 hover:bg-graphite-850/40 transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-status-red" />
              <span className="text-status-red font-semibold">THREAT_INTERCEPTED</span>
              <span className="text-stone-200">bash_exec("rm -rf /var/data")</span>
            </div>
            <div className="flex items-center gap-4 text-graphite-500 text-[11px]">
              <span>agt_devops_bot</span>
              <span>sha256:4f8e...901b</span>
              <span>JUST NOW</span>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between text-graphite-400 hover:bg-graphite-850/40 transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-copper-400" />
              <span className="text-copper-400 font-semibold">POLICY_ENFORCED</span>
              <span className="text-stone-200">POL-04: Production PII Masking Applied</span>
            </div>
            <div className="flex items-center gap-4 text-graphite-500 text-[11px]">
              <span>agt_finance_bot</span>
              <span>sha256:77a1...8cb3</span>
              <span>2m AGO</span>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between text-graphite-400 hover:bg-graphite-850/40 transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
              <span className="text-status-green font-semibold">OPERATOR_APPROVAL</span>
              <span className="text-stone-200">HITL Approval Granted: Deploy Cloud Replica</span>
            </div>
            <div className="flex items-center gap-4 text-graphite-500 text-[11px]">
              <span>op_sec_admin</span>
              <span>sha256:d904...12fe</span>
              <span>12m AGO</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. FINAL CINEMATIC CTA (Section 15) ── */}
      <section className="py-32 px-6 lg:px-12 border-t border-graphite-750/70 relative z-10 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-copper-400">
            Enterprise Security Infrastructure
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-stone-100 tracking-tight leading-tight">
            Control what<br />
            autonomous systems can do.
          </h2>

          <p className="text-base sm:text-lg text-graphite-300 max-w-xl mx-auto leading-relaxed">
            Deploy the RAKSHYA inline protection gateway today. Protect corporate resources from
            unconstrained agent behavior.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-7 py-3.5 text-sm font-semibold text-graphite-950 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-400 hover:to-copper-500 rounded-md transition-all cursor-pointer flex items-center gap-2 shadow-xl shadow-copper-500/20"
            >
              <span>Explore RAKSHYA</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/api-keys"
              className="px-6 py-3.5 text-sm font-medium text-stone-200 bg-graphite-850 hover:bg-graphite-800 border border-graphite-750 hover:border-graphite-600 rounded-md transition-all flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 text-copper-400" />
              <span>Developer Documentation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 11. ENTERPRISE FOOTER ── */}
      <footer className="py-8 px-6 lg:px-12 border-t border-graphite-750/60 bg-graphite-950 text-xs font-mono text-graphite-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif text-stone-300 font-medium">RAKSHYA</span>
            <span className="text-graphite-700">|</span>
            <span>Security Infrastructure for Autonomous Systems</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-status-green flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
              GLOBAL CLUSTER ONLINE
            </span>
            <span>SOC2 TYPE II READY</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
