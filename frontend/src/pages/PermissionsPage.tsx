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

      setPermissions(permRes.data.data || []);
      setTools(toolRes.data.data || []);
      setAgents(agentRes.data.data || agentRes.data.agents || []);
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

      setTools([...tools, res.data.data]);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              RBAC & Access Control
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Tool Permissions & Resources
          </h1>
          <p className="text-xs text-zinc-400">
            Least-privilege authorization matrix governing agent connectivity to tools and data stores.
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
            variant="outline"
            size="sm"
            onClick={() => setIsRegisterToolOpen(true)}
            icon={<Wrench className="w-4 h-4" />}
          >
            Register Tool
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGrantOpen(true)}
            icon={<Plus className="w-4 h-4 text-zinc-950" />}
          >
            Grant Permission
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('PERMISSIONS')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'PERMISSIONS'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Agent Access Matrix</span>
          <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 text-[10px]">
            {permissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TOOLS')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'TOOLS'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Enterprise Tool Catalog</span>
          <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 text-[10px]">
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
            icon={<KeyRound className="w-8 h-8 text-zinc-500" />}
            title="No Tool Permissions Granted"
            description="Authorize autonomous agents to access specific enterprise tools using least privilege."
            actionLabel="Grant Permission"
            onAction={() => setIsGrantOpen(true)}
          />
        ) : (
          <Card className="p-0 overflow-hidden border-zinc-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 font-mono">
                  <tr>
                    <th className="py-3 px-4 font-medium">Autonomous Agent</th>
                    <th className="py-3 px-4 font-medium">Enterprise Tool</th>
                    <th className="py-3 px-4 font-medium">Tool Category</th>
                    <th className="py-3 px-4 font-medium">Granted Privilege</th>
                    <th className="py-3 px-4 font-medium text-right">Revoke Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {permissions.map((perm) => (
                    <tr key={perm.id} className="hover:bg-zinc-850/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-medium text-zinc-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>{perm.agent_name || 'Agent'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-200 font-medium">
                        {perm.tool_name || 'Tool'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px]">
                          {perm.tool_category || 'GENERAL'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
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

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleRevokePermission(perm.id)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
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
          </Card>
        )
      ) : (
        /* Tools Catalog */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Card key={tool.id} className="border-zinc-800 bg-zinc-900/90">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-zinc-100 text-sm tracking-tight">
                      {tool.name}
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Category: {tool.category}
                    </span>
                  </div>

                  <Badge variant={getSeverityBadgeVariant(tool.risk_level)} size="sm">
                    {tool.risk_level}
                  </Badge>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2">
                  {tool.description || 'Enterprise tool accessible to agents.'}
                </p>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    {tool.is_external ? (
                      <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    )}
                    <span className="truncate">{tool.endpoint || 'Internal API'}</span>
                  </div>
                  <span className="text-[10px]">
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
        <form onSubmit={handleGrantPermission} className="space-y-4">
          {grantError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300">
              {grantError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              Select Autonomous Agent
            </label>
            <select
              required
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 p-2.5 focus:border-amber-500 focus:outline-none"
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
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              Select Enterprise Tool
            </label>
            <select
              required
              value={selectedToolId}
              onChange={(e) => setSelectedToolId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 p-2.5 focus:border-amber-500 focus:outline-none"
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
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              Permission Level
            </label>
            <select
              value={permissionLevel}
              onChange={(e) => setPermissionLevel(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 p-2.5 focus:border-amber-500 focus:outline-none"
            >
              <option value="READ">READ (Read-only queries & lookups)</option>
              <option value="WRITE">WRITE (Mutations, inserts & updates)</option>
              <option value="EXECUTE">EXECUTE (Workflow triggers, script execution)</option>
              <option value="DENY">DENY (Explicit block)</option>
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
              icon={<KeyRound className="w-4 h-4 text-zinc-950" />}
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
        subtitle="Add a new data source, API, or external service to the defense perimeter."
      >
        <form onSubmit={handleRegisterTool} className="space-y-4">
          {toolError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300">
              {toolError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">
              Tool Name
            </label>
            <input
              type="text"
              required
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="e.g. Production PostgreSQL DB, Stripe API"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 p-2.5 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              value={toolDesc}
              onChange={(e) => setToolDesc(e.target.value)}
              placeholder="Enterprise service used for..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 p-2.5 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={toolCategory}
                onChange={(e) => setToolCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 p-2 focus:border-amber-500 focus:outline-none"
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
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Risk Tier
              </label>
              <select
                value={toolRisk}
                onChange={(e) => setToolRisk(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 p-2 focus:border-amber-500 focus:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1">
              Service Endpoint / Host
            </label>
            <input
              type="text"
              value={toolEndpoint}
              onChange={(e) => setToolEndpoint(e.target.value)}
              placeholder="https://api.stripe.com/v1 or db.internal.net"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 p-2.5 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-200 pt-1">
            <input
              type="checkbox"
              checked={toolIsExternal}
              onChange={(e) => setToolIsExternal(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0"
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
              icon={<Plus className="w-4 h-4 text-zinc-950" />}
            >
              Register Tool
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
