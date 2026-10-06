import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  CheckSquare,
  AlertTriangle,
  RefreshCw,
  Activity,
  ArrowUpRight,
  Flame,
  ExternalLink,
  Radio,
} from 'lucide-react';
import { dashboardApi, threatsApi } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge, getSeverityBadgeVariant } from '../components/common/Badge';
import { RiskScoreMeter } from '../components/common/RiskScoreMeter';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ThreatsChart } from '../components/charts/ThreatsChart';
import { RiskDistributionChart } from '../components/charts/RiskDistributionChart';
import { DecisionsPieChart } from '../components/charts/DecisionsPieChart';

/* Animated counter component with smooth easing */
const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({ value, duration = 800 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = displayValue;
    const endVal = value;

    if (startVal === endVal) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startVal + (endVal - startVal) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, duration]);

  return <span className="tabular-nums font-mono">{displayValue.toLocaleString()}</span>;
};

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<any>({
    totalActions: 0,
    allowedActions: 0,
    blockedActions: 0,
    pendingApprovals: 0,
    criticalThreats: 0,
    sensitiveDataEvents: 0,
    promptInjectionAttempts: 0,
    dataExfiltrationAttempts: 0,
  });

  const [threatsOverTime, setThreatsOverTime] = useState<any[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<any[]>([]);
  const [actionsByDecision, setActionsByDecision] = useState<any[]>([]);
  const [agentActivity, setAgentActivity] = useState<any[]>([]);
  const [recentThreats, setRecentThreats] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [
        metricsRes,
        threatsRes,
        riskRes,
        decisionRes,
        activityRes,
        recentThreatsRes,
      ] = await Promise.all([
        dashboardApi.getMetrics().catch(() => ({ data: {} })),
        dashboardApi.getThreatsOverTime().catch(() => ({ data: { data: [] } })),
        dashboardApi.getRiskDistribution().catch(() => ({ data: { data: [] } })),
        dashboardApi.getActionsByDecision().catch(() => ({ data: { data: [] } })),
        dashboardApi.getAgentActivity().catch(() => ({ data: { data: [] } })),
        threatsApi.list({ limit: 6 }).catch(() => ({ data: { threats: [] } })),
      ]);

      if (metricsRes.data) {
        setMetrics(metricsRes.data);
      }

      // Group threats over time
      const rawThreats = Array.isArray(threatsRes.data?.data) ? threatsRes.data.data : [];
      const dateMap: Record<string, { date: string; count: number; blocked: number }> = {};
      rawThreats.forEach((item: any) => {
        const d = item.date ? item.date.slice(0, 10) : 'Active';
        if (!dateMap[d]) {
          dateMap[d] = { date: d, count: 0, blocked: 0 };
        }
        dateMap[d].count += parseInt(item.count || 0);
        if (item.category === 'CRITICAL' || item.category === 'HIGH') {
          dateMap[d].blocked += parseInt(item.count || 0);
        }
      });
      setThreatsOverTime(Object.values(dateMap));

      // Risk distribution
      const rawRisk = Array.isArray(riskRes.data?.data) ? riskRes.data.data : [];
      setRiskDistribution(
        rawRisk.map((r: any) => ({
          level: r.risk_level || 'UNKNOWN',
          count: parseInt(r.count || 0),
        }))
      );

      // Decision distribution
      const rawDecisions = Array.isArray(decisionRes.data?.data) ? decisionRes.data.data : [];
      setActionsByDecision(
        rawDecisions.map((d: any) => ({
          decision: d.decision || 'UNKNOWN',
          count: parseInt(d.count || 0),
        }))
      );

      // Agent activity
      setAgentActivity(Array.isArray(activityRes.data?.data) ? activityRes.data.data : []);

      // Recent threats
      const threatList =
        recentThreatsRes.data?.threats || recentThreatsRes.data?.data || recentThreatsRes.data;
      setRecentThreats(Array.isArray(threatList) ? threatList : []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 20000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return <LoadingSpinner label="Connecting to Rakshya Defense Gateway..." size="lg" fullHeight />;
  }

  const blockRate =
    metrics.totalActions > 0
      ? ((metrics.blockedActions / metrics.totalActions) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-10 pb-16">
      {/* ── TOP: COMMAND CENTER HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#C9A66B] font-semibold">
              RAKSHYA SECURITY CORE
            </span>
            <span className="text-white/20 font-mono text-xs">/</span>
            <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#101011] border border-white/[0.08] text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#F2EEE7] font-medium">Inline protection active</span>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-[#C9A66B]/15 text-[#E0C28D] border border-[#C9A66B]/30 hidden sm:inline">
              SIMULATION TELEMETRY
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[40px] text-[#F2EEE7] tracking-tight font-medium leading-tight">
            Command Center
          </h1>
          <p className="text-[14.5px] text-[#96939A] mt-1.5 max-w-2xl leading-relaxed">
            Real-time proxy telemetry, behavioral risk classification, and zero-trust policy enforcement across governed autonomous systems.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh Telemetry
          </Button>

          <Link to="/simulator">
            <Button
              variant="primary"
              size="md"
              icon={<Flame className="w-4 h-4 text-[#070707]" />}
            >
              Simulate Attack
            </Button>
          </Link>
        </div>
      </div>

      {/* ── LARGE 4-KPI AREA (36–42px Dominant Metrics) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Actions evaluated */}
        <div className="surface-card surface-card-hover p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#96939A] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#96939A] font-medium">
                Actions Evaluated
              </span>
              <Activity className="w-4.5 h-4.5 text-[#C9A66B]" />
            </div>
            <div className="text-4xl lg:text-[42px] font-mono font-medium text-[#F2EEE7] tracking-tight leading-none">
              <AnimatedNumber value={metrics.totalActions || 0} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.07] text-xs font-mono">
            <span className="text-emerald-400 font-medium">
              {metrics.allowedActions?.toLocaleString() || 0} allowed
            </span>
            <span className="text-[#66636A]">+12.4% / 24h</span>
          </div>
        </div>

        {/* 2. Threats intercepted */}
        <div className="surface-card surface-card-hover p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#96939A] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#96939A] font-medium">
                Threats Intercepted
              </span>
              <ShieldAlert className="w-4.5 h-4.5 text-red-400" />
            </div>
            <div className="text-4xl lg:text-[42px] font-mono font-medium text-red-400 tracking-tight leading-none">
              <AnimatedNumber value={metrics.blockedActions || 0} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.07] text-xs font-mono">
            <span className="text-red-400 font-medium">{blockRate}% block rate</span>
            <span className="text-[#66636A]">Neutralized</span>
          </div>
        </div>

        {/* 3. Pending approvals */}
        <div className="surface-card surface-card-hover p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#96939A] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#96939A] font-medium">
                Pending Approvals
              </span>
              <CheckSquare className="w-4.5 h-4.5 text-[#E0C28D]" />
            </div>
            <div className="text-4xl lg:text-[42px] font-mono font-medium text-[#E0C28D] tracking-tight leading-none">
              <AnimatedNumber value={metrics.pendingApprovals || 0} />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-white/[0.07]">
            <Link
              to="/approvals"
              className="text-xs text-[#E0C28D] hover:text-[#FAF8F5] font-mono inline-flex items-center gap-1.5 transition-colors font-medium"
            >
              <span>Inspect HITL queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4. Critical incidents */}
        <div className="surface-card surface-card-hover p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#96939A] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#96939A] font-medium">
                Critical Incidents
              </span>
              <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div className="text-4xl lg:text-[42px] font-mono font-medium text-amber-400 tracking-tight leading-none">
              <AnimatedNumber value={metrics.criticalThreats || 0} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.07] text-xs font-mono">
            <span className="text-amber-400 font-medium">
              {metrics.promptInjectionAttempts || 0} prompt injections
            </span>
            <span className="text-[#66636A]">Isolated</span>
          </div>
        </div>
      </div>

      {/* ── PRIMARY ANALYTICS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Activity Graph */}
        <Card
          title="Threat Activity Graph"
          subtitle="Chronological distribution of evaluated operations and blocked attacks"
          className="lg:col-span-2"
          action={
            <Link
              to="/threats"
              className="text-xs text-[#96939A] hover:text-[#F2EEE7] flex items-center gap-1 font-mono transition-colors"
            >
              <span>Incident Center</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#C9A66B]" />
            </Link>
          }
        >
          <ThreatsChart data={threatsOverTime} height={280} />
        </Card>

        {/* Decision Distribution */}
        <Card
          title="Decision Distribution"
          subtitle="Real-time enforcement outcomes across evaluated actions"
          action={
            <Link
              to="/actions"
              className="text-xs text-[#96939A] hover:text-[#F2EEE7] flex items-center gap-1 font-mono transition-colors"
            >
              <span>Action Stream</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#C9A66B]" />
            </Link>
          }
        >
          <DecisionsPieChart data={actionsByDecision} height={280} />
        </Card>
      </div>

      {/* ── SECONDARY POSTURE ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Classification */}
        <Card
          title="Risk Classification"
          subtitle="Autonomous actions segmented by automated threat severity"
        >
          <RiskDistributionChart data={riskDistribution} height={260} />
        </Card>

        {/* Active Agent Posture */}
        <Card
          title="Active Agent Posture"
          subtitle="Autonomous systems governed by the Rakshya defense layer"
          className="lg:col-span-2"
          action={
            <Link
              to="/agents"
              className="text-xs text-[#96939A] hover:text-[#F2EEE7] flex items-center gap-1 font-mono transition-colors"
            >
              <span>Agent Registry</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#C9A66B]" />
            </Link>
          }
        >
          {agentActivity.length === 0 ? (
            <div className="py-14 text-center text-xs font-mono text-[#66636A]">
              No active agent telemetry recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-white/[0.07] text-[#66636A] font-mono text-[11px]">
                    <th className="pb-3.5 font-medium uppercase tracking-wider">AGENT SYSTEM</th>
                    <th className="pb-3.5 font-medium text-right uppercase tracking-wider">TOTAL</th>
                    <th className="pb-3.5 font-medium text-right uppercase tracking-wider">ALLOWED</th>
                    <th className="pb-3.5 font-medium text-right uppercase tracking-wider">BLOCKED</th>
                    <th className="pb-3.5 font-medium pl-6 uppercase tracking-wider">RISK PROFILE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] font-mono">
                  {agentActivity.slice(0, 5).map((agent: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 text-[#F2EEE7] font-sans font-medium flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="truncate max-w-[220px]">{agent.agent_name}</span>
                      </td>
                      <td className="py-4 text-right text-[#D8D4CC] font-medium tabular-nums">
                        {agent.total_actions}
                      </td>
                      <td className="py-4 text-right text-emerald-400 tabular-nums">
                        {agent.allowed}
                      </td>
                      <td className="py-4 text-right text-red-400 tabular-nums">
                        {agent.blocked}
                      </td>
                      <td className="py-4 pl-6">
                        <RiskScoreMeter score={parseFloat(agent.avg_risk) || 0} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── LIVE INTERCEPTION FEED ── */}
      <Card
        title="Live Threat Interception Feed"
        subtitle="Chronological stream of malicious pattern matches and policy blocks"
        action={
          <Link
            to="/threats"
            className="text-xs text-[#E0C28D] hover:text-[#FAF8F5] font-mono inline-flex items-center gap-1.5 transition-colors font-medium"
          >
            <span>All Incidents ({Array.isArray(recentThreats) ? recentThreats.length : 0})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {!Array.isArray(recentThreats) || recentThreats.length === 0 ? (
          <div className="py-14 text-center text-xs font-mono text-[#66636A]">
            No active threat incidents currently reported
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {recentThreats.map((threat: any) => (
              <div
                key={threat.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] px-3 rounded-xl transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <Badge variant={getSeverityBadgeVariant(threat.severity)} size="sm">
                      {threat.severity}
                    </Badge>
                    <span className="text-sm font-mono text-[#F2EEE7] font-medium">
                      {threat.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-xs text-[#96939A]">
                      Agent: <span className="text-[#D8D4CC] font-mono font-medium">{threat.agent_name || 'Autonomous Agent'}</span>
                    </span>
                  </div>
                  <p className="text-[13.5px] text-[#96939A] line-clamp-1 max-w-3xl">
                    {threat.description || 'Payload matched zero-trust violation policy.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs font-mono text-[#66636A]">
                    {threat.created_at ? new Date(threat.created_at).toLocaleTimeString() : 'Just now'}
                  </span>
                  <Link to="/threats">
                    <Button variant="outline" size="sm">
                      Investigate
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
