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
  Terminal,
  Cpu,
  Lock,
  Zap,
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
    <div className="space-y-6">
      {/* Header with status telemetry & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-graphite-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-status-green indicator-breathing" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              REAL-TIME INTERCEPTION RUNNING
            </span>
            <span className="text-graphite-600 font-mono">|</span>
            <span className="text-[11px] font-mono text-graphite-400">LATENCY &lt; 1.2ms</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-50 tracking-tight">
            Security Enforcement Center
          </h1>
          <p className="text-xs text-graphite-300 mt-0.5">
            Real-time proxy telemetry, behavioral risk scoring, and zero-trust policy orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh Feed
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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Actions */}
        <div className="stat-card">
          <div className="flex items-center justify-between text-graphite-400 mb-2">
            <span className="stat-card-label">Evaluated Operations</span>
            <Activity className="w-3.5 h-3.5 text-graphite-400" />
          </div>
          <div className="stat-card-value text-stone-50">
            {metrics.totalActions?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-graphite-400 font-mono">
            <span className="text-status-green font-medium">
              {metrics.allowedActions?.toLocaleString() || 0}
            </span>
            <span>authorized inline</span>
          </div>
        </div>

        {/* Blocked Actions */}
        <div className="stat-card">
          <div className="flex items-center justify-between text-graphite-400 mb-2">
            <span className="stat-card-label">Attacks Enforced</span>
            <ShieldAlert className="w-3.5 h-3.5 text-status-red" />
          </div>
          <div className="stat-card-value text-status-red">
            {metrics.blockedActions?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-graphite-400 font-mono">
            <span className="text-status-red font-medium">{blockRate}%</span>
            <span>block enforcement rate</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="stat-card">
          <div className="flex items-center justify-between text-graphite-400 mb-2">
            <span className="stat-card-label">Pending HITL Review</span>
            <CheckSquare className="w-3.5 h-3.5 text-copper-400" />
          </div>
          <div className="stat-card-value text-copper-300">
            {metrics.pendingApprovals?.toLocaleString() || 0}
          </div>
          <div className="mt-2">
            <Link
              to="/approvals"
              className="text-[11px] text-copper-400 hover:text-copper-300 font-mono inline-flex items-center gap-1"
            >
              <span>Inspect queue</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Critical Threats */}
        <div className="stat-card">
          <div className="flex items-center justify-between text-graphite-400 mb-2">
            <span className="stat-card-label">Critical Incursions</span>
            <AlertTriangle className="w-3.5 h-3.5 text-status-red" />
          </div>
          <div className="stat-card-value text-red-300">
            {metrics.criticalThreats?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-graphite-400 font-mono truncate">
            <span className="text-status-yellow font-medium">
              {metrics.promptInjectionAttempts || 0}
            </span>
            <span>prompt injection exploits</span>
          </div>
        </div>

        {/* Sensitive Data Exposures */}
        <div className="stat-card">
          <div className="flex items-center justify-between text-graphite-400 mb-2">
            <span className="stat-card-label">Exfiltrations Prevented</span>
            <FileLock2 className="w-3.5 h-3.5 text-status-blue" />
          </div>
          <div className="stat-card-value text-sky-300">
            {metrics.sensitiveDataEvents?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-graphite-400 font-mono">
            <span className="text-sky-400 font-medium">
              {metrics.dataExfiltrationAttempts || 0}
            </span>
            <span>DLP tokens masked</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Threats Over Time Chart */}
        <Card
          title="Incident Trends & Intercepted Threats"
          subtitle="Autonomous agent threat events evaluated over timeline"
          className="lg:col-span-2"
          action={
            <Link
              to="/threats"
              className="text-xs text-graphite-300 hover:text-copper-300 flex items-center gap-1 font-mono transition-colors"
            >
              <span>Incident Center</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          <ThreatsChart data={threatsOverTime} height={250} />
        </Card>

        {/* Action Decisions Donut */}
        <Card
          title="Decision Distribution"
          subtitle="Real-time enforcement outcomes across monitored actions"
          action={
            <Link
              to="/actions"
              className="text-xs text-graphite-300 hover:text-copper-300 flex items-center gap-1 font-mono transition-colors"
            >
              <span>Telemetry Stream</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          <DecisionsPieChart data={actionsByDecision} height={250} />
        </Card>
      </div>

      {/* Second Row: Risk Distribution & Agent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Risk Level Distribution */}
        <Card
          title="Action Risk Classification"
          subtitle="Distribution of actions segmented by automated threat score"
        >
          <RiskDistributionChart data={riskDistribution} height={240} />
        </Card>

        {/* Top Active Agents */}
        <Card
          title="Agent Inventory & Risk Posture"
          subtitle="Top autonomous agents governed by the Rakshya proxy layer"
          className="lg:col-span-2"
          action={
            <Link
              to="/agents"
              className="text-xs text-graphite-300 hover:text-copper-300 flex items-center gap-1 font-mono transition-colors"
            >
              <span>Registry</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          {agentActivity.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-graphite-400">
              No autonomous agent telemetry recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-graphite-800 text-graphite-400 font-mono text-[11px]">
                    <th className="pb-2.5 font-medium">AGENT IDENTIFIER</th>
                    <th className="pb-2.5 font-medium text-right">TOTAL</th>
                    <th className="pb-2.5 font-medium text-right">ALLOWED</th>
                    <th className="pb-2.5 font-medium text-right">BLOCKED</th>
                    <th className="pb-2.5 font-medium pl-6">RISK PROFILE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-800/60 font-mono">
                  {agentActivity.slice(0, 5).map((agent: any, idx: number) => (
                    <tr key={idx} className="hover:bg-graphite-850/50 transition-colors">
                      <td className="py-3 text-stone-200 font-sans font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
                        <span className="truncate max-w-[160px]">{agent.agent_name}</span>
                      </td>
                      <td className="py-3 text-right text-graphite-200 font-medium">
                        {agent.total_actions}
                      </td>
                      <td className="py-3 text-right text-status-green">
                        {agent.allowed}
                      </td>
                      <td className="py-3 text-right text-status-red">
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

      {/* Recent High-Priority Incidents Feed */}
      <Card
        title="Live Threat Interception Feed"
        subtitle="Chronological stream of malicious pattern matches and policy blocks"
        action={
          <Link
            to="/threats"
            className="text-xs text-copper-400 hover:text-copper-300 font-mono inline-flex items-center gap-1 transition-colors"
          >
            <span>All Threats ({recentThreats.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {recentThreats.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-graphite-400">
            No active threat incidents currently reported
          </div>
        ) : (
          <div className="divide-y divide-graphite-800">
            {recentThreats.map((threat: any) => (
              <div
                key={threat.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-graphite-850/40 px-2 rounded-md transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityBadgeVariant(threat.severity)} size="sm">
                      {threat.severity}
                    </Badge>
                    <span className="text-xs font-mono text-stone-200 font-semibold">
                      {threat.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-graphite-600 text-xs">·</span>
                    <span className="text-xs text-graphite-400">
                      Agent: <strong className="text-stone-300 font-mono">{threat.agent_name || 'Autonomous Agent'}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-graphite-300 line-clamp-1">
                    {threat.description || 'Payload matched zero-trust violation policy.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-graphite-400">
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
