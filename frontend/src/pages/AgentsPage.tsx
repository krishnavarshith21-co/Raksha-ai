import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Layers,
  KeyRound,
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { agentsApi } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge, getSeverityBadgeVariant, getStatusBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [envFilter, setEnvFilter] = useState('');

  // Register Modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState<'PRODUCTION' | 'STAGING' | 'DEVELOPMENT'>('PRODUCTION');
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Agent Detail Modal
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [agentDetails, setAgentDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await agentsApi.list();
      const list = res.data?.data || res.data?.agents || res.data || [];
      setAgents(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAgents();
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCreate(true);
    setCreateError(null);

    try {
      const res = await agentsApi.create({
        name,
        description,
        environment,
        risk_level: riskLevel,
        metadata: { framework: 'autonomous-agent-v1' },
      });

      const newAgent = res.data?.data || res.data;
      if (newAgent) {
        setAgents([newAgent, ...agents]);
      }
      setIsRegisterOpen(false);
      setName('');
      setDescription('');
    } catch (err: any) {
      setCreateError(
        err.response?.data?.error || 'Failed to register agent. Please try again.'
      );
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleToggleStatus = async (agent: any) => {
    const nextStatus = agent.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await agentsApi.update(agent.id, { status: nextStatus });
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, status: nextStatus } : a))
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleViewDetails = async (agent: any) => {
    setSelectedAgent(agent);
    setLoadingDetails(true);
    try {
      const res = await agentsApi.get(agent.id);
      setAgentDetails(res.data?.data || agent);
    } catch {
      setAgentDetails(agent);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredAgents = agents.filter((ag) => {
    if (envFilter && ag.environment !== envFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      ag.name?.toLowerCase().includes(term) ||
      ag.description?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-graphite-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-copper-400 indicator-breathing" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-copper-300 font-semibold">
              AUTONOMOUS INVENTORY & GOVERNANCE
            </span>
            <span className="text-graphite-600 font-mono">|</span>
            <span className="text-[11px] font-mono text-graphite-400">ACTIVE REGISTRY</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-50 tracking-tight">
            Registered AI Agents
          </h1>
          <p className="text-xs text-graphite-300 mt-0.5">
            Lifecycle monitoring, risk tier baselines, and tool execution boundaries for all deployed autonomous agents.
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
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRegisterOpen(true)}
            icon={<Plus className="w-4 h-4 text-graphite-950" />}
          >
            Register Agent
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-3.5 rounded-lg bg-graphite-900 border border-graphite-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="lg:col-span-3 relative">
            <Search className="w-3.5 h-3.5 text-graphite-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agent by name, framework, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <div>
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 focus:border-copper-500/80 focus:outline-none font-mono"
            >
              <option value="">All Environments</option>
              <option value="PRODUCTION">PRODUCTION</option>
              <option value="STAGING">STAGING</option>
              <option value="DEVELOPMENT">DEVELOPMENT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <LoadingSpinner label="Querying agent registry..." size="lg" fullHeight />
      ) : filteredAgents.length === 0 ? (
        <EmptyState
          icon={<Bot className="w-7 h-7 text-copper-400" />}
          title="No Agents Registered"
          description="Register your first autonomous agent to begin monitoring tool executions."
          actionLabel="Register Agent"
          onAction={() => setIsRegisterOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <Card
              key={agent.id}
              className={`hover:border-graphite-700 transition-all flex flex-col justify-between ${
                agent.status === 'SUSPENDED' ? 'opacity-60 bg-graphite-950/70' : 'bg-graphite-900'
              }`}
            >
              <div className="space-y-3.5">
                {/* Agent Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-graphite-850 border border-graphite-750 flex items-center justify-center text-copper-400 shadow-inner">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-100 text-sm tracking-tight truncate max-w-[160px]">
                        {agent.name}
                      </h3>
                      <span className="text-[10px] font-mono text-graphite-400">
                        ID: {agent.id?.slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  <Badge variant={getStatusBadgeVariant(agent.status)} size="sm" dot>
                    {agent.status}
                  </Badge>
                </div>

                <p className="text-xs text-graphite-300 line-clamp-2 leading-relaxed font-sans">
                  {agent.description || 'Autonomous agent connected to enterprise tools and external APIs.'}
                </p>

                {/* Badges / Metadata */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-graphite-950 border border-graphite-800 text-[10px] font-mono text-graphite-300">
                    {agent.environment}
                  </span>
                  <Badge variant={getSeverityBadgeVariant(agent.risk_level)} size="sm">
                    {agent.risk_level} RISK
                  </Badge>
                </div>

                {/* Telemetry Stats */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-graphite-950 rounded-md border border-graphite-800 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-graphite-500 block">ACTIONS</span>
                    <span className="text-xs font-semibold text-stone-200">
                      {agent.total_actions || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-graphite-500 block">THREATS</span>
                    <span className="text-xs font-semibold text-status-red">
                      {agent.total_threats || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-graphite-500 block">TOOLS</span>
                    <span className="text-xs font-semibold text-copper-400">
                      {agent.total_permissions || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-graphite-800 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(agent)}
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Inspect
                </Button>

                <Button
                  variant={agent.status === 'ACTIVE' ? 'secondary' : 'success'}
                  size="sm"
                  onClick={() => handleToggleStatus(agent)}
                  icon={
                    agent.status === 'ACTIVE' ? (
                      <PauseCircle className="w-3.5 h-3.5 text-graphite-400" />
                    ) : (
                      <PlayCircle className="w-3.5 h-3.5 text-status-green" />
                    )
                  }
                >
                  {agent.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Register Agent Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register Autonomous Agent"
        subtitle="Provision an agent ID in Rakshya for perimeter inline telemetry."
      >
        <form onSubmit={handleCreateAgent} className="space-y-3.5">
          {createError && (
            <div className="p-3 rounded-md bg-status-red/10 border border-status-red/30 text-xs text-red-300">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1.5">
              Agent Identifier Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finance-Analyst-Agent"
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1.5">
              Description & Purpose
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Autonomous assistant tasked with querying SQL warehouses and generating summaries..."
              rows={3}
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-graphite-300 mb-1.5">
                Runtime Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
              >
                <option value="PRODUCTION">PRODUCTION</option>
                <option value="STAGING">STAGING</option>
                <option value="DEVELOPMENT">DEVELOPMENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-graphite-300 mb-1.5">
                Baseline Risk Tier
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as any)}
                className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setIsRegisterOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingCreate}
              icon={<Plus className="w-4 h-4 text-graphite-950" />}
            >
              Register Agent
            </Button>
          </div>
        </form>
      </Modal>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <Modal
          isOpen={!!selectedAgent}
          onClose={() => {
            setSelectedAgent(null);
            setAgentDetails(null);
          }}
          maxWidth="2xl"
          title={`Agent Profile: ${selectedAgent.name}`}
          subtitle={`ID: ${selectedAgent.id} · Environment: ${selectedAgent.environment}`}
        >
          {loadingDetails ? (
            <LoadingSpinner label="Loading agent permissions and actions..." />
          ) : (
            <div className="space-y-4">
              {/* Description */}
              <div className="p-3 bg-graphite-950 rounded-md border border-graphite-800 text-xs text-graphite-300 font-mono">
                {selectedAgent.description || 'No description provided.'}
              </div>

              {/* Permissions list */}
              <div>
                <h4 className="text-xs font-mono font-medium text-stone-200 mb-2 flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-copper-400" />
                  <span>Authorized Enterprise Tools & Permissions</span>
                </h4>
                {agentDetails?.permissions?.length > 0 ? (
                  <div className="space-y-1.5">
                    {agentDetails.permissions.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded bg-graphite-950 border border-graphite-800 text-xs font-mono"
                      >
                        <span className="text-stone-200">{p.tool_name}</span>
                        <Badge variant="allow" size="sm">
                          {p.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded bg-graphite-950/60 border border-graphite-800 text-xs text-graphite-500 text-center font-mono">
                    No tools explicitly granted to this agent yet.
                  </div>
                )}
              </div>

              {/* Recent Actions */}
              <div>
                <h4 className="text-xs font-mono font-medium text-stone-200 mb-2 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>Recent Evaluated Actions</span>
                </h4>
                {agentDetails?.recentActions?.length > 0 ? (
                  <div className="space-y-1.5">
                    {agentDetails.recentActions.slice(0, 5).map((act: any) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-2.5 rounded bg-graphite-950 border border-graphite-800 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-graphite-400">{act.action_type}</span>
                          <span className="text-stone-200 truncate max-w-xs">
                            {act.resource}
                          </span>
                        </div>
                        <Badge
                          variant={act.decision === 'ALLOW' ? 'allow' : 'block'}
                          size="sm"
                        >
                          {act.decision}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded bg-graphite-950/60 border border-graphite-800 text-xs text-graphite-500 text-center font-mono">
                    No action history recorded yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
