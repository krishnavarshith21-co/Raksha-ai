import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  RefreshCw,
  Search,
  Eye,
  AlertTriangle,
  FileCode,
  Shield,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { actionsApi, agentsApi } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge, getDecisionBadgeVariant, getSeverityBadgeVariant } from '../components/common/Badge';
import { RiskScoreMeter } from '../components/common/RiskScoreMeter';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const ActionStreamPage: React.FC = () => {
  const [actions, setActions] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [decisionFilter, setDecisionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected action for inspection modal
  const [selectedAction, setSelectedAction] = useState<any | null>(null);

  const fetchActions = useCallback(async () => {
    try {
      const params: any = {
        page,
        limit: 15,
      };
      if (decisionFilter) params.decision = decisionFilter;
      if (severityFilter) params.severity = severityFilter;
      if (actionTypeFilter) params.actionType = actionTypeFilter;
      if (agentFilter) params.agentId = agentFilter;

      const res = await actionsApi.list(params);
      const data = res.data;
      setActions(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
      setTotal(data?.total || 0);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load actions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, decisionFilter, severityFilter, actionTypeFilter, agentFilter]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // Load agents for dropdown filter
  useEffect(() => {
    agentsApi
      .list()
      .then((res) => {
        const agList = res.data?.agents || res.data?.data || res.data || [];
        setAgents(Array.isArray(agList) ? agList : []);
      })
      .catch(() => {});
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActions();
  };

  const filteredActions = actions.filter((act) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      act.resource?.toLowerCase().includes(term) ||
      act.agent_name?.toLowerCase().includes(term) ||
      act.explanation?.toLowerCase().includes(term) ||
      act.action_type?.toLowerCase().includes(term)
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
              PROXY TELEMETRY STREAM
            </span>
            <span className="text-graphite-600 font-mono text-[11px]">/</span>
            <span className="text-[11.5px] font-mono text-graphite-400">SOC LEVEL 1 / 2 CONSOLE</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display text-stone-100 tracking-tight">
            Action Stream
          </h1>
          <p className="text-[14.5px] text-graphite-400 mt-1">
            Real-time inline inspection of autonomous agent tool calls, network requests, and policy decisions.
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
            Refresh Stream
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="surface-card p-4 rounded-xl border border-[#1e1e21]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Term */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-graphite-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search resource, agent, or pattern..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13.5px] text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none font-mono transition-colors"
            />
          </div>

          {/* Decision Filter */}
          <div>
            <select
              value={decisionFilter}
              onChange={(e) => {
                setDecisionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13px] text-graphite-300 focus:border-copper-500 focus:outline-none font-mono transition-colors"
            >
              <option value="">All Verdicts</option>
              <option value="ALLOW">ALLOW</option>
              <option value="REQUIRE_APPROVAL">REQUIRE APPROVAL</option>
              <option value="BLOCK">BLOCK</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13px] text-graphite-300 focus:border-copper-500 focus:outline-none font-mono transition-colors"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Action Type Filter */}
          <div>
            <select
              value={actionTypeFilter}
              onChange={(e) => {
                setActionTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13px] text-graphite-300 focus:border-copper-500 focus:outline-none font-mono transition-colors"
            >
              <option value="">All Types</option>
              <option value="READ">READ</option>
              <option value="WRITE">WRITE</option>
              <option value="EXECUTE">EXECUTE</option>
              <option value="EXPORT">EXPORT</option>
              <option value="SEND">SEND</option>
              <option value="UPLOAD">UPLOAD</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Agent Filter */}
          <div>
            <select
              value={agentFilter}
              onChange={(e) => {
                setAgentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13px] text-graphite-300 focus:border-copper-500 focus:outline-none font-mono transition-colors"
            >
              <option value="">All Agents</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stream Table */}
      {loading ? (
        <LoadingSpinner label="Intercepting stream telemetry..." size="lg" fullHeight />
      ) : filteredActions.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-5 h-5 text-copper-400" />}
          title="No action telemetry matching current filters"
          description="Try broadening your filter criteria or simulate an agent attack in the attack simulator."
          actionLabel="Open Simulator"
          onAction={() => (window.location.href = '/simulator')}
        />
      ) : (
        <div className="surface-card rounded-xl border border-[#1e1e21] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0b0b0c] border-b border-[#1e1e21] text-graphite-400 font-mono text-[11px] tracking-wider uppercase">
                <tr>
                  <th className="py-3.5 px-4 font-medium">VERDICT</th>
                  <th className="py-3.5 px-4 font-medium">AGENT</th>
                  <th className="py-3.5 px-4 font-medium">OPERATION & RESOURCE</th>
                  <th className="py-3.5 px-4 font-medium">RISK SCORE</th>
                  <th className="py-3.5 px-4 font-medium">SEVERITY</th>
                  <th className="py-3.5 px-4 font-medium">VIOLATIONS / THREATS</th>
                  <th className="py-3.5 px-4 font-medium">TIMESTAMP</th>
                  <th className="py-3.5 px-4 font-medium text-right">INSPECT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181b] font-mono text-[13.5px]">
                {filteredActions.map((act) => {
                  const isBlock = act.decision === 'BLOCK';
                  const isApproval = act.decision === 'REQUIRE_APPROVAL';
                  const borderSeverityClass = isBlock
                    ? 'border-l-[3.5px] border-l-red-500/90 hover:bg-red-500/[0.03]'
                    : isApproval
                    ? 'border-l-[3.5px] border-l-amber-500/90 hover:bg-amber-500/[0.03]'
                    : 'border-l-[3.5px] border-l-emerald-500/70 hover:bg-emerald-500/[0.02]';

                  return (
                    <tr
                      key={act.id}
                      className={`transition-colors group cursor-pointer ${borderSeverityClass}`}
                      onClick={() => setSelectedAction(act)}
                    >
                      {/* Verdict */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge
                          variant={getDecisionBadgeVariant(act.decision)}
                          size="md"
                        >
                          {act.decision}
                        </Badge>
                      </td>

                      {/* Agent Name */}
                      <td className="py-4 px-4 font-sans font-medium text-stone-100 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span className="truncate max-w-[150px] text-[14px]">
                            {act.agent_name || 'Agent'}
                          </span>
                        </div>
                      </td>

                      {/* Action & Resource */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#141416] text-[11px] text-graphite-300 border border-[#26262a] uppercase tracking-wide">
                            {act.action_type}
                          </span>
                          <span className="text-stone-200 font-medium truncate max-w-[240px] text-[13.5px]" title={act.resource}>
                            {act.resource}
                          </span>
                        </div>
                        {act.destination && (
                          <div className="text-[11.5px] text-graphite-400 mt-1 truncate max-w-[240px]">
                            dest: <span className="text-graphite-300">{act.destination}</span>
                          </div>
                        )}
                      </td>

                      {/* Risk Score */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <RiskScoreMeter score={act.risk_score} size="md" />
                      </td>

                      {/* Severity */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge variant={getSeverityBadgeVariant(act.severity)} size="sm">
                          {act.severity}
                        </Badge>
                      </td>

                      {/* Violations / Threats */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                          {act.threats && act.threats.length > 0 ? (
                            act.threats.map((t: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400 text-[11px] font-mono tracking-wide"
                              >
                                {t.replace(/_/g, ' ')}
                              </span>
                            ))
                          ) : act.policy_violations && act.policy_violations.length > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] font-mono">
                              {act.policy_violations.length} Violation(s)
                            </span>
                          ) : (
                            <span className="text-graphite-500 text-[12px]">Authorized Scope</span>
                          )}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-4 text-graphite-400 text-[12px] whitespace-nowrap">
                        {act.created_at
                          ? new Date(act.created_at).toLocaleTimeString()
                          : 'Now'}
                      </td>

                      {/* Inspect button */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAction(act);
                          }}
                          className="p-1.5 rounded-lg text-graphite-400 hover:text-stone-100 hover:bg-[#18181b] border border-transparent hover:border-[#2a2a2e] transition-all cursor-pointer"
                          title="Forensic Inspection"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-5 py-3.5 border-t border-[#1e1e21] bg-[#0c0c0d]/60 flex items-center justify-between text-[13px] text-graphite-400 font-mono">
            <span>
              Showing {(page - 1) * 15 + 1} to{' '}
              {Math.min(page * 15, total)} of {total} events
            </span>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-stone-300 text-[13px] font-mono px-1">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Forensic Inspection Modal */}
      {selectedAction && (
        <Modal
          isOpen={!!selectedAction}
          onClose={() => setSelectedAction(null)}
          maxWidth="2xl"
          title={
            <div className="flex items-center gap-3">
              <span className="font-sans font-medium text-stone-100 text-[18px]">Forensic Action Inspection</span>
              <Badge
                variant={getDecisionBadgeVariant(selectedAction.decision)}
                size="md"
              >
                {selectedAction.decision}
              </Badge>
            </div>
          }
          subtitle={`Telemetry Event Record: ${selectedAction.id}`}
        >
          <div className="space-y-4">
            {/* Verdict Explanation Box */}
            <div
              className={`p-4 rounded-xl border ${
                selectedAction.decision === 'BLOCK'
                  ? 'bg-red-500/10 border-red-500/30 text-red-200'
                  : selectedAction.decision === 'REQUIRE_APPROVAL'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2.5 font-medium text-[13.5px] mb-1.5">
                {selectedAction.decision === 'BLOCK' ? (
                  <XCircle className="w-5 h-5 text-red-400" />
                ) : selectedAction.decision === 'REQUIRE_APPROVAL' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                <span className="font-mono uppercase text-[11px] tracking-wider font-semibold">Enforcement Rationale</span>
              </div>
              <p className="text-[14px] font-sans leading-relaxed text-stone-200">
                {selectedAction.explanation ||
                  'Action evaluated against behavioral models and enterprise perimeter policies.'}
              </p>
            </div>

            {/* Core Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[13px]">
              <div className="p-3 bg-[#0a0a0b] rounded-lg border border-[#202023]">
                <span className="text-graphite-500 block text-[10px] uppercase font-semibold">AGENT</span>
                <span className="font-medium text-stone-100 truncate block mt-1">
                  {selectedAction.agent_name || 'Agent'}
                </span>
              </div>
              <div className="p-3 bg-[#0a0a0b] rounded-lg border border-[#202023]">
                <span className="text-graphite-500 block text-[10px] uppercase font-semibold">OPERATION</span>
                <span className="font-medium text-copper-400 mt-1 block">
                  {selectedAction.action_type}
                </span>
              </div>
              <div className="p-3 bg-[#0a0a0b] rounded-lg border border-[#202023]">
                <span className="text-graphite-500 block text-[10px] uppercase font-semibold">SEVERITY</span>
                <span className="font-medium text-stone-100 mt-1 block">
                  {selectedAction.severity}
                </span>
              </div>
              <div className="p-3 bg-[#0a0a0b] rounded-lg border border-[#202023]">
                <span className="text-graphite-500 block text-[10px] uppercase font-semibold">DATA CLASS</span>
                <span className="font-medium text-sky-400 mt-1 block">
                  {selectedAction.data_classification || 'INTERNAL'}
                </span>
              </div>
            </div>

            {/* Risk Score Meter */}
            <div className="p-4 bg-[#0a0a0b] rounded-lg border border-[#202023]">
              <RiskScoreMeter score={selectedAction.risk_score} size="lg" />
            </div>

            {/* Sensitive Data Detected */}
            {selectedAction.sensitive_data_detected && (
              <div className="p-4 bg-[#0a0a0b] rounded-lg border border-[#202023]">
                <div className="flex items-center gap-2 text-[14px] font-medium text-stone-200 mb-2 font-sans">
                  <Shield className="w-4 h-4 text-copper-400" />
                  <span>Sensitive Data Analysis</span>
                </div>
                <div className="text-[13px] font-mono text-graphite-300">
                  {typeof selectedAction.sensitive_data_detected === 'object' ? (
                    <div className="space-y-1.5">
                      {selectedAction.sensitive_data_detected.findings?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedAction.sensitive_data_detected.findings.map(
                            (f: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400 text-[11.5px]"
                              >
                                {f.type || f}: {f.count || 1} match(es)
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-graphite-500 text-[13px]">No raw sensitive patterns detected</span>
                      )}
                    </div>
                  ) : (
                    <span>{String(selectedAction.sensitive_data_detected)}</span>
                  )}
                </div>
              </div>
            )}

            {/* Raw Payload Preview */}
            {selectedAction.payload && (
              <div className="p-4 bg-[#0a0a0b] rounded-lg border border-[#202023]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[14px] font-medium text-stone-200 font-sans">
                    <FileCode className="w-4 h-4 text-graphite-400" />
                    <span>Evaluated Payload Data</span>
                  </div>
                  <span className="text-[11.5px] font-mono text-graphite-400">
                    Target: {selectedAction.resource}
                  </span>
                </div>
                <pre className="p-3.5 bg-[#050506] rounded-lg text-[12.5px] font-mono text-stone-300 overflow-x-auto max-h-48 border border-[#1b1b1e] whitespace-pre-wrap leading-relaxed">
                  {typeof selectedAction.payload === 'object'
                    ? JSON.stringify(selectedAction.payload, null, 2)
                    : selectedAction.payload}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
