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
      setAgents(res.data.data || res.data.agents || []);
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

      const newAgent = res.data.data;
      setAgents([newAgent, ...agents]);
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
      setAgentDetails(res.data.data);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Autonomous Agent Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Registered AI Agents
          </h1>
          <p className="text-xs text-zinc-400">
            Lifecycle monitoring, risk profiles, and perimeter enforcement for deployed autonomous agents.
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
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRegisterOpen(true)}
            icon={<Plus className="w-4 h-4 text-zinc-950" />}
          >
            Register Agent
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <Card className="p-4 bg-zinc-900/90 border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-3 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agent by name, framework, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              className="w-full py-1.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Environments</option>
              <option value="PRODUCTION">PRODUCTION</option>
              <option value="STAGING">STAGING</option>
              <option value="DEVELOPMENT">DEVELOPMENT</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Agents Grid */}
      {loading ? (
        <LoadingSpinner label="Querying agent registry..." size="lg" fullHeight />
      ) : filteredAgents.length === 0 ? (
        <EmptyState
          icon={<Bot className="w-8 h-8 text-zinc-500" />}
          title="No Agents Registered"
          description="Register your first autonomous agent to begin monitoring tool executions."
          actionLabel="Register Agent"
          onAction={() => setIsRegisterOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((agent) => (
            <Card
              key={agent.id}
              className={`border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between ${
                agent.status === 'SUSPENDED' ? 'opacity-60 bg-zinc-950/60' : 'bg-zinc-900/90'
              }`}
            >
              <div className="space-y-4">
                {/* Agent Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-amber-400 shadow-inner">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-100 text-sm tracking-tight">
                        {agent.name}
                      </h3>
                      <span className="text-[10px] font-mono text-zinc-500">
                        ID: {agent.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  <Badge variant={getStatusBadgeVariant(agent.status)} size="sm" dot>
                    {agent.status}
                  </Badge>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2">
                  {agent.description || 'Autonomous agent connected to enterprise tools.'}
                </p>

                {/* Badges / Metadata */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                    {agent.environment}
                  </span>
                  <Badge variant={getSeverityBadgeVariant(agent.risk_level)} size="sm">
                    {agent.risk_level} RISK
                  </Badge>
                </div>

                {/* Telemetry Stats */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-zinc-950/80 rounded-lg border border-zinc-800 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">ACTIONS</span>
                    <span className="text-xs font-bold text-zinc-200">
                      {agent.total_actions || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">THREATS</span>
                    <span className="text-xs font-bold text-rose-400">
                      {agent.total_threats || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">TOOLS</span>
                    <span className="text-xs font-bold text-amber-400">
                      {agent.total_permissions || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between">
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
                      <PauseCircle className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
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
        <form onSubmit={handleCreateAgent} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              Agent Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finance-Analyst-Agent"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 p-2.5 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              Description & Purpose
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Autonomous assistant tasked with querying SQL warehouses and posting reports..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 p-2.5 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 p-2.5 focus:border-amber-500 focus:outline-none"
              >
                <option value="PRODUCTION">PRODUCTION</option>
                <option value="STAGING">STAGING</option>
                <option value="DEVELOPMENT">DEVELOPMENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                Baseline Risk Tier
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 p-2.5 focus:border-amber-500 focus:outline-none"
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
              icon={<Plus className="w-4 h-4 text-zinc-950" />}
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
            <div className="space-y-5">
              {/* Description */}
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-300">
                {selectedAgent.description || 'No description provided.'}
              </div>

              {/* Permissions list */}
              <div>
                <h4 className="text-xs font-mono font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>Authorized Enterprise Tools & Permissions</span>
                </h4>
                {agentDetails?.permissions?.length > 0 ? (
                  <div className="space-y-1.5">
                    {agentDetails.permissions.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono"
                      >
                        <span className="text-zinc-200">{p.tool_name}</span>
                        <Badge variant="allow" size="sm">
                          {p.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-500 text-center font-mono">
                    No tools explicitly granted to this agent yet.
                  </div>
                )}
              </div>

              {/* Recent Actions */}
              <div>
                <h4 className="text-xs font-mono font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>Recent Evaluated Actions</span>
                </h4>
                {agentDetails?.recentActions?.length > 0 ? (
                  <div className="space-y-1.5">
                    {agentDetails.recentActions.slice(0, 5).map((act: any) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">{act.action_type}</span>
                          <span className="text-zinc-200 truncate max-w-xs">
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
                  <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-500 text-center font-mono">
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
