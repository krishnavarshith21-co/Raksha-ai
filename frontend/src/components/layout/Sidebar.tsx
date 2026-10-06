import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  CheckSquare,
  Bot,
  ScrollText,
  KeyRound,
  Terminal,
  Key,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { approvalsApi } from '../../services/api';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
}) => {
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const location = useLocation();

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await approvalsApi.list();
        const pending = (res.data.approvals || res.data || []).filter(
          (a: any) => a.status === 'PENDING'
        );
        setPendingApprovalsCount(pending.length);
      } catch {
        // Silent catch
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const navItems = [
    {
      category: 'ENFORCEMENT',
      items: [
        { to: '/', label: 'Overview', icon: LayoutDashboard },
        { to: '/actions', label: 'Action Stream', icon: Activity },
        {
          to: '/approvals',
          label: 'Approval Queue',
          icon: CheckSquare,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: 'bg-amber-500 text-zinc-950 font-bold',
        },
        { to: '/threats', label: 'Threat Incidents', icon: ShieldAlert },
      ],
    },
    {
      category: 'GOVERNANCE',
      items: [
        { to: '/agents', label: 'Agent Inventory', icon: Bot },
        { to: '/policies', label: 'Security Policies', icon: ScrollText },
        { to: '/permissions', label: 'Tool Permissions', icon: KeyRound },
      ],
    },
    {
      category: 'OPERATIONS',
      items: [
        { to: '/simulator', label: 'Attack Simulator', icon: Terminal },
        { to: '/api-keys', label: 'API Keys & SDK', icon: Key },
        { to: '/audit', label: 'Audit Trail', icon: FileSpreadsheet },
        { to: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-zinc-950/95 border-r border-zinc-800/80 flex flex-col transition-all duration-300 backdrop-blur-md ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-800/80 shrink-0">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 shrink-0 border border-amber-400/30">
            <ShieldCheck className="w-5 h-5 text-zinc-950" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-base text-zinc-100 font-mono">
                RAKSHYA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-400/90 font-mono">
                AI Defense Layer
              </span>
            </div>
          )}
        </NavLink>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors hidden md:flex"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-mono font-semibold tracking-wider text-zinc-500 uppercase">
                {group.category}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge !== undefined && (
                      <span
                        className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-mono ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-zinc-800/80 shrink-0 bg-zinc-950/60">
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-zinc-300">GATEWAY ACTIVE</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">v1.4</span>
          </div>
        ) : (
          <div className="flex justify-center py-1" title="Gateway Active: Enforcing">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
