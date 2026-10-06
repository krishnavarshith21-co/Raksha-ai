import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  UserCheck,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1f]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 ring-4 ring-amber-400/15" />
            <span className="text-[11.5px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
              HUMAN-IN-THE-LOOP ORCHESTRATION
            </span>
            <span className="text-graphite-600 font-mono text-[11px]">/</span>
            <span className="text-[11.5px] font-mono text-graphite-400">DUAL-CUSTODY AUTHORIZATION</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display text-stone-100 tracking-tight">
            Approval Queue
          </h1>
          <p className="text-[14.5px] text-graphite-400 mt-1">
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
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Prominent High-Risk Escalation Banner */}
      {pendingApprovals.length > 0 && (
        <div className="surface-card p-5 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] shadow-[0_0_30px_rgba(245,158,11,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[15.5px] font-medium text-amber-200 tracking-tight font-sans">
                HIGH-RISK ACTION REQUIRES HUMAN AUTHORIZATION
              </h3>
              <p className="text-[13.5px] text-graphite-300 mt-0.5">
                {pendingApprovals.length} privileged autonomous action(s) halted at gateway perimeter awaiting cryptographic or dual-custody approval.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-[12px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium shrink-0 tracking-wide">
            {pendingApprovals.length} ACTION(S) ESCALATED
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#1c1c1f] pb-3">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`pb-1 text-[13.5px] font-mono transition-colors cursor-pointer flex items-center gap-2 border-b-2 -mb-3.5 ${
            activeTab === 'PENDING'
              ? 'border-copper-500 text-stone-100 font-medium'
              : 'border-transparent text-graphite-400 hover:text-stone-300'
          }`}
        >
          <span>Pending Review</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
            {pendingApprovals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-1 text-[13.5px] font-mono transition-colors cursor-pointer flex items-center gap-2 border-b-2 -mb-3.5 ${
            activeTab === 'ALL'
              ? 'border-copper-500 text-stone-100 font-medium'
              : 'border-transparent text-graphite-400 hover:text-stone-300'
          }`}
        >
          <span>Audit History</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#161618] text-graphite-400 border border-[#26262a]">
            {approvals.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Fetching approval queue state..." size="lg" fullHeight />
      ) : displayedApprovals.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
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
        <div className="space-y-4">
          {displayedApprovals.map((approval) => {
            const isPending = approval.status === 'PENDING';
            return (
              <div
                key={approval.id}
                className={`surface-card p-6 rounded-xl border border-[#1e1e21] transition-all ${
                  isPending
                    ? 'border-l-[4px] border-l-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.05)]'
                    : 'opacity-90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2.5 flex-1">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge variant={getStatusBadgeVariant(approval.status)} size="md">
                        {approval.status}
                      </Badge>
                      <span className="text-[15px] font-sans text-stone-100 font-medium">
                        {approval.agent_name || 'Agent'}
                      </span>
                      <span className="text-graphite-600 font-mono text-xs">/</span>
                      <span className="px-2 py-0.5 rounded bg-[#141416] text-[11.5px] font-mono text-copper-400 border border-[#26262a] uppercase tracking-wide">
                        {approval.action_type || 'ACCESS'}
                      </span>
                      <span className="px-3 py-1 rounded bg-[#070708] border border-[#222225] font-mono text-[13px] text-stone-200 truncate max-w-md">
                        {approval.resource}
                      </span>
                    </div>

                    {/* Reason */}
                    <p className="text-[14.5px] text-stone-300 font-sans leading-relaxed">
                      {approval.reason ||
                        approval.explanation ||
                        'Action triggered an enterprise human approval policy rule.'}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-[12px] font-mono text-graphite-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-graphite-500" />
                        <span>
                          Requested:{' '}
                          {approval.created_at
                            ? new Date(approval.created_at).toLocaleString()
                            : 'Recent'}
                        </span>
                      </div>

                      {approval.decided_at && (
                        <div className="flex items-center gap-1 text-graphite-300">
                          <span>
                            Decided:{' '}
                            {new Date(approval.decided_at).toLocaleTimeString()}
                          </span>
                          {approval.decision_reason && (
                            <span className="italic text-graphite-400">
                              ("{approval.decision_reason}")
                            </span>
                          )}
                        </div>
                      )}

                      <span className="text-graphite-600">Ref: {approval.id?.slice(0, 8)}...</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  {isPending ? (
                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        variant="success"
                        size="md"
                        icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        onClick={() => handleOpenDecisionModal(approval, 'APPROVED')}
                      >
                        Approve Action
                      </Button>
                      <Button
                        variant="danger"
                        size="md"
                        icon={<XCircle className="w-4 h-4 text-red-400" />}
                        onClick={() => handleOpenDecisionModal(approval, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="shrink-0 font-mono text-[12px] text-graphite-400 uppercase tracking-wider px-3 py-1 rounded bg-[#101012] border border-[#202024]">
                      Resolution Complete
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Modal */}
      {selectedApproval && decisionAction && (
        <Modal
          isOpen={!!selectedApproval}
          onClose={() => setSelectedApproval(null)}
          maxWidth="md"
          title={
            <div className="flex items-center gap-3">
              <span className="text-[18px] font-medium text-stone-100 font-sans">
                {decisionAction === 'APPROVED' ? 'Authorize Privileged Operation' : 'Reject Operation'}
              </span>
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                  decisionAction === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-red-500/10 text-red-400 border-red-500/25'
                }`}
              >
                {decisionAction}
              </span>
            </div>
          }
          subtitle={`Escalation Reference: ${selectedApproval.id}`}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
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
                size="md"
                onClick={handleSubmitDecision}
                loading={submittingDecision}
              >
                Confirm {decisionAction === 'APPROVED' ? 'Authorization' : 'Rejection'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {decisionError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-[13px] text-red-400">
                {decisionError}
              </div>
            )}

            <div className="p-4 bg-[#0a0a0b] rounded-xl border border-[#202023] font-mono text-[13px] space-y-2">
              <div className="flex justify-between">
                <span className="text-graphite-500">Autonomous Agent:</span>
                <span className="text-stone-100 font-medium">{selectedApproval.agent_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Privileged Operation:</span>
                <span className="text-copper-400 font-medium">{selectedApproval.action_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-graphite-500">Target Resource:</span>
                <span className="text-stone-200 truncate max-w-[240px]">{selectedApproval.resource}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11.5px] font-mono uppercase tracking-wider text-graphite-400 mb-1.5 font-medium">
                Cryptographic / Dual-Custody Audit Justification
              </label>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                rows={3}
                className="w-full p-3 bg-[#050506] border border-[#222225] rounded-lg text-[13.5px] text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none transition-colors"
                placeholder="Audit logging rationale..."
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
