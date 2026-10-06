export type UserRole = 'ADMIN' | 'SECURITY_ANALYST' | 'MEMBER';
export type AgentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type AgentEnvironment = 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ActionType = 'READ' | 'WRITE' | 'DELETE' | 'EXPORT' | 'SEND' | 'UPLOAD' | 'DOWNLOAD' | 'EXECUTE' | 'MODIFY';
export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
export type ActionDecision = 'ALLOW' | 'REQUIRE_APPROVAL' | 'BLOCK';
export type ActionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'BLOCKED';
export type ThreatType = 'PROMPT_INJECTION' | 'DATA_EXFILTRATION' | 'UNAUTHORIZED_ACCESS' | 'SENSITIVE_DATA_EXPOSURE' | 'ABNORMAL_BEHAVIOR' | 'MALICIOUS_TOOL_USAGE' | 'POLICY_VIOLATION';
export type ThreatSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ThreatStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type PermissionLevel = 'READ' | 'WRITE' | 'EXECUTE' | 'DENY';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  organizationName?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  owner_id?: string;
  status: AgentStatus;
  environment: AgentEnvironment;
  risk_level: RiskLevel;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Tool {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  category?: string;
  endpoint?: string;
  is_external: boolean;
  risk_level: RiskLevel;
  created_at: string;
}

export interface Permission {
  id: string;
  organization_id: string;
  agent_id: string;
  tool_id: string;
  level: PermissionLevel;
  agent_name?: string;
  tool_name?: string;
  created_at: string;
}

export interface Policy {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  rule: string;
  severity: ThreatSeverity;
  is_active: boolean;
  conditions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  organization_id: string;
  agent_id: string;
  user_id?: string;
  action_type: ActionType;
  resource: string;
  source?: string;
  destination?: string;
  data_classification: DataClassification;
  payload?: string;
  risk_score: number;
  severity: ThreatSeverity;
  decision: ActionDecision;
  status: ActionStatus;
  threats: string[];
  policy_violations: string[];
  explanation?: string;
  ai_analysis?: Record<string, any>;
  sensitive_data_detected?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  agent_name?: string;
  user_name?: string;
}

export interface Threat {
  id: string;
  organization_id: string;
  action_id?: string;
  agent_id?: string;
  user_id?: string;
  type: ThreatType;
  severity: ThreatSeverity;
  status: ThreatStatus;
  source?: string;
  target_resource?: string;
  destination?: string;
  risk_score: number;
  description?: string;
  signals: string[];
  ai_analysis?: Record<string, any>;
  policy_violations: string[];
  timeline?: Array<{ time: string; event: string; actor: string }>;
  created_at: string;
  agent_name?: string;
  user_name?: string;
}

export interface Approval {
  id: string;
  organization_id: string;
  action_id: string;
  agent_id: string;
  requested_by?: string;
  approved_by?: string;
  status: ApprovalStatus;
  reason?: string;
  decision_reason?: string;
  risk_score: number;
  data_classification: DataClassification;
  expires_at?: string;
  decided_at?: string;
  created_at: string;
  agent_name?: string;
  requester_name?: string;
  action_type?: string;
  resource?: string;
  destination?: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  actor_id?: string;
  event: string;
  resource_type?: string;
  resource_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  request_id?: string;
  created_at: string;
  actor_name?: string;
}

export interface ApiKey {
  id: string;
  organization_id: string;
  created_by: string;
  name: string;
  key_prefix: string;
  last_used_at?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  creator_name?: string;
}

export interface DashboardMetrics {
  totalActions: number;
  allowedActions: number;
  blockedActions: number;
  pendingApprovals: number;
  criticalThreats: number;
  sensitiveDataEvents: number;
  promptInjections: number;
  dataExfiltrations: number;
}

export interface ActionAnalysisRequest {
  agentId: string;
  actionType: ActionType;
  resource: string;
  source?: string;
  destination?: string;
  dataClassification?: DataClassification;
  payload?: string;
}

export interface ActionAnalysisResponse {
  action: Action;
  threat?: Threat;
  riskScore: number;
  severity: ThreatSeverity;
  decision: ActionDecision;
  threats: string[];
  policyViolations: string[];
  explanation: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  code: string;
  details?: any;
}
