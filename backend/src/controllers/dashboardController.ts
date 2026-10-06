import { Response } from 'express';
import { query } from '../database/pool';
import { AuthRequest } from '../middleware/auth';

export async function getDashboardMetrics(req: AuthRequest, res: Response) {
  const orgId = req.user!.organizationId;
  const { period = '7d', agentId, severity, decision } = req.query;

  try {
    const interval = getInterval(period as string);
    const baseConditions = [`organization_id = $1`, `created_at >= NOW() - INTERVAL '${interval}'`];
    const params: any[] = [orgId];
    let i = 2;

    if (agentId) { baseConditions.push(`agent_id = $${i}`); params.push(agentId); i++; }

    const actionWhere = baseConditions.join(' AND ');

    // Core metrics
    const metricsResult = await query(`
      SELECT
        COUNT(*) as total_actions,
        COUNT(*) FILTER (WHERE decision = 'ALLOW') as allowed_actions,
        COUNT(*) FILTER (WHERE decision = 'BLOCK') as blocked_actions,
        COUNT(*) FILTER (WHERE decision = 'REQUIRE_APPROVAL' AND status = 'PENDING') as pending_approvals,
        COUNT(*) FILTER (WHERE severity = 'CRITICAL') as critical_actions,
        COUNT(*) FILTER (WHERE sensitive_data_detected IS NOT NULL AND sensitive_data_detected::text != 'null') as sensitive_data_events,
        COUNT(*) FILTER (WHERE 'PROMPT_INJECTION' = ANY(threats)) as prompt_injection_attempts,
        COUNT(*) FILTER (WHERE 'DATA_EXFILTRATION' = ANY(threats)) as data_exfiltration_attempts
      FROM actions
      WHERE ${actionWhere}
    `, params);

    // Critical threats count
    const criticalThreats = await query(`
      SELECT COUNT(*) as count FROM threats
      WHERE organization_id = $1 AND severity = 'CRITICAL' AND status = 'OPEN'
        AND created_at >= NOW() - INTERVAL '${interval}'
    `, [orgId]);

    const metrics = metricsResult.rows[0];

    res.json({
      totalActions: parseInt(metrics.total_actions),
      allowedActions: parseInt(metrics.allowed_actions),
      blockedActions: parseInt(metrics.blocked_actions),
      pendingApprovals: parseInt(metrics.pending_approvals),
      criticalThreats: parseInt(criticalThreats.rows[0].count),
      sensitiveDataEvents: parseInt(metrics.sensitive_data_events),
      promptInjectionAttempts: parseInt(metrics.prompt_injection_attempts),
      dataExfiltrationAttempts: parseInt(metrics.data_exfiltration_attempts),
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to get dashboard metrics', code: 'INTERNAL_ERROR' });
  }
}

export async function getThreatsOverTime(req: AuthRequest, res: Response) {
  const orgId = req.user!.organizationId;
  const { period = '7d' } = req.query;
  const interval = getInterval(period as string);
  const groupBy = getGroupBy(period as string);

  try {
    const result = await query(`
      SELECT 
        date_trunc('${groupBy}', created_at) as date,
        COUNT(*) as count,
        severity as category
      FROM threats
      WHERE organization_id = $1 AND created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY date_trunc('${groupBy}', created_at), severity
      ORDER BY date
    `, [orgId]);

    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get threats over time', code: 'INTERNAL_ERROR' });
  }
}

export async function getRiskDistribution(req: AuthRequest, res: Response) {
  const orgId = req.user!.organizationId;
  const { period = '7d' } = req.query;
  const interval = getInterval(period as string);

  try {
    const result = await query(`
      SELECT 
        CASE 
          WHEN risk_score <= 30 THEN 'LOW'
          WHEN risk_score <= 70 THEN 'MEDIUM'
          ELSE 'HIGH'
        END as risk_level,
        COUNT(*) as count
      FROM actions
      WHERE organization_id = $1 AND created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY risk_level
      ORDER BY risk_level
    `, [orgId]);

    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get risk distribution', code: 'INTERNAL_ERROR' });
  }
}

export async function getActionsByDecision(req: AuthRequest, res: Response) {
  const orgId = req.user!.organizationId;
  const { period = '7d' } = req.query;
  const interval = getInterval(period as string);

  try {
    const result = await query(`
      SELECT decision, COUNT(*) as count
      FROM actions
      WHERE organization_id = $1 AND created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY decision
    `, [orgId]);

    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get actions by decision', code: 'INTERNAL_ERROR' });
  }
}

export async function getThreatTypeDistribution(req: AuthRequest, res: Response) {
  const orgId = req.user!.organizationId;
  const { period = '7d' } = req.query;
  const interval = getInterval(period as string);

  try {
    const result = await query(`
      SELECT type, COUNT(*) as count
      FROM threats
      WHERE organization_id = $1 AND created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY type
      ORDER BY count DESC
    `, [orgId]);

    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get threat types', code: 'INTERNAL_ERROR' });
  }
}

export async function getAgentActivity(req: AuthRequest, res: Response) {
  const orgId = req.user!.organizationId;
  const { period = '7d' } = req.query;
  const interval = getInterval(period as string);

  try {
    const result = await query(`
      SELECT ag.name as agent_name, 
        COUNT(*) as total_actions,
        COUNT(*) FILTER (WHERE a.decision = 'ALLOW') as allowed,
        COUNT(*) FILTER (WHERE a.decision = 'BLOCK') as blocked,
        COUNT(*) FILTER (WHERE a.decision = 'REQUIRE_APPROVAL') as pending,
        ROUND(AVG(a.risk_score)) as avg_risk
      FROM actions a
      JOIN agents ag ON a.agent_id = ag.id
      WHERE a.organization_id = $1 AND a.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY ag.name
      ORDER BY total_actions DESC
    `, [orgId]);

    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get agent activity', code: 'INTERNAL_ERROR' });
  }
}

function getInterval(period: string): string {
  switch (period) {
    case '24h': return '24 hours';
    case '7d': return '7 days';
    case '30d': return '30 days';
    case '90d': return '90 days';
    default: return '7 days';
  }
}

function getGroupBy(period: string): string {
  switch (period) {
    case '24h': return 'hour';
    case '7d': return 'day';
    case '30d': return 'day';
    case '90d': return 'week';
    default: return 'day';
  }
}
