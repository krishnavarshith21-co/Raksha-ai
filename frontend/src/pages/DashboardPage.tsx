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
      const rawThreats = threatsRes.data?.data || [];
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
      const rawRisk = riskRes.data?.data || [];
      setRiskDistribution(
        rawRisk.map((r: any) => ({
          level: r.risk_level || 'UNKNOWN',
          count: parseInt(r.count || 0),
        }))
      );

      // Decisions formatting
      const rawDecisions = decisionRes.data?.data || [];
      setActionsByDecision(
        rawDecisions.map((d: any) => ({
          decision: d.decision || 'UNKNOWN',
          count: parseInt(d.count || 0),
        }))
      );

      // Agent activity
      setAgentActivity(activityRes.data?.data || []);

      // Recent threats
      setRecentThreats(
        recentThreatsRes.data?.threats || recentThreatsRes.data || []
      );
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
    return <LoadingSpinner label="Loading defense metrics and active threat feeds..." size="lg" fullHeight />;
  }

  const blockRate =
    metrics.totalActions > 0
      ? Math.round((metrics.blockedActions / metrics.totalActions) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header with status & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Live Threat Interception Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Security Enforcement Overview
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time proxy telemetry, behavioral risk scores, and autonomous agent governance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh Data
          </Button>
          <Link to="/simulator">
            <Button
              variant="primary"
              size="sm"
              icon={<Flame className="w-3.5 h-3.5 text-zinc-950" />}
            >
              Simulate Action
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Actions */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Evaluated Actions</span>
            <Activity className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {metrics.totalActions?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-400">
            <span className="text-emerald-400 font-mono font-medium">
              {metrics.allowedActions?.toLocaleString() || 0}
            </span>
            <span>allowed by policy</span>
          </div>
        </Card>

        {/* Blocked Actions */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Attacks Enforced</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {metrics.blockedActions?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-400">
            <span className="text-rose-400 font-mono font-medium">{blockRate}%</span>
            <span>block rate</span>
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Pending Approvals</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {metrics.pendingApprovals?.toLocaleString() || 0}
          </div>
          <div className="mt-2">
            <Link
              to="/approvals"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
            >
              <span>Review queue</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Critical Threats */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Critical Threats</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">
            {metrics.criticalThreats?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-400 truncate">
            <span className="text-orange-400 font-mono">
              {metrics.promptInjectionAttempts || 0}
            </span>
            <span>injections intercepted</span>
          </div>
        </Card>

        {/* Sensitive Data Exposures */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Data Leaks Stopped</span>
            <FileLock2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-400">
            {metrics.sensitiveDataEvents?.toLocaleString() || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-400">
            <span className="text-sky-400 font-mono">
              {metrics.dataExfiltrationAttempts || 0}
            </span>
            <span>exfiltrations stopped</span>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threats Over Time Chart */}
        <Card
          title="Incident Trends & Intercepted Threats"
          subtitle="Autonomous agent threat occurrences evaluated across time"
          className="lg:col-span-2"
          action={
            <Link
              to="/threats"
              className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 font-mono"
            >
              <span>View all</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          <ThreatsChart data={threatsOverTime} height={250} />
        </Card>

        {/* Action Decisions Donut */}
        <Card
          title="Decision Distribution"
          subtitle="Enforcement verdicts across recent actions"
          action={
            <Link
              to="/actions"
              className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 font-mono"
            >
              <span>Stream</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          <DecisionsPieChart data={actionsByDecision} height={250} />
        </Card>
      </div>

      {/* Second Row: Risk Distribution & Agent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Level Distribution */}
        <Card
          title="Action Risk Distribution"
          subtitle="Breakdown of actions by evaluated risk tier"
        >
          <RiskDistributionChart data={riskDistribution} height={240} />
        </Card>

        {/* Top Active Agents */}
        <Card
          title="Agent Activity & Risk Assessment"
          subtitle="Top active agents governed by Rakshya gateway"
          className="lg:col-span-2"
          action={
            <Link
              to="/agents"
              className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 font-mono"
            >
              <span>Manage agents</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          }
        >
          {agentActivity.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-zinc-500">
              No agent telemetry recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                    <th className="pb-2.5 font-medium">Agent Name</th>
                    <th className="pb-2.5 font-medium text-right">Total</th>
                    <th className="pb-2.5 font-medium text-right">Allowed</th>
                    <th className="pb-2.5 font-medium text-right">Blocked</th>
                    <th className="pb-2.5 font-medium pl-6">Average Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {agentActivity.slice(0, 5).map((agent: any, idx: number) => (
                    <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 text-zinc-200 font-sans font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {agent.agent_name}
                      </td>
                      <td className="py-3 text-right text-zinc-300 font-semibold">
                        {agent.total_actions}
                      </td>
                      <td className="py-3 text-right text-emerald-400">
                        {agent.allowed}
                      </td>
                      <td className="py-3 text-right text-rose-400">
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
        title="Recent Security Incidents & Threat Events"
        subtitle="Live feed of suspicious activities and policy enforcement blocks"
        action={
          <Link
            to="/threats"
            className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
          >
            <span>Incident Center</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {recentThreats.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-zinc-500">
            No active threat incidents currently reported
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {recentThreats.map((threat: any) => (
              <div
                key={threat.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-850/40 px-2 rounded-lg transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityBadgeVariant(threat.severity)} size="sm">
                      {threat.severity}
                    </Badge>
                    <span className="text-xs font-mono text-zinc-200 font-semibold">
                      {threat.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-zinc-500 text-xs">·</span>
                    <span className="text-xs text-zinc-400">
                      Agent: <strong className="text-zinc-300 font-mono">{threat.agent_name || 'Autonomous Agent'}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {threat.description || 'Behavior matched malicious pattern signatures.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-zinc-500">
                    {threat.created_at ? new Date(threat.created_at).toLocaleTimeString() : 'Just now'}
                  </span>
                  <Link to={`/threats`}>
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
