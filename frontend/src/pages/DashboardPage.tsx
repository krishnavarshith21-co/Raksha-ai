import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  CheckSquare,
  AlertTriangle,
  FileLock2,
  RefreshCw,
  Activity,
  ArrowUpRight,
  ExternalLink,
  Flame,
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
        threatsApi.list({ limit: 5 }).catch(() => ({ data: { threats: [] } })),
      ]);

      if (metricsRes.data) {
        setMetrics(metricsRes.data);
      }

      // Group threats over time by date
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

      // Risk distribution formatting
      const rawRisk = Array.isArray(riskRes.data?.data) ? riskRes.data.data : [];
      setRiskDistribution(
        rawRisk.map((r: any) => ({
          level: r.risk_level || 'UNKNOWN',
          count: parseInt(r.count || 0),
        }))
      );

      // Decisions formatting
      const rawDecisions = Array.isArray(decisionRes.data?.data) ? decisionRes.data.data : [];
      setActionsByDecision(
        rawDecisions.map((d: any) => ({
          decision: d.decision || 'UNKNOWN',
          count: parseInt(d.count || 0),
        }))
      );

      // Agent activity
      setAgentActivity(Array.isArray(activityRes.data?.data) ? activityRes.data.data : []);

      // Recent threats safely normalized to an Array
      const threatList = recentThreatsRes.data?.threats || recentThreatsRes.data?.data || recentThreatsRes.data;
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
      ? Math.round((metrics.blockedActions / metrics.totalActions) * 100)
      : 0;

  return (
    <div className="space-y-5">
      {/* Precision Header with telemetry status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-graphite-750/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-status-green font-medium">
              TELEMETRY ENGINE RUNNING
            </span>
            <span className="text-graphite-600 font-mono text-[10px]">/</span>
            <span className="text-[10px] font-mono text-graphite-400">LATENCY 0.9ms</span>
          </div>
          <h1 className="text-xl font-medium text-stone-100 tracking-tight">
            Command Center
          </h1>
          <p className="text-xs text-graphite-400 mt-0.5">
            Real-time proxy telemetry, behavioral risk scoring, and zero-trust policy orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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

      {/* 5-Column High-Density KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Actions */}
        <div className="bg-graphite-850 border border-graphite-750 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-graphite-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-graphite-400">Evaluated Ops</span>
            <Activity className="w-3.5 h-3.5 text-graphite-500" />
          </div>
          <div className="text-2xl font-mono font-medium text-stone-100 tabular-nums">
            {metrics.totalActions?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-graphite-400 font-mono">
            <span className="text-status-green font-medium">
              {metrics.allowedActions?.toLocaleString() || 0}
            </span>
            <span>authorized inline</span>
          </div>
        </div>

        {/* Blocked Actions */}
        <div className="bg-graphite-850 border border-graphite-750 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-graphite-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-graphite-400">Attacks Enforced</span>
            <ShieldAlert className="w-3.5 h-3.5 text-status-red" />
          </div>
          <div className="text-2xl font-mono font-medium text-status-red tabular-nums">
            {metrics.blockedActions?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-graphite-400 font-mono">
            <span className="text-status-red font-medium">{blockRate}%</span>
            <span>block rate</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-graphite-850 border border-graphite-750 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-graphite-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-graphite-400">Pending HITL</span>
            <CheckSquare className="w-3.5 h-3.5 text-copper-400" />
          </div>
          <div className="text-2xl font-mono font-medium text-copper-400 tabular-nums">
            {metrics.pendingApprovals?.toLocaleString() || 0}
          </div>
          <div className="mt-2">
            <Link
              to="/approvals"
              className="text-[10px] text-copper-400 hover:text-copper-300 font-mono inline-flex items-center gap-1"
            >
              <span>Inspect queue</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Critical Threats */}
        <div className="bg-graphite-850 border border-graphite-750 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-graphite-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-graphite-400">Critical Threats</span>
            <AlertTriangle className="w-3.5 h-3.5 text-status-red" />
          </div>
          <div className="text-2xl font-mono font-medium text-status-red tabular-nums">
            {metrics.criticalThreats?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-graphite-400 font-mono truncate">
            <span className="text-status-yellow font-medium">
              {metrics.promptInjectionAttempts || 0}
            </span>
            <span>injections detected</span>
          </div>
        </div>

        {/* Sensitive Data Exposures */}
        <div className="bg-graphite-850 border border-graphite-750 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-graphite-400 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-graphite-400">DLP Masked</span>
            <FileLock2 className="w-3.5 h-3.5 text-status-blue" />
          </div>
          <div className="text-2xl font-mono font-medium text-status-blue tabular-nums">
            {metrics.sensitiveDataEvents?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-graphite-400 font-mono">
            <span className="text-status-blue font-medium">
              {metrics.dataExfiltrationAttempts || 0}
            </span>
            <span>exfiltrations stopped</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threats Over Time */}
        <Card
          title="Incident Trends & Intercepted Threats"
          subtitle="Autonomous agent threat events evaluated over timeline"
          className="lg:col-span-2"
          action={
            <Link
              to="/threats"
              className="text-xs text-graphite-400 hover:text-stone-200 flex items-center gap-1 font-mono transition-colors"
            >
              <span>Incident Center</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          <ThreatsChart data={threatsOverTime} height={240} />
        </Card>

        {/* Action Decisions Donut */}
        <Card
          title="Decision Distribution"
          subtitle="Real-time enforcement outcomes across monitored actions"
          action={
            <Link
              to="/actions"
              className="text-xs text-graphite-400 hover:text-stone-200 flex items-center gap-1 font-mono transition-colors"
            >
              <span>Stream</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          <DecisionsPieChart data={actionsByDecision} height={240} />
        </Card>
      </div>

      {/* Second Row: Risk Distribution & Agent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Level Distribution */}
        <Card
          title="Risk Classification"
          subtitle="Distribution of actions segmented by automated threat score"
        >
          <RiskDistributionChart data={riskDistribution} height={220} />
        </Card>

        {/* Top Active Agents */}
        <Card
          title="Active Agent Posture"
          subtitle="Autonomous agents governed by the Rakshya proxy layer"
          className="lg:col-span-2"
          action={
            <Link
              to="/agents"
              className="text-xs text-graphite-400 hover:text-stone-200 flex items-center gap-1 font-mono transition-colors"
            >
              <span>Registry</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          {agentActivity.length === 0 ? (
            <div className="py-10 text-center text-xs font-mono text-graphite-500">
              No autonomous agent telemetry recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-graphite-750 text-graphite-400 font-mono text-[10px]">
                    <th className="pb-2 font-medium">AGENT</th>
                    <th className="pb-2 font-medium text-right">TOTAL</th>
                    <th className="pb-2 font-medium text-right">ALLOWED</th>
                    <th className="pb-2 font-medium text-right">BLOCKED</th>
                    <th className="pb-2 font-medium pl-5">RISK PROFILE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-750/50 font-mono">
                  {agentActivity.slice(0, 5).map((agent: any, idx: number) => (
                    <tr key={idx} className="hover:bg-graphite-800/40 transition-colors">
                      <td className="py-2.5 text-stone-200 font-sans font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
                        <span className="truncate max-w-[150px]">{agent.agent_name}</span>
                      </td>
                      <td className="py-2.5 text-right text-graphite-300 font-medium tabular-nums">
                        {agent.total_actions}
                      </td>
                      <td className="py-2.5 text-right text-status-green tabular-nums">
                        {agent.allowed}
                      </td>
                      <td className="py-2.5 text-right text-status-red tabular-nums">
                        {agent.blocked}
                      </td>
                      <td className="py-2.5 pl-5">
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

      {/* Live Threat Interception Feed */}
      <Card
        title="Live Threat Interception Feed"
        subtitle="Chronological stream of malicious pattern matches and policy blocks"
        action={
          <Link
            to="/threats"
            className="text-xs text-copper-400 hover:text-copper-300 font-mono inline-flex items-center gap-1 transition-colors"
          >
            <span>All Threats ({Array.isArray(recentThreats) ? recentThreats.length : 0})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {!Array.isArray(recentThreats) || recentThreats.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-graphite-500">
            No active threat incidents currently reported
          </div>
        ) : (
          <div className="divide-y divide-graphite-750/70">
            {recentThreats.map((threat: any) => (
              <div
                key={threat.id}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-graphite-800/30 px-2 rounded transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityBadgeVariant(threat.severity)} size="sm">
                      {threat.severity}
                    </Badge>
                    <span className="text-xs font-mono text-stone-200 font-medium">
                      {threat.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-graphite-600 text-xs">·</span>
                    <span className="text-xs text-graphite-400">
                      Agent: <span className="text-stone-300 font-mono">{threat.agent_name || 'Autonomous Agent'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-graphite-400 line-clamp-1">
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
