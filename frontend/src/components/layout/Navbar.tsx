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
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between gap-4">
      {/* Left info / Environment */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-200 font-semibold tracking-wide">RAKSHYA ENFORCER</span>
          <span className="text-zinc-400">|</span>
          <span className="text-amber-400 font-mono text-[11px]">ACTIVE INLINE</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400">
          <span>Org:</span>
          <span className="text-zinc-200 font-medium">
            {user?.organizationName || 'Rakshya Security HQ'}
          </span>
        </div>
      </div>

      {/* Right controls & User profile */}
      <div className="flex items-center gap-3">
        {/* Quick Simulator CTA */}
        <Link
          to="/simulator"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 hover:border-amber-500/50 text-xs font-mono text-zinc-200 hover:text-amber-400 transition-all shadow-sm"
        >
          <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Simulate Attack</span>
        </Link>

        {/* API Docs / Quick Link */}
        <Link
          to="/api-keys"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>SDK / Keys</span>
        </Link>

        {/* User profile menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-200 font-bold text-xs uppercase shadow-inner">
              {user?.name ? user.name.slice(0, 2) : <User className="w-4 h-4" />}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-zinc-200 leading-tight">
                {user?.name || 'Security Analyst'}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {user?.role || 'ADMIN'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                  <div className="text-xs font-semibold text-zinc-100">{user?.name}</div>
                  <div className="text-xs text-zinc-400 truncate">{user?.email}</div>
                  <div className="mt-2">
                    <Badge variant="allow" size="sm">
                      {user?.role || 'ADMIN'}
                    </Badge>
                  </div>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
                >
                  <Shield className="w-4 h-4 text-zinc-400" />
                  Organization Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors mt-1 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
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
