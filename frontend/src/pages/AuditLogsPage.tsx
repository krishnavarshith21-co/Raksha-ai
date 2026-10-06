import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  Search,
  Filter,
  User,
  Clock,
  Shield,
  Download,
  Eye,
} from 'lucide-react';
import { auditApi } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
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
      setLogs(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Compliance & Non-Repudiation
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Immutable Audit Trail
          </h1>
          <p className="text-xs text-zinc-400">
            Append-only enterprise verification record of all policy updates, agent registrations, and security actions.
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
      <Card className="p-4 bg-zinc-900/90 border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event description, actor, or payload..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Events</option>
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
              className="w-full py-1.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
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
      </Card>

      {/* Logs Table */}
      {loading ? (
        <LoadingSpinner label="Querying compliance ledger..." size="lg" fullHeight />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={<FileSpreadsheet className="w-8 h-8 text-zinc-500" />}
          title="No Audit Records"
          description="Administrative actions and enforcement events will appear here."
        />
      ) : (
        <Card className="p-0 overflow-hidden border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 font-mono">
                <tr>
                  <th className="py-3 px-4 font-medium">Timestamp</th>
                  <th className="py-3 px-4 font-medium">Event Code</th>
                  <th className="py-3 px-4 font-medium">Actor</th>
                  <th className="py-3 px-4 font-medium">Resource</th>
                  <th className="py-3 px-4 font-medium">Audit Narrative</th>
                  <th className="py-3 px-4 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-zinc-850/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="py-3.5 px-4 text-zinc-400 text-[11px] whitespace-nowrap">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : 'Now'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-semibold">
                        {log.event}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-sans text-zinc-300">
                      {log.actor_name || log.actor_email || 'System Gate'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">
                        {log.resource_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-sans text-zinc-300 max-w-md truncate">
                      {log.description}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                        title="View Record JSON"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Showing {(page - 1) * 25 + 1} to{' '}
              {Math.min(page * 25, total)} of {total} audit records
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

      {/* Log Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record: ${selectedLog.event}`}
          subtitle={`Ledger UUID: ${selectedLog.id}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">ACTOR</span>
                <span className="font-semibold text-zinc-200">
                  {selectedLog.actor_name || selectedLog.actor_email || 'System'}
                </span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">TIMESTAMP</span>
                <span className="font-semibold text-zinc-200">
                  {new Date(selectedLog.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs">
              <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">
                Event Description
              </div>
              <p className="text-zinc-200 font-sans">{selectedLog.description}</p>
            </div>

            {selectedLog.metadata && (
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">
                  Metadata Payload
                </div>
                <pre className="p-2.5 bg-zinc-900 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48 border border-zinc-800 whitespace-pre-wrap">
                  {typeof selectedLog.metadata === 'object'
                    ? JSON.stringify(selectedLog.metadata, null, 2)
                    : selectedLog.metadata}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
