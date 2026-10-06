import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  Plus,
  RefreshCw,
  Search,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import { agentsApi } from '../services/api';
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-graphite-750/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-copper-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-copper-400 font-medium">
              AUTONOMOUS INVENTORY & GOVERNANCE
            </span>
            <span className="text-graphite-600 font-mono text-[10px]">/</span>
            <span className="text-[10px] font-mono text-graphite-400">ACTIVE REGISTRY</span>
          </div>
          <h1 className="text-xl font-medium text-stone-100 tracking-tight">
            Agent Inventory
          </h1>
          <p className="text-xs text-graphite-400 mt-0.5">
            Lifecycle tracking, risk tier baselines, and tool execution boundaries.
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
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRegisterOpen(true)}
            icon={<Plus className="w-3.5 h-3.5 text-graphite-950" />}
          >
            Register Agent
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-2.5 rounded-lg bg-graphite-850 border border-graphite-750">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="lg:col-span-3 relative">
            <Search className="w-3.5 h-3.5 text-graphite-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search agent by name, framework, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              className="w-full py-1 px-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-graphite-300 focus:border-copper-500 focus:outline-none font-mono"
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
          icon={<Bot className="w-5 h-5 text-copper-400" />}
          title="No Agents Registered"
          description="Register your first autonomous agent to begin monitoring tool executions."
          actionLabel="Register Agent"
          onAction={() => setIsRegisterOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className={`p-4 rounded-lg bg-graphite-850 border border-graphite-750 hover:border-graphite-700 transition-all flex flex-col justify-between ${
                agent.status === 'SUSPENDED' ? 'opacity-65' : ''
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-graphite-900 border border-graphite-750 flex items-center justify-center text-copper-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-stone-100 text-xs tracking-tight truncate max-w-[150px]">
                        {agent.name}
                      </h3>
                      <span className="text-[10px] font-mono text-graphite-500">
                        {agent.id?.slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  <Badge variant={getStatusBadgeVariant(agent.status)} size="sm">
                    {agent.status}
                  </Badge>
                </div>

                <p className="text-xs text-graphite-400 line-clamp-2 leading-relaxed">
                  {agent.description || 'Autonomous agent runtime configured under zero-trust proxy policy.'}
                </p>

                {/* Inline Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-graphite-750/70 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-graphite-500 uppercase block">ENV</span>
                    <span className="text-stone-300 font-medium">{agent.environment}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-graphite-500 uppercase block">RISK POSTURE</span>
                    <span className="text-stone-300 font-medium">
                      <Badge variant={getSeverityBadgeVariant(agent.risk_level)} size="sm">
                        {agent.risk_level}
                      </Badge>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 mt-3 border-t border-graphite-750/70 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(agent)}
                >
                  Inspect Policy
                </Button>

                <Button
                  variant={agent.status === 'ACTIVE' ? 'ghost' : 'success'}
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
                  {agent.status === 'ACTIVE' ? 'Suspend' : 'Resume'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Agent Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        maxWidth="md"
        title="Register Autonomous Agent"
        subtitle="Establish zero-trust enforcement boundaries for an agent identity"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRegisterOpen(false)}
              disabled={submittingCreate}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateAgent}
              loading={submittingCreate}
            >
              Register Identity
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateAgent} className="space-y-3">
          {createError && (
            <div className="p-2 rounded bg-status-red/10 border border-status-red/25 text-xs text-status-red">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Agent Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. data-pipeline-agent"
              className="w-full px-2.5 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Purpose & Operational Scope
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe authorized tasks and scope..."
              className="w-full px-2.5 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
                Environment
              </label>
              <select
                value={environment}
                onChange={(e: any) => setEnvironment(e.target.value)}
                className="w-full px-2 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 font-mono"
              >
                <option value="PRODUCTION">PRODUCTION</option>
                <option value="STAGING">STAGING</option>
                <option value="DEVELOPMENT">DEVELOPMENT</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
                Risk Tier Baseline
              </label>
              <select
                value={riskLevel}
                onChange={(e: any) => setRiskLevel(e.target.value)}
                className="w-full px-2 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 font-mono"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Agent Detail / Inspection Modal */}
      {selectedAgent && (
        <Modal
          isOpen={!!selectedAgent}
          onClose={() => setSelectedAgent(null)}
          maxWidth="lg"
          title={`Agent Inspection: ${selectedAgent.name}`}
          subtitle={`Runtime ID: ${selectedAgent.id}`}
        >
          {loadingDetails ? (
            <LoadingSpinner label="Querying agent telemetry..." size="md" />
          ) : (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-graphite-900 rounded border border-graphite-750 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-graphite-500">Status:</span>
                  <Badge variant={getStatusBadgeVariant(selectedAgent.status)} size="sm">
                    {selectedAgent.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite-500">Environment:</span>
                  <span className="text-stone-200">{selectedAgent.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite-500">Risk Tier:</span>
                  <span className="text-copper-400">{selectedAgent.risk_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite-500">Registered:</span>
                  <span className="text-stone-300">{new Date(selectedAgent.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase text-graphite-500 block mb-1">
                  Scope Description
                </span>
                <div className="p-2.5 bg-graphite-900 rounded border border-graphite-750 font-sans text-stone-300 text-xs">
                  {selectedAgent.description || 'No description provided.'}
                </div>
              </div>

              {agentDetails?.metadata && (
                <div>
                  <span className="text-[10px] uppercase text-graphite-500 block mb-1">
                    Runtime Metadata
                  </span>
                  <pre className="p-2.5 bg-graphite-950 rounded border border-graphite-800 text-[11px] text-stone-300 overflow-x-auto">
                    {JSON.stringify(agentDetails.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
