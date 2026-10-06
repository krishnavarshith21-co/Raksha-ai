import {
  ActionType, DataClassification, ThreatType, ThreatSeverity,
  ActionDecision, RiskScoreBreakdown, AiAnalysisResult, SensitiveDataResult,
  PolicyCondition
} from '../types';

interface RiskInput {
  actionType: ActionType;
  resource: string;
  source: string | null;
  destination: string | null;
  dataClassification: DataClassification;
  sensitiveData: SensitiveDataResult;
  aiAnalysis: AiAnalysisResult | null;
  permissionViolation: boolean;
  policyViolations: string[];
  isExternalDestination: boolean;
}

interface RiskOutput {
  score: number;
  severity: ThreatSeverity;
  threats: ThreatType[];
  decision: ActionDecision;
  breakdown: RiskScoreBreakdown;
  explanation: string;
}

// Risk score weights - configurable
const RISK_WEIGHTS = {
  promptInjection: 25,
  sensitiveData: 25,
  externalDestination: 20,
  unauthorizedPermission: 20,
  behaviorAnomaly: 10,
  policyViolation: 15,
};

// High-risk action types
const HIGH_RISK_ACTIONS: ActionType[] = ['DELETE', 'EXPORT', 'SEND', 'UPLOAD', 'EXECUTE'];
const MEDIUM_RISK_ACTIONS: ActionType[] = ['WRITE', 'MODIFY', 'DOWNLOAD'];

// Untrusted sources
const UNTRUSTED_SOURCES = [
  'external_email', 'external_document', 'web_content',
  'rag_content', 'external_api', 'unknown', 'user_input',
  'third_party', 'public_web',
];

export function calculateRiskScore(input: RiskInput): RiskOutput {
  const breakdown: RiskScoreBreakdown = {
    promptInjection: 0,
    sensitiveData: 0,
    externalDestination: 0,
    unauthorizedPermission: 0,
    behaviorAnomaly: 0,
    policyViolation: 0,
    total: 0,
  };

  const threats: ThreatType[] = [];

  // 1. Prompt Injection Score
  if (input.aiAnalysis?.isPromptInjection) {
    breakdown.promptInjection = Math.min(
      RISK_WEIGHTS.promptInjection,
      Math.round(RISK_WEIGHTS.promptInjection * input.aiAnalysis.confidence)
    );
    threats.push('PROMPT_INJECTION');
  }

  // 2. Sensitive Data Score
  if (input.sensitiveData.detected) {
    const classificationMultiplier = getClassificationMultiplier(input.sensitiveData.classification);
    breakdown.sensitiveData = Math.round(RISK_WEIGHTS.sensitiveData * classificationMultiplier);
    if (input.isExternalDestination) {
      threats.push('SENSITIVE_DATA_EXPOSURE');
      threats.push('DATA_EXFILTRATION');
    } else {
      threats.push('SENSITIVE_DATA_EXPOSURE');
    }
  }

  // Also consider the declared data classification
  if (input.dataClassification === 'CONFIDENTIAL' || input.dataClassification === 'RESTRICTED') {
    const bonus = input.dataClassification === 'RESTRICTED' ? 15 : 10;
    breakdown.sensitiveData = Math.min(
      RISK_WEIGHTS.sensitiveData,
      breakdown.sensitiveData + bonus
    );
    if (!threats.includes('SENSITIVE_DATA_EXPOSURE')) {
      threats.push('SENSITIVE_DATA_EXPOSURE');
    }
  }

  // 3. External Destination Score
  if (input.isExternalDestination) {
    breakdown.externalDestination = RISK_WEIGHTS.externalDestination;
    if (HIGH_RISK_ACTIONS.includes(input.actionType)) {
      if (!threats.includes('DATA_EXFILTRATION')) {
        threats.push('DATA_EXFILTRATION');
      }
    }
  }

  // 4. Unauthorized Permission Score
  if (input.permissionViolation) {
    breakdown.unauthorizedPermission = RISK_WEIGHTS.unauthorizedPermission;
    threats.push('UNAUTHORIZED_ACCESS');
  }

  // 5. Behavior Anomaly Score
  const anomalyScore = calculateBehaviorAnomaly(input);
  breakdown.behaviorAnomaly = anomalyScore;
  if (anomalyScore > 5) {
    threats.push('ABNORMAL_BEHAVIOR');
  }

  // 6. Policy Violation Score
  if (input.policyViolations.length > 0) {
    breakdown.policyViolation = Math.min(
      RISK_WEIGHTS.policyViolation,
      input.policyViolations.length * 5
    );
    if (!threats.includes('POLICY_VIOLATION')) {
      threats.push('POLICY_VIOLATION');
    }
  }

  // Calculate total
  breakdown.total = Math.min(100,
    breakdown.promptInjection +
    breakdown.sensitiveData +
    breakdown.externalDestination +
    breakdown.unauthorizedPermission +
    breakdown.behaviorAnomaly +
    breakdown.policyViolation
  );

  // Determine severity
  const severity = getSeverity(breakdown.total);

  // Determine decision
  const decision = getDecision(breakdown.total, threats, input.policyViolations);

  // Build explanation
  const explanation = buildExplanation(breakdown, threats, input, decision);

  return {
    score: breakdown.total,
    severity,
    threats: [...new Set(threats)],
    decision,
    breakdown,
    explanation,
  };
}

