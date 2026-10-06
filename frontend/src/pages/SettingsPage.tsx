import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  Plus,
  RefreshCw,
  Server,
  Cpu,
  Lock,
  Globe,
  Radio,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1f]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-copper-400 ring-4 ring-copper-400/10" />
            <span className="text-[11.5px] font-mono uppercase tracking-widest text-copper-400 font-medium">
              CLUSTER ADMINISTRATION & ORG PERIMETER
            </span>
            <span className="text-graphite-600 font-mono text-[11px]">/</span>
            <span className="text-[11.5px] font-mono text-graphite-400">ENTERPRISE TENANT</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display text-stone-100 tracking-tight">
            System Settings
          </h1>
          <p className="text-[14.5px] text-graphite-400 mt-1">
            Manage organization security team access, cryptographic identities, and gateway cluster topology.
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
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            icon={<Plus className="w-3.5 h-3.5 text-graphite-950" />}
          >
            Provision Member
          </Button>
        </div>
      </div>

      {/* Cluster Overview Grid (3 Substantial Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Organization Perimeter */}
        <div className="surface-card p-5 rounded-xl border border-[#1e1e21] relative overflow-hidden group hover:border-copper-500/30 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-copper-400/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[11px] font-mono text-copper-400 uppercase tracking-wider font-medium">
              <ShieldCheck className="w-4 h-4 text-copper-400" />
              <span>Tenant Perimeter</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-copper-400/10 text-copper-300 border border-copper-400/20">
              TENANT v2.8
            </span>
          </div>
          <div className="text-[17px] font-sans font-medium text-stone-100 truncate">
            {user?.organizationName || 'Rakshya Enterprise Security'}
          </div>
          <div className="text-[12px] font-mono text-graphite-500 mt-1.5 flex items-center gap-2 truncate">
            <span>ID:</span>
            <span className="text-stone-300 font-mono">
              {user?.organizationId ? user.organizationId.slice(0, 18) + '...' : 'org_enterprise_primary'}
            </span>
          </div>
          <div className="mt-4 pt-3.5 border-t border-[#1a1a1c] flex items-center justify-between text-[11.5px] text-graphite-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-graphite-500" />
              Region: us-east-fed
            </span>
            <span className="text-copper-400 font-medium">Dedicated VPC</span>
          </div>
        </div>

        {/* Gateway Health */}
        <div className="surface-card p-5 rounded-xl border border-[#1e1e21] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[11px] font-mono text-status-green uppercase tracking-wider font-medium">
              <Server className="w-4 h-4 text-status-green" />
              <span>Gateway Health</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-green/10 text-status-green border border-status-green/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
              OPERATIONAL
            </span>
          </div>
          <div className="flex items-center gap-2 text-[17px] font-mono font-medium text-status-green">
            <span>CLUSTER INLINE ACTIVE</span>
          </div>
          <div className="text-[12px] font-mono text-graphite-400 mt-1.5">
            Zero-Trust Interceptor Gateway v2.8
          </div>
          <div className="mt-4 pt-3.5 border-t border-[#1a1a1c] flex items-center justify-between text-[11.5px] text-graphite-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Simulated Telemetry
            </span>
            <span className="text-stone-300">Port 3001 Ingress</span>
          </div>
        </div>

        {/* Enforcement Deployment */}
        <div className="surface-card p-5 rounded-xl border border-[#1e1e21] relative overflow-hidden group hover:border-sky-500/30 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[11px] font-mono text-sky-400 uppercase tracking-wider font-medium">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Enforcement Engine</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-400/10 text-sky-300 border border-sky-400/20">
              ENTERPRISE TIER
            </span>
          </div>
          <div className="text-[17px] font-sans font-medium text-stone-100">
            WASM Rule Core + NLP Intercept
          </div>
          <div className="text-[12px] font-mono text-graphite-400 mt-1.5">
            Policy evaluation posture: Strict Inline
          </div>
          <div className="mt-4 pt-3.5 border-t border-[#1a1a1c] flex items-center justify-between text-[11.5px] text-graphite-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-graphite-500" />
              Dual-Custody Approvals
            </span>
            <span className="text-sky-400 font-medium">Enforced</span>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <Card
        title={
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-copper-400" />
            <span className="text-[17px] font-medium text-stone-100 font-sans">Authorized Security Team</span>
          </div>
        }
        subtitle="Cryptographically authorized console accounts, RBAC entitlements, and security roles."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Team Member
          </Button>
        }
      >
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner label="Querying authorized security roster..." />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 -mb-6">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-[#0a0a0b] border-y border-[#1e1e21] text-graphite-400 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6 font-medium">TEAM MEMBER & IDENTITY</th>
                  <th className="py-3.5 px-6 font-medium">AUTHORIZATION ROLE</th>
                  <th className="py-3.5 px-6 font-medium">CONSOLE STATUS</th>
                  <th className="py-3.5 px-6 font-medium">PROVISIONED</th>
                  <th className="py-3.5 px-6 font-medium text-right">LAST AUTHENTICATED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181a] font-mono">
                {users.map((member) => (
                  <tr key={member.id} className="hover:bg-[#121214] transition-colors">
                    <td className="py-4 px-6 font-sans">
                      <div className="font-medium text-stone-100 text-[14.5px]">{member.name}</div>
                      <div className="text-[12px] font-mono text-graphite-400 mt-0.5">{member.email}</div>
                    </td>

                    <td className="py-4 px-6">
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

                    <td className="py-4 px-6">
                      <Badge variant={member.is_active !== false ? 'allow' : 'block'} size="sm">
                        {member.is_active !== false ? 'ACTIVE' : 'DISABLED'}
                      </Badge>
                    </td>

                    <td className="py-4 px-6 text-stone-300 text-[12.5px]">
                      {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'System Seed'}
                    </td>

                    <td className="py-4 px-6 text-right text-graphite-400 text-[12.5px]">
                      {member.last_login ? new Date(member.last_login).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        maxWidth="md"
        title="Provision Team Member Access"
        subtitle="Grant administrator or security analyst console credentials to an enterprise operator"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInviteOpen(false)}
              disabled={submittingInvite}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleInviteUser}
              loading={submittingInvite}
            >
              Provision Account
            </Button>
          </div>
        }
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          {inviteError && (
            <div className="p-3 rounded-lg bg-status-red/10 border border-status-red/25 text-[13px] text-status-red font-mono">
              {inviteError}
            </div>
          )}

          <div>
            <label className="block text-[11.5px] font-mono uppercase tracking-wider text-graphite-400 mb-1.5 font-medium">
              Member Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alan Turing"
              className="w-full px-3.5 py-2.5 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13.5px] text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-mono uppercase tracking-wider text-graphite-400 mb-1.5 font-medium">
              Enterprise Work Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst@enterprise.sec"
              className="w-full px-3.5 py-2.5 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13.5px] text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-mono uppercase tracking-wider text-graphite-400 mb-1.5 font-medium">
              Initial Temporary Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13.5px] text-stone-100 focus:border-copper-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-mono uppercase tracking-wider text-graphite-400 mb-1.5 font-medium">
              Console Role Tier
            </label>
            <select
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0b0b0c] border border-[#222225] rounded-lg text-[13.5px] text-stone-100 font-mono focus:border-copper-500 focus:outline-none transition-colors"
            >
              <option value="SECURITY_ANALYST">SECURITY_ANALYST (Evaluate, Audit & Approve)</option>
              <option value="ADMIN">ADMIN (Full Cluster & Policy Orchestration)</option>
              <option value="MEMBER">MEMBER (Read-only Observer)</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
