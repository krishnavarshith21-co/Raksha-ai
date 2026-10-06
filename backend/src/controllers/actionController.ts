import { Response } from 'express';
import { query, transaction } from '../database/pool';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';
import { detectSensitiveData, redactSensitiveData } from '../security/sensitiveDataDetector';
import { calculateRiskScore, isExternalDestination } from '../security/riskEngine';
import { analyzeWithAI } from '../ai/geminiService';
import { checkPolicies, checkPermissions, getRequiredPermissionLevel } from '../policies/policyEngine';
import { ActionAnalysisRequest, ActionDecision, ThreatType } from '../types';

export async function analyzeAction(req: AuthRequest, res: Response) {
  const body: ActionAnalysisRequest = req.body;
  const orgId = req.user!.organizationId;

  try {
    // 1. Verify agent exists and belongs to org
    const agentResult = await query(
      'SELECT * FROM agents WHERE id = $1 AND organization_id = $2',
      [body.agentId, orgId]
    );
    if (agentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found', code: 'AGENT_NOT_FOUND' });
    }
    const agent = agentResult.rows[0];

    if (agent.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Agent is not active', code: 'AGENT_INACTIVE' });
    }

    // 2. Detect sensitive data BEFORE sending to AI
    const sensitiveData = detectSensitiveData(body.payload);
    const effectiveClassification = 
      sensitiveData.detected && 
      ['CONFIDENTIAL', 'RESTRICTED'].includes(sensitiveData.classification)
        ? sensitiveData.classification as any
        : body.dataClassification || 'PUBLIC';

    // 3. Check permissions
    const requiredLevel = getRequiredPermissionLevel(body.actionType);
    const permCheck = await checkPermissions(orgId, body.agentId, body.resource, requiredLevel);

    // 4. Check policies
    const isExternal = isExternalDestination(body.destination);
    const policyCheck = await checkPolicies({
      organizationId: orgId,
      agentId: body.agentId,
      actionType: body.actionType,
      resource: body.resource,
      destination: body.destination || null,
      dataClassification: effectiveClassification,
      isExternal,
    });

    // 5. AI analysis (with redacted payload)
    const aiAnalysis = await analyzeWithAI({
      actionType: body.actionType,
      resource: body.resource,
      source: body.source || null,
      destination: body.destination || null,
      dataClassification: effectiveClassification,
      payload: body.payload || null,
    });

    // 6. Calculate risk score
    const riskResult = calculateRiskScore({
      actionType: body.actionType,
      resource: body.resource,
      source: body.source || null,
      destination: body.destination || null,
      dataClassification: effectiveClassification,
      sensitiveData,
      aiAnalysis,
      permissionViolation: !permCheck.allowed || permCheck.deniedExplicitly,
      policyViolations: policyCheck.violations,
      isExternalDestination: isExternal,
    });

    // 7. Determine final decision (policy can override risk engine)
    let finalDecision = riskResult.decision;
    if (policyCheck.shouldBlock && finalDecision !== 'BLOCK') {
      finalDecision = 'BLOCK';
    }
    if (policyCheck.requireApproval && finalDecision === 'ALLOW') {
      finalDecision = 'REQUIRE_APPROVAL';
    }
    if (permCheck.deniedExplicitly) {
      finalDecision = 'BLOCK';
    }

    // 8. Determine status
    const status = finalDecision === 'ALLOW' ? 'EXECUTED' 
      : finalDecision === 'BLOCK' ? 'BLOCKED' 
      : 'PENDING';

    // 9. Store action
    const actionResult = await query(
      `INSERT INTO actions (organization_id, agent_id, user_id, action_type, resource, source, destination,
        data_classification, payload, risk_score, severity, decision, status, threats, policy_violations,
        explanation, ai_analysis, sensitive_data_detected)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING id, created_at`,
      [
        orgId, body.agentId, body.userId || req.user!.userId,
        body.actionType, body.resource, body.source || null, body.destination || null,
        effectiveClassification, body.payload || null,
        riskResult.score, riskResult.severity, finalDecision, status,
        riskResult.threats, policyCheck.violations,
        riskResult.explanation,
        aiAnalysis ? JSON.stringify(aiAnalysis) : null,
        sensitiveData.detected ? JSON.stringify(sensitiveData) : null,
      ]
    );

    const actionId = actionResult.rows[0].id;

    // 10. Create threats if detected
    for (const threatType of riskResult.threats) {
      await query(
        `INSERT INTO threats (organization_id, action_id, agent_id, user_id, type, severity, source,
          target_resource, destination, risk_score, description, signals, ai_analysis, policy_violations, timeline)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          orgId, actionId, body.agentId, body.userId || req.user!.userId,
          threatType, riskResult.severity, body.source || null,
          body.resource, body.destination || null, riskResult.score,
          `${threatType.replace(/_/g, ' ')} detected in ${body.actionType} action on ${body.resource}`,
          riskResult.threats, aiAnalysis ? JSON.stringify(aiAnalysis) : null,
          policyCheck.violations,
          JSON.stringify([{
            timestamp: new Date().toISOString(),
            event: 'THREAT_DETECTED',
            details: `Detected during action analysis. Risk score: ${riskResult.score}/100. Decision: ${finalDecision}`,
          }]),
        ]
      );
    }

    // 11. Create approval request if needed
    if (finalDecision === 'REQUIRE_APPROVAL') {
      await query(
        `INSERT INTO approvals (organization_id, action_id, agent_id, requested_by, reason, risk_score, data_classification, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + INTERVAL '24 hours')`,
        [
          orgId, actionId, body.agentId, body.userId || req.user!.userId,
          riskResult.explanation, riskResult.score, effectiveClassification,
        ]
      );
    }

    // 12. Audit log
    const auditEvent = finalDecision === 'ALLOW' ? 'ACTION_ALLOWED' 
      : finalDecision === 'BLOCK' ? 'ACTION_BLOCKED' 
      : 'ACTION_REQUIRES_APPROVAL';

    await createAuditLog({
      organizationId: orgId,
      actorId: body.userId || req.user!.userId,
      event: auditEvent as any,
      resourceType: 'action',
      resourceId: actionId,
      description: `${body.actionType} on ${body.resource} → ${finalDecision} (Risk: ${riskResult.score}/100)`,
      metadata: {
        agentId: body.agentId,
        agentName: agent.name,
        actionType: body.actionType,
        resource: body.resource,
        destination: body.destination,
        riskScore: riskResult.score,
        threats: riskResult.threats,
      },
      ipAddress: req.ip,
      requestId: req.requestId,
    });

    // 13. Return analysis result
    res.json({
      id: actionId,
      riskScore: riskResult.score,
      severity: riskResult.severity,
      decision: finalDecision,
      threats: riskResult.threats,
      policyViolations: policyCheck.violations,
      explanation: riskResult.explanation,
      sensitiveDataDetected: sensitiveData,
      aiAnalysis: aiAnalysis,
      timestamp: actionResult.rows[0].created_at,
    });
  } catch (error) {
    console.error('Action analysis error:', error);
    res.status(500).json({ error: 'Action analysis failed', code: 'ANALYSIS_ERROR' });
  }
}

export async function getActions(req: AuthRequest, res: Response) {
  const orgId = req.user!.organizationId;
  const { page = '1', limit = '20', agentId, severity, decision, actionType } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const conditions: string[] = ['a.organization_id = $1'];
    const params: any[] = [orgId];
    let i = 2;

    if (agentId) { conditions.push(`a.agent_id = $${i}`); params.push(agentId); i++; }
    if (severity) { conditions.push(`a.severity = $${i}`); params.push(severity); i++; }
    if (decision) { conditions.push(`a.decision = $${i}`); params.push(decision); i++; }
    if (actionType) { conditions.push(`a.action_type = $${i}`); params.push(actionType); i++; }

    const where = conditions.join(' AND ');

    const countResult = await query(`SELECT COUNT(*) FROM actions a WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT a.*, ag.name as agent_name, u.name as user_name
       FROM actions a
       LEFT JOIN agents ag ON a.agent_id = ag.id
       LEFT JOIN users u ON a.user_id = u.id
       WHERE ${where}
       ORDER BY a.created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, parseInt(limit as string), offset]
    );

    res.json({
      data: result.rows,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get actions', code: 'INTERNAL_ERROR' });
  }
}

export async function getAction(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      `SELECT a.*, ag.name as agent_name, u.name as user_name
       FROM actions a
       LEFT JOIN agents ag ON a.agent_id = ag.id
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = $1 AND a.organization_id = $2`,
      [req.params.id, req.user!.organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Action not found', code: 'NOT_FOUND' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get action', code: 'INTERNAL_ERROR' });
  }
}
