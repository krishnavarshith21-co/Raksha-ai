import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  CheckSquare,
  ShieldAlert,
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
  Compass,
  Radio,
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
        const pending = (res.data?.approvals || res.data || []).filter(
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
          badgeColor: 'bg-copper-500/20 text-copper-300 border border-copper-500/40',
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
      className={`fixed top-0 left-0 bottom-0 z-40 bg-graphite-950/95 border-r border-graphite-800 flex flex-col transition-all duration-300 backdrop-blur-xl ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-graphite-800 shrink-0">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-8 h-8 rounded-lg bg-graphite-850 border border-graphite-700 group-hover:border-copper-500/50 flex items-center justify-center transition-all shadow-inner shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-copper-400 group-hover:scale-105 transition-transform" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold tracking-wider text-sm text-stone-50 font-sans truncate">
                RAKSHYA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-copper-400/80 font-mono">
                AI Defense Layer
              </span>
            </div>
          )}
        </NavLink>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-graphite-400 hover:text-stone-50 hover:bg-graphite-800 border border-transparent hover:border-graphite-700 transition-all hidden md:flex items-center justify-center"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-mono font-medium tracking-wider text-graphite-400 uppercase">
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
                      `flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all group relative ${
                        isActive
                          ? 'bg-graphite-800/80 text-stone-50 border border-graphite-650 shadow-sm'
                          : 'text-graphite-300 hover:text-stone-100 hover:bg-graphite-900/80 border border-transparent'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 text-graphite-400 group-hover:text-stone-200 transition-colors" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge !== undefined && (
                      <span
                        className={`ml-auto text-[10px] px-1.5 py-0.2 rounded font-mono ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-copper-400 indicator-breathing" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Launch & Status */}
      <div className="p-3 border-t border-graphite-800 shrink-0 bg-graphite-950/80 space-y-2">
        {!collapsed ? (
          <>
            <NavLink
              to="/landing"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-mono text-graphite-400 hover:text-stone-200 hover:bg-graphite-900 border border-transparent hover:border-graphite-800 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-copper-400" />
              <span>Public Architecture Portal</span>
            </NavLink>
            <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md bg-graphite-900/60 border border-graphite-800">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-status-green indicator-breathing" />
                <span className="text-[11px] font-mono text-graphite-200">GATEWAY ACTIVE</span>
              </div>
              <span className="text-[10px] font-mono text-graphite-400">v1.4.0</span>
            </div>
          </>
        ) : (
          <div className="flex justify-center py-1" title="Gateway Active: Enforcing">
            <span className="w-2 h-2 rounded-full bg-status-green indicator-breathing" />
          </div>
        )}
      </div>
    </aside>
  );
};
