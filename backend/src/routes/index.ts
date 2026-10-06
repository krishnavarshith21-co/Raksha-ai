import { Router } from 'express';
import { authenticate, authorize, authenticateApiKey } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { 
  registerSchema, loginSchema, createAgentSchema, updateAgentSchema,
  createToolSchema, createPermissionSchema, createPolicySchema, updatePolicySchema,
  analyzeActionSchema, approvalDecisionSchema, createApiKeySchema, updateThreatSchema,
  createUserSchema,
} from '../validators/schemas';
import * as auth from '../controllers/authController';
import * as agents from '../controllers/agentController';
import * as actions from '../controllers/actionController';
import * as threats from '../controllers/threatController';
import * as policies from '../controllers/policyController';
import * as approvals from '../controllers/approvalController';
import * as apiKeys from '../controllers/apiKeyController';
import * as dashboard from '../controllers/dashboardController';
import { getAuditLogs } from '../services/auditService';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'rakshya-api', version: '1.0.0' });
});

// Auth routes
router.post('/auth/register', validate(registerSchema), auth.register);
router.post('/auth/login', validate(loginSchema), auth.login);
router.get('/auth/me', authenticate, auth.getMe);
router.get('/auth/users', authenticate, authorize('ADMIN'), auth.getUsers);
router.post('/auth/users', authenticate, authorize('ADMIN'), validate(createUserSchema), auth.createUser);

// Agent routes
router.get('/agents', authenticate, agents.getAgents);
router.get('/agents/:id', authenticate, agents.getAgent);
router.post('/agents', authenticate, authorize('ADMIN'), validate(createAgentSchema), agents.createAgent);
router.patch('/agents/:id', authenticate, authorize('ADMIN'), validate(updateAgentSchema), agents.updateAgent);
router.delete('/agents/:id', authenticate, authorize('ADMIN'), agents.deleteAgent);

// Tool routes
router.get('/tools', authenticate, policies.getTools);
router.post('/tools', authenticate, authorize('ADMIN'), validate(createToolSchema), policies.createTool);

// Permission routes
router.get('/permissions', authenticate, policies.getPermissions);
router.post('/permissions', authenticate, authorize('ADMIN'), validate(createPermissionSchema), policies.createPermission);
router.delete('/permissions/:id', authenticate, authorize('ADMIN'), policies.deletePermission);

// Policy routes
router.get('/policies', authenticate, policies.getPolicies);
router.get('/policies/:id', authenticate, policies.getPolicy);
router.post('/policies', authenticate, authorize('ADMIN'), validate(createPolicySchema), policies.createPolicy);
router.patch('/policies/:id', authenticate, authorize('ADMIN'), validate(updatePolicySchema), policies.updatePolicy);
router.delete('/policies/:id', authenticate, authorize('ADMIN'), policies.deletePolicy);

// Action routes (supports both JWT and API key auth)
router.post('/actions/analyze', authenticateApiKey, validate(analyzeActionSchema), actions.analyzeAction);
router.get('/actions', authenticate, actions.getActions);
router.get('/actions/:id', authenticate, actions.getAction);

// Threat routes
router.get('/threats', authenticate, threats.getThreats);
router.get('/threats/:id', authenticate, threats.getThreat);
router.patch('/threats/:id', authenticate, authorize('ADMIN', 'SECURITY_ANALYST'), validate(updateThreatSchema), threats.updateThreat);

// Approval routes
router.get('/approvals', authenticate, authorize('ADMIN', 'SECURITY_ANALYST'), approvals.getApprovals);
router.post('/approvals/:id/decide', authenticate, authorize('ADMIN', 'SECURITY_ANALYST'), validate(approvalDecisionSchema), approvals.decideApproval);

// API Key routes
router.get('/api-keys', authenticate, authorize('ADMIN'), apiKeys.getApiKeys);
router.post('/api-keys', authenticate, authorize('ADMIN'), validate(createApiKeySchema), apiKeys.createApiKey);
router.delete('/api-keys/:id', authenticate, authorize('ADMIN'), apiKeys.revokeApiKey);

// Dashboard routes
router.get('/dashboard/metrics', authenticate, dashboard.getDashboardMetrics);
router.get('/dashboard/threats-over-time', authenticate, dashboard.getThreatsOverTime);
router.get('/dashboard/risk-distribution', authenticate, dashboard.getRiskDistribution);
router.get('/dashboard/actions-by-decision', authenticate, dashboard.getActionsByDecision);
router.get('/dashboard/threat-types', authenticate, dashboard.getThreatTypeDistribution);
router.get('/dashboard/agent-activity', authenticate, dashboard.getAgentActivity);

// Audit routes
router.get('/audit-logs', authenticate, authorize('ADMIN', 'SECURITY_ANALYST'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await getAuditLogs(req.user!.organizationId, {
      page: parseInt(req.query.page as string || '1'),
      limit: parseInt(req.query.limit as string || '20'),
      event: req.query.event as string,
      actorId: req.query.actorId as string,
      resourceType: req.query.resourceType as string,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get audit logs', code: 'INTERNAL_ERROR' });
  }
});

// Public API routes (v1)
const v1Router = Router();
v1Router.post('/actions/analyze', authenticateApiKey, validate(analyzeActionSchema), actions.analyzeAction);
v1Router.post('/actions/check', authenticateApiKey, validate(analyzeActionSchema), actions.analyzeAction);
v1Router.get('/actions', authenticateApiKey, actions.getActions);
v1Router.get('/threats', authenticateApiKey, threats.getThreats);
v1Router.get('/agents', authenticateApiKey, agents.getAgents);

router.use('/v1', v1Router);

export default router;
