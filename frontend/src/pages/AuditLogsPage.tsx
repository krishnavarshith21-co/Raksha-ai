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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-graphite-750/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-copper-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-copper-400 font-medium">
              COMPLIANCE & NON-REPUDIATION
            </span>
            <span className="text-graphite-600 font-mono text-[10px]">/</span>
            <span className="text-[10px] font-mono text-graphite-400">SOC 2 TYPE II LEDGER</span>
          </div>
          <h1 className="text-xl font-medium text-stone-100 tracking-tight">
            Audit Trail
          </h1>
          <p className="text-xs text-graphite-400 mt-0.5">
            Append-only enterprise verification record of all policy mutations, agent registrations, and security actions.
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
      <div className="p-2.5 rounded-lg bg-graphite-850 border border-graphite-750">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-graphite-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search narrative, actor identity, or payload..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-1 px-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-graphite-300 focus:border-copper-500 focus:outline-none font-mono"
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
              className="w-full py-1 px-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-graphite-300 focus:border-copper-500 focus:outline-none font-mono"
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
        <div className="bg-graphite-850 border border-graphite-750 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-graphite-900/60 border-b border-graphite-750 text-graphite-400 font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3.5 font-medium">TIMESTAMP</th>
                  <th className="py-2.5 px-3.5 font-medium">EVENT CODE</th>
                  <th className="py-2.5 px-3.5 font-medium">ACTOR</th>
                  <th className="py-2.5 px-3.5 font-medium">RESOURCE</th>
                  <th className="py-2.5 px-3.5 font-medium">NARRATIVE</th>
                  <th className="py-2.5 px-3.5 font-medium text-right">INSPECT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-750/40 font-mono">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-graphite-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="py-2.5 px-3.5 text-graphite-400 text-[10px] whitespace-nowrap">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : 'Now'}
                    </td>

                    <td className="py-2.5 px-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-copper-500/10 text-copper-300 border border-copper-500/25">
                        {log.event}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 font-sans text-stone-200">
                      {log.actor_name || log.actor_email || 'System Gate'}
                    </td>

                    <td className="py-2.5 px-3.5">
                      <span className="px-1.5 py-0.2 rounded bg-graphite-900 text-[10px] text-graphite-400 border border-graphite-750">
                        {log.resource_type}
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5 font-sans text-stone-300 max-w-md truncate">
                      {log.description}
                    </td>

                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="p-1 rounded text-graphite-400 hover:text-stone-200 hover:bg-graphite-800 transition-colors"
                        title="View Record JSON"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-2.5 border-t border-graphite-750 bg-graphite-900/30 flex items-center justify-between text-xs text-graphite-400 font-mono">
            <span>
              Showing {(page - 1) * 25 + 1} to{' '}
              {Math.min(page * 25, total)} of {total} records
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

      {/* Record Inspection Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          maxWidth="lg"
          title={`Audit Record: ${selectedLog.event}`}
          subtitle={`Ledger Reference ID: ${selectedLog.id}`}
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-graphite-900 rounded border border-graphite-750 space-y-1">
              <div className="flex justify-between">
                <span className="text-graphite-500">Actor Identity:</span>
                <span className="text-stone-200">{selectedLog.actor_name || selectedLog.actor_email || 'System Gate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Resource Type:</span>
                <span className="text-copper-400">{selectedLog.resource_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Resource ID:</span>
                <span className="text-stone-300">{selectedLog.resource_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Logged At:</span>
                <span className="text-stone-300">{new Date(selectedLog.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-graphite-500 block mb-1">
                Event Description
              </span>
              <div className="p-2.5 bg-graphite-900 rounded border border-graphite-750 font-sans text-stone-200 text-xs">
                {selectedLog.description}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-graphite-500 block mb-1">
                Cryptographic Evidence Payload (JSON)
              </span>
              <pre className="p-3 bg-graphite-950 rounded border border-graphite-800 text-[11px] text-stone-300 overflow-x-auto max-h-56">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
