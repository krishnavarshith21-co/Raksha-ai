import { Response } from 'express';
import { query } from '../database/pool';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';

export async function getApprovals(req: AuthRequest, res: Response) {
  const orgId = req.user!.organizationId;
  const { status: statusFilter, page = '1', limit = '20' } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const conditions: string[] = ['ap.organization_id = $1'];
    const params: any[] = [orgId];
    let i = 2;

    if (statusFilter) {
      conditions.push(`ap.status = $${i}`);
      params.push(statusFilter);
      i++;
    }

    const where = conditions.join(' AND ');
    const countResult = await query(`SELECT COUNT(*) FROM approvals ap WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT ap.*, ag.name as agent_name, 
              a.action_type, a.resource, a.destination, a.source, a.explanation,
              a.threats, a.severity as action_severity,
              u1.name as requested_by_name, u2.name as approved_by_name
       FROM approvals ap
       JOIN actions a ON ap.action_id = a.id
       LEFT JOIN agents ag ON ap.agent_id = ag.id
       LEFT JOIN users u1 ON ap.requested_by = u1.id
       LEFT JOIN users u2 ON ap.approved_by = u2.id
       WHERE ${where}
       ORDER BY ap.created_at DESC
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
    res.status(500).json({ error: 'Failed to get approvals', code: 'INTERNAL_ERROR' });
  }
}

export async function decideApproval(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { decision, reason } = req.body;

  try {
    const existing = await query(
      'SELECT * FROM approvals WHERE id = $1 AND organization_id = $2',
      [id, req.user!.organizationId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Approval not found', code: 'NOT_FOUND' });
    }

    const approval = existing.rows[0];
    if (approval.status !== 'PENDING') {
      return res.status(409).json({ error: 'Approval already decided', code: 'ALREADY_DECIDED' });
    }

    // Update approval
    const result = await query(
      `UPDATE approvals SET status = $1, approved_by = $2, decision_reason = $3, decided_at = NOW()
       WHERE id = $4 RETURNING *`,
      [decision, req.user!.userId, reason || null, id]
    );

    // Update action status
    const actionStatus = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    await query(
      'UPDATE actions SET status = $1, updated_at = NOW() WHERE id = $2',
      [actionStatus, approval.action_id]
    );

    // Audit log
    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: decision === 'APPROVED' ? 'ACTION_APPROVED' : 'ACTION_REJECTED',
      resourceType: 'approval',
      resourceId: id,
      description: `Action ${decision.toLowerCase()}: ${reason || 'No reason provided'}`,
      metadata: { actionId: approval.action_id, decision, reason },
      ipAddress: req.ip,
    });

    res.json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process approval', code: 'INTERNAL_ERROR' });
  }
}
