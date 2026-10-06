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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-graphite-750/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-copper-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-copper-400 font-medium">
              PROXY TELEMETRY STREAM
            </span>
            <span className="text-graphite-600 font-mono text-[10px]">/</span>
            <span className="text-[10px] font-mono text-graphite-400">SOC LEVEL 1 / 2 CONSOLE</span>
          </div>
          <h1 className="text-xl font-medium text-stone-100 tracking-tight">
            Action Stream
          </h1>
          <p className="text-xs text-graphite-400 mt-0.5">
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
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-2.5 rounded-lg bg-graphite-850 border border-graphite-750">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
          {/* Search Term */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-graphite-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search resource, agent, or pattern..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none font-mono"
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
              className="w-full py-1 px-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-graphite-300 focus:border-copper-500 focus:outline-none font-mono"
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
              className="w-full py-1 px-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-graphite-300 focus:border-copper-500 focus:outline-none font-mono"
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
              className="w-full py-1 px-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-graphite-300 focus:border-copper-500 focus:outline-none font-mono"
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
              className="w-full py-1 px-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-graphite-300 focus:border-copper-500 focus:outline-none font-mono"
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
        <div className="bg-graphite-850 border border-graphite-750 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-graphite-900/60 border-b border-graphite-750 text-graphite-400 font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3.5 font-medium">VERDICT</th>
                  <th className="py-2.5 px-3.5 font-medium">AGENT</th>
                  <th className="py-2.5 px-3.5 font-medium">OPERATION & RESOURCE</th>
                  <th className="py-2.5 px-3.5 font-medium">RISK</th>
                  <th className="py-2.5 px-3.5 font-medium">SEVERITY</th>
                  <th className="py-2.5 px-3.5 font-medium">VIOLATIONS / THREATS</th>
                  <th className="py-2.5 px-3.5 font-medium">TIME</th>
                  <th className="py-2.5 px-3.5 font-medium text-right">INSPECT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-750/40 font-mono">
                {filteredActions.map((act) => (
                  <tr
                    key={act.id}
                    className="hover:bg-graphite-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedAction(act)}
                  >
                    {/* Verdict */}
                    <td className="py-2 px-3.5">
                      <Badge
                        variant={getDecisionBadgeVariant(act.decision)}
                        size="sm"
                      >
                        {act.decision}
                      </Badge>
                    </td>

                    {/* Agent Name */}
                    <td className="py-2 px-3.5 font-sans font-medium text-stone-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-green shrink-0" />
                        <span className="truncate max-w-[130px]">
                          {act.agent_name || 'Agent'}
                        </span>
                      </div>
                    </td>

                    {/* Action & Resource */}
                    <td className="py-2 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-graphite-800 text-[10px] text-graphite-400 border border-graphite-750">
                          {act.action_type}
                        </span>
                        <span className="text-stone-200 font-medium truncate max-w-[200px]" title={act.resource}>
                          {act.resource}
                        </span>
                      </div>
                      {act.destination && (
                        <div className="text-[10px] text-graphite-500 mt-0.5 truncate max-w-[200px]">
                          dest: {act.destination}
                        </div>
                      )}
                    </td>

                    {/* Risk Score */}
                    <td className="py-2 px-3.5">
                      <RiskScoreMeter score={act.risk_score} size="sm" />
                    </td>

                    {/* Severity */}
                    <td className="py-2 px-3.5">
                      <Badge variant={getSeverityBadgeVariant(act.severity)} size="sm">
                        {act.severity}
                      </Badge>
                    </td>

                    {/* Violations / Threats */}
                    <td className="py-2 px-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {act.threats && act.threats.length > 0 ? (
                          act.threats.map((t: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.2 rounded bg-status-red/10 border border-status-red/25 text-status-red text-[10px]"
                            >
                              {t.replace(/_/g, ' ')}
                            </span>
                          ))
                        ) : act.policy_violations && act.policy_violations.length > 0 ? (
                          <span className="px-1.5 py-0.2 rounded bg-status-yellow/10 border border-status-yellow/25 text-status-yellow text-[10px]">
                            {act.policy_violations.length} Violation(s)
                          </span>
                        ) : (
                          <span className="text-graphite-500 text-[10px]">Authorized</span>
                        )}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-2 px-3.5 text-graphite-400 text-[10px] whitespace-nowrap">
                      {act.created_at
                        ? new Date(act.created_at).toLocaleTimeString()
                        : 'Now'}
                    </td>

                    {/* Inspect button */}
                    <td className="py-2 px-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAction(act);
                        }}
                        className="p-1 rounded text-graphite-400 hover:text-stone-200 hover:bg-graphite-800 transition-colors"
                        title="Forensic Inspection"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-2.5 border-t border-graphite-750 bg-graphite-900/30 flex items-center justify-between text-xs text-graphite-400 font-mono">
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
              <span className="text-stone-300 text-xs font-mono">
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
            <div className="flex items-center gap-2">
              <span>Action Forensic Inspection</span>
              <Badge
                variant={getDecisionBadgeVariant(selectedAction.decision)}
                size="sm"
              >
                {selectedAction.decision}
              </Badge>
            </div>
          }
          subtitle={`Telemetry ID: ${selectedAction.id}`}
        >
          <div className="space-y-3.5">
            {/* Verdict Explanation Box */}
            <div
              className={`p-3 rounded border ${
                selectedAction.decision === 'BLOCK'
                  ? 'bg-status-red/10 border-status-red/25 text-status-red'
                  : selectedAction.decision === 'REQUIRE_APPROVAL'
                  ? 'bg-status-yellow/10 border-status-yellow/25 text-status-yellow'
                  : 'bg-status-green/10 border-status-green/25 text-status-green'
              }`}
            >
              <div className="flex items-center gap-2 font-medium text-xs mb-1">
                {selectedAction.decision === 'BLOCK' ? (
                  <XCircle className="w-4 h-4 text-status-red" />
                ) : selectedAction.decision === 'REQUIRE_APPROVAL' ? (
                  <AlertTriangle className="w-4 h-4 text-status-yellow" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                )}
                <span className="font-mono uppercase text-[10px] tracking-wider">Enforcement Rationale</span>
              </div>
              <p className="text-xs font-mono leading-relaxed opacity-95">
                {selectedAction.explanation ||
                  'Action evaluated against behavioral models and enterprise perimeter policies.'}
              </p>
            </div>

            {/* Core Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <div className="p-2.5 bg-graphite-900 rounded border border-graphite-750">
                <span className="text-graphite-500 block text-[9px] uppercase">AGENT</span>
                <span className="font-medium text-stone-200 truncate block mt-0.5">
                  {selectedAction.agent_name || 'Agent'}
                </span>
              </div>
              <div className="p-2.5 bg-graphite-900 rounded border border-graphite-750">
                <span className="text-graphite-500 block text-[9px] uppercase">OPERATION</span>
                <span className="font-medium text-copper-400 mt-0.5 block">
                  {selectedAction.action_type}
                </span>
              </div>
              <div className="p-2.5 bg-graphite-900 rounded border border-graphite-750">
                <span className="text-graphite-500 block text-[9px] uppercase">SEVERITY</span>
                <span className="font-medium text-stone-200 mt-0.5 block">
                  {selectedAction.severity}
                </span>
              </div>
              <div className="p-2.5 bg-graphite-900 rounded border border-graphite-750">
                <span className="text-graphite-500 block text-[9px] uppercase">DATA CLASS</span>
                <span className="font-medium text-status-blue mt-0.5 block">
                  {selectedAction.data_classification || 'INTERNAL'}
                </span>
              </div>
            </div>

            {/* Risk Score Meter */}
            <div className="p-3 bg-graphite-900 rounded border border-graphite-750">
              <RiskScoreMeter score={selectedAction.risk_score} size="lg" />
            </div>

            {/* Sensitive Data Detected */}
            {selectedAction.sensitive_data_detected && (
              <div className="p-3 bg-graphite-900 rounded border border-graphite-750">
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-200 mb-1.5">
                  <Shield className="w-3.5 h-3.5 text-copper-400" />
                  <span>Sensitive Data Analysis</span>
                </div>
                <div className="text-xs font-mono text-graphite-300">
                  {typeof selectedAction.sensitive_data_detected === 'object' ? (
                    <div className="space-y-1">
                      {selectedAction.sensitive_data_detected.findings?.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedAction.sensitive_data_detected.findings.map(
                            (f: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.2 rounded bg-status-red/10 border border-status-red/25 text-status-red text-[10px]"
                              >
                                {f.type || f}: {f.count || 1} match(es)
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-graphite-500">No raw sensitive patterns detected</span>
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
              <div className="p-3 bg-graphite-900 rounded border border-graphite-750">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-200">
                    <FileCode className="w-3.5 h-3.5 text-graphite-400" />
                    <span>Evaluated Payload</span>
                  </div>
                  <span className="text-[10px] font-mono text-graphite-500">
                    Target: {selectedAction.resource}
                  </span>
                </div>
                <pre className="p-2.5 bg-graphite-950 rounded text-[11px] font-mono text-stone-300 overflow-x-auto max-h-44 border border-graphite-800 whitespace-pre-wrap">
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
