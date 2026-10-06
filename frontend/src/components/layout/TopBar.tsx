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
  Search,
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

  const currentTitle = routeTitleMap[location.pathname] || 'Enterprise Console';

  return (
    <header className="h-12 border-b border-graphite-750/70 bg-graphite-950/85 backdrop-blur-md sticky top-0 z-30 px-5 flex items-center justify-between gap-4">
      {/* Left: Precision Breadcrumb & Telemetry Tag */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-graphite-400 font-medium">RAKSHYA</span>
          <span className="text-graphite-600">/</span>
          <span className="text-stone-100 font-medium tracking-tight">
            {currentTitle}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-graphite-900 border border-graphite-750 text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
          <span className="text-graphite-300">INLINE ACTIVE</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Simulator fast launcher */}
        <Link
          to="/simulator"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-graphite-900 hover:bg-graphite-850 border border-graphite-750 hover:border-graphite-700 text-xs font-mono text-graphite-200 hover:text-stone-100 transition-colors"
          title="Launch Attack Simulation"
        >
          <Radio className="w-3 h-3 text-copper-400" />
          <span>Simulator</span>
        </Link>

        {/* SDK & Keys */}
        <Link
          to="/api-keys"
          className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono text-graphite-400 hover:text-stone-100 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          <span>SDK</span>
        </Link>

        {/* Org identifier */}
        <div className="hidden lg:flex items-center text-[11px] font-mono text-graphite-400 border-l border-graphite-750/70 pl-3">
          <span className="text-graphite-300">
            {user?.organizationName || 'SecOps Core'}
          </span>
        </div>

        {/* Operator Profile Dropdown */}
        <div className="relative border-l border-graphite-750/70 pl-2.5">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-graphite-850 transition-colors cursor-pointer"
          >
            <div className="w-6.5 h-6.5 rounded bg-graphite-850 border border-graphite-700 flex items-center justify-center text-stone-200 font-mono text-[11px] uppercase">
              {user?.name ? user.name.slice(0, 2) : <User className="w-3 h-3 text-graphite-400" />}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-stone-200">
              {user?.name || 'Operator'}
            </span>
            <ChevronDown className="w-3 h-3 text-graphite-400" />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-60 rounded-lg bg-graphite-850 border border-graphite-700 shadow-2xl p-1.5 z-50 animate-slide-up">
                <div className="px-3 py-2 border-b border-graphite-750 mb-1">
                  <div className="text-xs font-medium text-stone-100">{user?.name}</div>
                  <div className="text-[11px] text-graphite-400 font-mono truncate">{user?.email}</div>
                  <div className="mt-1.5">
                    <Badge variant="allow" size="sm">
                      {user?.role || 'ADMIN'}
                    </Badge>
                  </div>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-graphite-300 hover:text-stone-100 hover:bg-graphite-800 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-graphite-400" />
                  Cluster Settings
                </Link>

                <Link
                  to="/landing"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-graphite-300 hover:text-stone-100 hover:bg-graphite-800 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-graphite-400" />
                  Product Architecture
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-status-red hover:bg-status-red/10 transition-colors mt-0.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Terminate Session
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
