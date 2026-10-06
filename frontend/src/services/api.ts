import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rakshya_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rakshya_token');
      localStorage.removeItem('rakshya_user');
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register') &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string; organizationName: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  createUser: (data: { email: string; password: string; name: string; role: string }) =>
    api.post('/auth/users', data),
};

// Dashboard
export const dashboardApi = {
  getMetrics: () => api.get('/dashboard/metrics'),
  getThreatsOverTime: () => api.get('/dashboard/threats-over-time'),
  getRiskDistribution: () => api.get('/dashboard/risk-distribution'),
  getActionsByDecision: () => api.get('/dashboard/actions-by-decision'),
  getThreatTypes: () => api.get('/dashboard/threat-types'),
  getAgentActivity: () => api.get('/dashboard/agent-activity'),
};

// Agents
export const agentsApi = {
  list: () => api.get('/agents'),
  get: (id: string) => api.get(`/agents/${id}`),
  create: (data: any) => api.post('/agents', data),
  update: (id: string, data: any) => api.patch(`/agents/${id}`, data),
  delete: (id: string) => api.delete(`/agents/${id}`),
};

// Tools
export const toolsApi = {
  list: () => api.get('/tools'),
  create: (data: any) => api.post('/tools', data),
};

// Permissions
export const permissionsApi = {
  list: () => api.get('/permissions'),
  create: (data: any) => api.post('/permissions', data),
  delete: (id: string) => api.delete(`/permissions/${id}`),
};

// Policies
export const policiesApi = {
  list: () => api.get('/policies'),
  get: (id: string) => api.get(`/policies/${id}`),
  create: (data: any) => api.post('/policies', data),
  update: (id: string, data: any) => api.patch(`/policies/${id}`, data),
  delete: (id: string) => api.delete(`/policies/${id}`),
};

// Actions
export const actionsApi = {
  list: (params?: any) => api.get('/actions', { params }),
  get: (id: string) => api.get(`/actions/${id}`),
  analyze: (data: any) => api.post('/actions/analyze', data),
};

// Threats
export const threatsApi = {
  list: (params?: any) => api.get('/threats', { params }),
  get: (id: string) => api.get(`/threats/${id}`),
  update: (id: string, data: any) => api.patch(`/threats/${id}`, data),
};

// Approvals
export const approvalsApi = {
  list: () => api.get('/approvals'),
  decide: (id: string, data: { decision: string; reason?: string }) => api.post(`/approvals/${id}/decide`, data),
};

// API Keys
export const apiKeysApi = {
  list: () => api.get('/api-keys'),
  create: (name: string) => api.post('/api-keys', { name }),
  revoke: (id: string) => api.delete(`/api-keys/${id}`),
};

// Audit Logs
export const auditApi = {
  list: (params?: any) => api.get('/audit-logs', { params }),
};

export default api;