function getClassificationMultiplier(classification: DataClassification): number {
  switch (classification) {
    case 'RESTRICTED': return 1.0;
    case 'CONFIDENTIAL': return 0.8;
    case 'INTERNAL': return 0.4;
    case 'PUBLIC': return 0.1;
    default: return 0.5;
  }
}

function calculateBehaviorAnomaly(input: RiskInput): number {
  let score = 0;

  // Untrusted source
  if (input.source && UNTRUSTED_SOURCES.includes(input.source.toLowerCase())) {
    score += 3;
  }

  // High-risk action on sensitive resource
  if (HIGH_RISK_ACTIONS.includes(input.actionType)) {
    score += 3;
  }

  // Combination signals
  if (input.isExternalDestination && HIGH_RISK_ACTIONS.includes(input.actionType)) {
    score += 4;
  }

  return Math.min(RISK_WEIGHTS.behaviorAnomaly, score);
}

function getSeverity(score: number): ThreatSeverity {
  if (score >= 71) return 'CRITICAL';
  if (score >= 51) return 'HIGH';
  if (score >= 31) return 'MEDIUM';
  return 'LOW';
}

function getDecision(score: number, threats: ThreatType[], policyViolations: string[]): ActionDecision {
  // Critical threats always block
  if (threats.includes('PROMPT_INJECTION') && score >= 50) {
    return 'BLOCK';
  }

  if (threats.includes('DATA_EXFILTRATION')) {
    return 'BLOCK';
  }

  // Score-based decisions
  if (score >= 70) {
    return 'BLOCK';
  }

  if (score >= 35) {
    return 'REQUIRE_APPROVAL';
  }

  // Sensitive data exposure requires human approval
  if (threats.includes('SENSITIVE_DATA_EXPOSURE') && score >= 20) {
    return 'REQUIRE_APPROVAL';
  }

  // Policy violations can force decisions
  if (policyViolations.length > 0 && score >= 25) {
    return 'REQUIRE_APPROVAL';
  }

  return 'ALLOW';
}

function buildExplanation(
  breakdown: RiskScoreBreakdown,
  threats: ThreatType[],
  input: RiskInput,
  decision: ActionDecision
): string {
  const parts: string[] = [];

  parts.push(`Risk Score: ${breakdown.total}/100 (${getSeverity(breakdown.total)})`);
  parts.push(`Decision: ${decision}`);
  parts.push('');
  parts.push('Risk Breakdown:');

  if (breakdown.promptInjection > 0) {
    parts.push(`• Prompt Injection: +${breakdown.promptInjection} — AI analysis detected potential prompt injection in the request`);
  }
  if (breakdown.sensitiveData > 0) {
    parts.push(`• Sensitive Data: +${breakdown.sensitiveData} — ${input.sensitiveData.types.join(', ')} detected (${input.sensitiveData.classification})`);
  }
  if (breakdown.externalDestination > 0) {
    parts.push(`• External Destination: +${breakdown.externalDestination} — Data directed to external target: ${input.destination}`);
  }
  if (breakdown.unauthorizedPermission > 0) {
    parts.push(`• Permission Violation: +${breakdown.unauthorizedPermission} — Agent lacks required permissions for this operation`);
  }
  if (breakdown.behaviorAnomaly > 0) {
    parts.push(`• Behavior Anomaly: +${breakdown.behaviorAnomaly} — Action pattern flagged as unusual`);
  }
  if (breakdown.policyViolation > 0) {
    parts.push(`• Policy Violation: +${breakdown.policyViolation} — ${input.policyViolations.length} policy violation(s)`);
  }

  if (threats.length > 0) {
    parts.push('');
    parts.push('Detected Threats:');
    threats.forEach(t => parts.push(`• ${t.replace(/_/g, ' ')}`));
  }

  if (input.policyViolations.length > 0) {
    parts.push('');
    parts.push('Policy Violations:');
    input.policyViolations.forEach(v => parts.push(`• ${v}`));
  }

  return parts.join('\n');
}

export function isExternalDestination(destination: string | null | undefined): boolean {
  if (!destination) return false;

  const lower = destination.toLowerCase();

  // External email
  if (lower.includes('@') && !lower.includes('@internal') && !lower.includes('@company')) {
    return true;
  }

  // External URLs
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('ftp://')) {
    return true;
  }

  // External indicators
  const externalIndicators = ['external', 'public', 'third-party', 'partner', 'vendor', 'outside'];
  return externalIndicators.some(ind => lower.includes(ind));
}
