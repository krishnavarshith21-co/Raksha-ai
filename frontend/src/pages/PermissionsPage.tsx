import React, { useState, useEffect, useCallback } from 'react';
import {
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wrench,
  Globe,
  Database,
} from 'lucide-react';
import { permissionsApi, toolsApi, agentsApi } from '../services/api';
import { Button } from '../components/common/Button';
import { Badge, getSeverityBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'PERMISSIONS' | 'TOOLS'>('PERMISSIONS');
  const [searchTerm, setSearchTerm] = useState('');

  // Grant Permission Modal
  const [isGrantOpen, setIsGrantOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedToolId, setSelectedToolId] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<'READ' | 'WRITE' | 'EXECUTE' | 'DENY'>('READ');
  const [submittingGrant, setSubmittingGrant] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);

  // Register Tool Modal
  const [isRegisterToolOpen, setIsRegisterToolOpen] = useState(false);
  const [toolName, setToolName] = useState('');
  const [toolDesc, setToolDesc] = useState('');
  const [toolCategory, setToolCategory] = useState('DATABASE');
  const [toolEndpoint, setToolEndpoint] = useState('');
  const [toolIsExternal, setToolIsExternal] = useState(false);
  const [toolRisk, setToolRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [submittingTool, setSubmittingTool] = useState(false);
  const [toolError, setToolError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [permRes, toolRes, agentRes] = await Promise.all([
        permissionsApi.list().catch(() => ({ data: { data: [] } })),
        toolsApi.list().catch(() => ({ data: { data: [] } })),
        agentsApi.list().catch(() => ({ data: { data: [] } })),
      ]);

      const permList = permRes.data?.data || permRes.data || [];
      const toolList = toolRes.data?.data || toolRes.data || [];
      const agentList = agentRes.data?.data || agentRes.data?.agents || agentRes.data || [];

      setPermissions(Array.isArray(permList) ? permList : []);
      setTools(Array.isArray(toolList) ? toolList : []);
      setAgents(Array.isArray(agentList) ? agentList : []);
    } catch (err) {
      console.error('Failed to load access matrix:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleGrantPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingGrant(true);
    setGrantError(null);

    try {
      await permissionsApi.create({
        agent_id: selectedAgentId,
        tool_id: selectedToolId,
        level: permissionLevel,
      });

      await fetchData();
      setIsGrantOpen(false);
      setSelectedAgentId('');
      setSelectedToolId('');
    } catch (err: any) {
      setGrantError(
        err.response?.data?.error || 'Failed to grant permission.'
      );
    } finally {
      setSubmittingGrant(false);
    }
  };

  const handleRevokePermission = async (id: string) => {
    if (!window.confirm('Revoke this tool permission from the agent?')) return;
    try {
      await permissionsApi.delete(id);
      setPermissions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to revoke permission:', err);
    }
  };

  const handleRegisterTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTool(true);
    setToolError(null);

    try {
      const res = await toolsApi.create({
        name: toolName,
        description: toolDesc,
        category: toolCategory,
        endpoint: toolEndpoint,
        is_external: toolIsExternal,
        risk_level: toolRisk,
      });

      const newTool = res.data?.data || res.data;
      if (newTool) {
        setTools([...tools, newTool]);
      }
      setIsRegisterToolOpen(false);
      setToolName('');
      setToolDesc('');
      setToolEndpoint('');
    } catch (err: any) {
      setToolError(
        err.response?.data?.error || 'Failed to register tool.'
      );
    } finally {
      setSubmittingTool(false);
    }
  };

  const filteredPermissions = permissions.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.agent_name?.toLowerCase().includes(term) ||
      p.tool_name?.toLowerCase().includes(term) ||
      p.level?.toLowerCase().includes(term)
    );
  });

  const filteredTools = tools.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.name?.toLowerCase().includes(term) ||
      t.category?.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1f]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-copper-400 ring-4 ring-copper-400/10" />
            <span className="text-[11.5px] font-mono uppercase tracking-widest text-copper-400 font-medium">
              RBAC & CAPABILITY SCOPES
            </span>
            <span className="text-graphite-600 font-mono text-[11px]">/</span>
            <span className="text-[11.5px] font-mono text-graphite-400">ZERO-TRUST MATRIX</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display text-stone-100 tracking-tight">
            Tool Permissions
          </h1>
          <p className="text-[14.5px] text-graphite-400 mt-1">
            Least-privilege authorization matrix governing agent connectivity to data stores, APIs, and tools.
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
            Refresh Matrix
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRegisterToolOpen(true)}
            icon={<Wrench className="w-3.5 h-3.5" />}
          >
            Register Tool
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGrantOpen(true)}
            icon={<Plus className="w-4 h-4 text-graphite-950" />}
          >
            Grant Scope
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#1c1c1f] pb-3">
        <button
          onClick={() => setActiveTab('PERMISSIONS')}
          className={`pb-1 text-[13.5px] font-mono transition-colors cursor-pointer flex items-center gap-2 border-b-2 -mb-3.5 ${
            activeTab === 'PERMISSIONS'
              ? 'border-copper-500 text-stone-100 font-medium'
              : 'border-transparent text-graphite-400 hover:text-stone-300'
          }`}
        >
          <span>Access Matrix</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#161618] text-graphite-300 border border-[#26262a]">
            {permissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TOOLS')}
          className={`pb-1 text-[13.5px] font-mono transition-colors cursor-pointer flex items-center gap-2 border-b-2 -mb-3.5 ${
            activeTab === 'TOOLS'
              ? 'border-copper-500 text-stone-100 font-medium'
              : 'border-transparent text-graphite-400 hover:text-stone-300'
          }`}
        >
          <span>Tool Catalog</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#161618] text-graphite-300 border border-[#26262a]">
            {tools.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading access permissions matrix..." size="lg" fullHeight />
      ) : activeTab === 'PERMISSIONS' ? (
        filteredPermissions.length === 0 ? (
          <EmptyState
            icon={<KeyRound className="w-5 h-5 text-copper-400" />}
            title="No Tool Permissions Granted"
            description="Authorize autonomous agents to access specific enterprise tools using least privilege."
            actionLabel="Grant Permission"
            onAction={() => setIsGrantOpen(true)}
          />
        ) : (
          <div className="surface-card rounded-xl border border-[#1e1e21] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0b0b0c] border-b border-[#1e1e21] text-graphite-400 font-mono text-[11px] tracking-wider uppercase">
                  <tr>
                    <th className="py-3.5 px-4 font-medium">AGENT IDENTITY</th>
                    <th className="py-3.5 px-4 font-medium">TOOL RESOURCE</th>
                    <th className="py-3.5 px-4 font-medium">CAPABILITY LEVEL</th>
                    <th className="py-3.5 px-4 font-medium">PROVISIONED</th>
                    <th className="py-3.5 px-4 font-medium text-right">REVOKE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18181b] font-mono text-[13.5px]">
                  {filteredPermissions.map((perm) => (
                    <tr key={perm.id} className="hover:bg-graphite-800/30 transition-colors group">
                      <td className="py-4 px-4 text-stone-100 font-medium font-sans">
                        {perm.agent_name || 'Agent'}
                      </td>
                      <td className="py-4 px-4 text-stone-200">
                        {perm.tool_name || 'Tool'}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold tracking-wide border ${
                            perm.level === 'DENY'
                              ? 'bg-red-500/10 text-red-400 border-red-500/25'
                              : perm.level === 'EXECUTE'
                              ? 'bg-copper-500/15 text-copper-300 border-copper-500/30'
                              : perm.level === 'WRITE'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          }`}
                        >
                          {perm.level}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-graphite-400 text-[12px]">
                        {perm.created_at ? new Date(perm.created_at).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleRevokePermission(perm.id)}
                          className="p-1.5 rounded-lg text-graphite-500 opacity-40 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Revoke Permission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Tools Grid */
        filteredTools.length === 0 ? (
          <EmptyState
            icon={<Wrench className="w-5 h-5 text-copper-400" />}
            title="Tool Catalog Empty"
            description="Register APIs and tools to enforce proxy governance."
            actionLabel="Register Tool"
            onAction={() => setIsRegisterToolOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="surface-card-hover p-6 rounded-xl border border-[#1e1e21] flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#141416] border border-[#26262a] flex items-center justify-center text-copper-400 group-hover:border-copper-400/40 transition-colors">
                        {tool.is_external ? <Globe className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-stone-100 text-[16px] font-sans truncate max-w-[170px]">
                          {tool.name}
                        </h4>
                        <span className="text-[11.5px] font-mono text-graphite-400">
                          {tool.category}
                        </span>
                      </div>
                    </div>

                    <Badge variant={getSeverityBadgeVariant(tool.risk_level)} size="sm">
                      {tool.risk_level}
                    </Badge>
                  </div>

                  <p className="text-[14px] text-graphite-300 font-sans line-clamp-2 leading-relaxed">
                    {tool.description || 'Enterprise tool endpoint governed by zero-trust gateway.'}
                  </p>

                  {tool.endpoint && (
                    <div className="p-2.5 rounded-lg bg-[#070708] border border-[#1e1e21] font-mono text-[12px] text-stone-300 truncate">
                      {tool.endpoint}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Grant Scope Modal */}
      <Modal
        isOpen={isGrantOpen}
        onClose={() => setIsGrantOpen(false)}
        maxWidth="md"
        title="Grant Tool Permission Scope"
        subtitle="Establish least-privilege binding between agent and tool"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGrantOpen(false)}
              disabled={submittingGrant}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGrantPermission}
              loading={submittingGrant}
            >
              Grant Capability
            </Button>
          </div>
        }
      >
        <form onSubmit={handleGrantPermission} className="space-y-3">
          {grantError && (
            <div className="p-2 rounded bg-status-red/10 border border-status-red/25 text-xs text-status-red">
              {grantError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Select Agent
            </label>
            <select
              required
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full p-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 font-mono"
            >
              <option value="">-- Choose Agent Identity --</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.environment})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Select Enterprise Tool
            </label>
            <select
              required
              value={selectedToolId}
              onChange={(e) => setSelectedToolId(e.target.value)}
              className="w-full p-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 font-mono"
            >
              <option value="">-- Choose Tool Resource --</option>
              {tools.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Access Scope
            </label>
            <select
              value={permissionLevel}
              onChange={(e: any) => setPermissionLevel(e.target.value)}
              className="w-full p-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 font-mono"
            >
              <option value="READ">READ (Inspection Only)</option>
              <option value="WRITE">WRITE (State Mutation Allowed)</option>
              <option value="EXECUTE">EXECUTE (Full Invocation)</option>
              <option value="DENY">DENY (Explicit Restriction)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Register Tool Modal */}
      <Modal
        isOpen={isRegisterToolOpen}
        onClose={() => setIsRegisterToolOpen(false)}
        maxWidth="md"
        title="Register Tool Resource"
        subtitle="Add a managed tool to the security enforcement catalog"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRegisterToolOpen(false)}
              disabled={submittingTool}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRegisterTool}
              loading={submittingTool}
            >
              Register Tool
            </Button>
          </div>
        }
      >
        <form onSubmit={handleRegisterTool} className="space-y-3">
          {toolError && (
            <div className="p-2 rounded bg-status-red/10 border border-status-red/25 text-xs text-status-red">
              {toolError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Tool Name
            </label>
            <input
              type="text"
              required
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="e.g. snowflake_query_executor"
              className="w-full p-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={toolDesc}
              onChange={(e) => setToolDesc(e.target.value)}
              placeholder="Operational capabilities..."
              className="w-full p-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
                Category
              </label>
              <select
                value={toolCategory}
                onChange={(e) => setToolCategory(e.target.value)}
                className="w-full p-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 font-mono"
              >
                <option value="DATABASE">DATABASE</option>
                <option value="API">API</option>
                <option value="FILESYSTEM">FILESYSTEM</option>
                <option value="SHELL">SHELL</option>
                <option value="PAYMENT">PAYMENT</option>
                <option value="COMMUNICATION">COMMUNICATION</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
                Inherent Risk Tier
              </label>
              <select
                value={toolRisk}
                onChange={(e: any) => setToolRisk(e.target.value)}
                className="w-full p-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 font-mono"
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
    </div>
  );
};
