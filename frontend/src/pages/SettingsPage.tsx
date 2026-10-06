import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Users,
  ShieldCheck,
  Plus,
  RefreshCw,
  Mail,
  User,
  Lock,
  Server,
  Activity,
  CheckCircle2,
  HardDrive,
  Cpu,
  Layers,
} from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Invite user modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Secret@123456');
  const [role, setRole] = useState<'ADMIN' | 'SECURITY_ANALYST' | 'MEMBER'>('SECURITY_ANALYST');
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await authApi.getUsers();
      const list = res.data?.data || res.data?.users || res.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingInvite(true);
    setInviteError(null);

    try {
      const res = await authApi.createUser({
        name,
        email,
        password,
        role,
      });

      const newUser = res.data?.data || res.data;
      if (newUser) {
        setUsers([newUser, ...users]);
      }
      setIsInviteOpen(false);
      setName('');
      setEmail('');
    } catch (err: any) {
      setInviteError(
        err.response?.data?.error || 'Failed to create user. Verify email uniqueness.'
      );
    } finally {
      setSubmittingInvite(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-graphite-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-copper-400 indicator-breathing" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-copper-300 font-semibold">
              CLUSTER ADMINISTRATION & ORG PERIMETER
            </span>
            <span className="text-graphite-600 font-mono">|</span>
            <span className="text-[11px] font-mono text-graphite-400">ENTERPRISE TENANT</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-50 tracking-tight">
            Organization & Gateway Settings
          </h1>
          <p className="text-xs text-graphite-300 mt-0.5">
            Manage organization security team access, perimeter authentication policies, and defense gateway cluster health.
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
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            icon={<Plus className="w-4 h-4 text-graphite-950" />}
          >
            Invite Member
          </Button>
        </div>
      </div>

      {/* Cluster Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-graphite-800 bg-graphite-900">
          <div className="flex items-center gap-2 text-xs font-mono text-copper-400 mb-2">
            <ShieldCheck className="w-4 h-4 text-copper-400" />
            <span>ORGANIZATION PERIMETER</span>
          </div>
          <div className="text-base font-semibold text-stone-100">
            {user?.organizationName || 'Enterprise SecOps HQ'}
          </div>
          <div className="text-xs font-mono text-graphite-400 mt-1">
            Cluster Org ID: {user?.organizationId ? user.organizationId.slice(0, 12) + '...' : 'org_enterprise_primary'}
          </div>
        </Card>

        <Card className="border-graphite-800 bg-graphite-900">
          <div className="flex items-center gap-2 text-xs font-mono text-status-green mb-2">
            <Server className="w-4 h-4 text-status-green" />
            <span>GATEWAY HEALTH</span>
          </div>
          <div className="flex items-center gap-2 text-base font-semibold text-status-green">
            <span className="w-2 h-2 rounded-full bg-status-green indicator-breathing" />
            <span>100% OPERATIONAL</span>
          </div>
          <div className="text-xs font-mono text-graphite-400 mt-1">
            Zero-Trust Policy Interceptor Active
          </div>
        </Card>

        <Card className="border-graphite-800 bg-graphite-900">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>ENFORCEMENT DEPLOYMENT</span>
          </div>
          <div className="text-base font-semibold text-stone-100 font-mono">
            Enterprise Tier
          </div>
          <div className="text-xs font-mono text-graphite-400 mt-1">
            Latency SLA: &lt; 1.2ms inline proxy
          </div>
        </Card>
      </div>

      {/* Team Members List */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-copper-400" />
            <span>Authorized Security Team</span>
          </div>
        }
        subtitle="Manage user accounts and role-based permissions for the Rakshya defense console"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add User
          </Button>
        }
      >
        {loading ? (
          <LoadingSpinner label="Loading organization members..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-graphite-800 text-graphite-400 font-mono text-[11px]">
                <tr>
                  <th className="pb-3 font-medium">TEAM MEMBER</th>
                  <th className="pb-3 font-medium">ROLE</th>
                  <th className="pb-3 font-medium">STATUS</th>
                  <th className="pb-3 font-medium">JOINED DATE</th>
                  <th className="pb-3 font-medium text-right">LAST LOGIN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-800/60 font-mono">
                {users.map((member) => (
                  <tr key={member.id} className="hover:bg-graphite-850/50 transition-colors">
                    <td className="py-3 font-sans font-medium text-stone-200">
                      <div>{member.name}</div>
                      <div className="text-[11px] font-mono text-graphite-400">{member.email}</div>
                    </td>

                    <td className="py-3">
                      <Badge
                        variant={
                          member.role === 'ADMIN'
                            ? 'allow'
                            : member.role === 'SECURITY_ANALYST'
                            ? 'info'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {member.role}
                      </Badge>
                    </td>

                    <td className="py-3">
                      <Badge variant={member.is_active !== false ? 'allow' : 'block'} size="sm" dot>
                        {member.is_active !== false ? 'ACTIVE' : 'DISABLED'}
                      </Badge>
                    </td>

                    <td className="py-3 text-graphite-400 text-[11px]">
                      {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'Initial'}
                    </td>

                    <td className="py-3 text-right text-graphite-400 text-[11px]">
                      {member.last_login ? new Date(member.last_login).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Gateway Engine Specifications */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-graphite-400" />
            <span>Defense Engine Specifications</span>
          </div>
        }
        subtitle="Security pipeline components running within this deployment cluster"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs font-mono">
          <div className="p-3 bg-graphite-950 rounded-md border border-graphite-800 space-y-1">
            <span className="text-graphite-500 block text-[10px]">DATABASE ENGINE</span>
            <span className="font-semibold text-status-green">PostgreSQL / PGlite Dual-Pool</span>
            <p className="text-[10px] text-graphite-400 font-sans">Embedded transactional ledger</p>
          </div>

          <div className="p-3 bg-graphite-950 rounded-md border border-graphite-800 space-y-1">
            <span className="text-graphite-500 block text-[10px]">BEHAVIORAL AI ENGINE</span>
            <span className="font-semibold text-copper-400">Gemini 2.5 Defense Rationale</span>
            <p className="text-[10px] text-graphite-400 font-sans">Dual-pass prompt injection classifier</p>
          </div>

          <div className="p-3 bg-graphite-950 rounded-md border border-graphite-800 space-y-1">
            <span className="text-graphite-500 block text-[10px]">PII & DLP DETECTOR</span>
            <span className="font-semibold text-sky-400">Deterministic Pattern Matrix</span>
            <p className="text-[10px] text-graphite-400 font-sans">SSN, Cards, API keys, JWT scanner</p>
          </div>

          <div className="p-3 bg-graphite-950 rounded-md border border-graphite-800 space-y-1">
            <span className="text-graphite-500 block text-[10px]">ENFORCEMENT SLA</span>
            <span className="font-semibold text-stone-200">Fail-Safe Default Closed</span>
            <p className="text-[10px] text-graphite-400 font-sans">Enforces human review on anomaly</p>
          </div>
        </div>
      </Card>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Security Team Member"
        subtitle="Grant role-based console access to your enterprise organization."
      >
        <form onSubmit={handleInviteUser} className="space-y-3.5">
          {inviteError && (
            <div className="p-3 rounded-md bg-status-red/10 border border-status-red/30 text-xs text-red-300">
              {inviteError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Chen"
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1">
              Work Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. maya@cybercorp.com"
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1">
              Initial Temporary Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-stone-100 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-graphite-300 mb-1">
              Organizational Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-graphite-950 border border-graphite-750 rounded-md text-xs text-graphite-200 p-2.5 focus:border-copper-500/80 focus:outline-none font-mono"
            >
              <option value="SECURITY_ANALYST">Security Analyst (Investigate & Decide Approvals)</option>
              <option value="ADMIN">Admin / CISO (Full Cluster Management & API Keys)</option>
              <option value="MEMBER">Member (Read-only Stream Telemetry)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingInvite}
              icon={<Plus className="w-4 h-4 text-graphite-950" />}
            >
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
