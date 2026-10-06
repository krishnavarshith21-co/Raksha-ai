export type UserRole = 'ADMIN' | 'SECURITY_ANALYST' | 'MEMBER';

export type AgentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type AgentEnvironment = 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ActionType = 'READ' | 'WRITE' | 'DELETE' | 'EXPORT' | 'SEND' | 'UPLOAD' | 'DOWNLOAD' | 'EXECUTE' | 'MODIFY';
export type ActionDecision = 'ALLOW' | 'REQUIRE_APPROVAL' | 'BLOCK';
export type ActionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'BLOCKED';

export type ThreatType = 'PROMPT_INJECTION' | 'DATA_EXFILTRATION' | 'UNAUTHORIZED_ACCESS' | 'SENSITIVE_DATA_EXPOSURE' | 'ABNORMAL_BEHAVIOR' | 'MALICIOUS_TOOL_USAGE' | 'POLICY_VIOLATION';
export type ThreatSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ThreatStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export type PermissionLevel = 'READ' | 'WRITE' | 'EXECUTE' | 'DENY';
export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export type AuditEventType =
  | 'LOGIN' | 'LOGOUT' | 'REGISTER'
  | 'AGENT_CREATED' | 'AGENT_UPDATED' | 'AGENT_DELETED' | 'AGENT_DISABLED'
  | 'TOOL_CREATED' | 'TOOL_UPDATED' | 'TOOL_DELETED'
  | 'PERMISSION_CREATED' | 'PERMISSION_UPDATED' | 'PERMISSION_DELETED'
  | 'POLICY_CREATED' | 'POLICY_UPDATED' | 'POLICY_DELETED'
  | 'ACTION_ANALYZED' | 'ACTION_ALLOWED' | 'ACTION_BLOCKED' | 'ACTION_REQUIRES_APPROVAL'
  | 'APPROVAL_REQUESTED' | 'ACTION_APPROVED' | 'ACTION_REJECTED'
  | 'API_KEY_CREATED' | 'API_KEY_REVOKED'
  | 'THREAT_DETECTED' | 'THREAT_UPDATED' | 'THREAT_RESOLVED'
  | 'SETTINGS_UPDATED';

export interface User {
  id: string;
  organization_id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Agent {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  owner_id: string;
  status: AgentStatus;
  environment: AgentEnvironment;
  risk_level: RiskLevel;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Tool {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  category: string;
  endpoint: string | null;
  is_external: boolean;
  risk_level: RiskLevel;
  created_at: Date;
  updated_at: Date;
}

export interface Permission {
  id: string;
  organization_id: string;
  agent_id: string;
  tool_id: string;
  level: PermissionLevel;
  conditions: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}

export interface Policy {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  rule: string;
  severity: ThreatSeverity;
  is_active: boolean;
  conditions: PolicyCondition;
  created_at: Date;
  updated_at: Date;
}

export interface PolicyCondition {
  action_types?: ActionType[];
  data_classifications?: DataClassification[];
  destinations?: string[];
  resources?: string[];
  agents?: string[];
  block_external?: boolean;
  require_approval?: boolean;
  max_risk_score?: number;
}

export interface Action {
  id: string;
  organization_id: string;
  agent_id: string;
  user_id: string | null;
  action_type: ActionType;
  resource: string;
  source: string | null;
  destination: string | null;
  data_classification: DataClassification;
  payload: string | null;
  risk_score: number;
  severity: ThreatSeverity;
  decision: ActionDecision;
  status: ActionStatus;
  threats: string[];
  policy_violations: string[];
  explanation: string;
  ai_analysis: Record<string, any> | null;
  sensitive_data_detected: Record<string, any> | null;
  metadata: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}

export interface Threat {
  id: string;
  organization_id: string;
  action_id: string;
  agent_id: string;
  user_id: string | null;
  type: ThreatType;
  severity: ThreatSeverity;
  status: ThreatStatus;
  source: string | null;
  target_resource: string | null;
  destination: string | null;
  risk_score: number;
  description: string;
  signals: string[];
  ai_analysis: Record<string, any> | null;
  policy_violations: string[];
  timeline: ThreatTimelineEntry[];
  created_at: Date;
  updated_at: Date;
}

export interface ThreatTimelineEntry {
  timestamp: string;
  event: string;
  details: string;
  actor?: string;
}

export interface Approval {
  id: string;
  organization_id: string;
  action_id: string;
  agent_id: string;
  requested_by: string | null;
  approved_by: string | null;
  status: ApprovalStatus;
  reason: string | null;
  decision_reason: string | null;
  risk_score: number;
  data_classification: DataClassification;
  expires_at: Date | null;
  decided_at: Date | null;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  actor_id: string | null;
  event: AuditEventType;
  resource_type: string;
  resource_id: string | null;
  description: string;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  request_id: string | null;
  created_at: Date;
}

export interface ApiKey {
  id: string;
  organization_id: string;
  created_by: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  last_used_at: Date | null;
  is_active: boolean;
  expires_at: Date | null;
  created_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: Date;
  created_at: Date;
}

// API Types
export interface ActionAnalysisRequest {
  agentId: string;
  userId?: string;
  actionType: ActionType;
  resource: string;
  source?: string;
  destination?: string;
  dataClassification?: DataClassification;
  payload?: string;
}

export interface ActionAnalysisResponse {
  id: string;
  riskScore: number;
  severity: ThreatSeverity;
  decision: ActionDecision;
  threats: ThreatType[];
  policyViolations: string[];
  explanation: string;
  sensitiveDataDetected: SensitiveDataResult;
  aiAnalysis: AiAnalysisResult | null;
  timestamp: string;
}

export interface SensitiveDataResult {
  detected: boolean;
  types: string[];
  classification: DataClassification;
  redactedPayload?: string;
}

export interface AiAnalysisResult {
  isPromptInjection: boolean;
  confidence: number;
  threats: string[];
  reasoning: string;
  recommendations: string[];
}

export interface RiskScoreBreakdown {
  promptInjection: number;
  sensitiveData: number;
  externalDestination: number;
  unauthorizedPermission: number;
  behaviorAnomaly: number;
  policyViolation: number;
  total: number;
}

export interface JwtPayload {
  userId: string;
  organizationId: string;
  role: UserRole;
  email: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardMetrics {
  totalActions: number;
  allowedActions: number;
  blockedActions: number;
  pendingApprovals: number;
  criticalThreats: number;
  sensitiveDataEvents: number;
  promptInjectionAttempts: number;
  dataExfiltrationAttempts: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
  category?: string;
}
