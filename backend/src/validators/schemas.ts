import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  organizationName: z.string().min(2, 'Organization name required').max(255),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createAgentSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(2000).optional().default(''),
  environment: z.enum(['PRODUCTION', 'STAGING', 'DEVELOPMENT']).optional().default('DEVELOPMENT'),
  risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('LOW'),
  metadata: z.record(z.any()).optional().default({}),
});

export const updateAgentSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  environment: z.enum(['PRODUCTION', 'STAGING', 'DEVELOPMENT']).optional(),
  risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  metadata: z.record(z.any()).optional(),
});

export const createToolSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(2000).optional().default(''),
  category: z.string().max(100).optional().default('general'),
  endpoint: z.string().max(500).optional(),
  is_external: z.boolean().optional().default(false),
  risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('LOW'),
});

export const createPermissionSchema = z.object({
  agent_id: z.string().uuid(),
  tool_id: z.string().uuid(),
  level: z.enum(['READ', 'WRITE', 'EXECUTE', 'DENY']),
  conditions: z.record(z.any()).optional(),
});

export const createPolicySchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(2000).optional().default(''),
  rule: z.string().min(5).max(5000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  is_active: z.boolean().optional().default(true),
  conditions: z.object({
    action_types: z.array(z.enum(['READ', 'WRITE', 'DELETE', 'EXPORT', 'SEND', 'UPLOAD', 'DOWNLOAD', 'EXECUTE', 'MODIFY'])).optional(),
    data_classifications: z.array(z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'])).optional(),
    destinations: z.array(z.string()).optional(),
    resources: z.array(z.string()).optional(),
    agents: z.array(z.string()).optional(),
    block_external: z.boolean().optional(),
    require_approval: z.boolean().optional(),
    max_risk_score: z.number().min(0).max(100).optional(),
  }).optional().default({}),
});

export const updatePolicySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(2000).optional(),
  rule: z.string().min(5).max(5000).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  is_active: z.boolean().optional(),
  conditions: z.object({
    action_types: z.array(z.string()).optional(),
    data_classifications: z.array(z.string()).optional(),
    destinations: z.array(z.string()).optional(),
    resources: z.array(z.string()).optional(),
    agents: z.array(z.string()).optional(),
    block_external: z.boolean().optional(),
    require_approval: z.boolean().optional(),
    max_risk_score: z.number().min(0).max(100).optional(),
  }).optional(),
});

export const analyzeActionSchema = z.object({
  agentId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  actionType: z.enum(['READ', 'WRITE', 'DELETE', 'EXPORT', 'SEND', 'UPLOAD', 'DOWNLOAD', 'EXECUTE', 'MODIFY']),
  resource: z.string().min(1).max(255),
  source: z.string().max(500).optional(),
  destination: z.string().max(500).optional(),
  dataClassification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).optional().default('PUBLIC'),
  payload: z.string().max(50000).optional(),
});

export const approvalDecisionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().max(2000).optional(),
});

export const createApiKeySchema = z.object({
  name: z.string().min(2).max(255),
  expires_in_days: z.number().min(1).max(365).optional(),
});

export const updateThreatSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED']),
  notes: z.string().max(2000).optional(),
});

export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('20'),
  sortBy: z.string().optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const dashboardFilterSchema = z.object({
  period: z.enum(['24h', '7d', '30d', '90d']).optional().default('7d'),
  agentId: z.string().uuid().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  threatType: z.string().optional(),
  decision: z.enum(['ALLOW', 'REQUIRE_APPROVAL', 'BLOCK']).optional(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(255),
  password: z.string().min(8).max(128),
  role: z.enum(['ADMIN', 'SECURITY_ANALYST', 'MEMBER']).optional().default('MEMBER'),
});
