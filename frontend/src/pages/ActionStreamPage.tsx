import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Filter,
  RefreshCw,
  Search,
  Eye,
  AlertTriangle,
  FileCode,
  Shield,
  Clock,
  Layers,
  ArrowRight,
  Database,
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
      setActions(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
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
      .then((res) => setAgents(res.data.agents || res.data || []))
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Live Evaluation Stream
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Autonomous Action Telemetry
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time inline inspection of agent tool calls, data flows, and security decisions.
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
            Refresh Stream
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-zinc-900/90 border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Term */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resource, agent, or pattern..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
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
              className="w-full py-1.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Decisions</option>
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
              className="w-full py-1.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
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
              className="w-full py-1.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Actions</option>
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
              className="w-full py-1.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
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
      </Card>

      {/* Stream Table */}
      {loading ? (
        <LoadingSpinner label="Intercepting stream data..." size="lg" fullHeight />
      ) : filteredActions.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-6 h-6 text-zinc-500" />}
          title="No action telemetry matching filters"
          description="Try broadening your filter criteria or simulate an agent attack in the attack simulator."
          actionLabel="Open Simulator"
          onAction={() => (window.location.href = '/simulator')}
        />
      ) : (
        <Card className="p-0 overflow-hidden border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 font-mono">
                <tr>
                  <th className="py-3 px-4 font-medium">Verdict</th>
                  <th className="py-3 px-4 font-medium">Agent</th>
                  <th className="py-3 px-4 font-medium">Action & Resource</th>
                  <th className="py-3 px-4 font-medium">Risk Score</th>
                  <th className="py-3 px-4 font-medium">Severity</th>
                  <th className="py-3 px-4 font-medium">Violations / Threats</th>
                  <th className="py-3 px-4 font-medium">Timestamp</th>
                  <th className="py-3 px-4 font-medium text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filteredActions.map((act) => (
                  <tr
                    key={act.id}
                    className="hover:bg-zinc-850/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedAction(act)}
                  >
                    {/* Verdict */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={getDecisionBadgeVariant(act.decision)}
                        size="sm"
                        dot={act.decision === 'REQUIRE_APPROVAL'}
                      >
                        {act.decision}
                      </Badge>
                    </td>

                    {/* Agent Name */}
                    <td className="py-3.5 px-4 font-sans font-medium text-zinc-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {act.agent_name || 'Agent'}
                        </span>
                      </div>
                    </td>

                    {/* Action & Resource */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 font-semibold border border-zinc-700">
                          {act.action_type}
                        </span>
                        <span className="text-zinc-200 font-medium truncate max-w-[200px]" title={act.resource}>
                          {act.resource}
                        </span>
                      </div>
                      {act.destination && (
                        <div className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[200px]">
                          dest: {act.destination}
                        </div>
                      )}
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-4">
                      <RiskScoreMeter score={act.risk_score} size="sm" />
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4">
                      <Badge variant={getSeverityBadgeVariant(act.severity)} size="sm">
                        {act.severity}
                      </Badge>
                    </td>

                    {/* Violations / Threats */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {act.threats && act.threats.length > 0 ? (
                          act.threats.map((t: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-rose-950/70 border border-rose-800/60 text-rose-300 text-[10px]"
                            >
                              {t.replace(/_/g, ' ')}
                            </span>
                          ))
                        ) : act.policy_violations && act.policy_violations.length > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[10px]">
                            {act.policy_violations.length} Violation(s)
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">Clean</span>
                        )}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
                      {act.created_at
                        ? new Date(act.created_at).toLocaleTimeString()
                        : 'Now'}
                    </td>

                    {/* Inspect button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAction(act);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                        title="Forensic Inspection"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Showing {(page - 1) * 15 + 1} to{' '}
              {Math.min(page * 15, total)} of {total} events
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="font-mono text-zinc-300">
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
        </Card>
      )}

      {/* Forensic Inspection Modal */}
      {selectedAction && (
        <Modal
          isOpen={!!selectedAction}
          onClose={() => setSelectedAction(null)}
          maxWidth="2xl"
          title={
            <div className="flex items-center gap-2.5">
              <span>Action Forensic Inspection</span>
              <Badge
                variant={getDecisionBadgeVariant(selectedAction.decision)}
                size="sm"
              >
                {selectedAction.decision}
              </Badge>
            </div>
          }
          subtitle={`Telemetry Record ID: ${selectedAction.id}`}
        >
          <div className="space-y-5">
            {/* Verdict Explanation Box */}
            <div
              className={`p-4 rounded-xl border ${
                selectedAction.decision === 'BLOCK'
                  ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                  : selectedAction.decision === 'REQUIRE_APPROVAL'
                  ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                  : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                {selectedAction.decision === 'BLOCK' ? (
                  <XCircle className="w-4 h-4 text-rose-400" />
                ) : selectedAction.decision === 'REQUIRE_APPROVAL' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span>Enforcement Rationale:</span>
              </div>
              <p className="text-xs font-mono leading-relaxed opacity-90">
                {selectedAction.explanation ||
                  'Action evaluated against behavioral models and enterprise perimeter policies.'}
              </p>
            </div>

            {/* Core Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">AGENT</span>
                <span className="font-semibold text-zinc-200">
                  {selectedAction.agent_name || 'Agent'}
                </span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">ACTION TYPE</span>
                <span className="font-semibold text-amber-400">
                  {selectedAction.action_type}
                </span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">SEVERITY</span>
                <span className="font-semibold text-zinc-200">
                  {selectedAction.severity}
                </span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">CLASSIFICATION</span>
                <span className="font-semibold text-sky-400">
                  {selectedAction.data_classification || 'INTERNAL'}
                </span>
              </div>
            </div>

            {/* Risk Score Meter */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
              <RiskScoreMeter score={selectedAction.risk_score} size="lg" />
            </div>

            {/* Sensitive Data Detected */}
            {selectedAction.sensitive_data_detected && (
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 mb-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Sensitive Data Analysis</span>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  {typeof selectedAction.sensitive_data_detected === 'object' ? (
                    <div className="space-y-1">
                      {selectedAction.sensitive_data_detected.findings?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedAction.sensitive_data_detected.findings.map(
                            (f: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-300 text-[11px]"
                              >
                                {f.type || f}: {f.count || 1} match(es)
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-500">No raw sensitive patterns detected</span>
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
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                    <FileCode className="w-4 h-4 text-zinc-400" />
                    <span>Evaluated Payload</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Target: {selectedAction.resource}
                  </span>
                </div>
                <pre className="p-3 bg-zinc-900 rounded-lg text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48 border border-zinc-800 whitespace-pre-wrap">
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
