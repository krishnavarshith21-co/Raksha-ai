import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Search,
  MessageSquare,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';
import { approvalsApi } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { RiskScoreMeter } from '../components/common/RiskScoreMeter';
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

      // Update state locally
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-graphite-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-copper-400 indicator-breathing" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-copper-300 font-semibold">
              HUMAN-IN-THE-LOOP ORCHESTRATION
            </span>
            <span className="text-graphite-600 font-mono">|</span>
            <span className="text-[11px] font-mono text-graphite-400">DUAL-CUSTODY AUTHORIZATION</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-50 tracking-tight">
            Security Approval Queue
          </h1>
          <p className="text-xs text-graphite-300 mt-0.5">
            Escalated autonomous agent actions requiring explicit administrator or SOC sign-off before proxy dispatch.
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
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Tabs & Count */}
      <div className="flex items-center justify-between border-b border-graphite-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'PENDING'
                ? 'bg-copper-500/15 text-copper-300 border border-copper-500/40 shadow-sm'
                : 'text-graphite-400 hover:text-stone-200 border border-transparent'
            }`}
          >
            <span>Awaiting Authorization</span>
            <span className="px-1.5 py-0.2 rounded bg-copper-500/20 text-copper-300 text-[10px] font-bold">
              {pendingApprovals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'ALL'
                ? 'bg-graphite-800 text-stone-100 border border-graphite-700'
                : 'text-graphite-400 hover:text-stone-200 border border-transparent'
            }`}
          >
            <span>Audit Trail History</span>
            <span className="px-1.5 py-0.2 rounded bg-graphite-800 text-graphite-400 text-[10px]">
              {approvals.length}
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Fetching approval queue state..." size="lg" fullHeight />
      ) : displayedApprovals.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-7 h-7 text-status-green" />}
          title={
            activeTab === 'PENDING'
              ? 'Zero Pending Approvals'
              : 'No Approval Records'
          }
          description={
            activeTab === 'PENDING'
              ? 'All escalated autonomous operations have been reviewed and resolved.'
              : 'No requests requiring elevation have been dispatched through the gateway.'
          }
        />
      ) : (
        <div className="space-y-3.5">
          {displayedApprovals.map((approval) => (
            <Card
              key={approval.id}
              className={`transition-all ${
                approval.status === 'PENDING'
                  ? 'border-l-4 border-l-copper-500 bg-graphite-900'
                  : 'bg-graphite-950/60 opacity-80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left detail */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge variant={getStatusBadgeVariant(approval.status)} size="sm" dot>
                      {approval.status}
                    </Badge>
                    <span className="text-xs font-mono text-stone-200 font-semibold">
                      {approval.agent_name || 'Autonomous Agent'}
                    </span>
                    <span className="text-graphite-600">·</span>
                    <span className="px-1.5 py-0.2 rounded bg-graphite-800 text-[10px] font-mono text-copper-300 border border-graphite-700">
                      {approval.action_type || 'ACCESS'}
                    </span>
                    <span className="text-xs font-mono text-stone-300 truncate max-w-sm">
                      {approval.resource}
                    </span>
                  </div>

                  <p className="text-xs text-graphite-300 font-sans leading-relaxed">
                    {approval.reason ||
                      approval.explanation ||
                      'Action triggered an enterprise human approval policy rule.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-graphite-400 pt-1">
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
                      <div className="flex items-center gap-1.5 text-graphite-300">
                        <span>
                          Decided:{' '}
                          {new Date(approval.decided_at).toLocaleString()}
                        </span>
                        {approval.decision_reason && (
                          <span className="italic text-graphite-400">
                            ("{approval.decision_reason}")
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right risk meter & action buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-graphite-800">
                  <div className="pr-4 border-r-0 sm:border-r border-graphite-800">
                    <RiskScoreMeter score={approval.risk_score || 70} size="md" />
                  </div>

                  {approval.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleOpenDecisionModal(approval, 'REJECTED')}
                        icon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleOpenDecisionModal(approval, 'APPROVED')}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Authorize
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-graphite-400 px-3 py-1 rounded bg-graphite-850 border border-graphite-750">
                      Closed Record
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Decision Authorization Modal */}
      {selectedApproval && decisionAction && (
        <Modal
          isOpen={!!selectedApproval}
          onClose={() => setSelectedApproval(null)}
          title={
            decisionAction === 'APPROVED'
              ? 'Authorize Agent Action'
              : 'Reject & Block Action'
          }
          subtitle={`Agent: ${selectedApproval.agent_name} · Resource: ${selectedApproval.resource}`}
          footer={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
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
                icon={
                  decisionAction === 'APPROVED' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )
                }
              >
                Confirm {decisionAction === 'APPROVED' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {decisionError && (
              <div className="p-3 rounded-md bg-status-red/10 border border-status-red/30 text-xs text-red-300">
                {decisionError}
              </div>
            )}

            <div className="p-3 bg-graphite-950 rounded-md border border-graphite-800 text-xs font-mono space-y-1.5">
              <div>
                <span className="text-graphite-500">Operation:</span>{' '}
                <span className="text-copper-400">{selectedApproval.action_type}</span>
              </div>
              <div>
                <span className="text-graphite-500">Target Resource:</span>{' '}
                <span className="text-stone-200">{selectedApproval.resource}</span>
              </div>
              <div>
                <span className="text-graphite-500">Evaluated Risk Score:</span>{' '}
                <span className="text-status-red font-bold">
                  {selectedApproval.risk_score || 70}/100
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-graphite-300 mb-1.5">
                Audit Reason / Justification Note
              </label>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                rows={3}
                className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
                placeholder="Enter justification note for SOC 2 / ISO 27001 compliance audit trail..."
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
