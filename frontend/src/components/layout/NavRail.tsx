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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { approvalsApi } from '../../services/api';

interface NavRailProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItemDef {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const NavRail: React.FC<NavRailProps> = ({
  collapsed = true,
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

  const navGroups: { category: string; items: NavItemDef[] }[] = [
    {
      category: 'COMMAND',
      items: [
        { to: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
      ],
    },
    {
      category: 'OBSERVE',
      items: [
        { to: '/actions', label: 'Action Stream', icon: Activity },
        { to: '/threats', label: 'Threat Incidents', icon: ShieldAlert },
      ],
    },
    {
      category: 'CONTROL',
      items: [
        {
          to: '/approvals',
          label: 'Approval Queue',
          icon: CheckSquare,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
        },
        { to: '/agents', label: 'Agent Inventory', icon: Bot },
        { to: '/policies', label: 'Security Policies', icon: ScrollText },
        { to: '/permissions', label: 'Tool Permissions', icon: KeyRound },
      ],
    },
    {
      category: 'DEVELOP',
      items: [
        { to: '/simulator', label: 'Attack Simulator', icon: Terminal },
        { to: '/api-keys', label: 'API Keys & SDK', icon: Key },
      ],
    },
    {
      category: 'GOVERN',
      items: [
        { to: '/audit', label: 'Audit Trail', icon: FileSpreadsheet },
        { to: '/settings', label: 'System Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-graphite-950 border-r border-graphite-750/70 flex flex-col transition-all duration-300 ease-out select-none ${
        collapsed ? 'w-[58px]' : 'w-[230px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-graphite-750/60 shrink-0">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 overflow-hidden group focus:outline-none"
          title="RAKSHYA Enterprise"
        >
          <div className="w-8 h-8 rounded-lg bg-graphite-850 border border-graphite-700 group-hover:border-copper-500/50 flex items-center justify-center transition-all shrink-0">
            <ShieldCheck className="w-4 h-4 text-copper-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-[15px] text-stone-100 tracking-tight font-medium">
                RAKSHYA
              </span>
              <span className="text-[8px] uppercase tracking-[0.22em] text-copper-500/80 font-mono">
                Security Core
              </span>
            </div>
          )}
        </NavLink>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`p-1 rounded-md text-graphite-500 hover:text-stone-100 hover:bg-graphite-850 transition-colors cursor-pointer ${
              collapsed ? 'hidden' : 'flex'
            }`}
            title="Collapse rail"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Nav items list */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 overflow-x-hidden scrollbar-none">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[9px] font-mono tracking-[0.22em] text-graphite-500 uppercase font-semibold">
                {group.category}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-graphite-850/90 text-stone-100 border border-graphite-700 shadow-sm'
                        : 'text-graphite-400 hover:text-stone-200 hover:bg-graphite-900/60 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="relative shrink-0">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-copper-400'
                              : 'text-graphite-400 group-hover:text-stone-200'
                          }`}
                        />
                        {/* Dot indicator if collapsed has badge */}
                        {collapsed && item.badge && item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-copper-400 ring-2 ring-graphite-950" />
                        )}
                      </div>

                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate tracking-normal">
                            {item.label}
                          </span>
                          {item.badge && item.badge > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-copper-500/15 text-copper-400 border border-copper-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Subtle active left bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-copper-400 rounded-r" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer toggle & status */}
      <div className="p-2 border-t border-graphite-750/60 bg-graphite-950/80 shrink-0">
        {collapsed ? (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-md text-graphite-500 hover:text-stone-100 hover:bg-graphite-850 transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="px-2.5 py-1.5 rounded bg-graphite-900/60 border border-graphite-800 text-[10px] font-mono flex items-center justify-between text-graphite-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
              <span>INLINE ACTIVE</span>
            </span>
            <span className="text-copper-400/80">v1.4.2</span>
          </div>
        )}
      </div>
    </aside>
  );
};
