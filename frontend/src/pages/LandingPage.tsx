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

/* ── HIGH-END ORBITAL SECURITY ENFORCEMENT CANVAS ──
   Visually communicates:
   AUTONOMOUS AGENT → RAKSHYA ENFORCEMENT CORE → TOOLS / APIs / DATA → ALLOW / BLOCK / HUMAN APPROVAL
*/
const SecurityPerimeterCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 620);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const centerX = () => width / 2;
    const centerY = () => height / 2;

    // Concentric architectural orbits
    const orbits = [
      { radius: 110, label: '03 / TOOLS & APIs', speed: 0.002, strokeColor: 'rgba(255, 255, 255, 0.08)' },
      { radius: 185, label: '02 / POLICY ENGINE', speed: -0.0015, strokeColor: 'rgba(201, 166, 107, 0.22)' },
      { radius: 265, label: '01 / AUTONOMOUS AGENTS', speed: 0.001, strokeColor: 'rgba(255, 255, 255, 0.06)' },
    ];

    interface TelemetrySignal {
      orbitIndex: number;
      angle: number;
      radius: number;
      type: 'allow' | 'threat' | 'approval';
      speed: number;
      label: string;
    }

    const signals: TelemetrySignal[] = [
      { orbitIndex: 2, angle: 0.4, radius: 265, type: 'allow', speed: 0.006, label: 'ALLOW' },
      { orbitIndex: 1, angle: 1.9, radius: 185, type: 'threat', speed: 0.005, label: 'BLOCK' },
      { orbitIndex: 2, angle: 3.5, radius: 265, type: 'approval', speed: 0.004, label: 'APPROVAL' },
      { orbitIndex: 0, angle: 4.8, radius: 110, type: 'allow', speed: 0.007, label: 'ALLOW' },
      { orbitIndex: 1, angle: 5.7, radius: 185, type: 'threat', speed: 0.005, label: 'BLOCK' },
    ];

    let t = 0;

    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, width, height);
      const cx = centerX();
      const cy = centerY();

      // Soft ambient core radial glow
      const glowGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 280);
      glowGrad.addColorStop(0, 'rgba(201, 166, 107, 0.05)');
      glowGrad.addColorStop(0.5, 'rgba(201, 166, 107, 0.015)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw orbital rings
      orbits.forEach((orb) => {
        ctx.beginPath();
        ctx.arc(cx, cy, orb.radius, 0, Math.PI * 2);
        ctx.strokeStyle = orb.strokeColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label on orbit
        ctx.fillStyle = 'rgba(150, 147, 154, 0.45)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        const angle = t * orb.speed * 18;
        const lx = cx + Math.cos(angle) * orb.radius;
        const ly = cy + Math.sin(angle) * orb.radius;
        ctx.fillText(orb.label, lx, ly - 4);
      });

      // Central RAKSHYA Enforcement Core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 54);
      coreGrad.addColorStop(0, 'rgba(201, 166, 107, 0.28)');
      coreGrad.addColorStop(0.7, 'rgba(20, 20, 21, 0.98)');
      coreGrad.addColorStop(1, 'rgba(11, 11, 12, 0.9)');
      ctx.beginPath();
      ctx.arc(cx, cy, 52, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(201, 166, 107, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pulsating containment border
      const pulseR = 52 + Math.sin(t * 2) * 4;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(201, 166, 107, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Core Label
      ctx.fillStyle = '#F2EEE7';
      ctx.font = '600 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('RAKSHYA', cx, cy - 4);
      ctx.fillStyle = '#E0C28D';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('CORE GATEWAY', cx, cy + 11);

      // Signals & Decision Indicators
      signals.forEach((sig) => {
        sig.angle += sig.speed;
        const sx = cx + Math.cos(sig.angle) * sig.radius;
        const sy = cy + Math.sin(sig.angle) * sig.radius;

        // Path line connecting signal to core
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(cx, cy);
        if (sig.type === 'threat') {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.16)';
        } else if (sig.type === 'approval') {
          ctx.strokeStyle = 'rgba(201, 166, 107, 0.18)';
        } else {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.14)';
        }
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Signal Node
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        if (sig.type === 'threat') {
          ctx.fillStyle = '#EF4444';
          ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
        } else if (sig.type === 'approval') {
          ctx.fillStyle = '#C9A66B';
          ctx.shadowColor = 'rgba(201, 166, 107, 0.8)';
        } else {
          ctx.fillStyle = '#10B981';
          ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
        }
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Decision Badge Tag
        const badgeWidth = sig.type === 'approval' ? 76 : 58;
        ctx.fillStyle =
          sig.type === 'threat'
            ? 'rgba(239, 68, 68, 0.15)'
            : sig.type === 'approval'
            ? 'rgba(201, 166, 107, 0.15)'
            : 'rgba(16, 185, 129, 0.15)';
        ctx.fillRect(sx + 10, sy - 10, badgeWidth, 18);
        ctx.strokeStyle =
          sig.type === 'threat'
            ? 'rgba(239, 68, 68, 0.45)'
            : sig.type === 'approval'
            ? 'rgba(201, 166, 107, 0.45)'
            : 'rgba(16, 185, 129, 0.45)';
        ctx.strokeRect(sx + 10, sy - 10, badgeWidth, 18);

        ctx.fillStyle =
          sig.type === 'threat'
            ? '#EF4444'
            : sig.type === 'approval'
            ? '#E0C28D'
            : '#10B981';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(sig.label, sx + 16, sy + 3);
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
    <div className="relative w-full h-[520px] sm:h-[600px] flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};

/* ── PUBLIC LANDING PAGE ── */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'python' | 'typescript' | 'curl'>('python');
  const [copied, setCopied] = useState(false);
  const [pipelineScenario, setPipelineScenario] = useState<'safe' | 'threat'>('safe');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
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

# Connect to inline protection gateway
rakshya = RakshyaClient(api_key="rk_live_9f82d1c3a07...")

# Intercept autonomous agent tool execution before runtime
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
    <div className="min-h-screen bg-[#070707] text-[#F2EEE7] flex flex-col relative selection:bg-[#C9A66B]/20 selection:text-[#F2EEE7] overflow-x-hidden font-sans">
      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[6%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[#C9A66B]/[0.025] blur-[220px] rounded-full" />
        <div className="absolute top-[40%] right-[6%] w-[650px] h-[650px] bg-blue-500/[0.015] blur-[220px] rounded-full" />
        <div className="absolute bottom-[10%] left-[8%] w-[550px] h-[550px] bg-[#C9A66B]/[0.02] blur-[200px] rounded-full" />
      </div>

      {/* ── 1. GLOBAL NAVIGATION ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0B0B0C]/90 backdrop-blur-md border-b border-white/[0.08] py-4 shadow-2xl'
            : 'bg-transparent py-6 border-b border-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3.5 group focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-[#141415] border border-white/10 group-hover:border-[#C9A66B]/50 flex items-center justify-center transition-all shadow-md shadow-black/50">
              <ShieldCheck className="w-5 h-5 text-[#C9A66B]" />
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="font-serif text-xl tracking-tight text-[#F2EEE7] font-medium">
                RAKSHYA
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#C9A66B] hidden sm:inline">
                Security Core
              </span>
            </div>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#96939A]">
            <a href="#control-plane" className="hover:text-[#F2EEE7] transition-colors">
              Platform
            </a>
            <a href="#pipeline" className="hover:text-[#F2EEE7] transition-colors">
              Enforcement Pipeline
            </a>
            <a href="#threats" className="hover:text-[#F2EEE7] transition-colors">
              Interception Matrix
            </a>
            <a href="#sdk" className="hover:text-[#F2EEE7] transition-colors">
              Developers
            </a>
            <a href="#audit" className="hover:text-[#F2EEE7] transition-colors">
              Auditability
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3.5">
            <Link
              to="/login"
              className="px-4 py-2 text-[14px] text-[#96939A] hover:text-[#F2EEE7] transition-colors font-medium"
            >
              Sign In
            </Link>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-gold px-5 py-2.5 rounded-xl text-[14px] font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#C9A66B]/15"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION ── */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center pt-28 pb-16 px-6 lg:px-12 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center flex-1 my-auto">
          {/* Left Hero Narrative */}
          <div className="lg:col-span-6 space-y-7">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#101011] border border-white/[0.08] text-xs font-mono text-[#E0C28D]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>INLINE SECURITY GATEWAY • DETERMINISTIC POLICY ENFORCEMENT</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[64px] text-[#F2EEE7] tracking-tight leading-[1.06]">
              Security infrastructure<br />
              <span className="text-[#E0C28D]">for autonomous systems.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#96939A] max-w-xl leading-relaxed">
              RAKSHYA evaluates, enforces, and governs autonomous AI agent actions before they reach
              your internal tools, customer databases, and production infrastructure.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-gold px-7 py-3.5 text-[15px] font-semibold rounded-xl flex items-center gap-2.5 cursor-pointer shadow-xl shadow-[#C9A66B]/20"
              >
                <span>Explore the platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#pipeline"
                className="px-6 py-3.5 text-[15px] font-medium text-[#F2EEE7] bg-[#141415] hover:bg-[#1A1A1C] border border-white/10 hover:border-white/20 rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Layers className="w-4 h-4 text-[#C9A66B]" />
                <span>View architecture</span>
              </a>
            </div>

            {/* Architecture Highlights */}
            <div className="pt-8 border-t border-white/[0.08] grid grid-cols-3 gap-6 text-xs font-mono text-[#96939A]">
              <div>
                <div className="text-[#F2EEE7] text-sm font-medium">Zero-Trust Intercept</div>
                <div className="text-[12px] text-[#66636A] mt-1">Every tool call verified</div>
              </div>
              <div>
                <div className="text-[#F2EEE7] text-sm font-medium">HITL Governance</div>
                <div className="text-[12px] text-[#66636A] mt-1">Operator signature required</div>
              </div>
              <div>
                <div className="text-[#F2EEE7] text-sm font-medium">Immutable Audit</div>
                <div className="text-[12px] text-[#66636A] mt-1">Cryptographic trail</div>
              </div>
            </div>
          </div>

          {/* Right Hero Visualizer */}
          <div className="lg:col-span-6 relative flex justify-center">
            <SecurityPerimeterCanvas />
          </div>
        </div>

        {/* ── 3. HERO TELEMETRY BAR (Explicitly labeled SIMULATION TELEMETRY) ── */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-5 gap-6 surface-card p-6 rounded-xl">
          <div>
            <div className="text-[11px] font-mono text-[#66636A] uppercase tracking-wider">
              System Gateway
            </div>
            <div className="text-[15px] font-mono text-emerald-400 flex items-center gap-2 mt-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>ONLINE</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#66636A] uppercase tracking-wider">
              Enforcement Mode
            </div>
            <div className="text-[15px] font-mono text-[#F2EEE7] mt-1.5 font-medium">STRICT ZERO-TRUST</div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#66636A] uppercase tracking-wider">
              Governed Agents
            </div>
            <div className="text-[15px] font-mono text-[#F2EEE7] mt-1.5 font-medium">04 INVENTORIED</div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#66636A] uppercase tracking-wider">
              Evaluation Model
            </div>
            <div className="text-[15px] font-mono text-[#E0C28D] mt-1.5 font-medium">HEURISTIC + BEHAVIORAL</div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#66636A] uppercase tracking-wider">
              Environment
            </div>
            <div className="text-[15px] font-mono text-[#C9A66B] mt-1.5 font-semibold">DEMO TELEMETRY</div>
          </div>
        </div>
      </section>

      {/* ── 4. PRODUCT EXPLANATION: CONTROL PLANE ── */}
      <section id="control-plane" className="py-32 px-6 lg:px-12 border-t border-white/[0.08] max-w-[1600px] mx-auto w-full">
        <div className="max-w-2xl mb-18">
          <div className="text-xs font-mono uppercase tracking-[0.24em] text-[#C9A66B] mb-3 font-semibold">
            Architectural Control Plane
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl text-[#F2EEE7] tracking-tight leading-tight">
            Autonomous systems need<br />
            a security control plane.
          </h2>
          <p className="text-base text-[#96939A] mt-5 leading-relaxed">
            Without enforcement, autonomous agents act with unconstrained privileges. RAKSHYA
            establishes a deterministic boundary between agent reasoning and external tool execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 01 OBSERVE */}
          <div className="p-8 rounded-2xl surface-card surface-card-hover group">
            <div className="text-xs font-mono text-[#C9A66B] mb-4 font-semibold">01 / OBSERVE</div>
            <div className="w-12 h-12 rounded-xl bg-[#141415] border border-white/10 flex items-center justify-center mb-6 group-hover:border-[#C9A66B]/40 transition-colors">
              <Eye className="w-6 h-6 text-[#C9A66B]" />
            </div>
            <h3 className="text-lg font-medium text-[#F2EEE7] mb-2.5">Capture Every Action</h3>
            <p className="text-[14px] text-[#96939A] leading-relaxed">
              Capture autonomous agent actions, tool calls, model inferences, SQL queries, and API
              destinations in flight.
            </p>
          </div>

          {/* 02 EVALUATE */}
          <div className="p-8 rounded-2xl surface-card surface-card-hover group">
            <div className="text-xs font-mono text-[#C9A66B] mb-4 font-semibold">02 / EVALUATE</div>
            <div className="w-12 h-12 rounded-xl bg-[#141415] border border-white/10 flex items-center justify-center mb-6 group-hover:border-[#C9A66B]/40 transition-colors">
              <Scale className="w-6 h-6 text-[#C9A66B]" />
            </div>
            <h3 className="text-lg font-medium text-[#F2EEE7] mb-2.5">Deterministic Risk Engine</h3>
            <p className="text-[14px] text-[#96939A] leading-relaxed">
              Analyze behavioral patterns, data sensitivity (PII/keys), prompt injection signals, and
              policy context in sub-milliseconds.
            </p>
          </div>

          {/* 03 ENFORCE */}
          <div className="p-8 rounded-2xl surface-card surface-card-hover group">
            <div className="text-xs font-mono text-[#C9A66B] mb-4 font-semibold">03 / ENFORCE</div>
            <div className="w-12 h-12 rounded-xl bg-[#141415] border border-white/10 flex items-center justify-center mb-6 group-hover:border-[#C9A66B]/40 transition-colors">
              <Gavel className="w-6 h-6 text-[#C9A66B]" />
            </div>
            <h3 className="text-lg font-medium text-[#F2EEE7] mb-2.5">Inline Gatekeeping</h3>
            <p className="text-[14px] text-[#96939A] leading-relaxed">
              Allow legitimate requests, instantly block hostile payloads, or mandate cryptographic
              human sign-off for critical operations.
            </p>
          </div>

          {/* 04 GOVERN */}
          <div className="p-8 rounded-2xl surface-card surface-card-hover group">
            <div className="text-xs font-mono text-[#C9A66B] mb-4 font-semibold">04 / GOVERN</div>
            <div className="w-12 h-12 rounded-xl bg-[#141415] border border-white/10 flex items-center justify-center mb-6 group-hover:border-[#C9A66B]/40 transition-colors">
              <BarChart3 className="w-6 h-6 text-[#C9A66B]" />
            </div>
            <h3 className="text-lg font-medium text-[#F2EEE7] mb-2.5">Full Audit & Posture</h3>
            <p className="text-[14px] text-[#96939A] leading-relaxed">
              Maintain centralized policy controls, tool permission matrices, and tamper-evident
              audit trails for regulatory compliance.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. LIVE SECURITY VISUALIZATION (Pipeline) ── */}
      <section id="pipeline" className="py-32 px-6 lg:px-12 border-t border-white/[0.08] max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.24em] text-[#C9A66B] mb-3 font-semibold">
              Real-time Decision Pipeline
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl text-[#F2EEE7] tracking-tight leading-tight">
              Every action becomes<br />
              a security decision.
            </h2>
          </div>

          {/* Pipeline Scenario Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#101011] border border-white/10">
            <button
              onClick={() => setPipelineScenario('safe')}
              className={`px-4 py-2 text-xs font-mono rounded-lg transition-all ${
                pipelineScenario === 'safe'
                  ? 'bg-[#141415] text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-[#96939A] hover:text-[#F2EEE7]'
              }`}
            >
              Legitimate Operation
            </button>
            <button
              onClick={() => setPipelineScenario('threat')}
              className={`px-4 py-2 text-xs font-mono rounded-lg transition-all ${
                pipelineScenario === 'threat'
                  ? 'bg-red-500/15 text-red-400 border border-red-500/35 shadow-sm'
                  : 'text-[#96939A] hover:text-[#F2EEE7]'
              }`}
            >
              Hostile Interception
            </button>
          </div>
        </div>

        {/* Pipeline Animated Flow Box */}
        <div className="p-8 sm:p-10 rounded-2xl surface-card shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Step 1: Initiator */}
            <div className="p-6 rounded-xl bg-[#141415] border border-white/10">
              <div className="text-[11px] font-mono text-[#66636A] uppercase tracking-wider mb-2 font-medium">
                01 / INITIATOR
              </div>
              <div className="text-base font-medium text-[#F2EEE7]">
                {pipelineScenario === 'safe'
                  ? 'Autonomous Sales Assistant'
                  : 'Compromised Support Bot'}
              </div>
              <div className="text-[13px] font-mono text-[#E0C28D] mt-2.5">
                {pipelineScenario === 'safe'
                  ? 'READ salesforce/account/ACME-8902'
                  : 'EXPORT customer_db/production/pii'}
              </div>
            </div>

            {/* Step 2: Risk Engine */}
            <div className="p-6 rounded-xl bg-[#141415] border border-white/10">
              <div className="text-[11px] font-mono text-[#66636A] uppercase tracking-wider mb-2 font-medium">
                02 / RISK ENGINE
              </div>
              <div className="text-base font-medium text-[#F2EEE7]">Behavioral Score</div>
              <div className="flex items-center gap-3 mt-2.5">
                <span
                  className={`text-2xl font-mono font-bold ${
                    pipelineScenario === 'safe' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {pipelineScenario === 'safe' ? '08 / 100' : '97 / 100'}
                </span>
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded border uppercase font-semibold ${
                    pipelineScenario === 'safe'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border-red-500/40'
                  }`}
                >
                  {pipelineScenario === 'safe' ? 'LOW RISK' : 'CRITICAL'}
                </span>
              </div>
            </div>

            {/* Step 3: Policy Engine */}
            <div className="p-6 rounded-xl bg-[#141415] border border-white/10">
              <div className="text-[11px] font-mono text-[#66636A] uppercase tracking-wider mb-2 font-medium">
                03 / POLICY ENGINE
              </div>
              <div className="text-base font-medium text-[#F2EEE7]">Evaluated Rule</div>
              <div className="text-[13px] font-mono text-[#D8D4CC] mt-2.5 truncate">
                {pipelineScenario === 'safe'
                  ? 'POL-01: CRM Standard Read'
                  : 'POL-09: Exfiltration Prevention'}
              </div>
            </div>

            {/* Step 4: Decision Result */}
            <div
              className={`p-6 rounded-xl border flex flex-col justify-between ${
                pipelineScenario === 'safe'
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-red-500/5 border-red-500/30'
              }`}
            >
              <div className="text-[11px] font-mono text-[#66636A] uppercase tracking-wider mb-2 font-medium">
                04 / ENFORCEMENT
              </div>
              <div className="flex items-center gap-2.5">
                {pipelineScenario === 'safe' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
                <span
                  className={`text-xl font-mono font-bold ${
                    pipelineScenario === 'safe' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {pipelineScenario === 'safe' ? 'ALLOW' : 'BLOCKED'}
                </span>
              </div>
              <div className="text-[12px] font-mono text-[#96939A] mt-2.5">
                {pipelineScenario === 'safe'
                  ? 'Payload verified & passed downstream'
                  : 'Execution dropped & audit log indexed'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. THREAT MATRIX ── */}
      <section id="threats" className="py-32 px-6 lg:px-12 border-t border-white/[0.08] max-w-[1600px] mx-auto w-full">
        <div className="max-w-2xl mb-18">
          <div className="text-xs font-mono uppercase tracking-[0.24em] text-[#C9A66B] mb-3 font-semibold">
            Autonomous Threat Matrix
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl text-[#F2EEE7] tracking-tight leading-tight">
            Threats specific to<br />
            autonomous execution.
          </h2>
          <p className="text-base text-[#96939A] mt-5 leading-relaxed">
            Conventional web firewalls do not understand agent planning or multi-step tool calls.
            RAKSHYA neutralizes agent-native vulnerabilities inline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl surface-card">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <h3 className="text-lg font-medium text-[#F2EEE7]">Prompt Injection & Jailbreaks</h3>
            </div>
            <p className="text-[14px] text-[#96939A] leading-relaxed mb-5">
              Malicious input embedded in external emails or user docs tricking the model into
              violating instructions and calling restricted tools.
            </p>
            <div className="p-4 rounded-xl bg-[#070707] font-mono text-xs text-[#96939A] border border-white/[0.07]">
              <span className="text-red-400 font-semibold">INTERCEPT:</span> Sanitizes injection vectors and overrides high-privilege prompt hijacking.
            </div>
          </div>

          <div className="p-8 rounded-2xl surface-card">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <h3 className="text-lg font-medium text-[#F2EEE7]">Mass Data Exfiltration</h3>
            </div>
            <p className="text-[14px] text-[#96939A] leading-relaxed mb-5">
              Agents instructed to query sensitive internal tables and transmit records to external
              webhooks or unapproved endpoints.
            </p>
            <div className="p-4 rounded-xl bg-[#070707] font-mono text-xs text-[#96939A] border border-white/[0.07]">
              <span className="text-red-400 font-semibold">INTERCEPT:</span> Enforces volume caps, egress blacklists, and real-time PII tokenization.
            </div>
          </div>

          <div className="p-8 rounded-2xl surface-card">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <h3 className="text-lg font-medium text-[#F2EEE7]">Unconstrained Tool Invocation</h3>
            </div>
            <p className="text-[14px] text-[#96939A] leading-relaxed mb-5">
              Hallucinated or hijacked agents executing shell commands, dropping databases, or
              invoking unpermitted admin APIs.
            </p>
            <div className="p-4 rounded-xl bg-[#070707] font-mono text-xs text-[#96939A] border border-white/[0.07]">
              <span className="text-red-400 font-semibold">INTERCEPT:</span> Tool-level RBAC restricting agents to strictly approved scopes.
            </div>
          </div>

          <div className="p-8 rounded-2xl surface-card">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <h3 className="text-lg font-medium text-[#F2EEE7]">Privilege Escalation Loops</h3>
            </div>
            <p className="text-[14px] text-[#96939A] leading-relaxed mb-5">
              Multi-agent swarms delegating tasks back and forth to bypass individual agent
              permission boundaries.
            </p>
            <div className="p-4 rounded-xl bg-[#070707] font-mono text-xs text-[#96939A] border border-white/[0.07]">
              <span className="text-red-400 font-semibold">INTERCEPT:</span> Global execution tracing binds parent-child token lineages across swarms.
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. DEVELOPER EXPERIENCE & SDK ── */}
      <section id="sdk" className="py-32 px-6 lg:px-12 border-t border-white/[0.08] max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-mono uppercase tracking-[0.24em] text-[#C9A66B] font-semibold">
              Developer Platform
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl text-[#F2EEE7] tracking-tight leading-tight">
              One security layer.<br />
              Any autonomous system.
            </h2>
            <p className="text-base text-[#96939A] leading-relaxed">
              Drop RAKSHYA into your Python, LangChain, CrewAI, AutoGen, or custom agent loop with a
              single wrapper. No architecture overhaul required.
            </p>

            <div className="space-y-3.5 pt-3">
              <div className="flex items-center gap-3 text-sm text-[#D8D4CC]">
                <Check className="w-4.5 h-4.5 text-[#C9A66B]" />
                <span>Deterministic evaluation before runtime execution</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#D8D4CC]">
                <Check className="w-4.5 h-4.5 text-[#C9A66B]" />
                <span>Zero telemetry lock-in: OpenTelemetry compliant</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#D8D4CC]">
                <Check className="w-4.5 h-4.5 text-[#C9A66B]" />
                <span>Cryptographic elevation tokens for human approvals</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/api-keys"
                className="inline-flex items-center gap-2 text-sm font-mono text-[#E0C28D] hover:text-[#FAF8F5] font-semibold transition-colors"
              >
                <span>Generate production credentials in console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Code Display */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl surface-card shadow-2xl overflow-hidden border-white/10">
              {/* Header with tabs */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#070707]">
                <div className="flex items-center gap-2">
                  {(['python', 'typescript', 'curl'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveTab(lang)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors ${
                        activeTab === lang
                          ? 'bg-[#141415] text-[#F2EEE7] font-semibold border border-white/10'
                          : 'text-[#96939A] hover:text-[#F2EEE7]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleCopyCode(sdkCode[activeTab])}
                  className="flex items-center gap-1.5 text-xs font-mono text-[#96939A] hover:text-[#F2EEE7] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Pre */}
              <pre className="p-6 font-mono text-[13.5px] text-[#F2EEE7] overflow-x-auto leading-relaxed bg-[#0B0B0C] selection:bg-[#C9A66B]/30">
                <code>{sdkCode[activeTab]}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. AUDIT TRAIL STREAM ── */}
      <section id="audit" className="py-32 px-6 lg:px-12 border-t border-white/[0.08] max-w-[1600px] mx-auto w-full">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono uppercase tracking-[0.24em] text-[#C9A66B] mb-3 font-semibold">
            Immutable Audit Trail
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl text-[#F2EEE7] tracking-tight leading-tight">
            Every decision leaves<br />
            an auditable trail.
          </h2>
          <p className="text-base text-[#96939A] mt-5 leading-relaxed">
            All agent operations, policy evaluations, and operator approvals are cryptographically
            hashed into an append-only audit stream.
          </p>
        </div>

        <div className="border border-white/[0.08] rounded-2xl surface-card divide-y divide-white/[0.06] font-mono text-[13px]">
          <div className="p-5 flex items-center justify-between text-[#96939A] hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-400 font-semibold">THREAT_INTERCEPTED</span>
              <span className="text-[#F2EEE7]">bash_exec("rm -rf /var/data")</span>
            </div>
            <div className="flex items-center gap-5 text-[#66636A] text-xs">
              <span>agt_devops_bot</span>
              <span>sha256:4f8e...901b</span>
              <span>JUST NOW</span>
            </div>
          </div>

          <div className="p-5 flex items-center justify-between text-[#96939A] hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3.5">
              <span className="w-2 h-2 rounded-full bg-[#C9A66B]" />
              <span className="text-[#E0C28D] font-semibold">POLICY_ENFORCED</span>
              <span className="text-[#F2EEE7]">POL-04: Production PII Masking Applied</span>
            </div>
            <div className="flex items-center gap-5 text-[#66636A] text-xs">
              <span>agt_finance_bot</span>
              <span>sha256:77a1...8cb3</span>
              <span>2m AGO</span>
            </div>
          </div>

          <div className="p-5 flex items-center justify-between text-[#96939A] hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 font-semibold">OPERATOR_APPROVAL</span>
              <span className="text-[#F2EEE7]">HITL Approval Granted: Deploy Cloud Replica</span>
            </div>
            <div className="flex items-center gap-5 text-[#66636A] text-xs">
              <span>op_sec_admin</span>
              <span>sha256:d904...12fe</span>
              <span>12m AGO</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FINAL CTA ── */}
      <section className="py-36 px-6 lg:px-12 border-t border-white/[0.08] relative z-10 text-center">
        <div className="max-w-3xl mx-auto space-y-7">
          <div className="text-xs font-mono uppercase tracking-[0.24em] text-[#C9A66B] font-semibold">
            Enterprise Security Infrastructure
          </div>

          <h2 className="font-serif text-5xl sm:text-6xl text-[#F2EEE7] tracking-tight leading-tight">
            Control what<br />
            autonomous systems can do.
          </h2>

          <p className="text-base sm:text-lg text-[#96939A] max-w-xl mx-auto leading-relaxed">
            Deploy the RAKSHYA inline protection gateway today. Protect corporate resources from
            unconstrained agent behavior.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-gold px-8 py-4 text-[15px] font-semibold rounded-xl flex items-center gap-2.5 cursor-pointer shadow-xl shadow-[#C9A66B]/20"
            >
              <span>Explore RAKSHYA</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>

            <Link
              to="/api-keys"
              className="px-7 py-4 text-[15px] font-medium text-[#F2EEE7] bg-[#141415] hover:bg-[#1A1A1C] border border-white/10 hover:border-white/20 rounded-xl transition-all flex items-center gap-2"
            >
              <Terminal className="w-4.5 h-4.5 text-[#C9A66B]" />
              <span>Developer Documentation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 10. ENTERPRISE FOOTER ── */}
      <footer className="py-10 px-6 lg:px-12 border-t border-white/[0.08] bg-[#070707] text-xs font-mono text-[#66636A]">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif text-[#F2EEE7] text-sm font-medium">RAKSHYA</span>
            <span className="text-white/20">|</span>
            <span>Security Infrastructure for Autonomous Systems</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              GLOBAL GATEWAY CLUSTER ONLINE
            </span>
            <span>SOC2 TYPE II COMPLIANT</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
