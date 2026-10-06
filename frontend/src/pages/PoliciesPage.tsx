import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Lock,
  Globe,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { policiesApi } from '../services/api';
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
    if (!window.confirm('Delete this security enforcement policy?')) return;
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-graphite-750/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-copper-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-copper-400 font-medium">
              POLICY ENFORCEMENT ENGINE
            </span>
            <span className="text-graphite-600 font-mono text-[10px]">/</span>
            <span className="text-[10px] font-mono text-graphite-400">DECLARATIVE GUARDRAILS</span>
          </div>
          <h1 className="text-xl font-medium text-stone-100 tracking-tight">
            Security Policies
          </h1>
          <p className="text-xs text-graphite-400 mt-0.5">
            Declarative perimeter rules, data boundaries, and dual-custody approval criteria.
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
            onClick={() => setIsCreateOpen(true)}
            icon={<Plus className="w-3.5 h-3.5 text-graphite-950" />}
          >
            Create Policy
          </Button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="p-2.5 rounded-lg bg-graphite-850 border border-graphite-750">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-graphite-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search policies by name, rule identifier, or resource target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Policies List */}
      {loading ? (
        <LoadingSpinner label="Compiling policy engine rules..." size="lg" fullHeight />
      ) : filteredPolicies.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="w-5 h-5 text-copper-400" />}
          title="No Policies Configured"
          description="Create your first perimeter security policy to enforce autonomous agent boundaries."
          actionLabel="Create Policy"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredPolicies.map((policy) => {
            const cond = policy.conditions || {};
            return (
              <div
                key={policy.id}
                className={`p-3.5 rounded-lg bg-graphite-850 border border-graphite-750 transition-all ${
                  policy.is_active ? '' : 'opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getSeverityBadgeVariant(policy.severity)} size="sm">
                        {policy.severity}
                      </Badge>
                      <h3 className="font-medium text-stone-100 text-xs font-sans">
                        {policy.name}
                      </h3>
                      <span className="text-graphite-600 text-xs">/</span>
                      <span className="text-[10px] font-mono text-copper-400">
                        {policy.rule}
                      </span>
                    </div>

                    <p className="text-xs text-graphite-400 font-sans leading-relaxed">
                      {policy.description || 'Enterprise declarative security rule active on agent proxy.'}
                    </p>

                    {/* Condition badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {cond.require_approval && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-status-yellow/10 text-status-yellow border border-status-yellow/25">
                          <Lock className="w-3 h-3" />
                          <span>Requires Approval</span>
                        </span>
                      )}

                      {cond.block_external && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-status-red/10 text-status-red border border-status-red/25">
                          <Globe className="w-3 h-3" />
                          <span>Block External Egress</span>
                        </span>
                      )}

                      {cond.action_types?.map((at: string) => (
                        <span
                          key={at}
                          className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-graphite-900 text-graphite-400 border border-graphite-750"
                        >
                          {at}
                        </span>
                      ))}

                      {cond.data_classifications?.map((dc: string) => (
                        <span
                          key={dc}
                          className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-status-blue/10 text-status-blue border border-status-blue/25"
                        >
                          {dc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTogglePolicy(policy)}
                      className="p-1 rounded text-graphite-400 hover:text-stone-200 transition-colors cursor-pointer"
                      title={policy.is_active ? 'Disable Policy' : 'Enable Policy'}
                    >
                      {policy.is_active ? (
                        <ToggleRight className="w-6 h-6 text-status-green" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-graphite-600" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="p-1 rounded text-graphite-500 hover:text-status-red transition-colors cursor-pointer"
                      title="Delete Policy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Policy Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        maxWidth="lg"
        title="Construct Security Policy"
        subtitle="Define declarative rule and enforcement constraints"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
              disabled={submittingCreate}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreatePolicy}
              loading={submittingCreate}
            >
              Enforce Policy
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreatePolicy} className="space-y-3">
          {createError && (
            <div className="p-2 rounded bg-status-red/10 border border-status-red/25 text-xs text-status-red">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Policy Rule Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Block PII Export in Shell Commands"
              className="w-full px-2.5 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Rationale & Enforcement Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe why this constraint is mandated..."
              className="w-full px-2.5 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
                Rule Identifier
              </label>
              <input
                type="text"
                value={rule}
                onChange={(e) => setRule(e.target.value)}
                placeholder="CUSTOM_RULE"
                className="w-full px-2 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
                Violation Severity
              </label>
              <select
                value={severity}
                onChange={(e: any) => setSeverity(e.target.value)}
                className="w-full px-2 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 font-mono"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          {/* Action Types */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1.5">
              Target Operation Types
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['READ', 'WRITE', 'EXECUTE', 'EXPORT', 'SEND', 'UPLOAD', 'DELETE'].map((at) => (
                <button
                  type="button"
                  key={at}
                  onClick={() => toggleActionType(at)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer border ${
                    selectedActionTypes.includes(at)
                      ? 'bg-copper-500 text-graphite-950 border-copper-400 font-medium'
                      : 'bg-graphite-900 text-graphite-400 border-graphite-750 hover:text-stone-200'
                  }`}
                >
                  {at}
                </button>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4 pt-1 font-mono text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="rounded border-graphite-700 bg-graphite-900 text-copper-500"
              />
              <span className="text-stone-300 text-[11px]">Require Dual-Custody Approval</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={blockExternal}
                onChange={(e) => setBlockExternal(e.target.checked)}
                className="rounded border-graphite-700 bg-graphite-900 text-copper-500"
              />
              <span className="text-stone-300 text-[11px]">Block External Egress</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};
