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
  Radio,
  ExternalLink,
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

/* Helper component for animated number count-up */
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
      // easeOutExpo
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

      // Format threats over time
      const rawThreats = Array.isArray(threatsRes.data?.data) ? threatsRes.data.data : [];
      const dateMap: Record<string, { date: string; count: number; blocked: number }> = {};
      rawThreats.forEach((item: any) => {
        const d = item.date ? item.date.slice(0, 10) : 'Today';
        if (!dateMap[d]) {
          dateMap[d] = { date: d, count: 0, blocked: 0 };
        }
        dateMap[d].count += parseInt(item.count || 0);
        if (item.category === 'CRITICAL' || item.category === 'HIGH') {
          dateMap[d].blocked += parseInt(item.count || 0);
        }
      });
      setThreatsOverTime(Object.values(dateMap));

      // Format risk distribution
      const rawRisk = Array.isArray(riskRes.data?.data) ? riskRes.data.data : [];
      setRiskDistribution(
        rawRisk.map((r: any) => ({
          level: r.risk_level || 'UNKNOWN',
          count: parseInt(r.count || 0),
        }))
      );

      // Format actions by decision
      const rawDecisions = Array.isArray(decisionRes.data?.data) ? decisionRes.data.data : [];
      setActionsByDecision(
        rawDecisions.map((d: any) => ({
          decision: d.decision || 'UNKNOWN',
          count: parseInt(d.count || 0),
        }))
      );

      // Agent activity
      setAgentActivity(Array.isArray(activityRes.data?.data) ? activityRes.data.data : []);

      // Recent threats safely normalized
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
    <div className="space-y-8 pb-12">
      {/* ── TOP: COMMAND CENTER HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-graphite-750/70">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-copper-400 font-semibold">
              RAKSHYA INFRASTRUCTURE
            </span>
            <span className="text-graphite-600 font-mono text-xs">/</span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-graphite-900 border border-graphite-750 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
              <span className="text-graphite-300 font-medium">Inline protection active</span>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-stone-100 tracking-tight font-medium">
            Command Center
          </h1>
          <p className="text-xs text-graphite-400 mt-1 max-w-xl">
            Real-time proxy telemetry, behavioral risk classification, and automated policy enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Link to="/simulator">
            <Button
              variant="primary"
              size="sm"
              icon={<Flame className="w-3.5 h-3.5 text-graphite-950" />}
            >
              Simulate Attack
            </Button>
          </Link>
        </div>
      </div>

      {/* ── LARGE KPI AREA (4 Primary Metrics) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Actions evaluated */}
        <div className="p-5 rounded-xl bg-graphite-900/60 border border-graphite-750/80 hover:border-graphite-600 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-graphite-400 mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-400">
                Actions evaluated
              </span>
              <Activity className="w-4 h-4 text-copper-400/80" />
            </div>
            <div className="text-3xl lg:text-4xl font-mono font-medium text-stone-100 tracking-tight">
              <AnimatedNumber value={metrics.totalActions || 0} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-graphite-800 text-xs font-mono text-graphite-400">
            <span className="text-status-green font-medium">
              {metrics.allowedActions?.toLocaleString() || 0}
            </span>
            <span>authorized inline</span>
          </div>
        </div>

        {/* 2. Threats intercepted */}
        <div className="p-5 rounded-xl bg-graphite-900/60 border border-graphite-750/80 hover:border-graphite-600 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-graphite-400 mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-400">
                Threats intercepted
              </span>
              <ShieldAlert className="w-4 h-4 text-status-red" />
            </div>
            <div className="text-3xl lg:text-4xl font-mono font-medium text-status-red tracking-tight">
              <AnimatedNumber value={metrics.blockedActions || 0} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-graphite-800 text-xs font-mono text-graphite-400">
            <span className="text-status-red font-medium">{blockRate}%</span>
            <span>enforcement block rate</span>
          </div>
        </div>

        {/* 3. Pending approvals */}
        <div className="p-5 rounded-xl bg-graphite-900/60 border border-graphite-750/80 hover:border-graphite-600 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-graphite-400 mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-400">
                Pending approvals
              </span>
              <CheckSquare className="w-4 h-4 text-copper-400" />
            </div>
            <div className="text-3xl lg:text-4xl font-mono font-medium text-copper-400 tracking-tight">
              <AnimatedNumber value={metrics.pendingApprovals || 0} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-graphite-800">
            <Link
              to="/approvals"
              className="text-xs text-copper-400 hover:text-copper-300 font-mono inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Inspect HITL queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4. Critical incidents */}
        <div className="p-5 rounded-xl bg-graphite-900/60 border border-graphite-750/80 hover:border-graphite-600 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-graphite-400 mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-400">
                Critical incidents
              </span>
              <AlertTriangle className="w-4 h-4 text-status-yellow" />
            </div>
            <div className="text-3xl lg:text-4xl font-mono font-medium text-status-yellow tracking-tight">
              <AnimatedNumber value={metrics.criticalThreats || 0} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-graphite-800 text-xs font-mono text-graphite-400">
            <span className="text-status-yellow font-medium">
              {metrics.promptInjectionAttempts || 0}
            </span>
            <span>injection triggers</span>
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
              className="text-xs text-graphite-400 hover:text-stone-200 flex items-center gap-1 font-mono transition-colors"
            >
              <span>Threat Center</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          <ThreatsChart data={threatsOverTime} height={260} />
        </Card>

        {/* Decision Distribution */}
        <Card
          title="Decision Distribution"
          subtitle="Enforcement breakdown across ALLOW, APPROVAL, and BLOCK"
          action={
            <Link
              to="/actions"
              className="text-xs text-graphite-400 hover:text-stone-200 flex items-center gap-1 font-mono transition-colors"
            >
              <span>Action Stream</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          <DecisionsPieChart data={actionsByDecision} height={260} />
        </Card>
      </div>

      {/* ── SECONDARY POSTURE ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Classification */}
        <Card
          title="Risk Classification"
          subtitle="Autonomous actions segmented by automated threat severity"
        >
          <RiskDistributionChart data={riskDistribution} height={240} />
        </Card>

        {/* Active Agent Posture */}
        <Card
          title="Active Agent Posture"
          subtitle="Monitored autonomous systems and their real-time risk profile"
          className="lg:col-span-2"
          action={
            <Link
              to="/agents"
              className="text-xs text-graphite-400 hover:text-stone-200 flex items-center gap-1 font-mono transition-colors"
            >
              <span>Agent Inventory</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          {agentActivity.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-graphite-500">
              No active agent telemetry recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-graphite-750 text-graphite-400 font-mono text-[10px]">
                    <th className="pb-3 font-medium">AGENT SYSTEM</th>
                    <th className="pb-3 font-medium text-right">TOTAL</th>
                    <th className="pb-3 font-medium text-right">ALLOWED</th>
                    <th className="pb-3 font-medium text-right">BLOCKED</th>
                    <th className="pb-3 font-medium pl-6">RISK PROFILE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-750/50 font-mono">
                  {agentActivity.slice(0, 5).map((agent: any, idx: number) => (
                    <tr key={idx} className="hover:bg-graphite-850/40 transition-colors">
                      <td className="py-3 text-stone-200 font-sans font-medium flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
                        <span className="truncate max-w-[200px]">{agent.agent_name}</span>
                      </td>
                      <td className="py-3 text-right text-graphite-300 font-medium tabular-nums">
                        {agent.total_actions}
                      </td>
                      <td className="py-3 text-right text-status-green tabular-nums">
                        {agent.allowed}
                      </td>
                      <td className="py-3 text-right text-status-red tabular-nums">
                        {agent.blocked}
                      </td>
                      <td className="py-3 pl-6">
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
        title="Live Interception Feed"
        subtitle="Chronological stream of policy blocks and neutralized vulnerabilities"
        action={
          <Link
            to="/threats"
            className="text-xs text-copper-400 hover:text-copper-300 font-mono inline-flex items-center gap-1 transition-colors"
          >
            <span>All Incidents ({Array.isArray(recentThreats) ? recentThreats.length : 0})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {!Array.isArray(recentThreats) || recentThreats.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-graphite-500">
            No active threat incidents currently reported
          </div>
        ) : (
          <div className="divide-y divide-graphite-750/60">
            {recentThreats.map((threat: any) => (
              <div
                key={threat.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-graphite-850/30 px-3 rounded-lg transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <Badge variant={getSeverityBadgeVariant(threat.severity)} size="sm">
                      {threat.severity}
                    </Badge>
                    <span className="text-xs font-mono text-stone-200 font-medium">
                      {threat.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-graphite-600 text-xs">·</span>
                    <span className="text-xs text-graphite-400">
                      Agent: <span className="text-stone-300 font-mono">{threat.agent_name || 'Autonomous System'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-graphite-400 line-clamp-1 max-w-3xl">
                    {threat.description || 'Payload matched zero-trust violation policy.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono text-graphite-500">
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
