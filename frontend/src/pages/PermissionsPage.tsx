import React, { useState, useEffect, useCallback } from 'react';
import {
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Layers,
  Trash2,
  Wrench,
  Globe,
  Database,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { permissionsApi, toolsApi, agentsApi } from '../services/api';
import { Card } from '../components/common/Card';
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
        err.response?.data?.error || 'Failed to register enterprise tool.'
      );
    } finally {
      setSubmittingTool(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-graphite-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-copper-400 indicator-breathing" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-copper-300 font-semibold">
              RBAC & CAPABILITY SCOPES
            </span>
            <span className="text-graphite-600 font-mono">|</span>
            <span className="text-[11px] font-mono text-graphite-400">ZERO-TRUST MATRIX</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-50 tracking-tight">
            Tool Permissions & Access Control
          </h1>
          <p className="text-xs text-graphite-300 mt-0.5">
            Least-privilege authorization matrix governing autonomous agent connectivity to enterprise data stores, APIs, and tools.
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
            Grant Permission
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-graphite-800 pb-3">
        <button
          onClick={() => setActiveTab('PERMISSIONS')}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'PERMISSIONS'
              ? 'bg-copper-500/15 text-copper-300 border border-copper-500/40 shadow-sm'
              : 'text-graphite-400 hover:text-stone-200 border border-transparent'
          }`}
        >
          <span>Agent Access Matrix</span>
          <span className="px-1.5 py-0.2 rounded bg-graphite-800 text-graphite-300 text-[10px]">
            {permissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TOOLS')}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'TOOLS'
              ? 'bg-graphite-800 text-stone-100 border border-graphite-700'
              : 'text-graphite-400 hover:text-stone-200 border border-transparent'
          }`}
        >
          <span>Enterprise Tool Catalog</span>
          <span className="px-1.5 py-0.2 rounded bg-graphite-800 text-graphite-300 text-[10px]">
            {tools.length}
          </span>
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <LoadingSpinner label="Loading access permissions matrix..." size="lg" fullHeight />
      ) : activeTab === 'PERMISSIONS' ? (
        /* Permissions Matrix Table */
        permissions.length === 0 ? (
          <EmptyState
            icon={<KeyRound className="w-7 h-7 text-copper-400" />}
            title="No Tool Permissions Granted"
            description="Authorize autonomous agents to access specific enterprise tools using least privilege."
            actionLabel="Grant Permission"
            onAction={() => setIsGrantOpen(true)}
          />
        ) : (
          <Card className="p-0 overflow-hidden border-graphite-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-graphite-950 border-b border-graphite-800 text-graphite-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-medium">AUTONOMOUS AGENT</th>
                    <th className="py-3 px-4 font-medium">ENTERPRISE TOOL</th>
                    <th className="py-3 px-4 font-medium">CATEGORY</th>
                    <th className="py-3 px-4 font-medium">GRANTED PRIVILEGE</th>
                    <th className="py-3 px-4 font-medium text-right">REVOKE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-800/60 font-mono">
                  {permissions.map((perm) => (
                    <tr key={perm.id} className="hover:bg-graphite-850/50 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-stone-200">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
                          <span>{perm.agent_name || 'Agent'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-stone-200 font-medium">
                        {perm.tool_name || 'Tool'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-graphite-950 border border-graphite-800 text-graphite-400 text-[10px]">
                          {perm.tool_category || 'GENERAL'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            perm.level === 'DENY'
                              ? 'block'
                              : perm.level === 'EXECUTE'
                              ? 'high'
                              : 'allow'
                          }
                          size="sm"
                        >
                          {perm.level}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRevokePermission(perm.id)}
                          className="p-1 rounded text-graphite-500 hover:text-status-red hover:bg-graphite-800 transition-colors"
                          title="Revoke Permission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        /* Tools Catalog */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Card key={tool.id} className="border-graphite-800 bg-graphite-900">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-stone-100 text-sm tracking-tight truncate max-w-[160px]">
                      {tool.name}
                    </h3>
                    <span className="text-[10px] font-mono text-graphite-400">
                      Category: {tool.category}
                    </span>
                  </div>

                  <Badge variant={getSeverityBadgeVariant(tool.risk_level)} size="sm">
                    {tool.risk_level}
                  </Badge>
                </div>

                <p className="text-xs text-graphite-300 line-clamp-2 leading-relaxed font-sans">
                  {tool.description || 'Enterprise tool accessible to agents.'}
                </p>

                <div className="pt-2 border-t border-graphite-800 flex items-center justify-between text-[11px] font-mono text-graphite-400">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    {tool.is_external ? (
                      <Globe className="w-3.5 h-3.5 text-copper-400 shrink-0" />
                    ) : (
                      <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    )}
                    <span className="truncate">{tool.endpoint || 'Internal API'}</span>
                  </div>
                  <span className="text-[10px] text-graphite-500">
                    {tool.is_external ? 'EXTERNAL' : 'INTERNAL'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Grant Permission Modal */}
      <Modal
        isOpen={isGrantOpen}
        onClose={() => setIsGrantOpen(false)}
        title="Authorize Agent Tool Access"
        subtitle="Enforce least-privilege RBAC for autonomous agent execution."
      >
        <form onSubmit={handleGrantPermission} className="space-y-3.5">
          {grantError && (
            <div className="p-3 rounded-md bg-status-red/10 border border-status-red/30 text-xs text-red-300">
              {grantError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1.5">
              Select Autonomous Agent
            </label>
            <select
              required
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            >
              <option value="">Choose an agent...</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.environment})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1.5">
              Select Enterprise Tool
            </label>
            <select
              required
              value={selectedToolId}
              onChange={(e) => setSelectedToolId(e.target.value)}
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            >
              <option value="">Choose a tool...</option>
              {tools.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1.5">
              Permission Level Scope
            </label>
            <select
              value={permissionLevel}
              onChange={(e) => setPermissionLevel(e.target.value as any)}
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            >
              <option value="READ">READ (Read-only queries & lookups)</option>
              <option value="WRITE">WRITE (Mutations, inserts & updates)</option>
              <option value="EXECUTE">EXECUTE (Workflow triggers, script execution)</option>
              <option value="DENY">DENY (Explicit zero-trust block)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setIsGrantOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingGrant}
              icon={<KeyRound className="w-4 h-4 text-graphite-950" />}
            >
              Grant Permission
            </Button>
          </div>
        </form>
      </Modal>

      {/* Register Tool Modal */}
      <Modal
        isOpen={isRegisterToolOpen}
        onClose={() => setIsRegisterToolOpen(false)}
        title="Register Enterprise Tool"
        subtitle="Add a new data store, API, or external service to the defense perimeter."
      >
        <form onSubmit={handleRegisterTool} className="space-y-3.5">
          {toolError && (
            <div className="p-3 rounded-md bg-status-red/10 border border-status-red/30 text-xs text-red-300">
              {toolError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1">
              Tool Name
            </label>
            <input
              type="text"
              required
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="e.g. Production PostgreSQL DB, Stripe API"
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1">
              Description
            </label>
            <textarea
              value={toolDesc}
              onChange={(e) => setToolDesc(e.target.value)}
              placeholder="Enterprise service used for..."
              rows={2}
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-graphite-300 mb-1">
                Category
              </label>
              <select
                value={toolCategory}
                onChange={(e) => setToolCategory(e.target.value)}
                className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 p-2 focus:border-copper-500/80 focus:outline-none font-mono"
              >
                <option value="DATABASE">DATABASE</option>
                <option value="API">API</option>
                <option value="MESSAGING">MESSAGING</option>
                <option value="CRM">CRM</option>
                <option value="PAYMENT">PAYMENT</option>
                <option value="CLOUD">CLOUD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-graphite-300 mb-1">
                Risk Tier
              </label>
              <select
                value={toolRisk}
                onChange={(e) => setToolRisk(e.target.value as any)}
                className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 p-2 focus:border-copper-500/80 focus:outline-none font-mono"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1">
              Service Endpoint / Host
            </label>
            <input
              type="text"
              value={toolEndpoint}
              onChange={(e) => setToolEndpoint(e.target.value)}
              placeholder="https://api.stripe.com/v1 or db.internal.net"
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-200 pt-1">
            <input
              type="checkbox"
              checked={toolIsExternal}
              onChange={(e) => setToolIsExternal(e.target.checked)}
              className="rounded bg-graphite-900 border-graphite-750 text-copper-500 focus:ring-0"
            />
            <span>This tool resides outside the internal private network (External SaaS / API)</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setIsRegisterToolOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingTool}
              icon={<Plus className="w-4 h-4 text-graphite-950" />}
            >
              Register Tool
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
