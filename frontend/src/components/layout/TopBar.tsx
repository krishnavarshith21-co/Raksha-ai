import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Shield,
  LogOut,
  User,
  Radio,
  ExternalLink,
  ChevronDown,
  Layers,
  Terminal,
} from 'lucide-react';
import { Badge } from '../common/Badge';

const routeTitleMap: Record<string, string> = {
  '/': 'Command Center',
  '/dashboard': 'Command Center',
  '/actions': 'Action Stream',
  '/approvals': 'Approval Queue',
  '/threats': 'Threat Incidents',
  '/agents': 'Agent Inventory',
  '/policies': 'Security Policies',
  '/permissions': 'Tool Permissions',
  '/simulator': 'Attack Simulator',
  '/api-keys': 'API Keys & SDK',
  '/audit': 'Audit Trail',
  '/settings': 'System Settings',
};

export const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentTitle = routeTitleMap[location.pathname] || 'Security Console';

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#0B0B0C]/90 backdrop-blur-md sticky top-0 z-30 px-6 lg:px-10 flex items-center justify-between gap-4">
      {/* Left: Precision Breadcrumb & Telemetry Status Tag */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 text-sm font-mono">
          <span className="text-[#96939A] font-medium tracking-wider">RAKSHYA</span>
          <span className="text-white/20">/</span>
          <span className="text-[#F2EEE7] font-semibold tracking-tight text-base font-sans">
            {currentTitle}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#101011] border border-white/[0.08] text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#D8D4CC] font-medium">INLINE DEFENSE ACTIVE</span>
          <span className="text-white/20">|</span>
          <span className="text-[#C9A66B]">DEMO TELEMETRY</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Simulator launcher */}
        <Link
          to="/simulator"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141415] hover:bg-[#1A1A1C] border border-white/10 hover:border-[#C9A66B]/40 text-xs font-mono text-[#F2EEE7] transition-all shadow-sm"
          title="Launch Red-Team Attack Simulation"
        >
          <Radio className="w-3.5 h-3.5 text-[#C9A66B]" />
          <span>Attack Simulator</span>
        </Link>

        {/* SDK & Keys */}
        <Link
          to="/api-keys"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#96939A] hover:text-[#F2EEE7] hover:bg-white/[0.04] transition-all"
        >
          <Terminal className="w-3.5 h-3.5 text-[#C9A66B]" />
          <span>SDK & APIs</span>
        </Link>

        {/* Org identifier */}
        <div className="hidden lg:flex items-center text-xs font-mono text-[#96939A] border-l border-white/10 pl-4">
          <span className="text-[#D8D4CC] font-medium">
            {user?.organizationName || 'SecOps Core'}
          </span>
        </div>

        {/* Operator Profile Dropdown */}
        <div className="relative border-l border-white/10 pl-3">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded bg-[#141415] border border-white/10 flex items-center justify-center text-[#F2EEE7] font-mono text-xs uppercase font-semibold">
              {user?.name ? user.name.slice(0, 2) : <User className="w-3.5 h-3.5 text-[#96939A]" />}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-[#F2EEE7]">
              {user?.name || 'Chief Security Officer'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#66636A]" />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#101011] border border-white/10 shadow-2xl p-2 z-50 animate-fade-in">
                <div className="px-3.5 py-3 border-b border-white/[0.07] mb-1.5">
                  <div className="text-sm font-medium text-[#F2EEE7]">{user?.name}</div>
                  <div className="text-xs text-[#96939A] font-mono truncate mt-0.5">{user?.email}</div>
                  <div className="mt-2">
                    <Badge variant="allow" size="sm">
                      {user?.role || 'CHIEF SECURITY OFFICER'}
                    </Badge>
                  </div>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#96939A] hover:text-[#F2EEE7] hover:bg-white/[0.05] transition-colors"
                >
                  <Shield className="w-4 h-4 text-[#C9A66B]" />
                  <span>Cluster Governance</span>
                </Link>

                <Link
                  to="/"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#96939A] hover:text-[#F2EEE7] hover:bg-white/[0.05] transition-colors"
                >
                  <Layers className="w-4 h-4 text-[#C9A66B]" />
                  <span>Public Architectural Overview</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors mt-1 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Terminate Session</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
