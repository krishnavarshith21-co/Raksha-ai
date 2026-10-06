import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  Plus,
  RefreshCw,
  Server,
  Cpu,
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-graphite-750/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-copper-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-copper-400 font-medium">
              CLUSTER ADMINISTRATION & ORG PERIMETER
            </span>
            <span className="text-graphite-600 font-mono text-[10px]">/</span>
            <span className="text-[10px] font-mono text-graphite-400">ENTERPRISE TENANT</span>
          </div>
          <h1 className="text-xl font-medium text-stone-100 tracking-tight">
            System Settings
          </h1>
          <p className="text-xs text-graphite-400 mt-0.5">
            Manage organization security team access, authentication policies, and gateway cluster health.
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
            variant="primary"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            icon={<Plus className="w-3.5 h-3.5 text-graphite-950" />}
          >
            Invite Member
          </Button>
        </div>
      </div>

      {/* Cluster Overview Grid (3-Col) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-graphite-850 border border-graphite-750">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-copper-400 mb-1.5 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-copper-400" />
            <span>Organization Perimeter</span>
          </div>
          <div className="text-sm font-medium text-stone-100 truncate">
            {user?.organizationName || 'Enterprise SecOps HQ'}
          </div>
          <div className="text-[10px] font-mono text-graphite-500 mt-1 truncate">
            ID: {user?.organizationId ? user.organizationId.slice(0, 16) + '...' : 'org_enterprise_primary'}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-graphite-850 border border-graphite-750">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-status-green mb-1.5 uppercase">
            <Server className="w-3.5 h-3.5 text-status-green" />
            <span>Gateway Health</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-status-green font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
            <span>100% OPERATIONAL</span>
          </div>
          <div className="text-[10px] font-mono text-graphite-500 mt-1">
            Zero-Trust Interceptor Active
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-graphite-850 border border-graphite-750">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-status-blue mb-1.5 uppercase">
            <Cpu className="w-3.5 h-3.5 text-status-blue" />
            <span>Enforcement Deployment</span>
          </div>
          <div className="text-sm font-medium text-stone-100 font-mono">
            Enterprise Tier
          </div>
          <div className="text-[10px] font-mono text-graphite-500 mt-1">
            Latency SLA: &lt; 1.2ms inline proxy
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-copper-400" />
            <span>Authorized Security Team</span>
          </div>
        }
        subtitle="Manage user accounts and role-based permissions for the defense console"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            icon={<Plus className="w-3 h-3" />}
          >
            Add User
          </Button>
        }
      >
        {loading ? (
          <LoadingSpinner label="Loading organization members..." />
        ) : (
          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="w-full text-left text-xs">
              <thead className="bg-graphite-900/60 border-y border-graphite-750 text-graphite-400 font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-5 font-medium">TEAM MEMBER</th>
                  <th className="py-2.5 px-5 font-medium">ROLE</th>
                  <th className="py-2.5 px-5 font-medium">STATUS</th>
                  <th className="py-2.5 px-5 font-medium">JOINED</th>
                  <th className="py-2.5 px-5 font-medium text-right">LAST LOGIN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-750/40 font-mono">
                {users.map((member) => (
                  <tr key={member.id} className="hover:bg-graphite-800/40 transition-colors">
                    <td className="py-2.5 px-5 font-sans font-medium text-stone-200">
                      <div>{member.name}</div>
                      <div className="text-[10px] font-mono text-graphite-400">{member.email}</div>
                    </td>

                    <td className="py-2.5 px-5">
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

                    <td className="py-2.5 px-5">
                      <Badge variant={member.is_active !== false ? 'allow' : 'block'} size="sm">
                        {member.is_active !== false ? 'ACTIVE' : 'DISABLED'}
                      </Badge>
                    </td>

                    <td className="py-2.5 px-5 text-graphite-400 text-[10px]">
                      {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'Initial'}
                    </td>

                    <td className="py-2.5 px-5 text-right text-graphite-400 text-[10px]">
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
        subtitle="Grant administrator or security analyst console credentials"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
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
        <form onSubmit={handleInviteUser} className="space-y-3">
          {inviteError && (
            <div className="p-2 rounded bg-status-red/10 border border-status-red/25 text-xs text-status-red">
              {inviteError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Member Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alan Turing"
              className="w-full px-2.5 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Work Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst@organization.sec"
              className="w-full px-2.5 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Initial Temporary Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 focus:border-copper-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Console Role Tier
            </label>
            <select
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
              className="w-full px-2 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 font-mono"
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
