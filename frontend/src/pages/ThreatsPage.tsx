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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1f]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-500/15" />
            <span className="text-[11.5px] font-mono uppercase tracking-widest text-red-400 font-semibold">
              MITRE ATT&CK & OWASP LLM CONSOLE
            </span>
            <span className="text-graphite-600 font-mono text-[11px]">/</span>
            <span className="text-[11.5px] font-mono text-graphite-400">SOC TIER 2 FORENSICS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display text-stone-100 tracking-tight">
            Security Incidents
          </h1>
          <p className="text-[14.5px] text-graphite-400 mt-1">
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
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="surface-card p-4 rounded-xl border border-[#1e1e21]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-graphite-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search threat type, agent name, or forensic pattern..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13.5px] text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none font-mono transition-colors"
            />
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13px] text-graphite-300 focus:border-copper-500 focus:outline-none font-mono transition-colors"
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
              className="w-full py-2.5 px-3 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13px] text-graphite-300 focus:border-copper-500 focus:outline-none font-mono transition-colors"
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
              className="w-full py-2.5 px-3 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13px] text-graphite-300 focus:border-copper-500 focus:outline-none font-mono transition-colors"
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
          icon={<Shield className="w-5 h-5 text-emerald-400" />}
          title="Zero Incidents Found"
          description="No security threats or attack vectors match your specified filter criteria."
        />
      ) : (
        <div className="space-y-4">
          {filteredThreats.map((threat) => {
            const isCritical = threat.severity === 'CRITICAL';
            const isHigh = threat.severity === 'HIGH';
            const cardSeverityStyle = isCritical
              ? 'border-l-[4px] border-l-red-500 shadow-[0_0_30px_rgba(239,68,68,0.06)] hover:border-l-red-400'
              : isHigh
              ? 'border-l-[4px] border-l-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.05)] hover:border-l-amber-400'
              : 'border-l-[4px] border-l-stone-600 hover:border-l-stone-400';

            return (
              <div
                key={threat.id}
                onClick={() => handleOpenInvestigate(threat)}
                className={`surface-card p-6 rounded-xl border border-[#1e1e21] transition-all cursor-pointer group ${cardSeverityStyle}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2.5 flex-1">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge variant={getSeverityBadgeVariant(threat.severity)} size="md">
                        {threat.severity}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(threat.status)} size="md" dot>
                        {threat.status}
                      </Badge>
                      <span className="text-[13.5px] font-mono font-medium text-stone-200">
                        {threat.type?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-graphite-600 font-mono text-xs">/</span>
                      <span className="text-[13.5px] text-graphite-400">
                        Agent: <span className="text-copper-400 font-mono font-medium">{threat.agent_name || 'Agent'}</span>
                      </span>
                    </div>

                    {/* Threat Description */}
                    <p className="text-[15px] text-stone-200 font-sans leading-relaxed">
                      {threat.description}
                    </p>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-4 text-[12px] font-mono text-graphite-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-graphite-500" />
                        <span>
                          {threat.created_at ? new Date(threat.created_at).toLocaleString() : 'Recent'}
                        </span>
                      </div>
                      {threat.mitre_technique && (
                        <span className="px-2 py-0.5 rounded bg-copper-400/10 text-copper-400 border border-copper-400/20 text-[11px] font-mono">
                          MITRE {threat.mitre_technique}
                        </span>
                      )}
                      <span className="text-graphite-600">ID: {threat.id?.slice(0, 8)}...</span>
                    </div>
                  </div>

                  {/* Forensics Action Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenInvestigate(threat);
                      }}
                    >
                      Investigate Forensics →
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Investigation Modal */}
      {selectedThreat && (
        <Modal
          isOpen={!!selectedThreat}
          onClose={() => setSelectedThreat(null)}
          maxWidth="2xl"
          title={
            <div className="flex items-center gap-3">
              <span className="text-[18px] font-medium text-stone-100 font-sans">Security Incident Forensics</span>
              <Badge variant={getSeverityBadgeVariant(selectedThreat.severity)} size="md">
                {selectedThreat.severity}
              </Badge>
            </div>
          }
          subtitle={`Incident Reference ID: ${selectedThreat.id}`}
        >
          <div className="space-y-4">
            {/* Description & Agent */}
            <div className="p-4 bg-[#0a0a0b] rounded-xl border border-[#202023] font-mono text-[13px] space-y-2">
              <div className="flex justify-between">
                <span className="text-graphite-500">Threat Type:</span>
                <span className="text-copper-400 font-medium">{selectedThreat.type?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Target Agent:</span>
                <span className="text-stone-100">{selectedThreat.agent_name || 'Autonomous Agent'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Recorded At:</span>
                <span className="text-stone-300">{new Date(selectedThreat.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1.5 font-semibold">
                Forensic Summary
              </div>
              <div className="p-4 bg-[#0a0a0b] rounded-xl border border-[#202023] text-[14px] text-stone-200 leading-relaxed font-sans">
                {selectedThreat.description}
              </div>
            </div>

            {/* Payload if present */}
            {selectedThreat.payload && (
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1.5 font-semibold">
                  Trigger Payload Evidence
                </div>
                <pre className="p-3.5 bg-[#050506] rounded-xl border border-[#1b1b1e] text-[12.5px] font-mono text-stone-300 overflow-x-auto max-h-44 whitespace-pre-wrap leading-relaxed">
                  {typeof selectedThreat.payload === 'object'
                    ? JSON.stringify(selectedThreat.payload, null, 2)
                    : selectedThreat.payload}
                </pre>
              </div>
            )}

            {/* Status Update Form */}
            <div className="p-4 bg-[#0a0a0b] rounded-xl border border-[#202023] space-y-3">
              <div className="text-[12px] font-mono uppercase tracking-wider text-stone-200 font-semibold">
                Analyst Incident State Transition
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-graphite-400 mb-1 font-medium">
                    Disposition Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full py-2 px-3 bg-[#050506] border border-[#222225] rounded-lg text-[13px] text-stone-200 font-mono focus:border-copper-500 focus:outline-none"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="DISMISSED">DISMISSED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-graphite-400 mb-1 font-medium">
                    Analyst Case Notes
                  </label>
                  <input
                    type="text"
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    placeholder="Case justification notes..."
                    className="w-full py-2 px-3 bg-[#050506] border border-[#222225] rounded-lg text-[13px] text-stone-200 focus:border-copper-500 focus:outline-none"
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
