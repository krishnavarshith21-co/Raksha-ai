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
  Compass,
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
      category: 'ENFORCEMENT',
      items: [
        { to: '/', label: 'Command Center', icon: LayoutDashboard },
        { to: '/actions', label: 'Action Stream', icon: Activity },
        {
          to: '/approvals',
          label: 'Approvals',
          icon: CheckSquare,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
        },
        { to: '/threats', label: 'Threats', icon: ShieldAlert },
      ],
    },
    {
      category: 'GOVERNANCE',
      items: [
        { to: '/agents', label: 'Agents', icon: Bot },
        { to: '/policies', label: 'Policies', icon: ScrollText },
        { to: '/permissions', label: 'Permissions', icon: KeyRound },
      ],
    },
    {
      category: 'OPERATIONS',
      items: [
        { to: '/simulator', label: 'Simulator', icon: Terminal },
        { to: '/api-keys', label: 'API Keys', icon: Key },
        { to: '/audit', label: 'Audit Trail', icon: FileSpreadsheet },
        { to: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-graphite-950/95 border-r border-graphite-750 flex flex-col transition-all duration-200 backdrop-blur-xl select-none ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Brand Header */}
      <div className="h-12 px-3 flex items-center justify-between border-b border-graphite-750/70 shrink-0">
        <NavLink
          to="/"
          className="flex items-center gap-2.5 overflow-hidden group focus:outline-none"
          title="RAKSHYA Enterprise"
        >
          <div className="w-8 h-8 rounded-md bg-graphite-850 border border-graphite-750 group-hover:border-copper-500/50 flex items-center justify-center transition-all shrink-0">
            <ShieldCheck className="w-4 h-4 text-copper-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-medium tracking-wider text-xs text-stone-100 font-sans truncate">
                RAKSHYA
              </span>
              <span className="text-[9px] uppercase tracking-widest text-copper-400/80 font-mono">
                DEFENSE LAYER
              </span>
            </div>
          )}
        </NavLink>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`p-1 rounded text-graphite-400 hover:text-stone-100 hover:bg-graphite-850 transition-colors ${
              collapsed ? 'hidden' : 'flex'
            }`}
            title="Collapse rail"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Nav items list */}
      <div className="flex-1 overflow-y-auto py-3 px-1.5 space-y-4 overflow-x-hidden">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[9px] font-mono tracking-wider text-graphite-400 uppercase">
                {group.category}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-graphite-850 text-stone-50 border border-graphite-700'
                        : 'text-graphite-400 hover:text-stone-200 hover:bg-graphite-900 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-copper-500 rounded-r" />
                      )}

                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-copper-400'
                            : 'text-graphite-400 group-hover:text-stone-300'
                        }`}
                      />

                      {!collapsed && (
                        <span className="truncate tracking-tight">{item.label}</span>
                      )}

                      {/* Badge in expanded view */}
                      {!collapsed && item.badge !== undefined && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-status-yellow/15 text-status-yellow border border-status-yellow/30">
                          {item.badge}
                        </span>
                      )}

                      {/* Micro dot in collapsed rail */}
                      {collapsed && item.badge !== undefined && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-status-yellow" />
                      )}

                      {/* Tooltip on hover when collapsed */}
                      {collapsed && (
                        <div className="fixed left-16 px-2 py-1 bg-graphite-850 border border-graphite-700 rounded text-[11px] font-sans text-stone-100 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                          {item.label}
                          {item.badge !== undefined && (
                            <span className="ml-1.5 text-status-yellow font-mono font-medium">
                              ({item.badge})
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Rail Footer */}
      <div className="p-1.5 border-t border-graphite-750/70 shrink-0 space-y-1">
        {onToggleCollapse && collapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded text-graphite-400 hover:text-stone-100 hover:bg-graphite-850 transition-colors cursor-pointer"
            title="Expand rail"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        <NavLink
          to="/landing"
          title="Architecture Overview"
          className="flex items-center justify-center p-2 rounded text-graphite-400 hover:text-stone-100 hover:bg-graphite-850 transition-colors"
        >
          <Compass className="w-4 h-4 text-graphite-400 hover:text-copper-400" />
          {!collapsed && (
            <span className="ml-2 text-xs truncate">Public Portal</span>
          )}
        </NavLink>

        <div
          className={`flex items-center ${
            collapsed ? 'justify-center py-1.5' : 'px-2 py-1.5 justify-between'
          } rounded bg-graphite-900/60 border border-graphite-750/70`}
          title="Enforcement Engine: Nominal"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-green shrink-0" />
            {!collapsed && (
              <span className="text-[10px] font-mono text-graphite-300">ONLINE</span>
            )}
          </div>
          {!collapsed && (
            <span className="text-[9px] font-mono text-graphite-400">99.9%</span>
          )}
        </div>
      </div>
    </aside>
  );
};
