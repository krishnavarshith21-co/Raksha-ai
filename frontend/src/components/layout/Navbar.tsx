import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Shield,
  LogOut,
  User,
  Radio,
  ExternalLink,
  ChevronDown,
  Activity,
  Layers,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-graphite-800 bg-graphite-950/85 backdrop-blur-xl sticky top-0 z-30 px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left info / Environment status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-graphite-900 border border-graphite-750 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-status-green indicator-breathing" />
          <span className="text-stone-100 font-semibold tracking-wide">RAKSHYA ENFORCER</span>
          <span className="text-graphite-600">|</span>
          <span className="text-copper-400 font-mono text-[11px] tracking-wider uppercase">INLINE ACTIVE</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-graphite-400 pl-2">
          <span>Org:</span>
          <span className="text-stone-200 font-medium">
            {user?.organizationName || 'Enterprise SecOps HQ'}
          </span>
        </div>
      </div>

      {/* Right controls & User profile */}
      <div className="flex items-center gap-3">
        {/* Attack Simulator CTA */}
        <Link
          to="/simulator"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-graphite-900 hover:bg-graphite-850 border border-graphite-700 hover:border-copper-500/50 text-xs font-mono text-stone-200 hover:text-copper-300 transition-all shadow-sm"
        >
          <Radio className="w-3.5 h-3.5 text-copper-400 animate-pulse" />
          <span>Attack Simulator</span>
        </Link>

        {/* API Docs / Quick Link */}
        <Link
          to="/api-keys"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-graphite-300 hover:text-stone-100 hover:bg-graphite-900 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-graphite-400" />
          <span>SDK & Keys</span>
        </Link>

        {/* User profile menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-graphite-900 border border-transparent hover:border-graphite-800 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-graphite-800 border border-graphite-700 flex items-center justify-center text-stone-200 font-medium text-xs uppercase shadow-inner">
              {user?.name ? user.name.slice(0, 2) : <User className="w-3.5 h-3.5 text-graphite-300" />}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-stone-100 leading-tight">
                {user?.name || 'Security Principal'}
              </span>
              <span className="text-[10px] text-graphite-400 font-mono">
                {user?.role || 'ADMIN'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-graphite-400" />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-lg bg-graphite-900 border border-graphite-750 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-graphite-800 mb-1">
                  <div className="text-xs font-medium text-stone-50">{user?.name}</div>
                  <div className="text-[11px] text-graphite-400 truncate">{user?.email}</div>
                  <div className="mt-2">
                    <Badge variant="allow" size="sm">
                      {user?.role || 'ADMIN'}
                    </Badge>
                  </div>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-graphite-200 hover:text-stone-50 hover:bg-graphite-800 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-graphite-400" />
                  Organization Settings
                </Link>

                <Link
                  to="/landing"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-graphite-200 hover:text-stone-50 hover:bg-graphite-800 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-graphite-400" />
                  Product Architecture
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-status-red hover:text-red-300 hover:bg-status-red/10 transition-colors mt-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
