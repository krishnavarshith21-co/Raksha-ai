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
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#070707] border-r border-white/[0.08] flex flex-col transition-all duration-200 ease-out select-none ${
        collapsed ? 'w-[58px]' : 'w-[230px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-3.5 flex items-center justify-between border-b border-white/[0.07] shrink-0">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 overflow-hidden group focus:outline-none"
          title="RAKSHYA Enterprise"
        >
          <div className="w-9 h-9 rounded-lg bg-[#101011] border border-white/10 group-hover:border-[#C9A66B]/50 flex items-center justify-center transition-all shrink-0 shadow-md shadow-black/50">
            <ShieldCheck className="w-4.5 h-4.5 text-[#C9A66B]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-[17px] text-[#F2EEE7] tracking-tight font-medium leading-none">
                RAKSHYA
              </span>
              <span className="text-[9px] uppercase tracking-[0.24em] text-[#C9A66B] font-mono mt-1">
                Security Core
              </span>
            </div>
          )}
        </NavLink>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-md text-[#66636A] hover:text-[#F2EEE7] hover:bg-white/[0.06] transition-colors cursor-pointer ${
              collapsed ? 'hidden' : 'flex'
            }`}
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav items list */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 overflow-x-hidden scrollbar-none">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[10px] font-mono tracking-[0.24em] text-[#66636A] uppercase font-semibold">
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
                    `group relative flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#141415] text-[#F2EEE7] border border-white/10 shadow-lg shadow-black/40'
                        : 'text-[#96939A] hover:text-[#F2EEE7] hover:bg-white/[0.04] border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="relative shrink-0 flex items-center justify-center">
                        <Icon
                          className={`w-[17px] h-[17px] transition-colors ${
                            isActive
                              ? 'text-[#C9A66B]'
                              : 'text-[#96939A] group-hover:text-[#F2EEE7]'
                          }`}
                        />
                        {/* Dot indicator if collapsed has badge */}
                        {collapsed && item.badge && item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C9A66B] ring-2 ring-[#070707]" />
                        )}
                      </div>

                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate tracking-normal">
                            {item.label}
                          </span>
                          {item.badge && item.badge > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#C9A66B]/15 text-[#E0C28D] border border-[#C9A66B]/35">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Subtle gold vertical indicator with soft glow */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#C9A66B] rounded-r shadow-[0_0_8px_rgba(201,166,107,0.6)]" />
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
      <div className="p-2.5 border-t border-white/[0.07] bg-[#070707] shrink-0">
        {collapsed ? (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-md text-[#66636A] hover:text-[#F2EEE7] hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="px-3 py-2 rounded-lg bg-[#0B0B0C] border border-white/[0.07] text-[11px] font-mono flex items-center justify-between text-[#96939A]">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[#F2EEE7] font-medium">GATEWAY ACTIVE</span>
            </span>
            <span className="text-[#C9A66B] font-semibold">v2.4</span>
          </div>
        )}
      </div>
    </aside>
  );
};
