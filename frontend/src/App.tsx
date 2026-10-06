import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ActionStreamPage } from './pages/ActionStreamPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { ThreatsPage } from './pages/ThreatsPage';
import { AgentsPage } from './pages/AgentsPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { PermissionsPage } from './pages/PermissionsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ApiKeysPage } from './pages/ApiKeysPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Enterprise Security Console routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/actions" element={<ActionStreamPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/threats" element={<ThreatsPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/api-keys" element={<ApiKeysPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
