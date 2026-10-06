import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Shield,
  FileCode,
  ArrowRight,
  UserCheck,
  Flame,
} from 'lucide-react';
import { threatsApi } from '../services/api';
import { Card } from '../components/common/Card';
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

  // Selected threat for investigation modal
  const [selectedThreat, setSelectedThreat] = useState<any | null>(null);
  const [investigatingThreat, setInvestigatingThreat] = useState<any | null>(null);
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
      setInvestigatingThreat(res.data?.data || threat);
      setUpdateStatus(threat.status === 'OPEN' ? 'INVESTIGATING' : threat.status);
      setUpdateNotes('');
    } catch {
      setSelectedThreat(threat);
      setInvestigatingThreat(threat);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedThreat) return;

    setSubmittingUpdate(true);
    try {
      const res = await threatsApi.update(selectedThreat.id, {
        status: updateStatus,
        notes: updateNotes || `Status updated to ${updateStatus} by analyst`,
      });

      const updated = res.data?.data || {
        ...selectedThreat,
        status: updateStatus,
      };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-graphite-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-status-red indicator-breathing" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-red-400 font-semibold">
              MITRE ATT&CK & OWASP LLM INCIDENT CENTER
            </span>
            <span className="text-graphite-600 font-mono">|</span>
            <span className="text-[11px] font-mono text-graphite-400">SOC TIER 2 FORENSICS</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-50 tracking-tight">
            Security Incident Center
          </h1>
          <p className="text-xs text-graphite-300 mt-0.5">
            Investigate prompt injections, unauthorized tool actions, and data exfiltration patterns detected across autonomous runtimes.
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
            Refresh Incidents
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-lg bg-graphite-900 border border-graphite-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-graphite-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search threat description or agent name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 focus:border-copper-500/80 focus:outline-none font-mono"
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
              className="w-full py-1.5 px-2.5 bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 focus:border-copper-500/80 focus:outline-none font-mono"
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
              className="w-full py-1.5 px-2.5 bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 focus:border-copper-500/80 focus:outline-none font-mono"
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
        <LoadingSpinner label="Compiling threat telemetry records..." size="lg" fullHeight />
      ) : filteredThreats.length === 0 ? (
        <EmptyState
          icon={<Shield className="w-7 h-7 text-status-green" />}
          title="Zero Incidents Found"
          description="No security threats or attack vectors match your specified filter criteria."
        />
      ) : (
        <div className="space-y-3">
          {filteredThreats.map((threat) => (
            <Card
              key={threat.id}
              className={`hover:border-graphite-700 transition-all cursor-pointer ${
                threat.severity === 'CRITICAL'
                  ? 'border-l-4 border-l-status-red bg-graphite-900'
                  : threat.severity === 'HIGH'
                  ? 'border-l-4 border-l-copper-500 bg-graphite-900'
                  : 'border-l-4 border-l-status-yellow bg-graphite-900'
              }`}
              onClick={() => handleOpenInvestigate(threat)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getSeverityBadgeVariant(threat.severity)} size="sm">
                      {threat.severity}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(threat.status)} size="sm" dot>
                      {threat.status}
                    </Badge>
                    <span className="text-xs font-mono font-semibold text-stone-200">
                      {threat.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-graphite-600">·</span>
                    <span className="text-xs text-graphite-400">
                      Agent: <strong className="text-stone-300 font-mono">{threat.agent_name || 'Agent'}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-graphite-300 leading-relaxed font-sans">
                    {threat.description || 'Action triggered anomaly detection model.'}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-graphite-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-graphite-500" />
                      {threat.created_at ? new Date(threat.created_at).toLocaleString() : 'Now'}
                    </span>
                    <span>Incident Ref: {threat.id?.slice(0, 8)}...</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInvestigate(threat);
                    }}
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Forensics
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Threat Investigation Modal */}
      {selectedThreat && (
        <Modal
          isOpen={!!selectedThreat}
          onClose={() => setSelectedThreat(null)}
          maxWidth="2xl"
          title={
            <div className="flex items-center gap-2.5">
              <span>Incident Forensic Dossier</span>
              <Badge variant={getSeverityBadgeVariant(selectedThreat.severity)} size="sm">
                {selectedThreat.severity}
              </Badge>
            </div>
          }
          subtitle={`Incident Category: ${selectedThreat.type} · ID: ${selectedThreat.id}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-graphite-400">Remediation Status:</span>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="bg-graphite-950 border border-graphite-750 rounded text-xs text-stone-100 py-1 px-2.5 focus:outline-none font-mono"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="DISMISSED">DISMISSED</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedThreat(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUpdateStatus}
                  loading={submittingUpdate}
                  icon={<CheckCircle className="w-3.5 h-3.5" />}
                >
                  Commit Status
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Description & Overview */}
            <div className="p-3.5 rounded-lg bg-graphite-950 border border-graphite-800 space-y-1.5">
              <div className="text-xs font-medium text-copper-400 font-mono">INCIDENT NARRATIVE:</div>
              <p className="text-xs font-mono text-stone-200 leading-relaxed">
                {selectedThreat.description}
              </p>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-3 bg-graphite-950 rounded-md border border-graphite-800">
                <span className="text-graphite-500 block text-[10px]">AFFECTED AGENT</span>
                <span className="font-medium text-stone-200">{selectedThreat.agent_name || 'Agent'}</span>
              </div>
              <div className="p-3 bg-graphite-950 rounded-md border border-graphite-800">
                <span className="text-graphite-500 block text-[10px]">RESOURCE TARGET</span>
                <span className="font-medium text-copper-400">{selectedThreat.resource || 'N/A'}</span>
              </div>
              <div className="p-3 bg-graphite-950 rounded-md border border-graphite-800">
                <span className="text-graphite-500 block text-[10px]">CLASSIFICATION</span>
                <span className="font-medium text-sky-400">{selectedThreat.data_classification || 'INTERNAL'}</span>
              </div>
            </div>

            {/* Payload if attached */}
            {selectedThreat.payload && (
              <div className="p-3 bg-graphite-950 rounded-md border border-graphite-800 space-y-1.5">
                <div className="text-[11px] font-medium text-stone-300 font-mono">INTERCEPTED PAYLOAD:</div>
                <pre className="p-2.5 bg-graphite-900 rounded text-[11px] font-mono text-stone-300 overflow-x-auto max-h-36 border border-graphite-800 whitespace-pre-wrap">
                  {typeof selectedThreat.payload === 'object'
                    ? JSON.stringify(selectedThreat.payload, null, 2)
                    : selectedThreat.payload}
                </pre>
              </div>
            )}

            {/* Timeline */}
            {selectedThreat.timeline && selectedThreat.timeline.length > 0 && (
              <div className="p-3 bg-graphite-950 rounded-md border border-graphite-800 space-y-2">
                <div className="text-[11px] font-medium text-stone-300 font-mono">INVESTIGATION AUDIT TIMELINE:</div>
                <div className="space-y-1.5">
                  {selectedThreat.timeline.map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] font-mono text-graphite-400">
                      <span className="text-copper-400 shrink-0">▸</span>
                      <span>
                        <strong className="text-stone-300">{entry.event}:</strong>{' '}
                        {entry.details || entry.actor} ({new Date(entry.timestamp).toLocaleTimeString()})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analyst Notes */}
            <div>
              <label className="block text-xs font-mono text-graphite-300 mb-1.5">
                SOC Analyst Investigation Notes:
              </label>
              <textarea
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Log remediation steps, root cause analysis, or policy adjustment recommendations..."
                rows={2}
                className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
