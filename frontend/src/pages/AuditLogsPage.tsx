import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  Search,
  Download,
  Eye,
} from 'lucide-react';
import { auditApi } from '../services/api';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [eventFilter, setEventFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const params: any = { page, limit: 25 };
      if (eventFilter) params.event = eventFilter;
      if (resourceFilter) params.resourceType = resourceFilter;

      const res = await auditApi.list(params);
      const data = res.data;
      const list = data?.data || data?.logs || data || [];
      setLogs(Array.isArray(list) ? list : []);
      setTotal(data?.total || (Array.isArray(list) ? list.length : 0));
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, eventFilter, resourceFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `rakshya-audit-trail-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = logs.filter((l) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.description?.toLowerCase().includes(term) ||
      l.event?.toLowerCase().includes(term) ||
      l.actor_name?.toLowerCase().includes(term)
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
              COMPLIANCE & NON-REPUDIATION
            </span>
            <span className="text-graphite-600 font-mono text-[11px]">/</span>
            <span className="text-[11.5px] font-mono text-graphite-400">SOC 2 TYPE II LEDGER</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display text-stone-100 tracking-tight">
            Audit Trail
          </h1>
          <p className="text-[14.5px] text-graphite-400 mt-1">
            Append-only enterprise verification record of all policy mutations, agent registrations, and security actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh Ledger
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="surface-card p-4 rounded-xl border border-[#1e1e21]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-graphite-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search narrative, actor identity, or payload signature..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13.5px] text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none font-mono transition-colors"
            />
          </div>

          <div>
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13px] text-graphite-300 focus:border-copper-500 focus:outline-none font-mono transition-colors"
            >
              <option value="">All Event Codes</option>
              <option value="AGENT_CREATED">AGENT_CREATED</option>
              <option value="POLICY_CREATED">POLICY_CREATED</option>
              <option value="POLICY_UPDATED">POLICY_UPDATED</option>
              <option value="THREAT_RESOLVED">THREAT_RESOLVED</option>
              <option value="ACTION_APPROVED">ACTION_APPROVED</option>
              <option value="API_KEY_CREATED">API_KEY_CREATED</option>
            </select>
          </div>

          <div>
            <select
              value={resourceFilter}
              onChange={(e) => {
                setResourceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2.5 px-3 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13px] text-graphite-300 focus:border-copper-500 focus:outline-none font-mono transition-colors"
            >
              <option value="">All Resource Types</option>
              <option value="agent">Agent</option>
              <option value="policy">Policy</option>
              <option value="threat">Threat</option>
              <option value="approval">Approval</option>
              <option value="api_key">API Key</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <LoadingSpinner label="Querying compliance ledger records..." size="lg" fullHeight />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={<FileSpreadsheet className="w-5 h-5 text-copper-400" />}
          title="No Audit Records Found"
          description="Administrative actions and gateway enforcement events will appear here."
        />
      ) : (
        <div className="surface-card rounded-xl border border-[#1e1e21] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0b0b0c] border-b border-[#1e1e21] text-graphite-400 font-mono text-[11px] tracking-wider uppercase">
                <tr>
                  <th className="py-3.5 px-4 font-medium">TIMESTAMP</th>
                  <th className="py-3.5 px-4 font-medium">EVENT CODE</th>
                  <th className="py-3.5 px-4 font-medium">ACTOR IDENTITY</th>
                  <th className="py-3.5 px-4 font-medium">RESOURCE</th>
                  <th className="py-3.5 px-4 font-medium">AUDIT NARRATIVE</th>
                  <th className="py-3.5 px-4 font-medium text-right">INSPECT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181b] font-mono text-[13.5px]">
                {filteredLogs.map((log) => {
                  const isCritical =
                    log.event?.includes('THREAT') ||
                    log.event?.includes('BLOCK') ||
                    log.event?.includes('DELETE');

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-graphite-800/30 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-4 px-4 text-graphite-400 text-[12px] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCritical ? 'bg-red-400' : 'bg-copper-400'
                            }`}
                          />
                          <span>
                            {log.created_at ? new Date(log.created_at).toLocaleString() : 'Now'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded bg-copper-400/10 text-copper-300 border border-copper-400/25 font-mono text-[11.5px] font-medium tracking-wide">
                          {log.event}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-sans text-stone-100 font-medium whitespace-nowrap">
                        {log.actor_name || log.actor_email || 'System Gate'}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#141416] text-[11px] text-graphite-300 border border-[#242428] uppercase">
                          {log.resource_type}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-sans text-stone-200 max-w-md truncate text-[13.5px]">
                        {log.description}
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="p-1.5 rounded-lg text-graphite-400 hover:text-stone-100 hover:bg-[#18181b] transition-all cursor-pointer"
                          title="View Record JSON"
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

          {/* Pagination */}
          <div className="px-5 py-3.5 border-t border-[#1e1e21] bg-[#0c0c0d]/60 flex items-center justify-between text-[13px] text-graphite-400 font-mono">
            <span>
              Showing {(page - 1) * 25 + 1} to{' '}
              {Math.min(page * 25, total)} of {total} records
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

      {/* Record Inspection Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          maxWidth="lg"
          title={
            <div className="flex items-center gap-2.5">
              <span className="text-[17px] font-medium text-stone-100 font-sans">Audit Ledger Record</span>
              <span className="px-2 py-0.5 rounded bg-copper-400/10 text-copper-300 border border-copper-400/25 font-mono text-[11px]">
                {selectedLog.event}
              </span>
            </div>
          }
          subtitle={`Immutable Ledger Reference: ${selectedLog.id}`}
        >
          <div className="space-y-4 font-mono text-[13px]">
            <div className="p-4 bg-[#0a0a0b] rounded-xl border border-[#202023] space-y-2">
              <div className="flex justify-between">
                <span className="text-graphite-500">Actor Identity:</span>
                <span className="text-stone-100 font-medium">{selectedLog.actor_name || selectedLog.actor_email || 'System Gate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Resource Category:</span>
                <span className="text-copper-400">{selectedLog.resource_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Resource Target ID:</span>
                <span className="text-stone-300">{selectedLog.resource_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Cryptographically Logged:</span>
                <span className="text-stone-300">{new Date(selectedLog.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-400 block mb-1.5 font-medium">
                Event Narrative
              </span>
              <div className="p-3.5 bg-[#0a0a0b] rounded-xl border border-[#202023] font-sans text-stone-200 text-[14px] leading-relaxed">
                {selectedLog.description}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-400 block mb-1.5 font-medium">
                Cryptographic Evidence Payload (Immutable JSON)
              </span>
              <pre className="p-4 bg-[#050506] rounded-xl border border-[#1b1b1e] text-[12px] text-stone-300 overflow-x-auto max-h-56 leading-relaxed">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

