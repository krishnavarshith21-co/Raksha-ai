import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollText,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ToggleLeft,
  ToggleRight,
  Trash2,
  AlertTriangle,
  Lock,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { policiesApi } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge, getSeverityBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const PoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Policy Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rule, setRule] = useState('CUSTOM_RULE');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [requireApproval, setRequireApproval] = useState(false);
  const [blockExternal, setBlockExternal] = useState(false);
  const [selectedActionTypes, setSelectedActionTypes] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([]);
  const [resourceKeywords, setResourceKeywords] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    try {
      const res = await policiesApi.list();
      const list = res.data?.data || res.data?.policies || res.data || [];
      setPolicies(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPolicies();
  };

  const handleTogglePolicy = async (policy: any) => {
    const nextActive = !policy.is_active;
    try {
      await policiesApi.update(policy.id, { is_active: nextActive });
      setPolicies((prev) =>
        prev.map((p) => (p.id === policy.id ? { ...p, is_active: nextActive } : p))
      );
    } catch (err) {
      console.error('Failed to toggle policy:', err);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this security policy?')) return;
    try {
      await policiesApi.delete(id);
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete policy:', err);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCreate(true);
    setCreateError(null);

    const conditions: any = {
      require_approval: requireApproval,
      block_external: blockExternal,
    };

    if (selectedActionTypes.length > 0) {
      conditions.action_types = selectedActionTypes;
    }
    if (selectedClassifications.length > 0) {
      conditions.data_classifications = selectedClassifications;
    }
    if (resourceKeywords.trim()) {
      conditions.resources = resourceKeywords
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    try {
      const res = await policiesApi.create({
        name,
        description,
        rule,
        severity,
        is_active: true,
        conditions,
      });

      const newPolicy = res.data?.data || res.data;
      if (newPolicy) {
        setPolicies([newPolicy, ...policies]);
      }
      setIsCreateOpen(false);
      // Reset form
      setName('');
      setDescription('');
      setSelectedActionTypes([]);
      setSelectedClassifications([]);
      setResourceKeywords('');
      setRequireApproval(false);
      setBlockExternal(false);
    } catch (err: any) {
      setCreateError(
        err.response?.data?.error || 'Failed to create policy. Please verify inputs.'
      );
    } finally {
      setSubmittingCreate(false);
    }
  };

  const toggleActionType = (type: string) => {
    setSelectedActionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleClassification = (cls: string) => {
    setSelectedClassifications((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const filteredPolicies = policies.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.rule?.toLowerCase().includes(term)
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
              POLICY ENFORCEMENT ENGINE
            </span>
            <span className="text-graphite-600 font-mono">|</span>
            <span className="text-[11px] font-mono text-graphite-400">DECLARATIVE GUARDRAILS</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-50 tracking-tight">
            Security Governance Policies
          </h1>
          <p className="text-xs text-graphite-300 mt-0.5">
            Define declarative perimeter rules, data access boundaries, and dual-custody approval criteria for all autonomous agents.
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
            onClick={() => setIsCreateOpen(true)}
            icon={<Plus className="w-4 h-4 text-graphite-950" />}
          >
            Create Policy
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-3.5 rounded-lg bg-graphite-900 border border-graphite-800 shadow-sm">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-graphite-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search policies by rule name, resource target, or classification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500/80 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Policies List */}
      {loading ? (
        <LoadingSpinner label="Loading policy rules..." size="lg" fullHeight />
      ) : filteredPolicies.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="w-7 h-7 text-copper-400" />}
          title="No Policies Configured"
          description="Create your first perimeter security policy to enforce autonomous agent boundaries."
          actionLabel="Create Policy"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredPolicies.map((policy) => {
            const cond = policy.conditions || {};
            return (
              <Card
                key={policy.id}
                className={`transition-all ${
                  policy.is_active ? 'bg-graphite-900' : 'bg-graphite-950/70 opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge variant={getSeverityBadgeVariant(policy.severity)} size="sm">
                        {policy.severity}
                      </Badge>
                      <h3 className="font-semibold text-stone-100 text-sm font-sans">
                        {policy.name}
                      </h3>
                      <span className="text-graphite-600">·</span>
                      <span className="text-[10px] font-mono text-graphite-300 px-1.5 py-0.2 rounded bg-graphite-800 border border-graphite-700">
                        {policy.rule || 'RULE'}
                      </span>
                    </div>

                    <p className="text-xs text-graphite-300 font-sans leading-relaxed">
                      {policy.description || 'Enterprise security policy rule.'}
                    </p>

                    {/* Conditions Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {cond.require_approval && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[10px] font-mono">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Requires Approval</span>
                        </span>
                      )}
                      {cond.block_external && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[10px] font-mono">
                          <Globe className="w-3 h-3" />
                          <span>Blocks External</span>
                        </span>
                      )}
                      {cond.action_types?.map((at: string) => (
                        <span
                          key={at}
                          className="px-2 py-0.5 rounded bg-graphite-800 border border-graphite-700 text-stone-300 text-[10px] font-mono"
                        >
                          Restricts: {at}
                        </span>
                      ))}
                      {cond.data_classifications?.map((dc: string) => (
                        <span
                          key={dc}
                          className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/50 text-sky-300 text-[10px] font-mono"
                        >
                          Data: {dc}
                        </span>
                      ))}
                      {cond.resources?.map((res: string) => (
                        <span
                          key={res}
                          className="px-2 py-0.5 rounded bg-graphite-950 border border-graphite-800 text-graphite-400 text-[10px] font-mono"
                        >
                          Path: {res}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-graphite-800">
                    <button
                      onClick={() => handleTogglePolicy(policy)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer border ${
                        policy.is_active
                          ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300'
                          : 'bg-graphite-900 border-graphite-800 text-graphite-500'
                      }`}
                    >
                      {policy.is_active ? (
                        <ToggleRight className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-graphite-500" />
                      )}
                      <span>{policy.is_active ? 'ENFORCING' : 'DISABLED'}</span>
                    </button>

                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="p-1.5 rounded-md text-graphite-500 hover:text-status-red hover:bg-graphite-800 transition-colors"
                      title="Delete Policy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Policy Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        maxWidth="xl"
        title="Create Security Policy"
        subtitle="Configure declarative enforcement rules to restrict autonomous agent operations."
      >
        <form onSubmit={handleCreatePolicy} className="space-y-3.5">
          {createError && (
            <div className="p-3 rounded-md bg-status-red/10 border border-status-red/30 text-xs text-red-300">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1">
              Policy Rule Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Block PII Export Outside Enterprise Perimeter"
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1">
              Description & Operational Context
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the security intention and operational context for audit reporting..."
              rows={2}
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-graphite-300 mb-1">
                Violation Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 p-2 focus:border-copper-500/80 focus:outline-none font-mono"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH (Enforces Block)</option>
                <option value="CRITICAL">CRITICAL (Enforces Block)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-graphite-300 mb-1">
                Rule Code Identifier
              </label>
              <input
                type="text"
                value={rule}
                onChange={(e) => setRule(e.target.value)}
                placeholder="RULE_CODE_ID"
                className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2 focus:border-copper-500/80 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Action Flags */}
          <div className="p-3 bg-graphite-950 rounded-md border border-graphite-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-200">
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="rounded bg-graphite-900 border-graphite-700 text-copper-500 focus:ring-0"
              />
              <span>Trigger Human Approval Queue (Decision: REQUIRE_APPROVAL)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-200">
              <input
                type="checkbox"
                checked={blockExternal}
                onChange={(e) => setBlockExternal(e.target.checked)}
                className="rounded bg-graphite-900 border-graphite-700 text-copper-500 focus:ring-0"
              />
              <span>Block Outbound External Network Destinations</span>
            </label>
          </div>

          {/* Action Types */}
          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1.5">
              Restricted Action Types (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['READ', 'WRITE', 'DELETE', 'EXPORT', 'SEND', 'UPLOAD', 'EXECUTE'].map((act) => {
                const isSelected = selectedActionTypes.includes(act);
                return (
                  <button
                    key={act}
                    type="button"
                    onClick={() => toggleActionType(act)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-copper-500/20 border-copper-500/60 text-copper-300 font-bold'
                        : 'bg-graphite-950 border-graphite-800 text-graphite-400 hover:text-stone-200'
                    }`}
                  >
                    {act}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data Classifications */}
          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1.5">
              Restricted Data Classifications
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'].map((cls) => {
                const isSelected = selectedClassifications.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClassification(cls)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-500/60 text-sky-300 font-bold'
                        : 'bg-graphite-950 border-graphite-800 text-graphite-400 hover:text-stone-200'
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resource keywords */}
          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1">
              Restricted Resource Substrings (comma separated)
            </label>
            <input
              type="text"
              value={resourceKeywords}
              onChange={(e) => setResourceKeywords(e.target.value)}
              placeholder="e.g. production_db, customer_secrets, /admin"
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingCreate}
              icon={<Plus className="w-4 h-4 text-graphite-950" />}
            >
              Enforce Policy
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
