import { Response } from 'express';
import { query } from '../database/pool';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';

export async function getAgents(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      `SELECT a.*, u.name as owner_name,
        (SELECT COUNT(*) FROM actions WHERE agent_id = a.id) as total_actions,
        (SELECT COUNT(*) FROM threats WHERE agent_id = a.id) as total_threats,
        (SELECT COUNT(*) FROM permissions WHERE agent_id = a.id) as total_permissions
       FROM agents a
       LEFT JOIN users u ON a.owner_id = u.id
       WHERE a.organization_id = $1
       ORDER BY a.created_at DESC`,
      [req.user!.organizationId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get agents', code: 'INTERNAL_ERROR' });
  }
}

export async function getAgent(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      `SELECT a.*, u.name as owner_name FROM agents a
       LEFT JOIN users u ON a.owner_id = u.id
       WHERE a.id = $1 AND a.organization_id = $2`,
      [req.params.id, req.user!.organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found', code: 'NOT_FOUND' });
    }

    const agent = result.rows[0];

    // Get permissions
    const permissions = await query(
      `SELECT p.*, t.name as tool_name, t.category as tool_category 
       FROM permissions p JOIN tools t ON p.tool_id = t.id 
       WHERE p.agent_id = $1`,
      [agent.id]
    );

    // Get recent actions
    const actions = await query(
      `SELECT id, action_type, resource, risk_score, severity, decision, status, created_at
       FROM actions WHERE agent_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [agent.id]
    );

    // Get threats
    const threats = await query(
      `SELECT id, type, severity, status, risk_score, created_at
       FROM threats WHERE agent_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [agent.id]
    );

    res.json({
      data: {
        ...agent,
        permissions: permissions.rows,
        recentActions: actions.rows,
        threats: threats.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get agent', code: 'INTERNAL_ERROR' });
  }
}

export async function createAgent(req: AuthRequest, res: Response) {
  const { name, description, environment, risk_level, metadata } = req.body;

  try {
    const result = await query(
      `INSERT INTO agents (organization_id, name, description, owner_id, environment, risk_level, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user!.organizationId, name, description, req.user!.userId, environment, risk_level, JSON.stringify(metadata || {})]
    );

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: 'AGENT_CREATED',
      resourceType: 'agent',
      resourceId: result.rows[0].id,
      description: `Agent "${name}" created in ${environment} environment`,
      ipAddress: req.ip,
    });

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create agent', code: 'INTERNAL_ERROR' });
  }
}

export async function updateAgent(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Check ownership
    const existing = await query(
      'SELECT id FROM agents WHERE id = $1 AND organization_id = $2',
      [id, req.user!.organizationId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found', code: 'NOT_FOUND' });
    }

    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (['name', 'description', 'status', 'environment', 'risk_level'].includes(key)) {
        fields.push(`${key} = $${i}`);
        values.push(value);
        i++;
      }
      if (key === 'metadata') {
        fields.push(`metadata = $${i}`);
        values.push(JSON.stringify(value));
        i++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update', code: 'VALIDATION_ERROR' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, req.user!.organizationId);

    const result = await query(
      `UPDATE agents SET ${fields.join(', ')} WHERE id = $${i} AND organization_id = $${i + 1} RETURNING *`,
      values
    );

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: 'AGENT_UPDATED',
      resourceType: 'agent',
      resourceId: id,
      description: `Agent updated: ${Object.keys(updates).join(', ')}`,
      metadata: updates,
      ipAddress: req.ip,
    });

    res.json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update agent', code: 'INTERNAL_ERROR' });
  }
}

export async function deleteAgent(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const existing = await query(
      'SELECT name FROM agents WHERE id = $1 AND organization_id = $2',
      [id, req.user!.organizationId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found', code: 'NOT_FOUND' });
    }

    await query('DELETE FROM permissions WHERE agent_id = $1', [id]);
    await query('DELETE FROM agents WHERE id = $1 AND organization_id = $2', [id, req.user!.organizationId]);

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: 'AGENT_DELETED',
      resourceType: 'agent',
      resourceId: id,
      description: `Agent "${existing.rows[0].name}" deleted`,
      ipAddress: req.ip,
    });

    res.json({ message: 'Agent deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete agent', code: 'INTERNAL_ERROR' });
  }
}
