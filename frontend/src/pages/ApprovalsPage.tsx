import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { approvalsApi } from '../services/api';
import { Button } from '../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const ApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL'>('PENDING');

  // Decision Modal state
  const [selectedApproval, setSelectedApproval] = useState<any | null>(null);
  const [decisionAction, setDecisionAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await approvalsApi.list();
      const items = res.data?.data || res.data?.approvals || res.data || [];
      setApprovals(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApprovals();
  };

  const handleOpenDecisionModal = (approval: any, action: 'APPROVED' | 'REJECTED') => {
    setSelectedApproval(approval);
    setDecisionAction(action);
    setDecisionReason(
      action === 'APPROVED'
        ? 'Verified requested access within operational scope.'
        : 'Action violated security compliance threshold.'
    );
    setDecisionError(null);
  };

  const handleSubmitDecision = async () => {
    if (!selectedApproval || !decisionAction) return;

    setSubmittingDecision(true);
    setDecisionError(null);

    try {
      await approvalsApi.decide(selectedApproval.id, {
        decision: decisionAction,
        reason: decisionReason,
      });

      setApprovals((prev) =>
        prev.map((app) =>
          app.id === selectedApproval.id
            ? {
                ...app,
                status: decisionAction,
                decision_reason: decisionReason,
                decided_at: new Date().toISOString(),
              }
            : app
        )
      );

      setSelectedApproval(null);
      setDecisionAction(null);
    } catch (err: any) {
      setDecisionError(
        err.response?.data?.error || 'Failed to submit decision. Please retry.'
      );
    } finally {
      setSubmittingDecision(false);
    }
  };

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const displayedApprovals = activeTab === 'PENDING' ? pendingApprovals : approvals;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-graphite-750/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-yellow" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-status-yellow font-medium">
              HUMAN-IN-THE-LOOP ORCHESTRATION
            </span>
            <span className="text-graphite-600 font-mono text-[10px]">/</span>
            <span className="text-[10px] font-mono text-graphite-400">DUAL-CUSTODY AUTHORIZATION</span>
          </div>
          <h1 className="text-xl font-medium text-stone-100 tracking-tight">
            Approval Queue
          </h1>
          <p className="text-xs text-graphite-400 mt-0.5">
            Escalated autonomous agent operations requiring explicit administrator or SOC sign-off.
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

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-graphite-750/70 pb-2">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`pb-1 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 -mb-2.5 ${
            activeTab === 'PENDING'
              ? 'border-copper-500 text-stone-100 font-medium'
              : 'border-transparent text-graphite-400 hover:text-stone-300'
          }`}
        >
          <span>Pending Review</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-status-yellow/15 text-status-yellow border border-status-yellow/30">
            {pendingApprovals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-1 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 -mb-2.5 ${
            activeTab === 'ALL'
              ? 'border-copper-500 text-stone-100 font-medium'
              : 'border-transparent text-graphite-400 hover:text-stone-300'
          }`}
        >
          <span>Audit History</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-graphite-800 text-graphite-400 border border-graphite-750">
            {approvals.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Fetching approval queue state..." size="lg" fullHeight />
      ) : displayedApprovals.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-5 h-5 text-status-green" />}
          title={
            activeTab === 'PENDING'
              ? 'Queue Clear: Zero Pending Approvals'
              : 'No Approval Records'
          }
          description={
            activeTab === 'PENDING'
              ? 'All escalated autonomous operations have been reviewed and resolved.'
              : 'No requests requiring elevation have been dispatched through the gateway.'
          }
        />
      ) : (
        <div className="space-y-2.5">
          {displayedApprovals.map((approval) => (
            <div
              key={approval.id}
              className={`p-4 rounded-lg bg-graphite-850 border border-graphite-750 transition-all ${
                approval.status === 'PENDING'
                  ? 'border-l-2 border-l-status-yellow'
                  : 'opacity-85'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(approval.status)} size="sm">
                      {approval.status}
                    </Badge>
                    <span className="text-xs font-mono text-stone-200 font-medium">
                      {approval.agent_name || 'Agent'}
                    </span>
                    <span className="text-graphite-600 text-xs">/</span>
                    <span className="px-1.5 py-0.2 rounded bg-graphite-900 text-[10px] font-mono text-copper-400 border border-graphite-750">
                      {approval.action_type || 'ACCESS'}
                    </span>
                    <span className="text-xs font-mono text-stone-300 truncate max-w-sm">
                      {approval.resource}
                    </span>
                  </div>

                  <p className="text-xs text-graphite-400 font-sans leading-relaxed">
                    {approval.reason ||
                      approval.explanation ||
                      'Action triggered an enterprise human approval policy rule.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-graphite-500 pt-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-graphite-500" />
                      <span>
                        Requested:{' '}
                        {approval.created_at
                          ? new Date(approval.created_at).toLocaleTimeString()
                          : 'Recent'}
                      </span>
                    </div>

                    {approval.decided_at && (
                      <div className="flex items-center gap-1 text-graphite-400">
                        <span>
                          Decided:{' '}
                          {new Date(approval.decided_at).toLocaleTimeString()}
                        </span>
                        {approval.decision_reason && (
                          <span className="italic text-graphite-500">
                            ("{approval.decision_reason}")
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                {approval.status === 'PENDING' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="success"
                      size="sm"
                      icon={<CheckCircle2 className="w-3.5 h-3.5 text-status-green" />}
                      onClick={() => handleOpenDecisionModal(approval, 'APPROVED')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<XCircle className="w-3.5 h-3.5 text-status-red" />}
                      onClick={() => handleOpenDecisionModal(approval, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div className="shrink-0 font-mono text-[11px] text-graphite-500 uppercase">
                    Resolution Complete
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      {selectedApproval && decisionAction && (
        <Modal
          isOpen={!!selectedApproval}
          onClose={() => setSelectedApproval(null)}
          maxWidth="md"
          title={
            <div className="flex items-center gap-2">
              <span>{decisionAction === 'APPROVED' ? 'Authorize Operation' : 'Reject Operation'}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  decisionAction === 'APPROVED'
                    ? 'bg-status-green/10 text-status-green border-status-green/25'
                    : 'bg-status-red/10 text-status-red border-status-red/25'
                }`}
              >
                {decisionAction}
              </span>
            </div>
          }
          subtitle={`Escalation ID: ${selectedApproval.id}`}
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedApproval(null)}
                disabled={submittingDecision}
              >
                Cancel
              </Button>
              <Button
                variant={decisionAction === 'APPROVED' ? 'success' : 'danger'}
                size="sm"
                onClick={handleSubmitDecision}
                loading={submittingDecision}
              >
                Confirm {decisionAction === 'APPROVED' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            {decisionError && (
              <div className="p-2.5 rounded bg-status-red/10 border border-status-red/25 text-xs text-status-red">
                {decisionError}
              </div>
            )}

            <div className="p-3 bg-graphite-900 rounded border border-graphite-750 font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-graphite-500">Agent:</span>
                <span className="text-stone-200">{selectedApproval.agent_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Action:</span>
                <span className="text-copper-400">{selectedApproval.action_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Resource:</span>
                <span className="text-stone-200 truncate max-w-[200px]">{selectedApproval.resource}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
                Authorization Rationale
              </label>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                rows={2}
                className="w-full p-2 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none"
                placeholder="Audit logging rationale..."
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
