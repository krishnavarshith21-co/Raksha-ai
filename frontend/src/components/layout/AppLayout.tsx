import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { NavRail } from './NavRail';
import { TopBar } from './TopBar';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <LoadingSpinner label="Authenticating security session..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#F2EEE7] flex selection:bg-[#C9A66B]/20 selection:text-[#F2EEE7]">
      {/* Navigation Rail */}
      <NavRail
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          collapsed ? 'ml-[58px]' : 'ml-[230px]'
        }`}
      >
        <TopBar />
        <main className="flex-1 p-6 lg:p-10 max-w-[1650px] w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
