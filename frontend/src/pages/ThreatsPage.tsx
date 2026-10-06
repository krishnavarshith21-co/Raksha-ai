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
      setThreats(data.data || data.threats || []);
      setTotal(data.total || (data.data || []).length);
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
      setSelectedThreat(res.data.data || threat);
      setInvestigatingThreat(res.data.data || threat);
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

      const updated = res.data.data || {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Threat Intelligence & SecOps
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Security Incident Center
          </h1>
          <p className="text-xs text-zinc-400">
            Investigate prompt injections, unauthorized tool actions, and data exfiltration signals.
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
            Refresh Incidents
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-zinc-900/90 border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search threat description or agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full py-1.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
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
              className="w-full py-1.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
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
              className="w-full py-1.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Threat Types</option>
              <option value="PROMPT_INJECTION">Prompt Injection</option>
              <option value="DATA_EXFILTRATION">Data Exfiltration</option>
              <option value="UNAUTHORIZED_ACCESS">Unauthorized Access</option>
              <option value="SENSITIVE_DATA_EXPOSURE">Sensitive Data Exposure</option>
              <option value="MALICIOUS_TOOL_USAGE">Malicious Tool Usage</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Incidents List */}
      {loading ? (
        <LoadingSpinner label="Compiling incident data..." size="lg" fullHeight />
      ) : filteredThreats.length === 0 ? (
        <EmptyState
          icon={<Shield className="w-8 h-8 text-emerald-400" />}
          title="Zero Incidents Found"
          description="No security threats match your specified filter criteria."
        />
      ) : (
        <div className="space-y-3">
          {filteredThreats.map((threat) => (
            <Card
              key={threat.id}
              className={`border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer ${
                threat.severity === 'CRITICAL'
                  ? 'border-l-4 border-l-red-500'
                  : threat.severity === 'HIGH'
                  ? 'border-l-4 border-l-orange-500'
                  : 'border-l-4 border-l-amber-500'
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
                    <span className="text-xs font-mono font-semibold text-zinc-200">
                      {threat.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-xs text-zinc-400">
                      Agent: <strong className="text-zinc-300 font-mono">{threat.agent_name || 'Agent'}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {threat.description || 'Action triggered anomaly detection model.'}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {threat.created_at ? new Date(threat.created_at).toLocaleString() : 'Now'}
                    </span>
                    <span>Incident ID: {threat.id.slice(0, 8)}...</span>
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
                    Investigate
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
              <span>Incident Investigation</span>
              <Badge variant={getSeverityBadgeVariant(selectedThreat.severity)} size="sm">
                {selectedThreat.severity}
              </Badge>
            </div>
          }
          subtitle={`Incident: ${selectedThreat.type} · ID: ${selectedThreat.id}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">Update Status:</span>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 py-1 px-2 focus:outline-none"
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
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="text-xs font-semibold text-zinc-300">Incident Narrative:</div>
              <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                {selectedThreat.description}
              </p>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">AFFECTED AGENT</span>
                <span className="font-semibold text-zinc-200">{selectedThreat.agent_name || 'Agent'}</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">RESOURCE</span>
                <span className="font-semibold text-amber-400">{selectedThreat.resource || 'N/A'}</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">CLASSIFICATION</span>
                <span className="font-semibold text-sky-400">{selectedThreat.data_classification || 'INTERNAL'}</span>
              </div>
            </div>

            {/* Payload if attached */}
            {selectedThreat.payload && (
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="text-[11px] font-semibold text-zinc-300">Intercepted Payload:</div>
                <pre className="p-2.5 bg-zinc-900 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-36 border border-zinc-800 whitespace-pre-wrap">
                  {typeof selectedThreat.payload === 'object'
                    ? JSON.stringify(selectedThreat.payload, null, 2)
                    : selectedThreat.payload}
                </pre>
              </div>
            )}

            {/* Timeline */}
            {selectedThreat.timeline && selectedThreat.timeline.length > 0 && (
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                <div className="text-[11px] font-semibold text-zinc-300">Investigation Timeline:</div>
                <div className="space-y-1.5">
                  {selectedThreat.timeline.map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] font-mono text-zinc-400">
                      <span className="text-amber-400 shrink-0">▸</span>
                      <span>
                        <strong className="text-zinc-300">{entry.event}:</strong>{' '}
                        {entry.details || entry.actor} ({new Date(entry.timestamp).toLocaleTimeString()})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analyst Notes */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                Add Analyst Investigation Notes:
              </label>
              <textarea
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Log remediation steps, root cause analysis, or whitelisting reasons..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 p-2.5 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
