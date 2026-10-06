import { Response } from 'express';
import { query } from '../database/pool';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';

export async function getThreats(req: AuthRequest, res: Response) {
  const orgId = req.user!.organizationId;
  const { page = '1', limit = '20', type, severity, status } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const conditions: string[] = ['t.organization_id = $1'];
    const params: any[] = [orgId];
    let i = 2;

    if (type) { conditions.push(`t.type = $${i}`); params.push(type); i++; }
    if (severity) { conditions.push(`t.severity = $${i}`); params.push(severity); i++; }
    if (status) { conditions.push(`t.status = $${i}`); params.push(status); i++; }

    const where = conditions.join(' AND ');
    const countResult = await query(`SELECT COUNT(*) FROM threats t WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT t.*, ag.name as agent_name, u.name as user_name
       FROM threats t
       LEFT JOIN agents ag ON t.agent_id = ag.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE ${where}
       ORDER BY t.created_at DESC
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
    res.status(500).json({ error: 'Failed to get threats', code: 'INTERNAL_ERROR' });
  }
}

export async function getThreat(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      `SELECT t.*, ag.name as agent_name, u.name as user_name,
              a.action_type, a.resource, a.source, a.destination, a.payload,
              a.data_classification, a.explanation, a.ai_analysis as action_ai_analysis,
              a.sensitive_data_detected as action_sensitive_data
       FROM threats t
       LEFT JOIN agents ag ON t.agent_id = ag.id
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN actions a ON t.action_id = a.id
       WHERE t.id = $1 AND t.organization_id = $2`,
      [req.params.id, req.user!.organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Threat not found', code: 'NOT_FOUND' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get threat', code: 'INTERNAL_ERROR' });
  }
}

export async function updateThreat(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const existing = await query(
      'SELECT * FROM threats WHERE id = $1 AND organization_id = $2',
      [id, req.user!.organizationId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Threat not found', code: 'NOT_FOUND' });
    }

    const timeline = existing.rows[0].timeline || [];
    timeline.push({
      timestamp: new Date().toISOString(),
      event: `STATUS_CHANGED_TO_${status}`,
      details: notes || `Status changed to ${status}`,
      actor: req.user!.email,
    });

    const result = await query(
      `UPDATE threats SET status = $1, timeline = $2, updated_at = NOW()
       WHERE id = $3 AND organization_id = $4 RETURNING *`,
      [status, JSON.stringify(timeline), id, req.user!.organizationId]
    );

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: status === 'RESOLVED' ? 'THREAT_RESOLVED' : 'THREAT_UPDATED',
      resourceType: 'threat',
      resourceId: id,
      description: `Threat status changed to ${status}`,
      metadata: { notes },
      ipAddress: req.ip,
    });

    res.json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update threat', code: 'INTERNAL_ERROR' });
  }
}
