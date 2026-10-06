import { Response } from 'express';
import { query } from '../database/pool';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';

export async function getPolicies(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      'SELECT * FROM policies WHERE organization_id = $1 ORDER BY created_at DESC',
      [req.user!.organizationId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get policies', code: 'INTERNAL_ERROR' });
  }
}

export async function getPolicy(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      'SELECT * FROM policies WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user!.organizationId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found', code: 'NOT_FOUND' });
    }
    res.json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get policy', code: 'INTERNAL_ERROR' });
  }
}

export async function createPolicy(req: AuthRequest, res: Response) {
  const { name, description, rule, severity, is_active, conditions } = req.body;

  try {
    const result = await query(
      `INSERT INTO policies (organization_id, name, description, rule, severity, is_active, conditions)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user!.organizationId, name, description, rule, severity, is_active, JSON.stringify(conditions || {})]
    );

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: 'POLICY_CREATED',
      resourceType: 'policy',
      resourceId: result.rows[0].id,
      description: `Policy "${name}" created`,
      ipAddress: req.ip,
    });

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create policy', code: 'INTERNAL_ERROR' });
  }
}

export async function updatePolicy(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const updates = req.body;

  try {
    const existing = await query(
      'SELECT id FROM policies WHERE id = $1 AND organization_id = $2',
      [id, req.user!.organizationId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found', code: 'NOT_FOUND' });
    }

    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (['name', 'description', 'rule', 'severity', 'is_active'].includes(key)) {
        fields.push(`${key} = $${i}`);
        values.push(value);
        i++;
      }
      if (key === 'conditions') {
        fields.push(`conditions = $${i}`);
        values.push(JSON.stringify(value));
        i++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields', code: 'VALIDATION_ERROR' });
    }

    fields.push('updated_at = NOW()');
    values.push(id, req.user!.organizationId);

    const result = await query(
      `UPDATE policies SET ${fields.join(', ')} WHERE id = $${i} AND organization_id = $${i + 1} RETURNING *`,
      values
    );

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: 'POLICY_UPDATED',
      resourceType: 'policy',
      resourceId: id,
      description: `Policy updated`,
      metadata: updates,
      ipAddress: req.ip,
    });

    res.json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update policy', code: 'INTERNAL_ERROR' });
  }
}

export async function deletePolicy(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const existing = await query(
      'SELECT name FROM policies WHERE id = $1 AND organization_id = $2',
      [id, req.user!.organizationId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found', code: 'NOT_FOUND' });
    }

    await query('DELETE FROM policies WHERE id = $1', [id]);

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: 'POLICY_DELETED',
      resourceType: 'policy',
      resourceId: id,
      description: `Policy "${existing.rows[0].name}" deleted`,
      ipAddress: req.ip,
    });

    res.json({ message: 'Policy deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete policy', code: 'INTERNAL_ERROR' });
  }
}

// Tools
export async function getTools(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      'SELECT * FROM tools WHERE organization_id = $1 ORDER BY name',
      [req.user!.organizationId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tools', code: 'INTERNAL_ERROR' });
  }
}

export async function createTool(req: AuthRequest, res: Response) {
  const { name, description, category, endpoint, is_external, risk_level } = req.body;

  try {
    const result = await query(
      `INSERT INTO tools (organization_id, name, description, category, endpoint, is_external, risk_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user!.organizationId, name, description, category, endpoint, is_external, risk_level]
    );

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: 'TOOL_CREATED',
      resourceType: 'tool',
      resourceId: result.rows[0].id,
      description: `Tool "${name}" created`,
      ipAddress: req.ip,
    });

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tool', code: 'INTERNAL_ERROR' });
  }
}

// Permissions
export async function getPermissions(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      `SELECT p.*, a.name as agent_name, t.name as tool_name, t.category as tool_category
       FROM permissions p
       JOIN agents a ON p.agent_id = a.id
       JOIN tools t ON p.tool_id = t.id
       WHERE p.organization_id = $1
       ORDER BY a.name, t.name`,
      [req.user!.organizationId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get permissions', code: 'INTERNAL_ERROR' });
  }
}

export async function createPermission(req: AuthRequest, res: Response) {
  const { agent_id, tool_id, level, conditions } = req.body;

  try {
    // Verify agent and tool belong to org
    const agentCheck = await query('SELECT id FROM agents WHERE id = $1 AND organization_id = $2', [agent_id, req.user!.organizationId]);
    const toolCheck = await query('SELECT id FROM tools WHERE id = $1 AND organization_id = $2', [tool_id, req.user!.organizationId]);

    if (agentCheck.rows.length === 0 || toolCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Agent or tool not found', code: 'NOT_FOUND' });
    }

    const result = await query(
      `INSERT INTO permissions (organization_id, agent_id, tool_id, level, conditions)
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (agent_id, tool_id, level) DO UPDATE SET conditions = $5, updated_at = NOW()
       RETURNING *`,
      [req.user!.organizationId, agent_id, tool_id, level, conditions ? JSON.stringify(conditions) : null]
    );

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: 'PERMISSION_CREATED',
      resourceType: 'permission',
      resourceId: result.rows[0].id,
      description: `Permission ${level} set for agent on tool`,
      ipAddress: req.ip,
    });

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({ error: 'Failed to create permission', code: 'INTERNAL_ERROR' });
  }
}

export async function deletePermission(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    await query('DELETE FROM permissions WHERE id = $1 AND organization_id = $2', [id, req.user!.organizationId]);

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: 'PERMISSION_DELETED',
      resourceType: 'permission',
      resourceId: id,
      description: 'Permission removed',
      ipAddress: req.ip,
    });

    res.json({ message: 'Permission deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete permission', code: 'INTERNAL_ERROR' });
  }
}
