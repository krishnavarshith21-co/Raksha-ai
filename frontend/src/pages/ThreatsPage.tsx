import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Shield,
  FileCode,
} from 'lucide-react';
import { threatsApi } from '../services/api';
import { Button } from '../components/common/Button';
import { Badge, getSeverityBadgeVariant, getStatusBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const ThreatsPage: React.FC = () => {
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Investigation state
  const [selectedThreat, setSelectedThreat] = useState<any | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('INVESTIGATING');
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const fetchThreats = useCallback(async () => {
    try {
      const params: any = { limit: 50 };
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const res = await threatsApi.list(params);
      const data = res.data;
      const list = data?.data || data?.threats || data || [];
      setThreats(Array.isArray(list) ? list : []);
      setTotal(data?.total || (Array.isArray(list) ? list.length : 0));
    } catch (err) {
      console.error('Failed to load threats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [severityFilter, statusFilter, typeFilter]);

  useEffect(() => {
    fetchThreats();
  }, [fetchThreats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchThreats();
  };

  const handleOpenInvestigate = async (threat: any) => {
    try {
      const res = await threatsApi.get(threat.id);
      setSelectedThreat(res.data?.data || threat);
      setUpdateStatus(threat.status === 'OPEN' ? 'INVESTIGATING' : threat.status);
      setUpdateNotes('');
    } catch {
      setSelectedThreat(threat);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedThreat) return;

    setSubmittingUpdate(true);
    try {
      await threatsApi.update(selectedThreat.id, {
        status: updateStatus,
        notes: updateNotes || `Status updated to ${updateStatus} by analyst`,
      });

      setThreats((prev) =>
        prev.map((t) => (t.id === selectedThreat.id ? { ...t, status: updateStatus } : t))
      );
      setSelectedThreat(null);
    } catch (err) {
      console.error('Failed to update threat:', err);
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const filteredThreats = threats.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.type?.toLowerCase().includes(term) ||
      t.agent_name?.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-graphite-750/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-red" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-status-red font-medium">
              MITRE ATT&CK & OWASP LLM CONSOLE
            </span>
            <span className="text-graphite-600 font-mono text-[10px]">/</span>
            <span className="text-[10px] font-mono text-graphite-400">SOC TIER 2 FORENSICS</span>
          </div>
          <h1 className="text-xl font-medium text-stone-100 tracking-tight">
            Security Incidents
          </h1>
          <p className="text-xs text-graphite-400 mt-0.5">
            Investigate prompt injections, unauthorized tool actions, and data exfiltration patterns.
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

      {/* Filter Bar */}
      <div className="p-2.5 rounded-lg bg-graphite-850 border border-graphite-750">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-graphite-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search threat or agent name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full py-1 px-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-graphite-300 focus:border-copper-500 focus:outline-none font-mono"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1 px-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-graphite-300 focus:border-copper-500 focus:outline-none font-mono"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="DISMISSED">DISMISSED</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-1 px-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-graphite-300 focus:border-copper-500 focus:outline-none font-mono"
            >
              <option value="">All Threat Categories</option>
              <option value="PROMPT_INJECTION">Prompt Injection (OWASP LLM01)</option>
              <option value="DATA_EXFILTRATION">Data Exfiltration (OWASP LLM06)</option>
              <option value="UNAUTHORIZED_ACCESS">Unauthorized Tool Execution</option>
              <option value="SENSITIVE_DATA_EXPOSURE">Sensitive Data Exposure</option>
              <option value="MALICIOUS_TOOL_USAGE">Malicious Parameter Tampering</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      {loading ? (
        <LoadingSpinner label="Compiling incident telemetry..." size="lg" fullHeight />
      ) : filteredThreats.length === 0 ? (
        <EmptyState
          icon={<Shield className="w-5 h-5 text-status-green" />}
          title="Zero Incidents Found"
          description="No security threats or attack vectors match your specified filter criteria."
        />
      ) : (
        <div className="space-y-2.5">
          {filteredThreats.map((threat) => (
            <div
              key={threat.id}
              onClick={() => handleOpenInvestigate(threat)}
              className={`p-3.5 rounded-lg bg-graphite-850 border border-graphite-750 hover:border-graphite-700 transition-all cursor-pointer ${
                threat.severity === 'CRITICAL'
                  ? 'border-l-2 border-l-status-red'
                  : threat.severity === 'HIGH'
                  ? 'border-l-2 border-l-status-orange'
                  : 'border-l-2 border-l-status-yellow'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getSeverityBadgeVariant(threat.severity)} size="sm">
                      {threat.severity}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(threat.status)} size="sm" dot>
                      {threat.status}
                    </Badge>
                    <span className="text-xs font-mono font-medium text-stone-200">
                      {threat.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-graphite-600 text-xs">/</span>
                    <span className="text-xs text-graphite-400">
                      Agent: <span className="text-stone-300 font-mono">{threat.agent_name || 'Agent'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-graphite-300 font-sans line-clamp-1">
                    {threat.description}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-graphite-500 pt-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-graphite-500" />
                      <span>
                        {threat.created_at ? new Date(threat.created_at).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                    {threat.mitre_technique && (
                      <span className="text-copper-400">
                        MITRE {threat.mitre_technique}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInvestigate(threat);
                    }}
                  >
                    Forensics
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Investigation Modal */}
      {selectedThreat && (
        <Modal
          isOpen={!!selectedThreat}
          onClose={() => setSelectedThreat(null)}
          maxWidth="2xl"
          title={
            <div className="flex items-center gap-2">
              <span>Security Incident Forensics</span>
              <Badge variant={getSeverityBadgeVariant(selectedThreat.severity)} size="sm">
                {selectedThreat.severity}
              </Badge>
            </div>
          }
          subtitle={`Incident Reference ID: ${selectedThreat.id}`}
        >
          <div className="space-y-3.5">
            {/* Description & Agent */}
            <div className="p-3 bg-graphite-900 rounded border border-graphite-750 font-mono text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-graphite-500">Threat Type:</span>
                <span className="text-copper-400 font-medium">{selectedThreat.type?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Target Agent:</span>
                <span className="text-stone-200">{selectedThreat.agent_name || 'Autonomous Agent'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Recorded At:</span>
                <span className="text-stone-300">{new Date(selectedThreat.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-graphite-500 mb-1">
                Forensic Summary
              </div>
              <div className="p-3 bg-graphite-900 rounded border border-graphite-750 text-xs text-stone-200 leading-relaxed font-sans">
                {selectedThreat.description}
              </div>
            </div>

            {/* Payload if present */}
            {selectedThreat.payload && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-graphite-500 mb-1">
                  Trigger Payload Evidence
                </div>
                <pre className="p-2.5 bg-graphite-950 rounded border border-graphite-800 text-[11px] font-mono text-stone-300 overflow-x-auto max-h-36">
                  {typeof selectedThreat.payload === 'object'
                    ? JSON.stringify(selectedThreat.payload, null, 2)
                    : selectedThreat.payload}
                </pre>
              </div>
            )}

            {/* Status Update Form */}
            <div className="p-3 bg-graphite-900 rounded border border-graphite-750 space-y-2.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-200">
                Analyst Incident State Transition
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-graphite-400 mb-1">
                    Disposition Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full py-1.5 px-2 bg-graphite-950 border border-graphite-750 rounded text-xs text-stone-200 font-mono"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="DISMISSED">DISMISSED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-graphite-400 mb-1">
                    Analyst Case Notes
                  </label>
                  <input
                    type="text"
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    placeholder="Case justification notes..."
                    className="w-full py-1.5 px-2 bg-graphite-950 border border-graphite-750 rounded text-xs text-stone-200"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUpdateStatus}
                  loading={submittingUpdate}
                >
                  Commit Status Update
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
